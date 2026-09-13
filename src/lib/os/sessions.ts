import { createServerSupabase } from "./supabase-server";
import { weekdayKey, isoDate } from "./attendance";

export type SessionState = "not_started" | "in_progress" | "completed";

export interface BatchSubjectOption {
  id: string;
  subjectId: string;
  name: string;
  teacherName: string | null;
  colour: string;
}

export interface TodaySession {
  batchId: string;
  batchName: string;
  grade: number;
  room: string | null;
  subjects: BatchSubjectOption[]; // everything that CAN be taught in this slot
  coveredSubjectIds: string[];    // what was actually picked for this session
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
 * All batches scheduled for `date` (default today) — the batch itself is the
 * recurring template (one dedicated slot, any mix of subjects), merged with
 * any session created for that date. Two queries total — no N+1.
 */
export async function getSessionsForDate(date = new Date()): Promise<TodaySession[]> {
  const supabase = createServerSupabase();
  const day = isoDate(date);
  const dayKey = weekdayKey(date);

  const { data: batches } = await supabase
    .from("batches")
    .select(
      "id, name, grade, room, start_time, end_time, status, deleted_at, batch_students(count), batch_subjects(id, subject_id, colour, status, deleted_at, subject:subjects(name), teacher:teachers(full_name))"
    )
    .eq("status", "active")
    .is("deleted_at", null)
    .contains("days", [dayKey])
    .order("start_time");

  const live = batches ?? [];
  const ids = live.map((b) => b.id);
  const { data: sessions } = ids.length
    ? await supabase
        .from("sessions")
        .select("id, batch_id, status, subject_ids, started_at, completed_at, attendance(count)")
        .eq("session_date", day)
        .in("batch_id", ids)
    : { data: [] };

  const byBatch = new Map(
    (sessions ?? []).map((s) => [
      s.batch_id,
      {
        id: s.id,
        status: s.status as string,
        subjectIds: (s.subject_ids as string[] | null) ?? [],
        marked: (s.attendance as unknown as { count: number }[])?.[0]?.count ?? 0,
        startedAt: s.started_at,
        completedAt: s.completed_at,
      },
    ])
  );

  return live.map((b) => {
    const subjects: BatchSubjectOption[] = (b.batch_subjects as unknown as {
      id: string; subject_id: string; colour: string; status: string; deleted_at: string | null;
      subject: { name: string } | null; teacher: { full_name: string } | null;
    }[])
      .filter((s) => s.status === "active" && !s.deleted_at)
      .map((s) => ({ id: s.id, subjectId: s.subject_id, name: s.subject?.name ?? "—", teacherName: s.teacher?.full_name ?? null, colour: s.colour }));

    const sess = byBatch.get(b.id);
    const state: SessionState = sess?.status === "completed" ? "completed" : sess?.status === "in_progress" ? "in_progress" : "not_started";
    return {
      batchId: b.id,
      batchName: b.name,
      grade: b.grade ?? 0,
      room: b.room,
      subjects,
      coveredSubjectIds: sess?.subjectIds ?? subjects.map((s) => s.subjectId),
      startTime: b.start_time?.slice(0, 5) ?? null,
      endTime: b.end_time?.slice(0, 5) ?? null,
      enrolled: (b.batch_students as unknown as { count: number }[])?.[0]?.count ?? 0,
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
