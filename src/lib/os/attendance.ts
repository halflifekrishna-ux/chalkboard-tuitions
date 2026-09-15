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

/**
 * Every date in this system is a calendar date in the centre's own timezone,
 * never an instant. That distinction matters: these helpers used to read the
 * host's local clock, which is UTC on Vercel, so between midnight and 5:30am
 * IST the server believed it was still yesterday while the browser knew it was
 * today — the two disagreed about which day "Today" meant.
 */
export const ORG_TZ = "Asia/Kolkata";

/** en-CA formats as YYYY-MM-DD, which is exactly the shape the DB stores. */
const ISO_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: ORG_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today's calendar date at the centre, as YYYY-MM-DD. */
export function isoDate(d: Date = new Date()): string {
  return ISO_FMT.format(d);
}

/**
 * DB day-code (mon, tue…) for a calendar date string. Built from a UTC
 * instant so no timezone can shift it onto the neighbouring day — a plain
 * `new Date("2026-03-01")` is midnight UTC and reads as Feb 28 west of
 * Greenwich.
 */
export function weekdayKey(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAY_KEYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** Shift a calendar date by whole days, staying in calendar space. */
export function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  t.setUTCDate(t.getUTCDate() + delta);
  return t.toISOString().slice(0, 10);
}

/** True for a well-formed YYYY-MM-DD. */
export function isIsoDate(v: string | undefined | null): v is string {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

/**
 * Format a calendar date for display. Parsed as UTC and rendered in UTC so
 * the label always names the same day it was given.
 */
export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", { ...opts, timeZone: "UTC" });
}

/** Hour of day (0-23) at the centre right now — the server clock is UTC. */
export function orgHour(d: Date = new Date()): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: ORG_TZ, hour: "2-digit", hour12: false }).format(d));
}

export function fmtTime(t: string | null): string {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ampm}`;
}
