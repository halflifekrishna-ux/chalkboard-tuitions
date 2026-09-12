export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getResend, FROM_EMAIL, ADMIN_EMAIL } from "@/lib/resend";
import { CONTACT_EMAIL } from "@/lib/contact";

/**
 * POST /api/studio-enquiry — Learning Studio's enquiry form.
 *
 * Email-only by design: it notifies the team (reply-to = the enquirer) and
 * stores nothing. The existing `leads` table is shaped for Tuitions (phone,
 * child grade and board are NOT NULL), and database changes are out of scope
 * for the marketing site. Separate from /api/contact, the Tuitions
 * demo-class flow. Fails loudly (502) if the email can't be sent, so the
 * visitor is told to email us instead of believing it went through.
 */
const AUDIENCES = new Set(["Corporate team", "College / institution", "Individual professional"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK = `Please email us directly at ${CONTACT_EMAIL}.`;

function text(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — report success so bots don't retry.
  if (text(body.website, 200)) return NextResponse.json({ success: true });

  const name = text(body.name, 120);
  const email = text(body.email, 200);
  const organisation = text(body.organisation, 160);
  const audience = text(body.audience, 60);
  const area = text(body.area, 80);
  const size = text(body.size, 40);
  const message = text(body.message, 4000);

  if (!name || !email || !organisation || !audience || !message) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!AUDIENCES.has(audience)) {
    return NextResponse.json({ error: "Please choose who the learning is for." }, { status: 400 });
  }

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Organisation", organisation],
    ["For", audience],
    ["Programme area", area || "—"],
    ["Group size", size || "—"],
  ];
  const subject = `Learning Studio enquiry — ${organisation} (${audience})`.replace(/[\r\n]+/g, " ");
  const html = `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a2e;">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c9a227;">Chalkboard Learning Studio</p>
  <h2 style="margin:0 0 16px;color:#1e3a2f;font-family:Georgia,serif;">New enquiry</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888;width:140px;">${k}</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">${esc(v)}</td></tr>`
      )
      .join("")}
  </table>
  <p style="margin:20px 0 6px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Learning problem</p>
  <div style="white-space:pre-wrap;font-size:14px;line-height:1.6;background:#faf8f4;border-left:3px solid #f4c430;padding:12px 16px;">${esc(message)}</div>
  <p style="margin-top:20px;font-size:12px;color:#888;">Reply to this email to respond to ${esc(name)} directly.</p>
</div>`;
  const plain = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nLearning problem:\n${message}`;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      reply_to: email,
      subject,
      html,
      text: plain,
    });
    if (error) {
      console.error("Studio enquiry email error:", JSON.stringify(error));
      return NextResponse.json({ error: `We couldn't send your enquiry. ${FALLBACK}` }, { status: 502 });
    }
  } catch (err) {
    console.error("Studio enquiry email exception:", err);
    return NextResponse.json({ error: `We couldn't send your enquiry. ${FALLBACK}` }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
