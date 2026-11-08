"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { saveAttendance, type FinishResult } from "@/lib/os/attendance-save";
import { friendlyError, fail, type MutationResult } from "@/lib/os/errors";
import { isUuid, NON_DELIVERED, STATE_META, stateFromStatus, type SessionCategory } from "@/lib/os/session-meta";

export type { FinishResult };

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

export async function finishSession(input: unknown): Promise<FinishResult> {
  const admin = await requireCapability("attendance.mark");
  return saveAttendance(createServerSupabase(), admin, input);
}
