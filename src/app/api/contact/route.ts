export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { resend, FROM_EMAIL, ADMIN_EMAIL, buildConfirmationEmail, buildAdminEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, child_grade, board, message } = body;

    if (!name || !email || !phone || !child_grade || !board) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Store lead in Supabase
    const { error: dbError } = await supabase.from("leads").insert([
      { name, email, phone, child_grade, board, message: message || null },
    ]);

    if (dbError) {
      console.error("Supabase insert error:", JSON.stringify(dbError));
      return NextResponse.json(
        { error: `DB error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Send confirmation email to the lead
    const confirmation = buildConfirmationEmail(name, child_grade);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: confirmation.subject,
      html: confirmation.html,
    });

    // Send admin notification
    const adminNotif = buildAdminEmail({ name, email, phone, child_grade, board, message });
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: adminNotif.subject,
      html: adminNotif.html,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
