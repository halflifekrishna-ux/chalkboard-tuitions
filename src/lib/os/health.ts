import { createServerSupabase } from "./supabase-server";
import { PHOTO_BUCKET, DOCS_BUCKET } from "./storage";

export type HealthState = "ok" | "warn" | "down";

export interface ServiceHealth {
  name: string;
  state: HealthState;
  detail: string;
}

/** Live environment checks for the Developer panel. Never throws. */
export async function checkEnvironment(): Promise<ServiceHealth[]> {
  const supabase = createServerSupabase();
  const results: ServiceHealth[] = [];

  // Supabase — a lightweight query proves connectivity + auth.
  try {
    const { error } = await supabase.from("feature_flags").select("key").limit(1);
    results.push(
      error
        ? { name: "Supabase", state: "down", detail: error.message }
        : { name: "Supabase", state: "ok", detail: "Connected" }
    );
  } catch (e) {
    results.push({ name: "Supabase", state: "down", detail: (e as Error).message });
  }

  // WhatsApp — credentials present means dispatch is live; absent means queue-only.
  const waConfigured = Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  results.push({
    name: "WhatsApp",
    state: waConfigured ? "ok" : "warn",
    detail: waConfigured ? "Credentials set — dispatch live" : "Not configured — messages queue safely",
  });

  // Storage — both private buckets should exist.
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      results.push({ name: "Storage", state: "down", detail: error.message });
    } else {
      const ids = new Set((data ?? []).map((b) => b.id));
      const missing = [PHOTO_BUCKET, DOCS_BUCKET].filter((b) => !ids.has(b));
      results.push(
        missing.length
          ? { name: "Storage", state: "warn", detail: `Missing buckets: ${missing.join(", ")}` }
          : { name: "Storage", state: "ok", detail: "Buckets ready" }
      );
    }
  } catch (e) {
    results.push({ name: "Storage", state: "down", detail: (e as Error).message });
  }

  return results;
}
