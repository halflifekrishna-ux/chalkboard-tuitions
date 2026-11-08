import type { SupabaseClient } from "@supabase/supabase-js";

/** A WhatsApp message that starts with DEMO, in any case. */
export const DEMO_RE = /^\s*demo\b/i;

export const DEMO_WAIT_MINUTES = 10;

/** The alert carries no name, number or message: it only says someone is waiting. */
export const DEMO_ALERT_TEXT = "DEMO lead waiting, 10 min";

export async function demoMessage(db: SupabaseClient): Promise<string> {
  const { data } = await db.from("crm_demo_settings").select("message").maybeSingle();
  return ((data?.message as string | undefined) ?? "").trim();
}

export async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) {
    console.error("demo alert: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set");
    return false;
  }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/**
 * Posts the Telegram alert for DEMO leads still waiting after ten minutes, once
 * each. A lead counts as handled once staff mark it, or contact it by any route.
 * Pass `leadId` to check just one lead. Runs with the service client so it works
 * with no staff signed in; it selects ids and timestamps only.
 */
export async function alertOverdueDemos(db: SupabaseClient, leadId?: string): Promise<number> {
  const cutoff = new Date(Date.now() - DEMO_WAIT_MINUTES * 60_000).toISOString();
  let q = db.from("crm_leads").select("id")
    .is("deleted_at", null)
    .not("demo_requested_at", "is", null).lte("demo_requested_at", cutoff)
    .is("demo_handled_at", null).is("demo_alerted_at", null)
    .is("last_contacted_at", null)
    .in("status", ["new", "assigned"]);
  if (leadId) q = q.eq("id", leadId);
  const { data } = await q.limit(20);

  let sent = 0;
  for (const row of data ?? []) {
    // Claim first so two callers never both alert for the same lead.
    const { data: claimed } = await db.from("crm_leads")
      .update({ demo_alerted_at: new Date().toISOString() })
      .eq("id", row.id).is("demo_alerted_at", null).select("id");
    if (!claimed?.length) continue;
    if (await sendTelegram(DEMO_ALERT_TEXT)) sent += 1;
    else await db.from("crm_leads").update({ demo_alerted_at: null }).eq("id", row.id);
  }
  return sent;
}
