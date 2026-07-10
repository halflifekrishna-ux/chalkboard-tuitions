import { redirect } from "next/navigation";
import { createServerSupabase } from "./supabase-server";
import { can, type Capability } from "./permissions";

export interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  branch_id: string | null;
  photo_path: string | null;
  must_change_password: boolean;
}

/**
 * Auth guard for every /admin page and action.
 * Requires a Supabase session AND an active row in `admins`.
 * Also refreshes last_seen (throttled) so the Developer panel can show
 * recently-active users. Anyone else is bounced to the login screen.
 */
export async function requireAdmin(): Promise<AdminProfile> {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("id, full_name, email, role, branch_id, auth_user_id, photo_path, must_change_password, last_seen_at")
    .eq("is_active", true)
    .is("deleted_at", null)
    .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

  if (!admin) redirect("/admin/login?error=unauthorized");

  // First login: bind the auth user to the seeded admin row.
  if (!admin.auth_user_id) {
    await supabase.from("admins").update({ auth_user_id: user.id }).eq("id", admin.id);
  }

  // Throttled last_seen refresh (once per ~2 min).
  const stale = !admin.last_seen_at || Date.now() - new Date(admin.last_seen_at).getTime() > 120_000;
  if (stale) {
    await supabase.from("admins").update({ last_seen_at: new Date().toISOString() }).eq("id", admin.id);
  }

  return {
    id: admin.id,
    full_name: admin.full_name,
    email: admin.email,
    role: admin.role,
    branch_id: admin.branch_id,
    photo_path: admin.photo_path,
    must_change_password: admin.must_change_password,
  };
}

/** Guard a page/action by capability. Redirects unauthorized users to /admin. */
export async function requireCapability(cap: Capability): Promise<AdminProfile> {
  const admin = await requireAdmin();
  if (!can(admin.role, cap)) redirect("/admin");
  return admin;
}

/** Guard by ANY of several capabilities (e.g. manage OR view-assigned). */
export async function requireAnyCapability(caps: Capability[]): Promise<AdminProfile> {
  const admin = await requireAdmin();
  if (!caps.some((c) => can(admin.role, c))) redirect("/admin");
  return admin;
}
