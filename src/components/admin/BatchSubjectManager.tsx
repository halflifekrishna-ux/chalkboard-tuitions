"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus, Clock, Pencil } from "lucide-react";
import { DAY_OPTIONS, SUBJECT_COLOURS } from "@/app/admin/(portal)/batches/schema";
import type { ActionState } from "@/app/admin/(portal)/batches/actions";

const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";
const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };

export interface BatchSubjectRow {
  id: string;
  subject_id: string;
  subject_name: string;
  teacher_name: string | null;
  days: string[];
  start_time: string | null;
  end_time: string | null;
  room: string | null;
  colour: string;
  status: string;
}

function fmtTime(t: string | null) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-xl px-5 py-2.5 font-bold text-sm active:scale-[0.98] disabled:opacity-60" style={{ background: "#c9a227", color: "#162d24" }}>
      {pending ? "Saving…" : label}
    </button>
  );
}

function SubjectFormFields({ subjects, defaults }: { subjects: { id: string; name: string }[]; defaults?: Partial<BatchSubjectRow> }) {
  const [colour, setColour] = useState(defaults?.colour ?? SUBJECT_COLOURS[0]);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Subject</label>
          <select name="subject_id" defaultValue={defaults?.subject_id ?? ""} required className={inputCls} style={inputStyle}>
            <option value="" disabled style={{ color: "#162d24" }}>Select…</option>
            {subjects.map((s) => (<option key={s.id} value={s.id} style={{ color: "#162d24" }}>{s.name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Teacher</label>
          <input name="teacher_name" defaultValue={defaults?.teacher_name ?? ""} placeholder="e.g. Nanditha" className={inputCls} style={inputStyle} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Days</label>
        <div className="flex flex-wrap gap-1.5">
          {DAY_OPTIONS.map((d) => (
            <label key={d.value} className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold has-[:checked]:bg-[#c9a227] has-[:checked]:text-[#162d24]" style={{ background: "rgba(245,240,232,0.08)", color: "rgba(245,240,232,0.7)" }}>
              <input type="checkbox" name="days" value={d.value} defaultChecked={defaults?.days?.includes(d.value)} className="sr-only" />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Start</label>
          <input type="time" name="start_time" defaultValue={defaults?.start_time?.slice(0, 5) ?? "17:00"} required className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>End</label>
          <input type="time" name="end_time" defaultValue={defaults?.end_time?.slice(0, 5) ?? "18:00"} required className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Room</label>
          <input name="room" defaultValue={defaults?.room ?? ""} className={inputCls} style={inputStyle} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Colour</label>
        <input type="hidden" name="colour" value={colour} />
        <div className="flex gap-2">
          {SUBJECT_COLOURS.map((c) => (
            <button key={c} type="button" onClick={() => setColour(c)} aria-label={`Colour ${c}`}
              className="h-7 w-7 rounded-full" style={{ background: c, outline: colour === c ? "2px solid #f5f0e8" : "none", outlineOffset: 2 }} />
          ))}
        </div>
      </div>
      <input type="hidden" name="status" value={defaults?.status ?? "active"} />
    </div>
  );
}

function EditForm({
  row,
  subjects,
  updateAction,
  archiveAction,
  onDone,
}: {
  row: BatchSubjectRow;
  subjects: { id: string; name: string }[];
  updateAction: (batchSubjectId: string, prev: ActionState, formData: FormData) => Promise<ActionState>;
  archiveAction: (batchSubjectId: string) => Promise<void>;
  onDone: () => void;
}) {
  const update = updateAction.bind(null, row.id);
  const [st, act] = useFormState<ActionState, FormData>(async (p, fd) => {
    const res = await update(p, fd);
    if (!res.error) onDone();
    return res;
  }, {});
  return (
    <form action={act} className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(22,45,36,0.9)", border: "1px solid rgba(201,162,39,0.3)" }}>
      <SubjectFormFields subjects={subjects} defaults={row} />
      {st.error && <p className="text-xs" style={{ color: "#e8a090" }}>{st.error}</p>}
      <div className="flex items-center gap-2">
        <SubmitButton label="Save" />
        <button type="button" onClick={onDone} className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.5)" }}>Cancel</button>
        <button type="button" onClick={() => archiveAction(row.id)} className="ml-auto text-xs font-semibold" style={{ color: "rgba(232,160,144,0.8)" }}>Remove</button>
      </div>
    </form>
  );
}

export function BatchSubjectManager({
  subjects,
  rows,
  addAction,
  updateAction,
  archiveAction,
}: {
  subjects: { id: string; name: string }[];
  rows: BatchSubjectRow[];
  addAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  updateAction: (batchSubjectId: string, prev: ActionState, formData: FormData) => Promise<ActionState>;
  archiveAction: (batchSubjectId: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [addState, addFormAction] = useFormState<ActionState, FormData>(async (p, fd) => {
    const r = await addAction(p, fd);
    if (!r.error) setAdding(false);
    return r;
  }, {});

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-widest font-semibold" style={{ color: "rgba(245,240,232,0.4)" }}>Subjects</h2>
        <button onClick={() => { setAdding((v) => !v); setEditingId(null); }} className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-1.5" style={{ background: "rgba(201,162,39,0.15)", color: "#f4c430" }}>
          <Plus size={13} /> {adding ? "Cancel" : "Add subject"}
        </button>
      </div>

      {subjects.length === 0 && (
        <p className="text-xs mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>
          No subjects available. Create some under Subjects first.
        </p>
      )}

      {adding && (
        <form action={addFormAction} className="rounded-2xl p-4 mb-3 space-y-3" style={{ background: "rgba(22,45,36,0.9)", border: "1px solid rgba(201,162,39,0.3)" }}>
          <SubjectFormFields subjects={subjects} />
          {addState.error && <p className="text-xs" style={{ color: "#e8a090" }}>{addState.error}</p>}
          <SubmitButton label="Add Subject" />
        </form>
      )}

      <ul className="space-y-2">
        {rows.map((r) => {
          return (
            <li key={r.id}>
              {editingId === r.id ? (
                <EditForm row={r} subjects={subjects} updateAction={updateAction} archiveAction={archiveAction} onDone={() => setEditingId(null)} />
              ) : (
                <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.12)", opacity: r.status === "active" ? 1 : 0.55 }}>
                  <span className="h-9 w-1.5 rounded-full flex-shrink-0" style={{ background: r.colour }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>{r.subject_name}{r.teacher_name ? ` · ${r.teacher_name}` : ""}</p>
                    <p className="text-[11px] mt-0.5 flex items-center gap-1.5 flex-wrap" style={{ color: "rgba(245,240,232,0.45)" }}>
                      <Clock size={11} /> {fmtTime(r.start_time)}–{fmtTime(r.end_time)} · {r.days.map((d) => d[0].toUpperCase() + d.slice(1)).join(" ")}{r.room ? ` · ${r.room}` : ""}
                    </p>
                  </div>
                  <button onClick={() => { setEditingId(r.id); setAdding(false); }} aria-label="Edit subject" className="p-2 flex-shrink-0" style={{ color: "rgba(245,240,232,0.5)" }}>
                    <Pencil size={14} />
                  </button>
                </div>
              )}
            </li>
          );
        })}
        {rows.length === 0 && !adding && (
          <li className="rounded-2xl p-6 text-center text-sm" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.12)", color: "rgba(245,240,232,0.45)" }}>
            No subjects in this batch yet. Add Mathematics, Physics, etc.
          </li>
        )}
      </ul>
    </section>
  );
}
