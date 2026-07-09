import { createServerSupabase } from "./supabase-server";
import { weekdayKey, isoDate } from "./attendance";

export type SessionState = "not_started" | "in_progress" | "completed";

export interface TodaySession {
  batchSubjectId: string;
  batchId: string;
  batchName: string;
  grade: number;
  subjectName: string;
  teacherName: string | null;
  colour: string;
  startTime: string | null; // "17:00"
  endTime: string | null;
  enrolled: number;
  sessionId: string | null;
  state: SessionState;
  marked: number;
  startedAt: string | null;
  completedAt: string | null;
}

/**
 * All batch subjects scheduled for `date` (default today), merged with any
 * session created for that date. Two queries total — no N+1. Batch subjects
 * act as recurring templates; a session materialises on Start.
 */
export async function getSessionsForDate(date = new Date()): Promise<TodaySession[]> {
  const supabase = createServerSupabase();
  const day = isoDate(date);
  const dayKey = weekdayKey(date);

  const { data: subjects } = await supabase
    .from("batch_subjects")
    .select("id, days, start_time, end_time, colour, subject:subjects(name), teacher:teachers(full_name), batch:batches(id, name, grade, status, deleted_at, batch_students(count))")
    .eq("status", "active")
    .is("deleted_at", null)
    .contains("days", [dayKey])
    .order("start_time");

  const live = (subjects ?? []).filter((s) => {
    const b = s.batch as unknown as { status: string; deleted_at: string | null } | null;
    return b && b.status === "active" && !b.deleted_at;
  });

  const ids = live.map((s) => s.id);
  const { data: sessions } = ids.length
    ? await supabase
        .from("sessions")
        .select("id, batch_subject_id, status, started_at, completed_at, attendance(count)")
        .eq("session_date", day)
        .in("batch_subject_id", ids)
    : { data: [] };

  const bySubject = new Map(
    (sessions ?? []).map((s) => [
      s.batch_subject_id,
      { id: s.id, status: s.status as string, marked: (s.attendance as unknown as { count: number }[])?.[0]?.count ?? 0, startedAt: s.started_at, completedAt: s.completed_at },
    ])
  );

  return live.map((s) => {
    const subject = s.subject as unknown as { name: string } | null;
    const teacher = s.teacher as unknown as { full_name: string } | null;
    const batch = s.batch as unknown as { id: string; name: string; grade: number; batch_students: { count: number }[] } | null;
    const sess = bySubject.get(s.id);
    const state: SessionState = sess?.status === "completed" ? "completed" : sess?.status === "in_progress" ? "in_progress" : "not_started";
    return {
      batchSubjectId: s.id,
      batchId: batch?.id ?? "",
      batchName: batch?.name ?? "Batch",
      grade: batch?.grade ?? 0,
      subjectName: subject?.name ?? "—",
      teacherName: teacher?.full_name ?? null,
      colour: s.colour,
      startTime: s.start_time?.slice(0, 5) ?? null,
      endTime: s.end_time?.slice(0, 5) ?? null,
      enrolled: batch?.batch_students?.[0]?.count ?? 0,
      sessionId: sess?.id ?? null,
      state,
      marked: sess?.marked ?? 0,
      startedAt: sess?.startedAt ?? null,
      completedAt: sess?.completedAt ?? null,
    };
  });
}

/** Group sessions by start time for a calendar-style layout. */
export function groupByTime(sessions: TodaySession[]): { time: string | null; items: TodaySession[] }[] {
  const groups = new Map<string, TodaySession[]>();
  for (const s of sessions) {
    const key = s.startTime ?? "—";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  return Array.from(groups.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([time, items]) => ({ time: time === "—" ? null : time, items }));
}
