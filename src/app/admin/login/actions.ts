"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createServerSupabase } from "@/lib/os/supabase-server";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export interface LoginState {
  error?: string;
}

/** Compact device label from the User-Agent for session tracking. */
function deviceLabel(ua: string): string {
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "Unknown OS";
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${br} · ${os}`;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email } = parsed.data;

  const supabase = createServerSupabase();

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Audit failed login (SECURITY DEFINER RPC, safe pre-auth).
    await supabase.rpc("log_auth_event", { p_email: email, p_action: "login_failed", p_summary: `Failed login for ${email}` });
    return { error: "Invalid email or password." };
  }

  // Session exists — verify this is an allowed, active admin.
  const { data: admin } = await supabase
    .from("admins")
    .select("id, full_name, must_change_password")
    .eq("is_active", true)
    .is("deleted_at", null)
    .ilike("email", email)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    await supabase.rpc("log_auth_event", { p_email: email, p_action: "login_denied", p_summary: `Login denied (no admin access) for ${email}` });
    return { error: "This account does not have admin access." };
  }

  const device = deviceLabel(headers().get("user-agent") ?? "");
  await supabase.from("admins").update({ last_login_at: new Date().toISOString(), last_seen_at: new Date().toISOString(), last_device: device }).eq("id", admin.id);
  await supabase.from("activity_logs").insert({ actor_id: admin.id, entity_type: "auth", action: "login", summary: `${admin.full_name} signed in (${device})` });

  if (admin.must_change_password) redirect("/admin/change-password");
  redirect("/admin");
}

export async function logout() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: admin } = await supabase.from("admins").select("id, full_name").or(`auth_user_id.eq.${user.id},email.eq.${user.email}`).maybeSingle();
    if (admin) await supabase.from("activity_logs").insert({ actor_id: admin.id, entity_type: "auth", action: "logout", summary: `${admin.full_name} signed out` });
  }
  await supabase.auth.signOut();
  redirect("/admin/login");
}
