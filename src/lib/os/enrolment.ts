/**
 * Who has left, and what that means for registers. Pure (no server imports) so
 * forms, pages and the mobile API all share one definition.
 */

/** Left Chalkboard. `alumni` is the legacy spelling of graduated. */
export const EXIT_STATUSES = ["dropped", "transferred", "graduated", "alumni"] as const;
/** Never on a register or in a class: everyone who left, plus removed records. */
export const OFF_REGISTER_STATUSES = [...EXIT_STATUSES, "archived"] as const;
/** The same list as a PostgREST `not.in` value. */
export const OFF_REGISTER_FILTER = `(${OFF_REGISTER_STATUSES.join(",")})`;

export function hasExited(status: string): boolean {
  return (EXIT_STATUSES as readonly string[]).includes(status);
}

export function isOnRegister(status: string): boolean {
  return !(OFF_REGISTER_STATUSES as readonly string[]).includes(status);
}

export const EXIT_TYPES = ["dropped", "transferred", "graduated"] as const;
export type ExitType = (typeof EXIT_TYPES)[number];
export const EXIT_TYPE_LABELS: Record<ExitType, string> = {
  dropped: "Dropped",
  transferred: "Transferred",
  graduated: "Graduated",
};

/** What staff can pick. `unknown` exists only on records from before this was tracked. */
export const EXIT_REASONS = [
  "fees", "moved_away", "results", "timing", "other_tuition",
  "finished", "health_family", "stopped_coming", "other",
] as const;
export type ExitReason = (typeof EXIT_REASONS)[number] | "unknown";
export const EXIT_REASON_LABELS: Record<ExitReason, string> = {
  fees: "Fees",
  moved_away: "Moved away",
  results: "Unhappy with results",
  timing: "Timing clash",
  other_tuition: "Joined another tuition",
  finished: "Finished course or exams",
  health_family: "Health or family",
  stopped_coming: "Stopped coming",
  other: "Other",
  unknown: "Unknown",
};

/** Today's date in Bangalore as YYYY-MM-DD. */
export function todayIST(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}

export function formatDay(day: string | null | undefined): string {
  if (!day) return "Not recorded";
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}
