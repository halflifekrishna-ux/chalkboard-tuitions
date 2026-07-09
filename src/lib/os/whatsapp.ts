import { createServerSupabase } from "./supabase-server";

/**
 * WhatsApp service layer (Meta Cloud API).
 *
 * - All message copy lives in TEMPLATES — call sites pass a template_key + variables.
 * - enqueue() only inserts communication_queue rows (attendance never blocks on Meta).
 * - processQueue() is best-effort dispatch; a future worker/cron can call it too.
 * - Delivery lifecycle: queue pending → sent; whatsapp_logs sent → delivered → read
 *   via webhook using provider_id (webhook route can be added without schema change).
 */

export type TemplateKey =
  | "attendance_present"
  | "attendance_absent"
  | "attendance_late"
  | "attendance_excused"
  | "homework"
  | "weekly_report"
  | "fee_reminder";

export interface TemplateVars {
  parent_name?: string;
  student_name?: string;
  class_name?: string;
  [key: string]: string | undefined;
}

interface Template {
  /** Approved template name in Meta Business Manager. */
  metaName: string;
  /** Text body used for session-window messages and logging previews. */
  body: (v: TemplateVars) => string;
}

export const TEMPLATES: Record<TemplateKey, Template> = {
  attendance_present: {
    metaName: "attendance_present",
    body: (v) =>
      `Hello ${v.parent_name}\n\nThis is an automated update from Chalkboard Tuitions.\n\n${v.student_name} attended today's class.\n\nThank you.`,
  },
  attendance_absent: {
    metaName: "attendance_absent",
    body: (v) =>
      `Hello ${v.parent_name}\n\nThis is an automated update from Chalkboard Tuitions.\n\n${v.student_name} was absent today.\n\nPlease contact us if this was unexpected.`,
  },
  attendance_late: {
    metaName: "attendance_late",
    body: (v) =>
      `Hello ${v.parent_name}\n\nThis is an automated update from Chalkboard Tuitions.\n\n${v.student_name} attended today's class but arrived late.\n\nThank you.`,
  },
  attendance_excused: {
    metaName: "attendance_excused",
    body: (v) =>
      `Hello ${v.parent_name}\n\nThis is an automated update from Chalkboard Tuitions.\n\n${v.student_name}'s absence today was excused.\n\nThank you.`,
  },
  homework: {
    metaName: "homework_update",
    body: (v) =>
      `Hello ${v.parent_name}\n\nHomework for ${v.student_name} (${v.class_name}):\n\n${v.homework}\n\n— Chalkboard Tuitions`,
  },
  weekly_report: {
    metaName: "weekly_report",
    body: (v) =>
      `Hello ${v.parent_name}\n\n${v.student_name}'s weekly report from Chalkboard Tuitions is ready.\n\n${v.summary ?? ""}`,
  },
  fee_reminder: {
    metaName: "fee_reminder",
    body: (v) =>
      `Hello ${v.parent_name}\n\nA gentle reminder from Chalkboard Tuitions: ${v.fee_title ?? "a fee"} for ${v.student_name} is due.\n\nPlease reach out for any questions.`,
  },
};

export interface QueueItem {
  template_key: TemplateKey;
  to_number: string;
  payload: TemplateVars;
  student_id?: string;
  parent_id?: string;
  session_id?: string;
}

/** Insert queue rows only — never talks to Meta. Safe inside the save transaction path. */
export async function enqueueMessages(items: QueueItem[]) {
  if (!items.length) return;
  const supabase = createServerSupabase();
  await supabase.from("communication_queue").insert(
    items.map((i) => ({
      template_key: i.template_key,
      to_number: i.to_number,
      payload: i.payload,
      student_id: i.student_id ?? null,
      parent_id: i.parent_id ?? null,
      session_id: i.session_id ?? null,
    }))
  );
}

function isConfigured() {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

async function sendViaMeta(toNumber: string, key: TemplateKey, vars: TemplateVars): Promise<string> {
  const tpl = TEMPLATES[key];
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toNumber.replace(/[^0-9]/g, ""),
        type: "template",
        template: {
          name: tpl.metaName,
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: vars.parent_name ?? "" },
                { type: "text", text: vars.student_name ?? "" },
              ],
            },
          ],
        },
      }),
    }
  );
  const json = (await res.json()) as { messages?: { id: string }[]; error?: { message: string } };
  if (!res.ok || !json.messages?.[0]?.id) {
    throw new Error(json.error?.message ?? `Meta API error (HTTP ${res.status})`);
  }
  return json.messages[0].id;
}

const MAX_RETRIES = 3;

/**
 * Best-effort dispatch of pending queue rows. Called fire-and-forget after
 * attendance saves; also callable from a retry button or future cron worker.
 * Without Meta credentials, rows simply stay pending — nothing is lost.
 */
export async function processQueue(limit = 25): Promise<{ sent: number; failed: number; skipped: boolean }> {
  if (!isConfigured()) return { sent: 0, failed: 0, skipped: true };

  const supabase = createServerSupabase();
  const { data: rows } = await supabase
    .from("communication_queue")
    .select("id, template_key, to_number, payload, student_id, parent_id")
    .eq("status", "pending")
    .lt("retry_count", MAX_RETRIES)
    .order("created_at")
    .limit(limit);

  if (!rows?.length) return { sent: 0, failed: 0, skipped: false };

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    // Claim: pending → processing (skip if another invocation grabbed it).
    const { data: claimed } = await supabase
      .from("communication_queue")
      .update({ status: "processing" })
      .eq("id", row.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    const key = row.template_key as TemplateKey;
    const vars = (row.payload ?? {}) as TemplateVars;
    const bodyText = TEMPLATES[key]?.body(vars) ?? "";

    try {
      const providerId = await sendViaMeta(row.to_number, key, vars);

      await Promise.all([
        supabase
          .from("communication_queue")
          .update({ status: "sent", provider_id: providerId, processed_at: new Date().toISOString(), last_error: null })
          .eq("id", row.id),
        supabase.from("whatsapp_logs").insert({
          parent_id: row.parent_id,
          student_id: row.student_id,
          to_number: row.to_number,
          template_key: key,
          body: bodyText,
          status: "sent",
          provider_id: providerId,
          sent_at: new Date().toISOString(),
        }),
        supabase.from("communications").insert({
          student_id: row.student_id,
          parent_id: row.parent_id,
          type: "whatsapp",
          direction: "outgoing",
          status: "sent",
          message: bodyText,
          metadata: { template_key: key, provider_id: providerId },
        }),
      ]);
      sent++;
    } catch (e) {
      await supabase
        .from("communication_queue")
        .update({
          status: "failed",
          retry_count: (await currentRetryCount(row.id)) + 1,
          last_error: (e as Error).message,
          processed_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      failed++;
    }
  }

  return { sent, failed, skipped: false };
}

async function currentRetryCount(id: string): Promise<number> {
  const supabase = createServerSupabase();
  const { data } = await supabase.from("communication_queue").select("retry_count").eq("id", id).single();
  return data?.retry_count ?? 0;
}

/** Requeue failed rows (retry button / worker). */
export async function requeueFailed() {
  const supabase = createServerSupabase();
  await supabase
    .from("communication_queue")
    .update({ status: "pending" })
    .eq("status", "failed")
    .lt("retry_count", MAX_RETRIES);
}
