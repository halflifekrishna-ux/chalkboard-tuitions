import { EXIT_REASON_LABELS, type ExitReason } from "./enrolment";

export interface InsightStudent {
  id: string;
  full_name: string;
  grade: number;
  board: string;
  status: string;
  deleted_at: string | null;
}

export interface InsightStint {
  id: string;
  student_id: string;
  joined_on: string;
  exit_type: string | null;
  exited_on: string | null;
  classes_at_exit: string[];
  date_confirmed: boolean;
}

export interface InsightDetail {
  enrolment_id: string;
  reason: string;
}

export interface InsightMark {
  student_id: string;
  status: string;
  session_date: string;
}

export interface Tally {
  label: string;
  count: number;
}

export interface MonthRow {
  month: string;
  label: string;
  joined: number;
  exited: number;
}

export interface AttendanceRate {
  attended: number;
  total: number;
}

export interface NeedsFixing {
  studentId: string;
  name: string;
  issue: string;
}

export interface StudentInsights {
  current: number;
  paused: number;
  exitedTotal: number;
  joinedThisMonth: number;
  exitedThisMonth: number;
  months: MonthRow[];
  medianStayDays: number | null;
  stayCount: number;
  reasons: Tally[];
  byGrade: Tally[];
  byBoard: Tally[];
  byClass: Tally[];
  earlyExits: number;
  datedExits: number;
  beforeExit: AttendanceRate;
  currentAttendance: AttendanceRate;
  needsFixing: NeedsFixing[];
}

export const EARLY_EXIT_DAYS = 90;
const ATTENDANCE_WINDOW_DAYS = 30;

function dayNumber(day: string): number {
  return Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10)) / 86_400_000;
}

function tally(values: string[]): Tally[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return Array.from(counts, ([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function lastTwelveMonths(today: string): MonthRow[] {
  const year = +today.slice(0, 4);
  const month = +today.slice(5, 7) - 1;
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 11 + i, 1));
    return {
      month: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
      joined: 0,
      exited: 0,
    };
  });
}

function rate(marks: InsightMark[]): AttendanceRate {
  return {
    attended: marks.filter((m) => m.status === "present" || m.status === "late").length,
    total: marks.length,
  };
}

/** Removed records are left out everywhere: archiving means it shouldn't count. */
export function computeStudentInsights(
  students: InsightStudent[],
  stints: InsightStint[],
  details: InsightDetail[],
  marks: InsightMark[],
  today: string,
  boardLabels: Record<string, string>
): StudentInsights {
  const live = new Map(students.filter((s) => !s.deleted_at && s.status !== "archived").map((s) => [s.id, s]));
  const counted = stints.filter((e) => live.has(e.student_id));
  const closed = counted.filter((e) => e.exit_type);
  const open = counted.filter((e) => !e.exit_type);
  const reasonOf = new Map(details.map((d) => [d.enrolment_id, d.reason]));

  const months = lastTwelveMonths(today);
  const monthRow = new Map(months.map((m) => [m.month, m]));
  for (const e of counted) {
    const joined = monthRow.get(e.joined_on.slice(0, 7));
    if (joined) joined.joined += 1;
    const exited = e.exited_on ? monthRow.get(e.exited_on.slice(0, 7)) : undefined;
    if (exited) exited.exited += 1;
  }
  const thisMonth = months[months.length - 1];

  const dated = closed.filter((e): e is InsightStint & { exited_on: string } => !!e.exited_on);
  const stays = dated.map((e) => dayNumber(e.exited_on) - dayNumber(e.joined_on)).sort((a, b) => a - b);
  const mid = Math.floor(stays.length / 2);
  const medianStayDays = !stays.length ? null : stays.length % 2 ? stays[mid] : (stays[mid - 1] + stays[mid]) / 2;

  const exitedStudents = closed.map((e) => live.get(e.student_id) as InsightStudent);

  const marksByStudent = new Map<string, InsightMark[]>();
  for (const m of marks) marksByStudent.set(m.student_id, [...(marksByStudent.get(m.student_id) ?? []), m]);
  const beforeExit = dated.flatMap((e) => {
    const end = dayNumber(e.exited_on);
    return (marksByStudent.get(e.student_id) ?? []).filter((m) => {
      const d = dayNumber(m.session_date);
      return d <= end && d > end - ATTENDANCE_WINDOW_DAYS;
    });
  });
  const todayNumber = dayNumber(today);
  const recentCurrent = open.flatMap((e) => (marksByStudent.get(e.student_id) ?? []).filter((m) => {
    const d = dayNumber(m.session_date);
    return d <= todayNumber && d > todayNumber - ATTENDANCE_WINDOW_DAYS;
  }));

  const needsFixing: NeedsFixing[] = [];
  for (const e of counted) {
    const s = live.get(e.student_id) as InsightStudent;
    const issues: string[] = [];
    if (!e.date_confirmed) issues.push("join date not confirmed");
    if (e.exit_type && !e.exited_on) issues.push("exit date missing");
    if (e.exit_type && (reasonOf.get(e.id) ?? "unknown") === "unknown") issues.push("exit reason unknown");
    if (issues.length) needsFixing.push({ studentId: s.id, name: s.full_name, issue: issues.join(", ") });
  }

  return {
    current: open.filter((e) => live.get(e.student_id)?.status !== "inactive" && live.get(e.student_id)?.status !== "paused").length,
    paused: open.filter((e) => live.get(e.student_id)?.status === "inactive" || live.get(e.student_id)?.status === "paused").length,
    exitedTotal: closed.length,
    joinedThisMonth: thisMonth.joined,
    exitedThisMonth: thisMonth.exited,
    months,
    medianStayDays,
    stayCount: stays.length,
    reasons: tally(closed.map((e) => {
      const reason = (reasonOf.get(e.id) ?? "unknown") as ExitReason;
      return EXIT_REASON_LABELS[reason] ?? EXIT_REASON_LABELS.unknown;
    })),
    byGrade: tally(exitedStudents.map((s) => `Grade ${s.grade}`)),
    byBoard: tally(exitedStudents.map((s) => boardLabels[s.board] ?? s.board)),
    byClass: tally(closed.flatMap((e) => e.classes_at_exit)),
    earlyExits: stays.filter((d) => d < EARLY_EXIT_DAYS).length,
    datedExits: stays.length,
    beforeExit: rate(beforeExit),
    currentAttendance: rate(recentCurrent),
    needsFixing: needsFixing.sort((a, b) => a.name.localeCompare(b.name)),
  };
}
