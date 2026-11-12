"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createServerSupabase } from "@/lib/os/supabase-server";

export interface ForgotState {
  error?: string;
  sent?: boolean;
}

const schema = z.object({ email: z.string().email("Enter a valid email") });

/**
 * Sends a Supabase password-reset email. Always reports success for a valid
 * address so the form cannot be used to discover which emails have accounts.
 */
export async function requestReset(_prev: ForgotState, formData: FormData): Promise<ForgotState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;

  const supabase = createServerSupabase();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/admin/auth/callback`,
  });
  await supabase.rpc("log_auth_event", {
    p_email: parsed.data.email,
    p_action: "password_reset_requested",
    p_summary: `Password reset requested for ${parsed.data.email}`,
  });
  return { sent: true };
}
