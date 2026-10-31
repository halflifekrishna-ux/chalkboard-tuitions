import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { enqueueMessages, processQueue, type QueueItem, type TemplateKey } from "./whatsapp";
import { STATUS_TO_TEMPLATE, type AttendanceStatus } from "./attendance";
import { friendlyError } from "./errors";
import type { SessionCategory } from "./session-meta";

type Db = SupabaseClient;

const markSchema = z.object({
  batchId: z.string().uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  subjectIds: z.array(z.string().uuid()).default([]),
  marks: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.enum(["present", "absent", "late", "excused"]),
  })),
  topic: z.string().optional(),
  homework: z.string().optional(),
  teacherNotes: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export interface FinishResult {
  ok: boolean;
  error?: string;
  saved?: number;
  queued?: number;
  sent?: number;
  whatsappSkipped?: boolean;
}

/**
 * Finish Session — the critical save path. Ordering guarantees attendance is
 * durable before any messaging: session upsert → attendance upsert →
 * attendance_logs (diffs) → activity_logs → completed → THEN enqueue → dispatch.
 */
export async function saveAttendance(supabase: Db, admin: { id: string }, input: unknown): Promise<FinishResult> {
  const parsed = markSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { batchId, sessionDate, startTime, endTime, subjectIds, marks, topic, homework, teacherNotes, rating } = parsed.data;

  // 0. Individual Attention means the whole session belongs to ONE student —
  //    nobody else can be marked in it.
  const { data: cls, error: clsErr } = await supabase
    .from("batches").select("session_category, student_id").eq("id", batchId).maybeSingle();
  if (clsErr) return { ok: false, error: friendlyError(clsErr, "Couldn't load this class. Your marks are kept — please try again.") };
  const category = ((cls?.session_category as SessionCategory | null) ?? "combined_class") as SessionCategory;
  const iaStudent = category === "individual_attention" ? ((cls?.student_id as string | null) ?? null) : null;
  if (category === "individual_attention" && (marks.length !== 1 || marks[0].studentId !== iaStudent)) {
    return { ok: false, error: "This is an Individual Attention class, so only its own student can be marked. Refresh the page and try again." };
  }

  // 1. Session (idempotent on batch+date+time) + which subjects were covered + class notes.
  //    Not an upsert: the unique index is partial (0013), and PostgREST can't send
  //    the predicate ON CONFLICT would need to match it.
  const sessionFields = {
    end_time: endTime ?? null,
    subject_ids: subjectIds,
    session_category: category,
    student_id: iaStudent,
    status: "completed",
    topic_covered: topic || null,
    homework_assigned: homework || null,
    teacher_notes: teacherNotes || null,
    rating: rating ?? null,
    completed_at: new Date().toISOString(),
    completed_by: admin.id,
  };
  const findSession = () => {
    const query = supabase.from("sessions").select("id").eq("batch_id", batchId).eq("session_date", sessionDate);
    return (startTime ? query.eq("start_time", startTime) : query.is("start_time", null)).maybeSingle();
  };
  const updateSession = (id: string) =>
    supabase.from("sessions").update(sessionFields).eq("id", id).select("id").single();

  const { data: found, error: findErr } = await findSession();
  if (findErr) return { ok: false, error: friendlyError(findErr, "Couldn't check this session. Your marks are kept — please try again.") };

  let { data: session, error: sErr } = found
    ? await updateSession(found.id)
    : await supabase
        .from("sessions")
        .insert({ ...sessionFields, batch_id: batchId, session_date: sessionDate, start_time: startTime ?? null })
        .select("id")
        .single();
  if (sErr?.code === "23505") {
    // A double tap (or another device) created it a moment ago — use that one.
    const { data: again } = await findSession();
    if (again) ({ data: session, error: sErr } = await updateSession(again.id));
  }
  if (sErr || !session) return { ok: false, error: sErr?.message ?? "Could not save session" };
  const sessionId = session.id;

  const { data: existing } = await supabase.from("attendance").select("id, student_id, status").eq("session_id", sessionId);
  const prevByStudent = new Map((existing ?? []).map((r) => [r.student_id, r]));

  // 2. Attendance — the durable core.
  const rows = marks.map((m) => ({
    session_id: sessionId, student_id: m.studentId, status: m.status, marked_by: admin.id, marked_at: new Date().toISOString(),
  }));
  const { data: saved, error: aErr } = await supabase
    .from("attendance").upsert(rows, { onConflict: "session_id,student_id" }).select("id, student_id, status");
  if (aErr) return { ok: false, error: `Attendance not saved: ${aErr.message}` };
  const savedRows = saved ?? [];

  // 3. attendance_logs for changes (edit audit: old + new + admin + timestamp).
  const logs = savedRows
    .filter((r) => { const prev = prevByStudent.get(r.student_id); return !prev || prev.status !== r.status; })
    .map((r) => ({ attendance_id: r.id, old_status: prevByStudent.get(r.student_id)?.status ?? null, new_status: r.status as AttendanceStatus, changed_by: admin.id }));
  if (logs.length) await supabase.from("attendance_logs").insert(logs);

  // 4. activity_logs — batch/subjects context for the summary + per-student.
  const [{ data: batch }, { data: subjectRows }] = await Promise.all([
    supabase.from("batches").select("name").eq("id", batchId).single(),
    subjectIds.length ? supabase.from("subjects").select("id, name").in("id", subjectIds) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);
  const batchName = batch?.name ?? "Batch";
  const subjectsLabel = (subjectRows ?? []).map((s) => s.name).join(", ") || "no subject picked";
  const label = `${batchName} · ${subjectsLabel}`;
  const summary = savedRows.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {} as Record<string, number>);
  await supabase.from("activity_logs").insert([
    {
      actor_id: admin.id, entity_type: "attendance", entity_id: sessionId, action: "session_completed",
      summary: `${label}: ${summary.present ?? 0} present, ${summary.absent ?? 0} absent, ${summary.late ?? 0} late, ${summary.excused ?? 0} excused`,
      metadata: { session_id: sessionId, counts: summary },
    },
    ...savedRows
      .filter((r) => (prevByStudent.get(r.student_id)?.status ?? null) !== r.status)
      .map((r) => ({ actor_id: admin.id, student_id: r.student_id, entity_type: "attendance", entity_id: sessionId, action: `marked_${r.status}`, summary: `Marked ${r.status} — ${label}`, metadata: { session_id: sessionId } })),
  ]);

  // 5. Attendance durably committed. Build WhatsApp queue items.
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, parent:parents(id, full_name, whatsapp_number, phone)")
    .in("id", savedRows.map((r) => r.student_id));
  const byId = new Map((students ?? []).map((s) => [s.id, s]));

  const queueItems: QueueItem[] = [];
  for (const r of savedRows) {
    const s = byId.get(r.student_id);
    const parent = s?.parent as unknown as { id: string; full_name: string; whatsapp_number: string | null; phone: string } | null;
    if (!s || !parent) continue;
    const to = (parent.whatsapp_number || parent.phone || "").replace(/[^0-9]/g, "");
    if (!to) continue;
    queueItems.push({
      template_key: STATUS_TO_TEMPLATE[r.status as AttendanceStatus] as TemplateKey,
      to_number: to,
      payload: { parent_name: parent.full_name, student_name: s.full_name, class_name: label },
      student_id: s.id, parent_id: parent.id, session_id: sessionId,
    });
  }

  // 6. Enqueue (insert only — cannot fail already-saved attendance).
  let queued = 0;
  try { await enqueueMessages(queueItems, supabase); queued = queueItems.length; } catch { /* attendance safe */ }

  // 7. Best-effort dispatch (skipped cleanly without Meta creds).
  let sent = 0; let whatsappSkipped = false;
  try { const res = await processQueue(25, supabase); sent = res.sent; whatsappSkipped = res.skipped; } catch { /* retryable */ }

  revalidatePath("/admin/attendance");
  revalidatePath("/admin");
  return { ok: true, saved: savedRows.length, queued, sent, whatsappSkipped };
}
