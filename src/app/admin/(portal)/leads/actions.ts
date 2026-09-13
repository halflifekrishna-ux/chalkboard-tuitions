"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCapability, type AdminProfile } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { can } from "@/lib/os/permissions";
import { routeNewLead, resolveOwner, type LeadStatus } from "@/lib/os/leads";
import { leadSchema, statusUpdateSchema } from "./schema";

export interface LeadActionState {
  error?: string;
  ok?: boolean;
}

async function logEvent(
  supabase: ReturnType<typeof createServerSupabase>,
  leadId: string,
  actorId: string,
  action: string,
  fields: { from?: LeadStatus | null; to?: LeadStatus | null; note?: string | null } = {}
) {
  await supabase.from("crm_lead_events").insert({
    lead_id: leadId,
    actor_id: actorId,
    action,
    from_status: fields.from ?? null,
    to_status: fields.to ?? null,
    note: fields.note ?? null,
  });
}

/** The lead plus whether this admin is allowed to work it. */
async function loadForOwner(supabase: ReturnType<typeof createServerSupabase>, leadId: string, admin: AdminProfile) {
  const { data: lead } = await supabase
    .from("crm_leads")
    .select("id, vertical, status, full_name, assigned_to")
    .eq("id", leadId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!lead) return { lead: null, allowed: false };
  const isAdminTier = can(admin.role, "leads.approve") || admin.role === "admin";
  return { lead, allowed: isAdminTier || lead.assigned_to === admin.id };
}

/**
 * Capture a lead. Tuitions goes straight to its owner; studio is parked for
 * Super Admin approval. Marketing can reach this and nothing else in the
 * pipeline.
 */
export async function createLead(_prev: LeadActionState, formData: FormData): Promise<LeadActionState> {
  const admin = await requireCapability("leads.create");
  const parsed = leadSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = createServerSupabase();
  const { data: branch } = await supabase.from("branches").select("id").eq("is_active", true).order("created_at").limit(1).maybeSingle();
  const routing = await routeNewLead(supabase, v.vertical);

  const { data: lead, error } = await supabase
    .from("crm_leads")
    .insert({
      branch_id: branch?.id ?? null,
      vertical: v.vertical,
      status: routing.status,
      assigned_to: routing.assigned_to,
      full_name: v.full_name,
      phone: v.phone,
      email: v.email || null,
      source: v.source,
      notes: v.notes || null,
      student_grade: v.vertical === "tuitions" ? v.student_grade ?? null : null,
      board: v.vertical === "tuitions" ? v.board ?? null : null,
      organisation: v.vertical === "studio" ? v.organisation || null : null,
      audience: v.vertical === "studio" ? v.audience ?? null : null,
      created_by: admin.id,
    })
    .select("id")
    .single();
  if (error || !lead) return { error: error?.message ?? "Could not save the lead" };

  await logEvent(supabase, lead.id, admin.id, "created", { to: routing.status as LeadStatus });
  await supabase.from("activity_logs").insert({
    actor_id: admin.id,
    entity_type: "lead",
    entity_id: lead.id,
    action: "lead_created",
    summary: `${v.full_name} added as a ${v.vertical === "studio" ? "Learning Studio" : "Tuitions"} lead${routing.status === "pending_approval" ? " — awaiting approval" : ""}`,
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  redirect(`/admin/leads/${lead.id}`);
}

/** Super Admin releases a studio lead to the studio's BD. */
export async function approveLead(leadId: string): Promise<void> {
  const admin = await requireCapability("leads.approve");
  const supabase = createServerSupabase();

  const { data: lead } = await supabase
    .from("crm_leads").select("id, status, full_name, vertical").eq("id", leadId).is("deleted_at", null).maybeSingle();
  if (!lead || lead.status !== "pending_approval") return;

  const owner = await resolveOwner(supabase, lead.vertical);
  await supabase
    .from("crm_leads")
    .update({ status: "assigned", assigned_to: owner, approved_by: admin.id, approved_at: new Date().toISOString() })
    .eq("id", leadId);

  await logEvent(supabase, leadId, admin.id, "approved", { from: "pending_approval", to: "assigned" });
  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "lead", entity_id: leadId, action: "lead_approved",
    summary: `${lead.full_name} approved for Learning Studio${owner ? "" : " (no studio owner set yet)"}`,
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");
}

export async function rejectLead(leadId: string, reason?: string): Promise<void> {
  const admin = await requireCapability("leads.approve");
  const supabase = createServerSupabase();

  const { data: lead } = await supabase
    .from("crm_leads").select("id, status, full_name").eq("id", leadId).is("deleted_at", null).maybeSingle();
  if (!lead || lead.status !== "pending_approval") return;

  await supabase.from("crm_leads").update({ status: "rejected", lost_reason: reason || null }).eq("id", leadId);
  await logEvent(supabase, leadId, admin.id, "rejected", { from: "pending_approval", to: "rejected", note: reason });
  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "lead", entity_id: leadId, action: "lead_rejected",
    summary: `${lead.full_name} declined${reason ? ` — ${reason}` : ""}`,
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

/** The owner moves a lead along and records what happens next. */
export async function updateLeadStatus(leadId: string, _prev: LeadActionState, formData: FormData): Promise<LeadActionState> {
  const admin = await requireCapability("leads.manage");
  const parsed = statusUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = createServerSupabase();
  const { lead, allowed } = await loadForOwner(supabase, leadId, admin);
  if (!lead) return { error: "Lead not found" };
  if (!allowed) return { error: "This lead belongs to someone else." };
  if (lead.status === "pending_approval") return { error: "This lead still needs Super Admin approval." };

  const { error } = await supabase
    .from("crm_leads")
    .update({
      status: v.status,
      next_action: v.next_action || null,
      next_action_at: v.next_action_at || null,
      lost_reason: v.status === "lost" ? v.lost_reason || null : null,
      ...(v.status === "converted" ? { converted_at: new Date().toISOString() } : {}),
    })
    .eq("id", leadId);
  if (error) return { error: error.message };

  await logEvent(supabase, leadId, admin.id, "status_changed", {
    from: lead.status as LeadStatus, to: v.status, note: v.note || v.next_action || null,
  });
  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "lead", entity_id: leadId, action: `lead_${v.status}`,
    summary: `${lead.full_name} moved to ${v.status.replace("_", " ")}`,
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function addLeadNote(leadId: string, _prev: LeadActionState, formData: FormData): Promise<LeadActionState> {
  const admin = await requireCapability("leads.manage");
  const note = (formData.get("note") as string | null)?.trim();
  if (!note) return { error: "Write something first" };

  const supabase = createServerSupabase();
  const { lead, allowed } = await loadForOwner(supabase, leadId, admin);
  if (!lead) return { error: "Lead not found" };
  if (!allowed) return { error: "This lead belongs to someone else." };

  await logEvent(supabase, leadId, admin.id, "note", { note });
  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true };
}
