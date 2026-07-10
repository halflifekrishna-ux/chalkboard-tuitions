"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import { ROLES, canManageRole } from "@/lib/os/permissions";

export interface UserActionState {
  error?: string;
  tempPassword?: string;
  ok?: boolean;
}

const createSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  role: z.enum(ROLES),
  branch_id: z.string().uuid().optional().or(z.literal("")),
});

/** Cryptographically-random temporary password (readable, no ambiguous chars). */
function tempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

async function audit(supabase: ReturnType<typeof createServerSupabase>, actorId: string, action: string, summary: string, targetId?: string) {
  await supabase.from("activity_logs").insert({ actor_id: actorId, entity_type: "user", entity_id: targetId ?? null, action, summary });
}

export async function createUser(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const actor = await requireCapability("users.manage");
  const parsed = createSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
    branch_id: formData.get("branch_id") || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  if (!canManageRole(actor.role, v.role)) return { error: "You cannot create a user with that role." };

  const supabase = createServerSupabase();
  const service = createServiceClient();
  const pw = tempPassword();

  // 1. Create the Supabase auth user (email auto-confirmed) via admin API.
  const { data: created, error: authErr } = await service.auth.admin.createUser({
    email: v.email,
    password: pw,
    email_confirm: true,
  });
  if (authErr || !created.user) {
    return { error: authErr?.message ?? "Could not create the login account." };
  }

  // 2. Create the admins row, linked to the auth user, forced to change password.
  const { data: branch } = v.branch_id
    ? { data: { id: v.branch_id } }
    : await supabase.from("branches").select("id").eq("is_active", true).order("created_at").limit(1).single();

  const { data: row, error: rowErr } = await supabase
    .from("admins")
    .insert({
      auth_user_id: created.user.id,
      full_name: v.full_name,
      email: v.email,
      phone: v.phone || null,
      role: v.role,
      branch_id: branch?.id ?? null,
      is_active: true,
      must_change_password: true,
      created_by: actor.id,
      invited_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (rowErr || !row) {
    // Roll back the auth user so we don't orphan a login.
    await service.auth.admin.deleteUser(created.user.id);
    return { error: rowErr?.message ?? "Could not create the user record." };
  }

  await audit(supabase, actor.id, "user_created", `Created ${v.role} ${v.full_name} (${v.email})`, row.id);
  revalidatePath("/admin/users");
  // Surface the temp password once so the admin can share it securely.
  return { ok: true, tempPassword: pw };
}

async function loadTarget(supabase: ReturnType<typeof createServerSupabase>, id: string) {
  const { data } = await supabase.from("admins").select("id, full_name, email, role, is_active, auth_user_id").eq("id", id).maybeSingle();
  return data;
}

export async function setUserActive(userId: string, active: boolean): Promise<void> {
  const actor = await requireCapability("users.manage");
  const supabase = createServerSupabase();
  const target = await loadTarget(supabase, userId);
  if (!target || !canManageRole(actor.role, target.role)) return;

  const { error } = await supabase.from("admins").update({ is_active: active }).eq("id", userId);
  if (error) return; // last-super-admin guard may block; ignore silently
  await audit(supabase, actor.id, active ? "user_enabled" : "user_disabled", `${active ? "Enabled" : "Disabled"} ${target.full_name}`, userId);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function changeUserRole(userId: string, role: string): Promise<void> {
  const actor = await requireCapability("users.manage");
  if (!ROLES.includes(role as (typeof ROLES)[number])) return;
  const supabase = createServerSupabase();
  const target = await loadTarget(supabase, userId);
  if (!target) return;
  // Must out-rank both the current and the new role.
  if (!canManageRole(actor.role, target.role) || !canManageRole(actor.role, role)) return;

  const { error } = await supabase.from("admins").update({ role }).eq("id", userId);
  if (error) return;
  await audit(supabase, actor.id, "role_changed", `Changed ${target.full_name}'s role to ${role}`, userId);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function resetUserPassword(userId: string): Promise<UserActionState> {
  const actor = await requireCapability("users.manage");
  const supabase = createServerSupabase();
  const target = await loadTarget(supabase, userId);
  if (!target || !target.auth_user_id || !canManageRole(actor.role, target.role)) return { error: "Not permitted." };

  const service = createServiceClient();
  const pw = tempPassword();
  const { error } = await service.auth.admin.updateUserById(target.auth_user_id, { password: pw });
  if (error) return { error: error.message };

  await supabase.from("admins").update({ must_change_password: true }).eq("id", userId);
  await audit(supabase, actor.id, "password_reset", `Reset password for ${target.full_name}`, userId);
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true, tempPassword: pw };
}

export async function softDeleteUser(userId: string): Promise<void> {
  const actor = await requireCapability("users.manage");
  const supabase = createServerSupabase();
  const target = await loadTarget(supabase, userId);
  if (!target || !canManageRole(actor.role, target.role)) return;

  const { error } = await supabase.from("admins").update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", userId);
  if (error) return; // last-super-admin guard blocks removing the final one
  await audit(supabase, actor.id, "user_deleted", `Removed ${target.full_name}`, userId);
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

/**
 * Super Admin transfer — promote a target to super_admin, optionally stepping
 * self down to admin. Lockout-safe: the DB trigger guarantees ≥1 super admin,
 * and we only demote self AFTER the target is promoted.
 */
export async function transferSuperAdmin(targetId: string, stepDown: boolean): Promise<void> {
  const actor = await requireCapability("users.manage");
  if (actor.role !== "super_admin") return;
  const supabase = createServerSupabase();
  const target = await loadTarget(supabase, targetId);
  if (!target || target.id === actor.id) return;

  const { error: promoteErr } = await supabase.from("admins").update({ role: "super_admin" }).eq("id", targetId);
  if (promoteErr) return;
  await audit(supabase, actor.id, "role_changed", `Promoted ${target.full_name} to Super Admin`, targetId);

  if (stepDown) {
    const { error: demoteErr } = await supabase.from("admins").update({ role: "admin" }).eq("id", actor.id);
    if (!demoteErr) await audit(supabase, actor.id, "role_changed", `${actor.full_name} stepped down to Admin`, actor.id);
  }

  revalidatePath("/admin/users");
}
