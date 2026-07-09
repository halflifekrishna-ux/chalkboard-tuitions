"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Pencil, Plus, Star } from "lucide-react";
import { updateBranch, addAcademicYear, setCurrentAcademicYear, type SettingsState } from "@/app/admin/(portal)/settings/actions";

const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";
const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };

export interface BranchRow {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
}

export interface YearRow {
  id: string;
  name: string;
  is_current: boolean;
}

function SaveBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-xl px-5 py-2.5 font-bold text-sm active:scale-[0.98] disabled:opacity-60" style={{ background: "#c9a227", color: "#162d24" }}>
      {pending ? "Saving…" : label}
    </button>
  );
}

function BranchEditor({ branch }: { branch: BranchRow }) {
  const [editing, setEditing] = useState(false);
  const update = updateBranch.bind(null, branch.id);
  const [state, action] = useFormState<SettingsState, FormData>(async (p, fd) => {
    const r = await update(p, fd);
    if (r.saved) setEditing(false);
    return r;
  }, {});

  if (!editing) {
    return (
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>{branch.name}{branch.is_active ? "" : " (inactive)"}</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,232,0.45)" }}>{branch.address ?? "—"} · {branch.phone ?? "—"}</p>
        </div>
        <button onClick={() => setEditing(true)} aria-label="Edit branch" className="p-2" style={{ color: "rgba(245,240,232,0.5)" }}><Pencil size={14} /></button>
      </div>
    );
  }

  return (
    <form action={action} className="p-4 space-y-2.5">
      <input name="name" defaultValue={branch.name} required placeholder="Branch name" className={inputCls} style={inputStyle} />
      <input name="address" defaultValue={branch.address ?? ""} placeholder="Address" className={inputCls} style={inputStyle} />
      <input name="phone" defaultValue={branch.phone ?? ""} placeholder="Phone" inputMode="tel" className={inputCls} style={inputStyle} />
      {state.error && <p className="text-xs" style={{ color: "#e8a090" }}>{state.error}</p>}
      <div className="flex items-center gap-2">
        <SaveBtn label="Save" />
        <button type="button" onClick={() => setEditing(false)} className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.5)" }}>Cancel</button>
      </div>
    </form>
  );
}

export function BranchesSettings({ branches }: { branches: BranchRow[] }) {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>Branches</h2>
      <div className="rounded-2xl divide-y" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
        {branches.map((b) => (
          <div key={b.id} style={{ borderColor: "rgba(201,162,39,0.1)" }}><BranchEditor branch={b} /></div>
        ))}
      </div>
    </section>
  );
}

export function AcademicYearsSettings({ years }: { years: YearRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [addState, addAction] = useFormState<SettingsState, FormData>(addAcademicYear, {});

  return (
    <section>
      <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>Academic Years</h2>
      <div className="rounded-2xl mb-3 divide-y" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
        {years.map((y) => (
          <div key={y.id} className="flex items-center justify-between px-4 py-3" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
            <span className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>{y.name}</span>
            {y.is_current ? (
              <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#f4c430" }}><Star size={13} fill="#f4c430" /> Current</span>
            ) : (
              <button onClick={() => startTransition(() => setCurrentAcademicYear(y.id))} disabled={isPending} className="text-xs font-semibold rounded-lg px-3 py-1.5" style={{ background: "rgba(201,162,39,0.15)", color: "#f4c430" }}>
                Set current
              </button>
            )}
          </div>
        ))}
      </div>
      <form action={addAction} className="flex items-center gap-2">
        <input name="name" placeholder="2027-28" pattern="\d{4}-\d{2}" required className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]" style={inputStyle} />
        <button type="submit" className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}><Plus size={15} /> Add</button>
      </form>
      {addState.error && <p className="text-xs mt-1.5" style={{ color: "#e8a090" }}>{addState.error}</p>}
    </section>
  );
}
