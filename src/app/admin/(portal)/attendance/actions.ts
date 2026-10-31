"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { enqueueMessages, processQueue, type QueueItem, type TemplateKey } from "@/lib/os/whatsapp";
import { STATUS_TO_TEMPLATE, type AttendanceStatus } from "@/lib/os/attendance";
import { friendlyError, fail, type MutationResult } from "@/lib/os/errors";
import { isUuid, NON_DELIVERED, STATE_META, stateFromStatus, type SessionCategory } from "@/lib/os/session-meta";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface SessionActionResult extends MutationResult {
  sessionId?: string;
  /** The class has no time set, so no session can be keyed to it yet. */
  needsSlot?: boolean;
}

/**
 * Start Session — lazily create one dated occurrence of a class and mark it in
 * progress. Idempotent per (batch, date, start_time).
 *
 * It returns a result and NEVER redirects: the caller navigates only once this
 * has actually succeeded. Previously the insert's error was discarded and the
 * redirect happened regardless, so a failure looked identical to a success.
 */
export async function startSession(
  batchId: string,
  sessionDate: string,
  startTime: string | null,
  endTime: string | null
): Promise<SessionActionResult> {
  const admin = await requireCapability("attendance.mark");
  if (!isUuid(batchId) || !ISO_DATE.test(sessionDate)) {
    return fail("This class could not be found. Refresh the page and try again.");
  }

  // Sessions are unique per (batch, date, start_time) and NULLs never collide,
  // so without a time one day's attendance could split across duplicate rows.
  if (!startTime) {
    return { ok: false, needsSlot: true, error: "This class has no time set yet. Add a start and end time first." };
  }

  const supabase = createServerSupabase();

  const { data: cls, error: clsErr } = await supabase
    .from("batches")
    .select("session_category, student_id, deleted_at")
    .eq("id", batchId)
    .maybeSingle();
  if (clsErr) return fail(friendlyError(clsErr, "Couldn't load this class. Please try again."));
  if (!cls || cls.deleted_at) {
    return fail("This class has been removed. Refresh the page to see the current timetable.");
  }
  const category = ((cls.session_category as SessionCategory | null) ?? "combined_class") as SessionCategory;

  const { data: existing, error: lookupErr } = await supabase
    .from("sessions")
    .select("id, status")
    .eq("batch_id", batchId)
    .eq("session_date", sessionDate)
    .eq("start_time", startTime)
    .maybeSingle();
  if (lookupErr) return fail(friendlyError(lookupErr, "Couldn't check this session. Please try again."));

  const now = new Date().toISOString();

  if (existing) {
    const state = stateFromStatus(existing.status as string);
    if (NON_DELIVERED.includes(state)) {
      return fail(`This session is marked “${STATE_META[state].label}”. Reopen it before marking attendance.`);
    }
    if (existing.status === "scheduled") {
      const { error } = await supabase
        .from("sessions")
        .update({ status: "in_progress", started_by: admin.id, started_at: now })
        .eq("id", existing.id);
      if (error) return fail(friendlyError(error, "Couldn't start this session. Please try again."));
    }
    revalidateAttendance();
    return { ok: true, sessionId: existing.id as string };
  }

  const { data: created, error: insErr } = await supabase
    .from("sessions")
    .insert({
      batch_id: batchId,
      session_date: sessionDate,
      start_time: startTime,
      end_time: endTime,
      status: "in_progress",
      started_by: admin.id,
      started_at: now,
      session_category: category,
      student_id: category === "individual_attention" ? cls.student_id : null,
    })
    .select("id")
    .single();

  if (insErr?.code === "23505") {
    // A double tap (or another device) created it a moment ago — use that one.
    const { data: again } = await supabase
      .from("sessions").select("id").eq("batch_id", batchId).eq("session_date", sessionDate).eq("start_time", startTime).maybeSingle();
    if (again) return { ok: true, sessionId: again.id as string };
  }
  if (insErr || !created) {
    return fail(friendlyError(insErr, "Couldn't start this session. Please try again."));
  }

  revalidateAttendance();
  return { ok: true, sessionId: created.id as string };
}

function revalidateAttendance() {
  revalidatePath("/admin/attendance");
  revalidatePath("/admin");
}

/**
 * Mark one session as a holiday / cancelled, or reopen it. Applies to that
 * single occurrence — the recurring class is untouched.
 */
