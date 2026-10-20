/**
 * Session vocabulary — pure data, safe to import from client components.
 * (schedule.ts re-exports all of this; it cannot be imported client-side
 * because it depends on the server Supabase client.)
 */

export type SessionCategory = "combined_class" | "individual_attention";

export const CATEGORY_META: Record<SessionCategory, { label: string; hint: string; color: string; bg: string }> = {
  combined_class: {
    label: "Combined Class",
    hint: "The whole batch attends together.",
    color: "#7fc3e8",
    bg: "rgba(74,158,202,0.16)",
  },
  individual_attention: {
    label: "Individual Attention",
    hint: "The entire session belongs to one student.",
    color: "#c3a8e8",
    bg: "rgba(157,124,216,0.16)",
  },
};

export const CATEGORY_OPTIONS = (Object.keys(CATEGORY_META) as SessionCategory[]).map((value) => ({
  value,
  label: CATEGORY_META[value].label,
  hint: CATEGORY_META[value].hint,
}));

export type SessionState = "not_started" | "in_progress" | "completed" | "cancelled" | "holiday" | "rescheduled";

export const STATE_META: Record<SessionState, { label: string; color: string; bg: string }> = {
  not_started: { label: "Attendance not marked", color: "rgba(245,240,232,0.6)", bg: "rgba(245,240,232,0.07)" },
  in_progress: { label: "Marking in progress", color: "#f4c430", bg: "rgba(244,196,48,0.15)" },
  completed: { label: "Attendance marked", color: "#7dc98f", bg: "rgba(125,201,143,0.15)" },
  cancelled: { label: "Cancelled", color: "#e8a090", bg: "rgba(220,80,60,0.14)" },
  holiday: { label: "Holiday — not conducted", color: "#e8a090", bg: "rgba(220,80,60,0.12)" },
  rescheduled: { label: "Rescheduled", color: "#d9b44a", bg: "rgba(201,162,39,0.15)" },
};

/** A session that did not take place has no attendance to mark. */
export const NON_DELIVERED: SessionState[] = ["cancelled", "holiday", "rescheduled"];

export function stateFromStatus(status: string | null | undefined): SessionState {
  switch (status) {
    case "in_progress":
    case "completed":
    case "cancelled":
    case "holiday":
    case "rescheduled":
      return status;
    default:
      return "not_started"; // 'scheduled' or no row yet
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(s: string | null | undefined): s is string {
  return !!s && UUID.test(s);
}
