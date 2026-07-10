"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";

const schema = z.object({
  password: z.string().min(8, "Use at least 8 characters"),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export interface ChangeState { error?: string }

export async function changePassword(_prev: ChangeState, formData: FormData): Promise<ChangeState> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createServerSupabase();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  await supabase.from("admins").update({ must_change_password: false }).eq("id", admin.id);
  await supabase.from("activity_logs").insert({ actor_id: admin.id, entity_type: "auth", action: "password_changed", summary: `${admin.full_name} changed their password` });

  redirect("/admin");
}
