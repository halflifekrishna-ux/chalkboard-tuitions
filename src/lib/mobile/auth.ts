import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { can, type Capability } from "@/lib/os/permissions";

/**
 * Auth for the staff Android app. The APK holds no Supabase URL or key: it signs
 * in through this API and sends a bearer token. Each request gets a client that
 * runs AS that staff member with the anon key, so the same RLS applies as on the
 * web, and the same can() checks sit in front of it. Never the service-role key.
 */

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export interface Staff {
  id: string;
  full_name: string;
  email: string;
  role: string;
  must_change_password: boolean;
}

export function anonClient(token?: string): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
  });
}

export async function loadStaff(db: SupabaseClient, userId: string, email: string | undefined): Promise<Staff> {
  const { data } = await db
    .from("admins")
    .select("id, full_name, email, role, auth_user_id, must_change_password")
    .eq("is_active", true)
    .is("deleted_at", null)
    .or(`auth_user_id.eq.${userId},email.eq.${email}`)
    .maybeSingle();
  if (!data) throw new ApiError(403, "not_staff", "This account isn't an active staff member.");
  if (!data.auth_user_id) await db.from("admins").update({ auth_user_id: userId }).eq("id", data.id);
  return data;
}

export async function requireStaff(req: NextRequest, cap?: Capability) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new ApiError(401, "no_token", "Please sign in.");

  const db = anonClient(token);
  const { data: { user } } = await db.auth.getUser(token);
  if (!user) throw new ApiError(401, "bad_token", "Your session has expired. Please sign in again.");

  const staff = await loadStaff(db, user.id, user.email);
  if (staff.must_change_password) {
    throw new ApiError(403, "must_change_password", "Set a new password on the Chalkboard OS website first.");
  }
  if (cap && !can(staff.role, cap)) throw new ApiError(403, "forbidden", "You don't have permission to do that.");
  return { db, staff };
}

/** The OS section: the capability, plus a live token from entering the PIN. */
export async function requireOsUnlock(req: NextRequest, cap: Capability) {
  const ctx = await requireStaff(req, cap);
  const token = req.headers.get("x-os-unlock") ?? "";
  const { data } = await ctx.db.rpc("os_section_unlocked", { token });
  if (data !== true) throw new ApiError(403, "os_locked", "Enter your PIN to open this section.");
  return ctx;
}
