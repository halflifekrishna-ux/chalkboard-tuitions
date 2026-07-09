"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";

/** Developer panel is Super Admin only. */
export async function requireSuperAdmin() {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") redirect("/admin");
  return admin;
}

export async function toggleFeatureFlag(key: string, enabled: boolean): Promise<void> {
  const admin = await requireSuperAdmin();
  const supabase = createServerSupabase();
  await supabase.from("feature_flags").update({ enabled }).eq("key", key);
  await supabase.from("activity_logs").insert({
    actor_id: admin.id,
    entity_type: "feature_flag",
    action: enabled ? "enabled" : "disabled",
    summary: `Feature flag "${key}" ${enabled ? "enabled" : "disabled"}`,
  });
  revalidatePath("/admin/developer");
  revalidatePath("/admin", "layout");
}
