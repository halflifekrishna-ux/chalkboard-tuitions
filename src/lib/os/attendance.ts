export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export const ATTENDANCE_META: Record<
  AttendanceStatus,
  { label: string; emoji: string; color: string; bg: string; border: string }
> = {
  present: { label: "Present", emoji: "✅", color: "#7dc98f", bg: "rgba(125,201,143,0.16)", border: "rgba(125,201,143,0.55)" },
  absent: { label: "Absent", emoji: "❌", color: "#e8a090", bg: "rgba(220,80,60,0.16)", border: "rgba(232,120,100,0.55)" },
  late: { label: "Late", emoji: "⏰", color: "#f4c430", bg: "rgba(244,196,48,0.16)", border: "rgba(244,196,48,0.55)" },
  excused: { label: "Excused", emoji: "🟡", color: "#d9b44a", bg: "rgba(201,162,39,0.14)", border: "rgba(201,162,39,0.5)" },
};

export const STATUS_TO_TEMPLATE: Record<AttendanceStatus, string> = {
  present: "attendance_present",
  absent: "attendance_absent",
  late: "attendance_late",
  excused: "attendance_excused",
};

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** DB day-code (mon,tue…) for a given Date in the org timezone (default local). */
export function weekdayKey(d: Date): string {
  return WEEKDAY_KEYS[d.getDay()];
}

/** YYYY-MM-DD for a Date (local). */
export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fmtTime(t: string | null): string {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ampm}`;
}
