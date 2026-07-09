"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import type { ActionState } from "@/app/admin/(portal)/batches/actions";

const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";
const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };

export interface BatchDefaults {
  name?: string;
  academic_year_id?: string;
  grade?: number;
  board?: string | null;
  capacity?: number;
  status?: string;
  notes?: string | null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>{label}</label>
      {children}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="flex items-center gap-2 rounded-xl py-3.5 px-8 font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60" style={{ background: "#c9a227", color: "#162d24" }}>
      <Save size={16} /> {pending ? "Saving…" : label}
    </button>
  );
}

export function BatchForm({
  action,
  academicYears,
  defaults,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  academicYears: { id: string; name: string }[];
  defaults?: BatchDefaults;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "#c9a227" }}>General</h2>
        <div className="space-y-4">
          <Field label="Batch name">
            <input name="name" defaultValue={defaults?.name} required placeholder="e.g. Grade 8 Foundation" className={inputCls} style={inputStyle} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Academic year">
              <select name="academic_year_id" defaultValue={defaults?.academic_year_id ?? academicYears[0]?.id ?? ""} required className={inputCls} style={inputStyle}>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id} style={{ color: "#162d24" }}>{ay.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Grade">
              <select name="grade" defaultValue={defaults?.grade ?? 8} className={inputCls} style={inputStyle}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g} style={{ color: "#162d24" }}>Grade {g}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Board">
              <select name="board" defaultValue={defaults?.board ?? ""} className={inputCls} style={inputStyle}>
                <option value="" style={{ color: "#162d24" }}>Any</option>
                <option value="cbse" style={{ color: "#162d24" }}>CBSE</option>
                <option value="icse" style={{ color: "#162d24" }}>ICSE</option>
                <option value="state_board" style={{ color: "#162d24" }}>State</option>
              </select>
            </Field>
            <Field label="Capacity">
              <input type="number" name="capacity" min={1} max={200} defaultValue={defaults?.capacity ?? 8} className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Status">
              <select name="status" defaultValue={defaults?.status ?? "active"} className={inputCls} style={inputStyle}>
                <option value="active" style={{ color: "#162d24" }}>Active</option>
                <option value="inactive" style={{ color: "#162d24" }}>Inactive</option>
                <option value="archived" style={{ color: "#162d24" }}>Archived</option>
              </select>
            </Field>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "#c9a227" }}>Notes</h2>
        <textarea name="notes" defaultValue={defaults?.notes ?? ""} rows={3} placeholder="Anything worth remembering about this batch…" className={inputCls} style={inputStyle} />
      </div>

      {state.error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(220,80,60,0.15)", color: "#e8a090" }}>{state.error}</p>
      )}

      <SubmitButton label={submitLabel} />
      <p className="text-xs" style={{ color: "rgba(245,240,232,0.4)" }}>
        After creating the batch, enrol students and add subjects (Maths, Physics…) from the batch page.
      </p>
    </form>
  );
}