export async function setSessionState(
  batchId: string,
  sessionDate: string,
  startTime: string | null,
  endTime: string | null,
  target: "holiday" | "cancelled" | "scheduled",
  reason?: string
): Promise<SessionActionResult> {
  const admin = await requireCapability("attendance.mark");
  if (!isUuid(batchId) || !ISO_DATE.test(sessionDate) || !["holiday", "cancelled", "scheduled"].includes(target)) {
    return fail("This session could not be found. Refresh the page and try again.");
  }
  const supabase = createServerSupabase();
  const note = reason?.trim().slice(0, 200) || null;

  const { data: existing, error: lookupErr } = await supabase
    .from("sessions")
    .select("id, status, attendance(count)")
    .eq("batch_id", batchId)
    .eq("session_date", sessionDate)
    .eq("start_time", startTime)
    .maybeSingle();
  if (lookupErr) return fail(friendlyError(lookupErr, "Couldn't load this session. Please try again."));

  const marked = ((existing?.attendance as unknown as { count: number }[]) ?? [])[0]?.count ?? 0;
  if (target !== "scheduled" && marked > 0) {
    return fail("Attendance is already marked for this session, so it can't be cancelled or marked as a holiday.");
  }

  if (existing) {
    const { error } = await supabase
      .from("sessions")
      .update({ status: target === "scheduled" && marked > 0 ? "completed" : target, state_note: target === "scheduled" ? null : note })
      .eq("id", existing.id);
    if (error) return fail(friendlyError(error, "Couldn't update this session. Please try again."));
  } else {
    if (target === "scheduled") {
      revalidateAttendance();
      return { ok: true, message: "✓ Session reopened" };
    }
    if (!startTime) return fail("This class has no time set yet, so its sessions can't be changed.");
    const { error } = await supabase.from("sessions").insert({
      batch_id: batchId, session_date: sessionDate, start_time: startTime, end_time: endTime,
      status: target, state_note: note,
    });
    if (error) return fail(friendlyError(error, "Couldn't update this session. Please try again."));
  }

  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "session", entity_id: existing?.id ?? null,
    action: `session_${target === "scheduled" ? "reopened" : target}`,
    summary: `Session on ${sessionDate} ${target === "holiday" ? "marked as a holiday" : target === "cancelled" ? "cancelled" : "reopened"}`,
    metadata: { batch_id: batchId, date: sessionDate, reason: note },
  });

  revalidateAttendance();
  return {
    ok: true,
    message: target === "holiday" ? "✓ Marked as holiday — not conducted" : target === "cancelled" ? "✓ Session cancelled" : "✓ Session reopened",
  };
}

/* ── Public holidays ───────────────────────────────────────────────────────── */

export async function addHoliday(date: string, name: string): Promise<MutationResult> {
  const admin = await requireCapability("batches.manage");
  if (!ISO_DATE.test(date)) return fail("Choose a valid date.");
  const label = name.trim().slice(0, 80);
  if (label.length < 2) return fail("Give the holiday a name, for example “Diwali”.");

  const supabase = createServerSupabase();
  const { error } = await supabase.from("holidays").insert({ holiday_date: date, name: label, created_by: admin.id });
  if (error) {
    return fail(friendlyError(error, "Couldn't save the holiday. Please try again.", { "23505": "This day is already marked as a public holiday." }));
  }
  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "holiday", action: "holiday_added",
    summary: `${date} marked as a public holiday (${label})`, metadata: { date },
  });
  revalidateAttendance();
  return { ok: true, message: "✓ Marked as a public holiday" };
}

export async function removeHoliday(date: string): Promise<MutationResult> {
  const admin = await requireCapability("batches.manage");
  if (!ISO_DATE.test(date)) return fail("Choose a valid date.");
  const supabase = createServerSupabase();
  const { error } = await supabase.from("holidays").delete().eq("holiday_date", date);
  if (error) return fail(friendlyError(error, "Couldn't remove the holiday. Please try again."));
  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "holiday", action: "holiday_removed",
    summary: `${date} is no longer a public holiday`, metadata: { date },
  });
  revalidateAttendance();
  return { ok: true, message: "✓ Holiday removed" };
}

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
export async function finishSession(input: unknown): Promise<FinishResult> {
  const admin = await requireCapability("attendance.mark");
  const parsed = markSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { batchId, sessionDate, startTime, endTime, subjectIds, marks, topic, homework, teacherNotes, rating } = parsed.data;

  const supabase = createServerSupabase();

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
      .map((r) => ({ actor_id: admin.id, student_id: r.student_id, entity_type: "attendance", entity_id: sessionId, action: `marked_${r.status}`, summary: `Marked ${r.status} — ${label}` })),
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
  try { await enqueueMessages(queueItems); queued = queueItems.length; } catch { /* attendance safe */ }

  // 7. Best-effort dispatch (skipped cleanly without Meta creds).
  let sent = 0; let whatsappSkipped = false;
  try { const res = await processQueue(); sent = res.sent; whatsappSkipped = res.skipped; } catch { /* retryable */ }

  revalidatePath("/admin/attendance");
  revalidatePath("/admin");
  return { ok: true, saved: savedRows.length, queued, sent, whatsappSkipped };
}
