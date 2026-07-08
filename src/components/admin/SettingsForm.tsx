"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import type { SettingsState } from "@/app/admin/(portal)/settings/actions";
import type { OrgSettings } from "@/lib/os/types";

const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";
const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl py-3.5 px-8 font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60"
      style={{ background: "#c9a227", color: "#162d24" }}
    >
      <Save size={16} /> {pending ? "Saving…" : "Save Settings"}
    </button>
  );
}

export function SettingsForm({
  org,
  action,
}: {
  org: OrgSettings;
  action: (prev: SettingsState, formData: FormData) => Promise<SettingsState>;
}) {
  const [state, formAction] = useFormState<SettingsState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      <Field label="Business name">
        <input name="business_name" defaultValue={org.business_name} required className={inputCls} style={inputStyle} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone">
          <input name="phone" defaultValue={org.phone} required inputMode="tel" className={inputCls} style={inputStyle} />
        </Field>
        <Field label="WhatsApp">
          <input name="whatsapp" defaultValue={org.whatsapp} required inputMode="tel" className={inputCls} style={inputStyle} />
        </Field>
      </div>
      <Field label="Email">
        <input name="email" type="email" defaultValue={org.email} required className={inputCls} style={inputStyle} />
      </Field>
      <Field label="Address">
        <textarea name="address" defaultValue={org.address} required rows={2} className={inputCls} style={inputStyle} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Timezone">
          <input name="timezone" defaultValue={org.timezone} required className={inputCls} style={inputStyle} />
        </Field>
        <Field label="Academic year">
          <input name="academic_year" defaultValue={org.academic_year} required placeholder="2026-27" className={inputCls} style={inputStyle} />
        </Field>
      </div>

      {state.error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(220,80,60,0.15)", color: "#e8a090" }}>
          {state.error}
        </p>
      )}
      {state.saved && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(125,201,143,0.12)", color: "#7dc98f" }}>
          Settings saved.
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
