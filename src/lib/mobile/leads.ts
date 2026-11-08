import type { SupabaseClient } from "@supabase/supabase-js";

const DAY_MS = 86_400_000;

export const lastTen = (phone: string) => phone.replace(/[^0-9]/g, "").slice(-10);

export async function followUpDays(db: SupabaseClient): Promise<number[]> {
  const { data } = await db.from("crm_follow_up_settings").select("days").maybeSingle();
  return (data?.days as number[] | undefined) ?? [1, 3, 7];
}

/**
 * Follow-up clock. Schedule days count from the first reply, so {1,3,7} sends at
 * +1, +3 and +7. Once the last one has been sent the lead comes back a day later
 * flagged `exhausted`, for a person to close or keep. Nothing closes itself.
 */
export function nextAfterSend(step: number, days: number[], now = new Date()) {
  const gap = step < days.length ? days[step] - (step > 0 ? days[step - 1] : 0) : 1;
  const at = new Date(now.getTime() + Math.max(gap, 1) * DAY_MS);
  return { follow_up_step: step + 1, follow_up_at: at.toISOString() };
}

export function isExhausted(step: number, days: number[]) {
  return step > days.length;
}

/** Keeps the fields the OS lead page already shows in step with the clock. */
export function nextActionFields(step: number, days: number[], followUpAt: string | null, reasonLabel?: string | null) {
  if (!followUpAt) return { next_action: null, next_action_at: null };
  const what = step === 0
    ? "First reply"
    : isExhausted(step, days) ? "Close or keep" : `WhatsApp follow-up ${step}`;
  return {
    next_action: reasonLabel ? `${what} · ${reasonLabel}` : what,
    next_action_at: new Date(new Date(followUpAt).getTime() + 19_800_000).toISOString().slice(0, 10),
  };
}
