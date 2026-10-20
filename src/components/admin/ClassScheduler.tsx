"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Check, Clock, Users, BookOpen, ChevronDown, CalendarDays } from "lucide-react";
import { saveClass } from "@/app/admin/(portal)/batches/class-actions";
import { DAY_OPTIONS } from "@/app/admin/(portal)/batches/schema";
import { CATEGORY_OPTIONS, type SessionCategory } from "@/lib/os/session-meta";
import { useAction, Feedback } from "./ActionFeedback";
import { ChoiceCards } from "./ChoiceChips";

type Day = (typeof DAY_OPTIONS)[number]["value"];

const DAY_ORDER: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const WEEKDAYS: Day[] = ["mon", "tue", "wed", "thu", "fri"];
const PRESETS: { label: string; days: Day[] }[] = [
  { label: "Mon – Fri", days: WEEKDAYS },
  { label: "Mon – Sat", days: [...WEEKDAYS, "sat"] },
  { label: "Every day", days: DAY_ORDER },
];
const DURATIONS = [30, 60, 90, 120];

const inputCls = "w-full rounded-xl px-3.5 py-3 text-base outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";
const inputStyle: React.CSSProperties = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8", colorScheme: "dark" };

export interface Student { id: string; full_name: string; admission_number: string | null; grade: number | null }
export interface Subject { id: string; name: string }

