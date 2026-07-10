"use client";

import { useFormState, useFormStatus } from "react-dom";
import { KeyRound } from "lucide-react";
import type { ChangeState } from "@/app/admin/change-password/actions";

const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";
const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm disabled:opacity-60" style={{ background: "#c9a227", color: "#162d24" }}>
      <KeyRound size={16} /> {pending ? "Saving…" : "Update password"}
    </button>
  );
}

export function ChangePasswordForm({ action }: { action: (prev: ChangeState, formData: FormData) => Promise<ChangeState> }) {
  const [state, formAction] = useFormState<ChangeState, FormData>(action, {});
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>New password</label>
        <input id="password" name="password" type="password" required autoComplete="new-password" minLength={8} className={inputCls} style={inputStyle} />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Confirm password</label>
        <input id="confirm" name="confirm" type="password" required autoComplete="new-password" minLength={8} className={inputCls} style={inputStyle} />
      </div>
      {state.error && <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(220,80,60,0.15)", color: "#e8a090" }}>{state.error}</p>}
      <Submit />
    </form>
  );
}
