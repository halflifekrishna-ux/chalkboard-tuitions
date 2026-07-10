"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";

const orgSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  phone: z.string().min(10, "Enter a valid phone"),
  whatsapp: z.string().min(10, "Enter a valid WhatsApp number"),
  email: z.string().email("Enter a valid email"),
  address: z.string().min(3, "Address is required"),
  timezone: z.string().min(3),
  academic_year: z.string().regex(/^\d{4}-\d{2}$/, "Format: 2026-27"),
});

export interface SettingsState {
  error?: string;
  saved?: boolean;
}

export async function saveOrgSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const admin = await requireCapability("settings.manage");
  const parsed = orgSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createServerSupabase();

  // Preserve keys not in the form (e.g. logo_path).
  const { data: current } = await supabase.from("system_settings").select("value").eq("key", "org").maybeSingle();
  const merged = { ...((current?.value as object) ?? {}), ...parsed.data };

  const { error } = await supabase
    .from("system_settings")
    .upsert({ key: "org", value: merged, description: "Organisation profile" }, { onConflict: "key" });
  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    actor_id: admin.id,
    entity_type: "settings",
    action: "settings_changed",
    summary: `Organisation settings updated by ${admin.full_name}`,
  });

  revalidatePath("/admin/settings");
  return { saved: true };
}

/* ── Branches ──────────────────────────────────────────────────────────────── */

const branchSchema = z.object({
  name: z.string().min(2, "Branch name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export async function updateBranch(branchId: string, _prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const admin = await requireCapability("settings.manage");
  const parsed = branchSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("branches")
    .update({ name: parsed.data.name, address: parsed.data.address || null, phone: parsed.data.phone || null })
    .eq("id", branchId);
  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "settings", action: "branch_updated",
    summary: `Branch "${parsed.data.name}" updated`,
  });
  revalidatePath("/admin/settings");
  return { saved: true };
}

/* ── Academic years ────────────────────────────────────────────────────────── */

export async function addAcademicYear(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const admin = await requireCapability("settings.manage");
  const name = String(formData.get("name") ?? "").trim();
  if (!/^\d{4}-\d{2}$/.test(name)) return { error: "Format: 2026-27" };

  const supabase = createServerSupabase();
  const { data: branch } = await supabase.from("branches").select("id").eq("is_active", true).limit(1).single();
  if (!branch) return { error: "No active branch found." };

  const { error } = await supabase
    .from("academic_years")
    .insert({ branch_id: branch.id, name, is_current: false });
  if (error) {
    if (error.code === "23505") return { error: "That academic year already exists." };
    return { error: error.message };
  }
  void admin;
  revalidatePath("/admin/settings");
  return { saved: true };
}

export async function setCurrentAcademicYear(yearId: string): Promise<void> {
  const admin = await requireCapability("settings.manage");
  const supabase = createServerSupabase();

  const { data: year } = await supabase.from("academic_years").select("branch_id, name").eq("id", yearId).single();
  if (!year) return;

  // One current per branch: clear then set (the partial unique index enforces this).
  await supabase.from("academic_years").update({ is_current: false }).eq("branch_id", year.branch_id);
  await supabase.from("academic_years").update({ is_current: true }).eq("id", yearId);

  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "settings", action: "academic_year_changed",
    summary: `Current academic year set to ${year.name}`,
  });
  revalidatePath("/admin/settings");
}
