export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getResend, FROM_EMAIL, ADMIN_EMAIL } from "@/lib/resend";

/**
 * POST /api/lesson-event: activity from the sample lessons page
 * (/learning-studio/work/lessons, public/learning-studio/sample-lessons.html).
 *
 * Stores nothing: database changes are out of scope for the marketing site.
 * Every valid event is written to the function log. When the visitor came
 * through an outreach link (`?ref=<lead-slug>`), the two events worth acting
 * on (opened the page, finished a lesson) also email the team, so a
 * follow-up can go out while the lesson is fresh. No personal data is sent by
 * the page: only the ref slug, a random session id and the lesson name.
 */
const EVENTS = new Set(["opened", "module_start", "screen", "answer", "complete", "cta_copy"]);
const LESSONS: Record<string, string> = { ai: "Using AI at work", posh: "POSH basics", phish: "Spot the phish" };
const REF_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;
const SID_RE = /^[a-z0-9]{4,12}$/;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 1000) return new NextResponse(null, { status: 204 });
    body = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const ev = typeof body.ev === "string" && EVENTS.has(body.ev) ? body.ev : null;
  if (!ev) return new NextResponse(null, { status: 204 });
  const ref = typeof body.ref === "string" && REF_RE.test(body.ref) ? body.ref : null;
  const sid = typeof body.sid === "string" && SID_RE.test(body.sid) ? body.sid : null;
  const mod = typeof body.mod === "string" && body.mod in LESSONS ? body.mod : null;
  const step = typeof body.i === "number" && body.i >= 0 && body.i < 10 ? body.i : null;
  const correct = typeof body.correct === "boolean" ? body.correct : null;

  console.log("[lesson-event]", JSON.stringify({ ev, ref, sid, mod, step, correct }));

  const notify = ref && (ev === "opened" || (ev === "complete" && mod));
  if (notify && process.env.RESEND_API_KEY) {
    const what = ev === "opened" ? "opened the sample lessons" : `finished "${LESSONS[mod as string]}"`;
    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Sample lessons: ${ref} ${what}`,
        text: `Outreach link ref: ${ref}\nWhat happened: ${what}\nSession: ${sid ?? "unknown"}\nTime: ${new Date().toISOString()}`,
      });
    } catch (e) {
      console.error("[lesson-event] email failed", e);
    }
  }

  return new NextResponse(null, { status: 204 });
}
