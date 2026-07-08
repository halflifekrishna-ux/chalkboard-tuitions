"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/os/auth";
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
  const admin = await requireAdmin();
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