export interface ClassDefaults {
  id?: string;
  name?: string;
  grade?: number;
  board?: string | null;
  days?: string[];
  start_time?: string | null;
  end_time?: string | null;
  room?: string | null;
  notes?: string | null;
  status?: string;
  capacity?: number;
  academic_year_id?: string | null;
  student_ids?: string[];
  subject_ids?: string[];
  category?: SessionCategory;
  student_id?: string | null;
}

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function fromMinutes(total: number) {
  const t = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function pretty(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
function daysLabel(days: Day[]) {
  const ordered = DAY_ORDER.filter((d) => days.includes(d));
  if (!ordered.length) return "No days chosen";
  if (ordered.length === 7) return "Every day";
  if (ordered.join() === WEEKDAYS.join()) return "Mon – Fri";
  if (ordered.join() === [...WEEKDAYS, "sat"].join()) return "Mon – Sat";
  return ordered.map((d) => DAY_OPTIONS.find((o) => o.value === d)!.label).join(", ");
}

function Section({ step, title, hint, icon, children }: { step: number; title: string; hint?: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
      <div className="flex items-start gap-2.5 mb-3">
        <span className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: "rgba(201,162,39,0.18)", color: "#f4c430" }}>{step}</span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold flex items-center gap-1.5" style={{ color: "#f5f0e8" }}>{icon} {title}</h2>
          {hint && <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,232,0.45)" }}>{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/**
 * Schedule a class the way you'd schedule a meeting: who's in it, when it
 * repeats, what's covered. Every selection is plain component state driven by
 * aria-pressed buttons and sent as a typed payload — nothing is read back out
 * of the DOM, so a tapped-off day can never come back.
 */
export function ClassScheduler({
  defaults,
  students,
  subjects,
  academicYearId,
}: {
  defaults?: ClassDefaults;
  students: Student[];
  subjects: Subject[];
  academicYearId: string | null;
}) {
  const router = useRouter();
  const editing = !!defaults?.id;

  const [name, setName] = useState(defaults?.name ?? "");
  const [nameTouched, setNameTouched] = useState(!!defaults?.name);
  const [grade, setGrade] = useState<number>(defaults?.grade ?? 8);
  const [days, setDays] = useState<Day[]>((defaults?.days as Day[]) ?? WEEKDAYS);
  const [start, setStart] = useState(defaults?.start_time?.slice(0, 5) ?? "17:00");
  const [end, setEnd] = useState(defaults?.end_time?.slice(0, 5) ?? "18:00");
  const [category, setCategory] = useState<SessionCategory>(defaults?.category ?? "combined_class");
  const [studentIds, setStudentIds] = useState<string[]>(
    defaults?.category === "individual_attention" && defaults?.student_id
      ? [defaults.student_id]
      : defaults?.student_ids ?? []
  );
  const [subjectIds, setSubjectIds] = useState<string[]>(defaults?.subject_ids ?? []);
  const [room, setRoom] = useState(defaults?.room ?? "");
  const [notes, setNotes] = useState(defaults?.notes ?? "");
  const [board, setBoard] = useState(defaults?.board ?? "");
  const [status, setStatus] = useState(defaults?.status ?? "active");
  const [search, setSearch] = useState("");
  const [more, setMore] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const save = useAction(saveClass, {
    onSuccess: (r) => { if (r.batchId) router.push(`/admin/batches/${r.batchId}`); },
  });

  const isIndividual = category === "individual_attention";

  const toggleDay = (d: Day) => setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  // Individual Attention is one student, so tapping another replaces the
  // choice instead of adding to it — no way to end up with two.
  const toggleStudent = (id: string) =>
    setStudentIds((prev) =>
      isIndividual ? (prev[0] === id ? [] : [id]) : prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const changeCategory = (next: SessionCategory) => {
    setCategory(next);
    // Switching to one-student keeps only the first pick, so the summary and
    // what gets saved never disagree.
    if (next === "individual_attention") setStudentIds((prev) => prev.slice(0, 1));
  };
  const toggleSubject = (id: string) => setSubjectIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const setDuration = (mins: number) => setEnd(fromMinutes(toMinutes(start) + mins));
  const durationMins = Math.max(0, toMinutes(end) - toMinutes(start));

  // Name suggests itself from the single student, until she types her own.
  const chosen = useMemo(() => students.filter((s) => studentIds.includes(s.id)), [students, studentIds]);
  const suggestedName = chosen.length === 1 ? `${chosen[0].full_name.trim()} — Grade ${grade}` : "";
  const effectiveName = nameTouched || !suggestedName ? name : suggestedName;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.full_name.toLowerCase().includes(q) || (s.admission_number ?? "").toLowerCase().includes(q));
  }, [students, search]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (effectiveName.trim().length < 2) return setLocalError("Give this class a name.");
    if (isIndividual && !studentIds[0]) return setLocalError("Choose the student this class is for.");
    if (!days.length) return setLocalError("Pick at least one day.");
    if (durationMins <= 0) return setLocalError("The end time must be after the start time.");
    save.run(defaults?.id ?? null, {
      name: effectiveName.trim(),
      grade,
      category,
      student_id: isIndividual ? studentIds[0] : null,
      academic_year_id: defaults?.academic_year_id ?? academicYearId,
      board: board || null,
      days,
      start_time: start,
      end_time: end,
      room,
      notes,
      capacity: defaults?.capacity ?? 8,
      status,
      student_ids: studentIds,
      subject_ids: subjectIds,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3 pb-28">
      {/* Live summary — always says exactly what will be saved */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)" }}>
        <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: "rgba(245,240,232,0.5)" }}>This class</p>
        <p className="text-base font-bold" style={{ color: "#f5f0e8" }}>{effectiveName.trim() || "Untitled class"}</p>
        <p className="text-sm mt-1 flex items-center gap-1.5 flex-wrap" style={{ color: "#f4c430" }}>
          <CalendarDays size={14} aria-hidden /> {daysLabel(days)} · {pretty(start)} – {pretty(end)}
        </p>
        <p className="text-xs mt-1" style={{ color: "rgba(245,240,232,0.55)" }}>
          {isIndividual ? "Individual Attention · 1 student" : `${studentIds.length} student${studentIds.length === 1 ? "" : "s"}`} · {subjectIds.length} subject{subjectIds.length === 1 ? "" : "s"}
          {durationMins > 0 && ` · ${Math.floor(durationMins / 60)}h ${durationMins % 60 ? `${durationMins % 60}m` : ""}`.trimEnd()}
        </p>
      </div>

      <Section step={1} title="What kind of class?" icon={<Users size={14} style={{ color: "#c9a227" }} />}>
        <ChoiceCards label="Class type" options={CATEGORY_OPTIONS} value={category} onChange={changeCategory} disabled={save.pending} />
      </Section>

      <Section
        step={2}
        title={isIndividual ? "Which student is it for?" : "Who's in this class?"}
        hint={isIndividual ? "The whole class belongs to this one student." : "Tap to add. You can change this any time."}
        icon={<Users size={14} style={{ color: "#c9a227" }} />}
      >
        {students.length > 6 && (
          <div className="relative mb-2.5">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(245,240,232,0.35)" }} aria-hidden />
            <input value={search} onChange={(e) => setSearch(e.target.value)} type="search" placeholder="Search students…" aria-label="Search students" className={`${inputCls} pl-9`} style={inputStyle} />
          </div>
        )}
        {students.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(245,240,232,0.55)" }}>No students yet. Add them under Students first.</p>
        ) : (
          <ul className="rounded-xl overflow-hidden divide-y max-h-72 overflow-y-auto" style={{ background: "rgba(245,240,232,0.04)", borderColor: "rgba(245,240,232,0.06)" }}>
            {visible.map((s) => {
              const on = studentIds.includes(s.id);
              return (
                <li key={s.id} style={{ borderColor: "rgba(245,240,232,0.06)" }}>
                  <button type="button" aria-pressed={on} onClick={() => toggleStudent(s.id)} className="w-full flex items-center gap-3 px-3.5 py-3 min-h-[52px] text-left" style={{ background: on ? "rgba(201,162,39,0.16)" : "transparent" }}>
                    <span className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: on ? "#c9a227" : "transparent", border: on ? "none" : "2px solid rgba(245,240,232,0.25)" }}>
                      {on && <Check size={14} style={{ color: "#162d24" }} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold truncate" style={{ color: on ? "#f4c430" : "#f5f0e8" }}>{s.full_name}</span>
                      <span className="block text-[11px]" style={{ color: "rgba(245,240,232,0.45)" }}>
                        {s.admission_number ?? "—"}{s.grade ? ` · Grade ${s.grade}` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            {visible.length === 0 && <li className="px-3.5 py-4 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>No students match “{search}”.</li>}
          </ul>
        )}
      </Section>

      <Section step={3} title="When does it run?" hint="Pick the days, then the time. Tap a day again to remove it." icon={<Clock size={14} style={{ color: "#c9a227" }} />}>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRESETS.map((p) => (
            <button key={p.label} type="button" onClick={() => setDays(p.days)} className="rounded-lg px-3 py-2 text-xs font-bold min-h-[38px]" style={{ background: "rgba(245,240,232,0.07)", color: "rgba(245,240,232,0.7)" }}>
              {p.label}
            </button>
          ))}
          {days.length > 0 && (
            <button type="button" onClick={() => setDays([])} className="rounded-lg px-3 py-2 text-xs font-bold min-h-[38px]" style={{ background: "transparent", color: "rgba(245,240,232,0.5)" }}>
              Clear
            </button>
          )}
        </div>

        <div role="group" aria-label="Days this class runs" className="grid grid-cols-7 gap-1.5">
          {DAY_OPTIONS.map((d) => {
            const on = days.includes(d.value);
            return (
              <button key={d.value} type="button" aria-pressed={on} aria-label={d.label} onClick={() => toggleDay(d.value)} className="rounded-xl py-3 text-xs font-bold min-h-[48px] transition-colors active:scale-95" style={on ? { background: "#c9a227", color: "#162d24" } : { background: "rgba(245,240,232,0.07)", color: "rgba(245,240,232,0.6)" }}>
                {d.label.slice(0, 1)}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <label className="block">
            <span className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.6)" }}>Starts</span>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} required className={`${inputCls} mt-1`} style={inputStyle} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.6)" }}>Ends</span>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required className={`${inputCls} mt-1`} style={inputStyle} />
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {DURATIONS.map((m) => {
            const on = durationMins === m;
            return (
              <button key={m} type="button" aria-pressed={on} onClick={() => setDuration(m)} className="rounded-lg px-3 py-2 text-xs font-bold min-h-[38px]" style={on ? { background: "rgba(201,162,39,0.25)", color: "#f4c430" } : { background: "rgba(245,240,232,0.07)", color: "rgba(245,240,232,0.6)" }}>
                {m < 60 ? `${m} min` : `${m / 60}${m % 60 ? ".5" : ""} hr`}
              </button>
            );
          })}
        </div>
      </Section>

      <Section step={4} title="What's taught?" hint="Optional. Any of these can be covered on any day — you pick while marking attendance." icon={<BookOpen size={14} style={{ color: "#c9a227" }} />}>
        {subjects.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(245,240,232,0.55)" }}>No subjects yet. Add them under Subjects.</p>
        ) : (
          <div role="group" aria-label="Subjects" className="flex flex-wrap gap-2">
            {subjects.map((s) => {
              const on = subjectIds.includes(s.id);
              return (
                <button key={s.id} type="button" aria-pressed={on} onClick={() => toggleSubject(s.id)} className="rounded-xl px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-95" style={on ? { background: "#c9a227", color: "#162d24" } : { background: "rgba(245,240,232,0.07)", color: "rgba(245,240,232,0.7)" }}>
                  {on ? "✓ " : ""}{s.name}
                </button>
              );
            })}
          </div>
        )}
      </Section>

      <Section step={5} title="Name this class" hint="A name Nanditha will recognise in the calendar." icon={<CalendarDays size={14} style={{ color: "#c9a227" }} />}>
        <input
          value={effectiveName}
          onChange={(e) => { setNameTouched(true); setName(e.target.value); }}
          placeholder="e.g. Abigail — Grade 2"
          required
          className={inputCls}
          style={inputStyle}
        />
        {!nameTouched && suggestedName && (
          <p className="text-[11px] mt-1.5" style={{ color: "rgba(245,240,232,0.45)" }}>Suggested from the student you picked — type to change it.</p>
        )}

        <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} className="flex items-center gap-1.5 text-xs font-semibold mt-3" style={{ color: "rgba(245,240,232,0.55)" }}>
          <ChevronDown size={14} style={{ transform: more ? "rotate(180deg)" : undefined }} aria-hidden /> More options
        </button>
        {more && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.6)" }}>Grade</span>
                <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className={`${inputCls} mt-1`} style={inputStyle}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (<option key={g} value={g} style={{ color: "#162d24" }}>Grade {g}</option>))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.6)" }}>Board</span>
                <select value={board ?? ""} onChange={(e) => setBoard(e.target.value)} className={`${inputCls} mt-1`} style={inputStyle}>
                  <option value="" style={{ color: "#162d24" }}>Any</option>
                  <option value="cbse" style={{ color: "#162d24" }}>CBSE</option>
                  <option value="icse" style={{ color: "#162d24" }}>ICSE</option>
                  <option value="state_board" style={{ color: "#162d24" }}>State</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.6)" }}>Room</span>
              <input value={room ?? ""} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. Room 2" className={`${inputCls} mt-1`} style={inputStyle} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.6)" }}>Notes</span>
              <textarea value={notes ?? ""} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputCls} mt-1`} style={inputStyle} />
            </label>
            {editing && (
              <label className="block">
                <span className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.6)" }}>Status</span>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} mt-1`} style={inputStyle}>
                  <option value="active" style={{ color: "#162d24" }}>Active</option>
                  <option value="inactive" style={{ color: "#162d24" }}>Paused</option>
                  <option value="archived" style={{ color: "#162d24" }}>Archived</option>
                </select>
              </label>
            )}
          </div>
        )}
      </Section>

      <Feedback error={localError ?? save.error} message={save.message} />

      {/* Sticky save — disabled while saving, so a double tap can't create two classes */}
      <div className="fixed bottom-0 inset-x-0 lg:pl-60 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+72px)] lg:pb-4 pt-3" style={{ background: "linear-gradient(transparent, #101d18 30%)" }}>
        <div className="max-w-2xl mx-auto">
          <button type="submit" disabled={save.pending} aria-busy={save.pending} className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-base min-h-[56px] active:scale-[0.98] transition-transform disabled:opacity-60" style={{ background: "#c9a227", color: "#162d24", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
            {save.pending ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : editing ? "Save changes" : "Schedule class"}
          </button>
        </div>
      </div>
    </form>
  );
}
