import { createServerSupabase } from "./supabase-server";
import { weekdayKey, isoDate } from "./attendance";
import { stateFromStatus, type SessionCategory, type SessionState } from "./session-meta";

// Labels/colours live in session-meta so client components can import them too.
export * from "./session-meta";

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
  /** Combined Class, or Individual Attention (the whole class is one student). */
  category: SessionCategory;
  studentId: string | null;
  studentName: string | null;
  /** What to read first: the student for Individual Attention, else the class. */
  headline: string;
  /** Why it didn't run — holiday name, or Nanditha's own note. */
  stateNote: string | null;
  /** True when "holiday" comes from the public-holiday calendar, not a saved session. */
  holidayDerived: boolean;
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
      // `students!student_id` is explicit: batches reaches students both directly
      // (Individual Attention) and through batch_students, which is ambiguous.
      "id, name, grade, room, start_time, end_time, status, deleted_at, session_category, student_id, student:students!student_id(full_name), batch_students(count), batch_subjects(id, subject_id, colour, status, deleted_at, subject:subjects(name), teacher:teachers(full_name))"
    )
    .eq("status", "active")
    .is("deleted_at", null)
    .contains("days", [dayKey])
    .order("start_time");

  const live = batches ?? [];
  const ids = live.map((b) => b.id);
  const [{ data: sessions }, { data: holiday }] = await Promise.all([
    ids.length
      ? supabase
          .from("sessions")
          .select("id, batch_id, status, subject_ids, started_at, completed_at, session_category, student_id, state_note, rescheduled_to_session_id, student:students!student_id(full_name), attendance(count)")
          .eq("session_date", day)
          .in("batch_id", ids)
      : Promise.resolve({ data: [] as unknown[] }),
    supabase.from("holidays").select("name").eq("holiday_date", day).maybeSingle(),
  ]);
  const holidayName = (holiday?.name as string | undefined) ?? null;

  type SessionRow = {
    id: string; batch_id: string; status: string; subject_ids: string[] | null;
    started_at: string | null; completed_at: string | null;
    session_category: SessionCategory | null; student_id: string | null;
    state_note: string | null; rescheduled_to_session_id: string | null;
    student: { full_name: string } | null;
    attendance: { count: number }[] | null;
  };

  const byBatch = new Map(
    ((sessions ?? []) as unknown as SessionRow[]).map((s) => [
      s.batch_id,
      {
        id: s.id,
        status: s.status,
        subjectIds: s.subject_ids ?? [],
        marked: s.attendance?.[0]?.count ?? 0,
        startedAt: s.started_at,
        completedAt: s.completed_at,
        category: s.session_category,
        studentId: s.student_id,
        studentName: s.student?.full_name ?? null,
        stateNote: s.state_note,
        rescheduledTo: s.rescheduled_to_session_id,
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

    // The session's own copy wins once it exists, so editing one occurrence
    // never rewrites the recurring class.
    const category = (sess?.category ?? (b.session_category as SessionCategory | null) ?? "combined_class") as SessionCategory;
    const studentName = sess?.studentName ?? (b.student as unknown as { full_name: string } | null)?.full_name ?? null;
    const isIndividual = category === "individual_attention";

    // No session row yet on a public holiday → show it as not conducted,
    // without writing anything.
    const state: SessionState = sess ? stateFromStatus(sess.status) : holidayName ? "holiday" : "not_started";
    const holidayDerived = !sess && !!holidayName;

    return {
      batchId: b.id,
      batchName: b.name,
      grade: b.grade ?? 0,
      room: b.room,
      subjects,
      coveredSubjectIds: sess?.subjectIds ?? subjects.map((s) => s.subjectId),
      startTime: b.start_time?.slice(0, 5) ?? null,
      endTime: b.end_time?.slice(0, 5) ?? null,
      enrolled: isIndividual ? 1 : (b.batch_students as unknown as { count: number }[])?.[0]?.count ?? 0,
      sessionId: sess?.id ?? null,
      state,
      marked: sess?.marked ?? 0,
      startedAt: sess?.startedAt ?? null,
      completedAt: sess?.completedAt ?? null,
      category,
      studentId: sess?.studentId ?? (b.student_id as string | null) ?? null,
      studentName,
      headline: isIndividual ? studentName ?? "Student" : b.name,
      stateNote: sess?.stateNote ?? (holidayDerived ? holidayName : null),
      holidayDerived,
    };
  });
}

export interface DayCount {
  /** Active classes whose weekly pattern includes this day. */
  scheduled: number;
  /** Sessions already completed on this date. */
  done: number;
}

/**
 * Per-day class counts for the whole month containing `anchorIso` — what the
 * month calendar needs to show which days have classes and which are already
 * marked. Two queries, computed in memory: classes recur by weekday, so the
 * only per-date lookup is the sessions actually saved.
 */
export async function getMonthOverview(anchorIso: string): Promise<Record<string, DayCount>> {
  const supabase = createServerSupabase();
  const anchor = new Date(`${anchorIso}T00:00:00`);
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);

  const [{ data: batches }, { data: sessions }] = await Promise.all([
    supabase.from("batches").select("days").eq("status", "active").is("deleted_at", null),
    supabase
      .from("sessions")
      .select("session_date, status")
      .gte("session_date", isoDate(first))
      .lte("session_date", isoDate(last)),
  ]);

  const perWeekday = new Map<string, number>();
  for (const b of batches ?? []) {
    for (const d of ((b.days as string[] | null) ?? [])) perWeekday.set(d, (perWeekday.get(d) ?? 0) + 1);
  }

  const doneByDate = new Map<string, number>();
  for (const s of sessions ?? []) {
    if (s.status !== "completed") continue;
    const key = s.session_date as string;
    doneByDate.set(key, (doneByDate.get(key) ?? 0) + 1);
  }

  const out: Record<string, DayCount> = {};
  for (const d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const iso = isoDate(d);
    const scheduled = perWeekday.get(weekdayKey(d)) ?? 0;
    const done = doneByDate.get(iso) ?? 0;
    if (scheduled || done) out[iso] = { scheduled, done };
  }
  return out;
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

/** The public holiday on a date, if any — drives the calendar banner. */
export async function getHoliday(dateIso: string): Promise<{ name: string } | null> {
  const supabase = createServerSupabase();
  const { data } = await supabase.from("holidays").select("name").eq("holiday_date", dateIso).maybeSingle();
  return data ? { name: data.name as string } : null;
}
