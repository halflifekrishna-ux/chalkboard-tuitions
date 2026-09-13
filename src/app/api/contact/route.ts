export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getResend, FROM_EMAIL, ADMIN_EMAIL, buildConfirmationEmail, buildAdminEmail } from "@/lib/resend";

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

    // The enquiry is safely stored by this point. Email is best-effort from
    // here: a Resend outage must not show the parent an error and have them
    // submit again, which is how one enquiry becomes four.
    try {
      const resend = getResend();
      const confirmation = buildConfirmationEmail(name, child_grade);
      const adminNotif = buildAdminEmail({ name, email, phone, child_grade, board, message });

      await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: confirmation.subject,
          html: confirmation.html,
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: adminNotif.subject,
          html: adminNotif.html,
        }),
      ]);
    } catch (mailErr) {
      // Surfaced in the Vercel logs; the lead is already captured.
      console.error("Contact email dispatch failed (lead was saved):", mailErr);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
