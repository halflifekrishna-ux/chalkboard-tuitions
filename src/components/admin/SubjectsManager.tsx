"use client";

import { useState, useMemo, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Search, Plus, Pencil, Archive, ArchiveRestore, X, Check } from "lucide-react";
import { createSubject, updateSubject, toggleArchiveSubject, type SubjectState } from "@/app/admin/(portal)/subjects/actions";

export interface SubjectRow {
  id: string;
  name: string;
  short_code: string | null;
  colour: string;
  is_active: boolean;
  in_use: number;
}

const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };
const COLOURS = ["#c9a227", "#4a9eca", "#7dc98f", "#e8784d", "#e8a0b4", "#9d7cd8", "#4ec9b0"] as const;

function ColourPicker({ name, value }: { name: string; value: string }) {
  const [colour, setColour] = useState(value);
  return (
    <>
      <input type="hidden" name={name} value={colour} />
      <div className="flex gap-1.5">
        {COLOURS.map((c) => (
          <button key={c} type="button" onClick={() => setColour(c)} aria-label={`Colour ${c}`} className="h-6 w-6 rounded-full" style={{ background: c, outline: colour === c ? "2px solid #f5f0e8" : "none", outlineOffset: 2 }} />
        ))}
      </div>
    </>
  );
}

function CreateButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-xl px-4 py-2.5 font-bold text-sm active:scale-[0.98] disabled:opacity-60" style={{ background: "#c9a227", color: "#162d24" }}>
      {pending ? "Adding…" : "Add"}
    </button>
  );
}

function InlineEdit({ subject, onDone }: { subject: SubjectRow; onDone: () => void }) {
  const update = updateSubject.bind(null, subject.id);
  const [state, action] = useFormState<SubjectState, FormData>(async (p, fd) => {
    const r = await update(p, fd);
    if (!r.error) onDone();
    return r;
  }, {});
  return (
    <form action={action} className="flex flex-col gap-2 flex-1">
      <div className="flex items-center gap-2">
        <input name="name" defaultValue={subject.name} required className="flex-1 rounded-lg px-3 py-2 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]" style={inputStyle} />
        <input name="short_code" defaultValue={subject.short_code ?? ""} placeholder="CODE" className="w-16 rounded-lg px-2 py-2 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]" style={inputStyle} />
        <button type="submit" aria-label="Save" className="p-2 rounded-lg" style={{ background: "#c9a227", color: "#162d24" }}><Check size={15} /></button>
        <button type="button" onClick={onDone} aria-label="Cancel" className="p-2" style={{ color: "rgba(245,240,232,0.5)" }}><X size={15} /></button>
      </div>
      <ColourPicker name="colour" value={subject.colour} />
      {state.error && <span className="text-[11px]" style={{ color: "#e8a090" }}>{state.error}</span>}
    </form>
  );
}

export function SubjectsManager({ subjects }: { subjects: SubjectRow[] }) {
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [createState, createAction] = useFormState<SubjectState, FormData>(createSubject, {});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subjects
      .filter((s) => showArchived || s.is_active)
      .filter((s) => !q || s.name.toLowerCase().includes(q) || (s.short_code ?? "").toLowerCase().includes(q));
  }, [subjects, query, showArchived]);

  return (
    <div className="space-y-4">
      {/* Inline create */}
      <form action={createAction} className="space-y-2.5">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>New subject</label>
            <input name="name" required placeholder="e.g. Biology" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]" style={inputStyle} />
          </div>
          <input name="short_code" placeholder="BIO" className="w-20 rounded-xl px-3 py-2.5 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]" style={inputStyle} />
          <CreateButton />
        </div>
        <ColourPicker name="colour" value={COLOURS[0]} />
      </form>
      {createState.error && <p className="text-xs" style={{ color: "#e8a090" }}>{createState.error}</p>}

      {/* Search + archived toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(245,240,232,0.35)" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search subjects…" className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]" style={{ ...inputStyle, border: "1px solid rgba(201,162,39,0.15)" }} />
        </div>
        <button onClick={() => setShowArchived((v) => !v)} className="text-xs font-semibold rounded-lg px-3 py-2.5 whitespace-nowrap" style={{ background: showArchived ? "rgba(201,162,39,0.15)" : "rgba(245,240,232,0.05)", color: showArchived ? "#f4c430" : "rgba(245,240,232,0.5)" }}>
          {showArchived ? "Hiding none" : "Show archived"}
        </button>
      </div>

      {/* List */}
      <ul className="space-y-2">
        {filtered.map((s) => (
          <li key={s.id} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.12)", opacity: s.is_active ? 1 : 0.55 }}>
            {editing === s.id ? (
              <InlineEdit subject={s} onDone={() => setEditing(null)} />
            ) : (
              <>
                <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: s.colour }} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>{s.name}</span>
                  {s.short_code && <span className="ml-2 text-[10px] font-bold rounded px-1.5 py-0.5" style={{ background: "rgba(201,162,39,0.15)", color: "#c9a227" }}>{s.short_code}</span>}
                  <span className="ml-2 text-[11px]" style={{ color: "rgba(245,240,232,0.35)" }}>{s.in_use} batch subject{s.in_use === 1 ? "" : "s"}</span>
                </div>
                <button onClick={() => setEditing(s.id)} aria-label="Edit" className="p-2" style={{ color: "rgba(245,240,232,0.5)" }}><Pencil size={14} /></button>
                <button
                  onClick={() => startTransition(() => toggleArchiveSubject(s.id, s.is_active))}
                  aria-label={s.is_active ? "Archive" : "Restore"}
                  className="p-2"
                  style={{ color: s.is_active ? "rgba(232,160,144,0.8)" : "#7dc98f" }}
                >
                  {s.is_active ? <Archive size={14} /> : <ArchiveRestore size={14} />}
                </button>
              </>
            )}
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-xl p-6 text-center text-sm" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.12)", color: "rgba(245,240,232,0.45)" }}>
            {query ? `No subjects match “${query}”.` : "No subjects yet — add one above."}
          </li>
        )}
      </ul>
    </div>
  );
}
