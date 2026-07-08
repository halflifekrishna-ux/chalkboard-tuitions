import { redirect } from "next/navigation";
import { createServerSupabase } from "./supabase-server";

export interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  branch_id: string | null;
}

/**
 * Auth guard for every /admin page and action.
 * Requires a Supabase session AND an active row in `admins`.
 * Anyone else is bounced to the login screen.
 */
export async function requireAdmin(): Promise<AdminProfile> {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("id, full_name, email, role, branch_id, auth_user_id")
    .eq("is_active", true)
    .is("deleted_at", null)
    .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

  if (!admin) redirect("/admin/login?error=unauthorized");

  // First login: bind the auth user to the seeded admin row.
  if (!admin.auth_user_id) {
    await supabase.from("admins").update({ auth_user_id: user.id }).eq("id", admin.id);
  }

  return admin;
}
