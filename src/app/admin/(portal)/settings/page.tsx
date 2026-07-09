import { createServerSupabase } from "@/lib/os/supabase-server";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { BranchesSettings, AcademicYearsSettings, type BranchRow, type YearRow } from "@/components/admin/SettingsExtras";
import type { OrgSettings } from "@/lib/os/types";
import { saveOrgSettings } from "./actions";

export const dynamic = "force-dynamic";

const DEFAULT_ORG: OrgSettings = {
  business_name: "Chalkboard Tuitions",
  logo_path: "",
  phone: "+917411446381",
  whatsapp: "+917411446381",
  email: "chalkboardtuitions@gmail.com",
  address: "Kammanahalli, Bangalore, Karnataka",
  timezone: "Asia/Kolkata",
  academic_year: "2026-27",
};

export default async function SettingsPage() {
  const supabase = createServerSupabase();

  const [{ data: setting }, { data: branches }, { data: years }] = await Promise.all([
    supabase.from("system_settings").select("value").eq("key", "org").maybeSingle(),
    supabase.from("branches").select("id, name, address, phone, is_active").is("deleted_at", null).order("created_at"),
    supabase.from("academic_years").select("id, name, is_current").order("name", { ascending: false }),
  ]);

  const org: OrgSettings = { ...DEFAULT_ORG, ...((setting?.value as Partial<OrgSettings>) ?? {}) };

  return (
    <div className="space-y-6 pb-8">
      <header>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          Integrations (WhatsApp, reports, receipts) read from here — nothing is hardcoded.
        </p>
      </header>

      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>Organisation</h2>
        <SettingsForm org={org} action={saveOrgSettings} />
      </section>

      <BranchesSettings branches={(branches ?? []) as BranchRow[]} />

      <AcademicYearsSettings years={(years ?? []) as YearRow[]} />
    </div>
  );
}
