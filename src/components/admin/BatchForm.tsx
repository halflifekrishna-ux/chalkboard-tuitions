"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { Save, Loader2, Clock, MapPin } from "lucide-react";
import type { ActionState } from "@/app/admin/(portal)/batches/actions";
import { DAY_OPTIONS, WEEKDAY_VALUES } from "@/app/admin/(portal)/batches/schema";
import { useFormDraft } from "@/lib/os/useFormDraft";

const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227] transition-shadow";
const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };

export interface BatchDefaults {
  name?: string;
  academic_year_id?: string;
  grade?: number;
  board?: string | null;
  capacity?: number;
  status?: string;
  notes?: string | null;
  days?: string[];
  start_time?: string | null;
  end_time?: string | null;
  room?: string | null;
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
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
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {pending ? "Saving…" : label}
    </button>
  );
}

/** Day-of-week picker for the batch's dedicated slot — any mix, Mon–Sat. */
function DayPicker({ defaultDays }: { defaultDays: string[] }) {
  const [selected, setSelected] = useState<string[]>(defaultDays);
  const toggle = (v: string) => setSelected((prev) => (prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v]));

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {DAY_OPTIONS.map((d) => {
          const on = selected.includes(d.value);
          return (
            <label key={d.value} className="relative cursor-pointer select-none">
              <input type="checkbox" name="days" value={d.value} checked={on} onChange={() => toggle(d.value)} className="sr-only" />
              <motion.span
                whileTap={{ scale: 0.92 }}
                animate={{ scale: on ? 1.04 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="block rounded-xl px-3.5 py-2.5 text-sm font-bold"
                style={{
                  background: on ? "#c9a227" : "rgba(245,240,232,0.08)",
                  color: on ? "#162d24" : "rgba(245,240,232,0.65)",
                  boxShadow: on ? "0 2px 12px rgba(201,162,39,0.35)" : "none",
                }}
              >
                {d.label}
              </motion.span>
            </label>
          );
        })}
      </div>
      <p className="text-[11px] mt-2" style={{ color: "rgba(245,240,232,0.4)" }}>
        Tap the days this batch actually meets — Mon–Fri is preselected; add Saturday if it runs.
      </p>
    </div>
  );
}

export function BatchForm({
  action,
  academicYears,
  defaults,
  submitLabel,
  draftKey,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  academicYears: { id: string; name: string }[];
  defaults?: BatchDefaults;
  submitLabel: string;
  draftKey?: string;
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});
  const { formRef, restored, clear } = useFormDraft(draftKey ?? "batch-disabled");

  return (
    <form ref={draftKey ? formRef : undefined} action={formAction} onSubmit={() => draftKey && clear()} className="space-y-5">
      {draftKey && restored && (
        <p className="text-xs rounded-lg px-3 py-2" style={{ background: "rgba(244,196,48,0.1)", color: "#f4c430" }}>
          Draft restored from your last unsaved entry.
        </p>
      )}
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
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "#c9a227" }}>Schedule</h2>
        <div className="space-y-4">
          <Field label="Days">
            <DayPicker defaultDays={defaults?.days ?? [...WEEKDAY_VALUES]} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={<span className="inline-flex items-center gap-1.5"><Clock size={12} /> Start</span>}>
              <input type="time" name="start_time" defaultValue={defaults?.start_time?.slice(0, 5) ?? "17:00"} required className={inputCls} style={inputStyle} />
            </Field>
            <Field label={<span className="inline-flex items-center gap-1.5"><Clock size={12} /> End</span>}>
              <input type="time" name="end_time" defaultValue={defaults?.end_time?.slice(0, 5) ?? "19:00"} required className={inputCls} style={inputStyle} />
            </Field>
          </div>
          <Field label={<span className="inline-flex items-center gap-1.5"><MapPin size={12} /> Room (optional)</span>}>
            <input name="room" defaultValue={defaults?.room ?? ""} placeholder="e.g. Room 2" className={inputCls} style={inputStyle} />
          </Field>
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
        After creating the batch, enrol students and add whichever subjects run in it (Maths, Physics…) — any subject can be taught at any time in the slot above.
      </p>
    </form>
  );
}
