export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { alertOverdueDemos } from "@/lib/mobile/demo";

/**
 * GET /api/cron/demo-alerts — Telegram alert for DEMO leads nobody has handled
 * within 10 minutes. Backup for the phone, which also checks after 10 minutes:
 * this one still fires if the phone is off. Call it every minute with
 * `Authorization: Bearer $CRON_SECRET` (Vercel Cron on a Pro plan, or any
 * external scheduler). Without CRON_SECRET set it refuses every request.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const alerted = await alertOverdueDemos(createServiceClient());
  return NextResponse.json({ alerted });
}
