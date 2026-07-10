"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { UserPlus, Copy, Check, ShieldAlert } from "lucide-react";
import type { UserActionState } from "@/app/admin/(portal)/users/actions";
import { ROLE_LABELS, type Role } from "@/lib/os/permissions";

const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";
const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>{label}</label>
      {children}
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="flex items-center gap-2 rounded-xl py-3.5 px-8 font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60" style={{ background: "#c9a227", color: "#162d24" }}>
      <UserPlus size={16} /> {pending ? "Creating…" : "Create User"}
    </button>
  );
}

export function UserForm({
  action,
  branches,
  assignableRoles,
}: {
  action: (prev: UserActionState, formData: FormData) => Promise<UserActionState>;
  branches: { id: string; name: string }[];
  assignableRoles: Role[];
}) {
  const router = useRouter();
  const [state, formAction] = useFormState<UserActionState, FormData>(action, {});
  const [copied, setCopied] = useState(false);

  // After success, show the one-time temporary password.
  if (state.ok && state.tempPassword) {
    return (
      <div className="rounded-2xl p-6 max-w-xl" style={{ background: "rgba(22,45,36,0.85)", border: "1px solid rgba(125,201,143,0.4)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Check size={20} style={{ color: "#7dc98f" }} />
          <h2 className="font-playfair text-xl font-bold" style={{ color: "#f5f0e8" }}>User created</h2>
        </div>
        <p className="text-sm mb-4" style={{ color: "rgba(245,240,232,0.6)" }}>
          Share this temporary password securely. They&apos;ll be required to set a new one at first sign-in.
        </p>
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4" style={{ background: "rgba(245,240,232,0.06)" }}>
          <code className="flex-1 font-mono text-sm" style={{ color: "#f4c430" }}>{state.tempPassword}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(state.tempPassword!); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="flex items-center gap-1 text-xs font-bold rounded-lg px-2.5 py-1.5"
            style={{ background: "rgba(201,162,39,0.15)", color: "#f4c430" }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/admin/users")} className="rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>Done</button>
          <button onClick={() => router.refresh()} className="rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "rgba(245,240,232,0.08)", color: "#f5f0e8" }}>Add another</button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      <Field label="Full name">
        <input name="full_name" required placeholder="e.g. Nanditha" className={inputCls} style={inputStyle} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email">
          <input name="email" type="email" required inputMode="email" className={inputCls} style={inputStyle} />
        </Field>
        <Field label="Phone (optional)">
          <input name="phone" inputMode="tel" className={inputCls} style={inputStyle} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Role">
          <select name="role" defaultValue={assignableRoles[assignableRoles.length - 1]} className={inputCls} style={inputStyle}>
            {assignableRoles.map((r) => (<option key={r} value={r} style={{ color: "#162d24" }}>{ROLE_LABELS[r]}</option>))}
          </select>
        </Field>
        <Field label="Branch">
          <select name="branch_id" defaultValue={branches[0]?.id ?? ""} className={inputCls} style={inputStyle}>
            {branches.map((b) => (<option key={b.id} value={b.id} style={{ color: "#162d24" }}>{b.name}</option>))}
          </select>
        </Field>
      </div>

      <div className="rounded-xl p-3.5 flex items-start gap-2.5" style={{ background: "rgba(244,196,48,0.08)", border: "1px solid rgba(244,196,48,0.25)" }}>
        <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#f4c430" }} />
        <p className="text-xs leading-relaxed" style={{ color: "rgba(245,240,232,0.65)" }}>
          A temporary password is generated on create and shown once. The user must change it at first sign-in.
          Email invites are wired for a future release.
        </p>
      </div>

      {state.error && <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(220,80,60,0.15)", color: "#e8a090" }}>{state.error}</p>}

      <Submit />
    </form>
  );
}
