"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Pencil, RotateCcw, UserMinus } from "lucide-react";
import { correctEnrolment, markStudentExited, rejoinStudent, type ActionState } from "@/app/admin/(portal)/students/actions";
import {
  EXIT_REASONS, EXIT_REASON_LABELS, EXIT_TYPES, EXIT_TYPE_LABELS, formatDay, todayIST,
  type ExitReason, type ExitType,
} from "@/lib/os/enrolment";

export interface EnrolmentEntry {
  id: string;
  joined_on: string;
  exit_type: string | null;
  exited_on: string | null;
  classes_at_exit: string[];
  reason: string | null;
  note: string | null;
}

const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";
const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };
const optionStyle = { color: "#162d24" };

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>{text}</span>
      {children}
    </label>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-xl py-3 px-6 font-bold text-sm disabled:opacity-60" style={{ background: "#c9a227", color: "#162d24" }}>
      {pending ? "Saving…" : label}
    </button>
  );
}

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/** Closes itself once the action comes back without an error. */
function StintForm({ action, submitLabel, onDone, children }: { action: Action; submitLabel: string; onDone: () => void; children: React.ReactNode }) {
  const [state, formAction] = useFormState(async (prev: ActionState, data: FormData) => {
    const result = await action(prev, data);
    return { ...result, done: !result.error };
  }, {} as ActionState & { done?: boolean });
  useEffect(() => { if (state.done) onDone(); }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-3 pt-3">
      {children}
      {state.error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(220,80,60,0.15)", color: "#e8a090" }}>{state.error}</p>
      )}
      <div className="flex items-center gap-3">
        <Submit label={submitLabel} />
        <button type="button" onClick={onDone} className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.5)" }}>Cancel</button>
      </div>
    </form>
  );
}

function ExitFields({ entry }: { entry?: EnrolmentEntry }) {
  const [reason, setReason] = useState(entry?.reason && entry.reason !== "unknown" ? entry.reason : "");
  const today = todayIST();
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Label text="Date they left">
          <input type="date" name="exited_on" required max={today} defaultValue={entry ? entry.exited_on ?? "" : today} className={inputCls} style={inputStyle} />
        </Label>
        <Label text="How they left">
          <select name="exit_type" required defaultValue={entry?.exit_type ?? "dropped"} className={inputCls} style={inputStyle}>
            {EXIT_TYPES.map((t) => <option key={t} value={t} style={optionStyle}>{EXIT_TYPE_LABELS[t]}</option>)}
          </select>
        </Label>
      </div>
      <Label text="Why they left">
        <select name="reason" required value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} style={inputStyle}>
          <option value="" style={optionStyle}>Choose a reason</option>
          {EXIT_REASONS.map((r) => <option key={r} value={r} style={optionStyle}>{EXIT_REASON_LABELS[r]}</option>)}
        </select>
      </Label>
      <Label text={reason === "other" ? "Note" : "Note (optional)"}>
        <textarea name="note" rows={2} required={reason === "other"} defaultValue={entry?.note ?? ""} className={inputCls} style={inputStyle} />
      </Label>
    </>
  );
}

export function EnrolmentHistory({ studentId, entries, canManage }: { studentId: string; entries: EnrolmentEntry[]; canManage: boolean }) {
  const [panel, setPanel] = useState<string | null>(null);
  const close = () => setPanel(null);
  const isOpen = entries.some((e) => !e.exit_type);

  return (
    <section>
      <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>
        Enrolment
      </h2>
      <div className="rounded-2xl" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
        <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
          {entries.map((e) => (
            <li key={e.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                    Joined {formatDay(e.joined_on)}
                    {e.exit_type ? ` · Left ${formatDay(e.exited_on)}` : " · Still here"}
                  </p>
                  {e.exit_type && (
                    <p className="text-xs mt-1" style={{ color: "rgba(245,240,232,0.55)" }}>
                      {EXIT_TYPE_LABELS[e.exit_type as ExitType]}
                      {e.reason ? ` · ${EXIT_REASON_LABELS[e.reason as ExitReason]}` : ""}
                      {e.classes_at_exit.length ? ` · Was in ${e.classes_at_exit.join(", ")}` : ""}
                    </p>
                  )}
                  {e.note && <p className="text-xs mt-1" style={{ color: "rgba(245,240,232,0.55)" }}>{e.note}</p>}
                </div>
                {canManage && (
                  <button type="button" onClick={() => setPanel(panel === e.id ? null : e.id)} aria-label="Correct these details" className="p-1 flex-shrink-0" style={{ color: "rgba(245,240,232,0.5)" }}>
                    <Pencil size={14} />
                  </button>
                )}
              </div>
              {panel === e.id && (
                <StintForm action={correctEnrolment.bind(null, studentId, e.id)} submitLabel="Save" onDone={close}>
                  <Label text="Date they joined">
                    <input type="date" name="joined_on" required defaultValue={e.joined_on} className={inputCls} style={inputStyle} />
                  </Label>
                  {e.exit_type && <ExitFields entry={e} />}
                </StintForm>
              )}
            </li>
          ))}
        </ul>

        {canManage && (
          <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(201,162,39,0.1)" }}>
            {isOpen ? (
              <button type="button" onClick={() => setPanel(panel === "exit" ? null : "exit")} className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#e8a090" }}>
                <UserMinus size={14} /> Mark as exited
              </button>
            ) : (
              <button type="button" onClick={() => setPanel(panel === "rejoin" ? null : "rejoin")} className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#f4c430" }}>
                <RotateCcw size={14} /> Rejoin
              </button>
            )}
            {panel === "exit" && (
              <StintForm action={markStudentExited.bind(null, studentId)} submitLabel="Mark as exited" onDone={close}>
                <p className="text-xs" style={{ color: "rgba(245,240,232,0.55)" }}>
                  They come off their classes and registers. Past attendance is kept.
                </p>
                <ExitFields />
              </StintForm>
            )}
            {panel === "rejoin" && (
              <StintForm action={rejoinStudent.bind(null, studentId)} submitLabel="Rejoin" onDone={close}>
                <p className="text-xs" style={{ color: "rgba(245,240,232,0.55)" }}>
                  Add them back to their classes afterwards.
                </p>
                <Label text="Date they rejoined">
                  <input type="date" name="joined_on" required defaultValue={todayIST()} className={inputCls} style={inputStyle} />
                </Label>
              </StintForm>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
