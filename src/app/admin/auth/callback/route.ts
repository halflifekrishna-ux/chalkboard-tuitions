import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/os/supabase-server";

/** Landing point of the Supabase reset email: swaps the code for a session, then sends the user to /admin/reset. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/admin/reset`);
  }
  return NextResponse.redirect(`${origin}/admin/login?reset=expired`);
}
