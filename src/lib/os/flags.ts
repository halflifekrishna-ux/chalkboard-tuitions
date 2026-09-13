import { createServerSupabase } from "./supabase-server";

export type FeatureKey =
  | "dashboard"
  | "students"
  | "attendance"
  | "whatsapp"
  | "classes"
  | "crm"
  | "homework"
  | "fees"
  | "payments"
  | "teacher_portal"
  | "parent_portal"
  | "student_portal"
  | "ai_reports"
  | "analytics"
  | "qr_attendance";

export type FeatureFlags = Record<FeatureKey, boolean>;

/** Safe defaults if the flags table is unreachable — core admin still works. */
const DEFAULTS: FeatureFlags = {
  dashboard: true,
  students: true,
  attendance: true,
  whatsapp: true,
  classes: true,
  crm: true,
  homework: false,
  fees: false,
  payments: false,
  teacher_portal: false,
  parent_portal: false,
  student_portal: false,
  ai_reports: false,
  analytics: false,
  qr_attendance: false,
};

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const supabase = createServerSupabase();
  const { data } = await supabase.from("feature_flags").select("key, enabled");
  if (!data?.length) return DEFAULTS;

  const flags = { ...DEFAULTS };
  for (const row of data) {
    if (row.key in flags) flags[row.key as FeatureKey] = row.enabled;
  }
  return flags;
}
