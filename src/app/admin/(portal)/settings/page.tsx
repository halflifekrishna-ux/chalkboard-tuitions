import { createServerSupabase } from "@/lib/os/supabase-server";
import { SettingsForm } from "@/components/admin/SettingsForm";
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

  const [{ data: setting }, { data: branches }] = await Promise.all([
    supabase.from("system_settings").select("value").eq("key", "org").maybeSingle(),
    supabase.from("branches").select("name, address, phone, is_active").is("deleted_at", null).order("created_at"),
  ]);

  const org: OrgSettings = { ...DEFAULT_ORG, ...((setting?.value as Partial<OrgSettings>) ?? {}) };

  return (
    <div className="space-y-6 pb-8">
      <header>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          Integrations (WhatsApp, reports, receipts) read from here — nothing is hardcoded.
        </p>
      </header>

      <SettingsForm org={org} action={saveOrgSettings} />

      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>
          Branches
        </h2>
        <div className="rounded-2xl divide-y" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          {(branches ?? []).map((b) => (
            <div key={b.name} className="p-4" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
              <p className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>
                {b.name} {b.is_active ? "" : "(inactive)"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,232,0.45)" }}>
                {b.address} · {b.phone}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
