"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { DAY_OPTIONS } from "@/app/admin/(portal)/classes/schema";
import type { ActionState } from "@/app/admin/(portal)/classes/actions";

const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";
const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };

export interface ClassDefaults {
  name?: string;
  subject_id?: string;
  grade?: number;
  board?: string | null;
  teacher_name?: string;
  start_time?: string;
  end_time?: string;
  days?: string[];
  capacity?: number;
  room?: string | null;
  is_active?: boolean;
}

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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl py-3.5 px-8 font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60"
      style={{ background: "#c9a227", color: "#162d24" }}
    >
      <Save size={16} /> {pending ? "Saving…" : label}
    </button>
  );
}

export function ClassForm({
  action,
  subjects,
  defaults,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  subjects: { id: string; name: string }[];
  defaults?: ClassDefaults;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Class name">
        <input name="name" defaultValue={defaults?.name} required placeholder="e.g. Grade 6 Mathematics" className={inputCls} style={inputStyle} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Subject">
          <select name="subject_id" defaultValue={defaults?.subject_id ?? ""} required className={inputCls} style={inputStyle}>
            <option value="" disabled style={{ color: "#162d24" }}>Select…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id} style={{ color: "#162d24" }}>{s.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Grade">
          <select name="grade" defaultValue={defaults?.grade ?? 6} className={inputCls} style={inputStyle}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g} style={{ color: "#162d24" }}>Grade {g}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Board (optional)">
          <select name="board" defaultValue={defaults?.board ?? ""} className={inputCls} style={inputStyle}>
            <option value="" style={{ color: "#162d24" }}>Any / Mixed</option>
            <option value="cbse" style={{ color: "#162d24" }}>CBSE</option>
            <option value="icse" style={{ color: "#162d24" }}>ICSE</option>
            <option value="state_board" style={{ color: "#162d24" }}>State Board</option>
          </select>
        </Field>
        <Field label="Teacher (optional)">
          <input name="teacher_name" defaultValue={defaults?.teacher_name} placeholder="e.g. Nanditha" className={inputCls} style={inputStyle} />
        </Field>
      </div>

      <Field label="Days">
        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map((d) => (
            <label
              key={d.value}
              className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold has-[:checked]:bg-[#c9a227] has-[:checked]:text-[#162d24]"
              style={{ background: "rgba(245,240,232,0.08)", color: "rgba(245,240,232,0.7)" }}
            >
              <input
                type="checkbox"
                name="days"
                value={d.value}
                defaultChecked={defaults?.days?.includes(d.value)}
                className="sr-only"
              />
              {d.label}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Start time">
          <input type="time" name="start_time" defaultValue={defaults?.start_time ?? "17:00"} required className={inputCls} style={inputStyle} />
        </Field>
        <Field label="End time">
          <input type="time" name="end_time" defaultValue={defaults?.end_time ?? "18:00"} required className={inputCls} style={inputStyle} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Capacity">
          <input type="number" name="capacity" min={1} max={200} defaultValue={defaults?.capacity ?? 8} className={inputCls} style={inputStyle} />
        </Field>
        <Field label="Room (optional)">
          <input name="room" defaultValue={defaults?.room ?? ""} className={inputCls} style={inputStyle} />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: "rgba(245,240,232,0.7)" }}>
        <input type="checkbox" name="is_active" defaultChecked={defaults?.is_active ?? true} className="rounded accent-[#c9a227]" />
        Active
      </label>

      {state.error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(220,80,60,0.15)", color: "#e8a090" }}>
          {state.error}
        </p>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
