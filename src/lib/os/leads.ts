import { createServerSupabase } from "./supabase-server";

export type LeadVertical = "tuitions" | "studio";

export type LeadStatus =
  | "new"
  | "pending_approval"
  | "assigned"
  | "contacted"
  | "follow_up"
  | "converted"
  | "lost"
  | "rejected";

export const LEAD_STATUS_META: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "#f4c430", bg: "rgba(244,196,48,0.14)" },
  pending_approval: { label: "Awaiting approval", color: "#f4c430", bg: "rgba(244,196,48,0.2)" },
  assigned: { label: "Assigned", color: "#7fc3e8", bg: "rgba(74,158,202,0.16)" },
  contacted: { label: "Contacted", color: "#7fc3e8", bg: "rgba(74,158,202,0.16)" },
  follow_up: { label: "Follow-up", color: "#c3a8e8", bg: "rgba(157,124,216,0.16)" },
  converted: { label: "Converted", color: "#7dc98f", bg: "rgba(125,201,143,0.16)" },
  lost: { label: "Lost", color: "#e8a090", bg: "rgba(220,80,60,0.14)" },
  rejected: { label: "Rejected", color: "#e8a090", bg: "rgba(220,80,60,0.14)" },
};

export const VERTICAL_META: Record<LeadVertical, { label: string; color: string; bg: string }> = {
  tuitions: { label: "Tuitions", color: "#f4c430", bg: "rgba(244,196,48,0.14)" },
  studio: { label: "Learning Studio", color: "#4ec9b0", bg: "rgba(78,201,176,0.14)" },
};

export const LEAD_SOURCES = [
  { value: "marketing", label: "Marketing" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "walk_in", label: "Walk-in" },
  { value: "other", label: "Other" },
] as const;

export const STUDIO_AUDIENCES = [
  { value: "corporate", label: "Corporate team" },
  { value: "college", label: "College / institution" },
  { value: "individual", label: "Individual professional" },
] as const;

/** Statuses an owner can move a live lead to. Terminal states are not listed. */
export const OWNER_NEXT_STATUSES: LeadStatus[] = ["contacted", "follow_up", "converted", "lost"];

export const OPEN_STATUSES: LeadStatus[] = ["new", "pending_approval", "assigned", "contacted", "follow_up"];

export function isOpen(status: LeadStatus): boolean {
  return OPEN_STATUSES.includes(status);
}

/**
 * Where a new lead lands. Tuitions goes straight to its owner; a studio lead
 * waits for the Super Admin before it reaches the studio's BD — that approval
 * gate is the whole difference between the two pipelines.
 */
export async function routeNewLead(
  supabase: ReturnType<typeof createServerSupabase>,
  vertical: LeadVertical
): Promise<{ status: LeadStatus; assigned_to: string | null }> {
  if (vertical === "studio") return { status: "pending_approval", assigned_to: null };
  const owner = await resolveOwner(supabase, "tuitions");
  return owner ? { status: "assigned", assigned_to: owner } : { status: "new", assigned_to: null };
}

/**
 * The admin who owns a vertical's leads: the `lead_routing` setting if it names
 * someone, otherwise the longest-standing active user holding the matching role
 * (admin runs tuitions, bd runs the studio).
 */
export async function resolveOwner(
  supabase: ReturnType<typeof createServerSupabase>,
  vertical: LeadVertical
): Promise<string | null> {
  const { data: setting } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "lead_routing")
    .maybeSingle();

  const configured = (setting?.value as { tuitions_owner_id?: string | null; studio_owner_id?: string | null } | null)?.[
    vertical === "tuitions" ? "tuitions_owner_id" : "studio_owner_id"
  ];
  if (configured) {
    const { data: stillThere } = await supabase
      .from("admins").select("id").eq("id", configured).eq("is_active", true).is("deleted_at", null).maybeSingle();
    if (stillThere) return stillThere.id;
  }

  const roles = vertical === "tuitions" ? ["admin", "branch_admin"] : ["bd"];
  const { data: fallback } = await supabase
    .from("admins")
    .select("id")
    .in("role", roles)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  return fallback?.id ?? null;
}
