"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { enqueueMessages, processQueue, type QueueItem, type TemplateKey } from "@/lib/os/whatsapp";
import { STATUS_TO_TEMPLATE, type AttendanceStatus } from "@/lib/os/attendance";

const markSchema = z.object({
  classId: z.string().uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().nullable().optional(),
  marks: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(["present", "absent", "late", "excused"]),
    })
  ),
  topic: z.string().optional(),
  homework: z.string().optional(),
  teacherNotes: z.string().optional(),
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
 * Finish Class — the critical save path. Ordering is deliberate:
 *   1. upsert session (+ class notes)   2. upsert attendance
 *   3. attendance_logs for changes       4. activity_logs
 *   5. mark session completed            6. ONLY THEN enqueue WhatsApp
 *   7. best-effort dispatch (never blocks; failures are retryable)
 * Attendance is durable before any messaging is attempted.
 */
export async function finishClass(input: unknown): Promise<FinishResult> {
  const admin = await requireAdmin();
  const parsed = markSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { classId, sessionDate, startTime, marks, topic, homework, teacherNotes } = parsed.data;

  const supabase = createServerSupabase();

  // 1. Session (idempotent on class+date+time). Store class notes here.
  const { data: session, error: sErr } = await supabase
    .from("class_sessions")
    .upsert(
      {
        class_id: classId,
        session_date: sessionDate,
        start_time: startTime ?? null,
        status: "completed",
        topic_covered: topic || null,
        homework_assigned: homework || null,
        teacher_notes: teacherNotes || null,
        completed_at: new Date().toISOString(),
        completed_by: admin.id,
      },
      { onConflict: "class_id,session_date,start_time" }
    )
    .select("id")
    .single();

  if (sErr || !session) return { ok: false, error: sErr?.message ?? "Could not save session" };
  const sessionId = session.id;

  // Existing rows (to compute edits for attendance_logs).
  const { data: existing } = await supabase
    .from("attendance")
    .select("id, student_id, status")
    .eq("session_id", sessionId);
  const prevByStudent = new Map((existing ?? []).map((r) => [r.student_id, r]));

  // 2. Upsert attendance — THIS is what must succeed. Everything else is derived.
  const rows = marks.map((m) => ({
    session_id: sessionId,
    student_id: m.studentId,
    status: m.status,
    marked_by: admin.id,
    marked_at: new Date().toISOString(),
  }));
  const { data: saved, error: aErr } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "session_id,student_id" })
    .select("id, student_id, status");

  if (aErr) return { ok: false, error: `Attendance not saved: ${aErr.message}` };
  const savedRows = saved ?? [];

  // 3. attendance_logs for status changes (edits). New rows also logged (null → status).
  const logs = savedRows
    .filter((r) => {
      const prev = prevByStudent.get(r.student_id);
      return !prev || prev.status !== r.status;
    })
    .map((r) => ({
      attendance_id: r.id,
      old_status: prevByStudent.get(r.student_id)?.status ?? null,
      new_status: r.status as AttendanceStatus,
      changed_by: admin.id,
    }));
  if (logs.length) await supabase.from("attendance_logs").insert(logs);

  // 4. activity_logs — one summary entry + per-student timeline entries.
  const { data: cls } = await supabase.from("classes").select("name").eq("id", classId).single();
  const className = cls?.name ?? "class";
  const summary = savedRows.reduce(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {} as Record<string, number>
  );
  await supabase.from("activity_logs").insert([
    {
      actor_id: admin.id,
      entity_type: "attendance",
      entity_id: sessionId,
      action: "session_completed",
      summary: `${className}: ${summary.present ?? 0} present, ${summary.absent ?? 0} absent, ${summary.late ?? 0} late, ${summary.excused ?? 0} excused`,
      metadata: { session_id: sessionId, counts: summary },
    },
    ...savedRows
      .filter((r) => (prevByStudent.get(r.student_id)?.status ?? null) !== r.status)
      .map((r) => ({
        actor_id: admin.id,
        student_id: r.student_id,
        entity_type: "attendance",
        entity_id: sessionId,
        action: `marked_${r.status}`,
        summary: `Marked ${r.status} — ${className}`,
      })),
  ]);

  // 5. Attendance is now durably committed. Build WhatsApp queue items.
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
      payload: { parent_name: parent.full_name, student_name: s.full_name, class_name: className },
      student_id: s.id,
      parent_id: parent.id,
      session_id: sessionId,
    });
  }

  // 6. Enqueue (insert only — cannot fail the attendance that's already saved).
  let queued = 0;
  try {
    await enqueueMessages(queueItems);
    queued = queueItems.length;
  } catch {
    // Queue insert failed — attendance is still safe; nothing is lost.
  }

  // 7. Best-effort dispatch. Skipped cleanly if Meta creds absent.
  let sent = 0;
  let whatsappSkipped = false;
  try {
    const res = await processQueue();
    sent = res.sent;
    whatsappSkipped = res.skipped;
  } catch {
    // Dispatch failure leaves rows pending/failed for retry.
  }

  revalidatePath("/admin/attendance");
  revalidatePath("/admin");
  return { ok: true, saved: savedRows.length, queued, sent, whatsappSkipped };
}
