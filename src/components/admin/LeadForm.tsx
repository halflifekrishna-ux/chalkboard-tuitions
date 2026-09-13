"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, GraduationCap, Building2 } from "lucide-react";
import type { LeadActionState } from "@/app/admin/(portal)/leads/actions";
import { LEAD_SOURCES, STUDIO_AUDIENCES, type LeadVertical } from "@/lib/os/leads";
import { useFormDraft } from "@/lib/os/useFormDraft";

const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";
const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };

function Field({ label, hint, children }: { label: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>{label}</label>
      {children}
      {hint && <p className="text-[11px] mt-1" style={{ color: "rgba(245,240,232,0.4)" }}>{hint}</p>}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="flex items-center gap-2 rounded-xl py-3.5 px-8 font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60" style={{ background: "#c9a227", color: "#162d24" }}>
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {pending ? "Saving…" : "Add Lead"}
    </button>
  );
}

const VERTICALS: { value: LeadVertical; label: string; blurb: string; icon: typeof GraduationCap; accent: string }[] = [
  { value: "tuitions", label: "Tuitions", blurb: "Goes straight to the tuitions team", icon: GraduationCap, accent: "#f4c430" },
  { value: "studio", label: "Learning Studio", blurb: "Held for approval, then to studio BD", icon: Building2, accent: "#4ec9b0" },
];

export function LeadForm({ action }: { action: (prev: LeadActionState, formData: FormData) => Promise<LeadActionState> }) {
  const [state, formAction] = useFormState<LeadActionState, FormData>(action, {});
  const [vertical, setVertical] = useState<LeadVertical>("tuitions");
  const { formRef, restored, clear } = useFormDraft("new-lead");

  return (
    <form ref={formRef} action={formAction} onSubmit={() => clear()} className="space-y-5">
      {restored && (
        <p className="text-xs rounded-lg px-3 py-2" style={{ background: "rgba(244,196,48,0.1)", color: "#f4c430" }}>
          Draft restored from your last unsaved entry.
        </p>
      )}

      <input type="hidden" name="vertical" value={vertical} />
      <div className="grid grid-cols-2 gap-3">
        {VERTICALS.map((v) => {
          const on = vertical === v.value;
          const Icon = v.icon;
          return (
            <motion.button
              key={v.value}
              type="button"
              onClick={() => setVertical(v.value)}
              aria-pressed={on}
              whileTap={{ scale: 0.97 }}
              animate={{ scale: on ? 1.01 : 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
              className="rounded-2xl p-4 text-left"
              style={{
                background: on ? `${v.accent}1f` : "rgba(245,240,232,0.05)",
                border: `1.5px solid ${on ? v.accent : "transparent"}`,
                boxShadow: on ? `0 2px 16px ${v.accent}33` : "none",
              }}
            >
              <Icon size={18} style={{ color: on ? v.accent : "rgba(245,240,232,0.4)" }} />
              <p className="text-sm font-bold mt-2" style={{ color: on ? "#f5f0e8" : "rgba(245,240,232,0.6)" }}>{v.label}</p>
              <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "rgba(245,240,232,0.4)" }}>{v.blurb}</p>
            </motion.button>
          );
        })}
      </div>

      <div className="space-y-4">
        <Field label="Name">
          <input name="full_name" required placeholder="Who got in touch" className={inputCls} style={inputStyle} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone">
            <input name="phone" required inputMode="tel" placeholder="+91…" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Email (optional)">
            <input name="email" inputMode="email" className={inputCls} style={inputStyle} />
          </Field>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {vertical === "tuitions" ? (
            <motion.div
              key="tuitions"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-2 gap-3"
            >
              <Field label="Grade (optional)">
                <select name="student_grade" defaultValue="" className={inputCls} style={inputStyle}>
                  <option value="" style={{ color: "#162d24" }}>Not sure yet</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g} style={{ color: "#162d24" }}>Grade {g}</option>
                  ))}
                </select>
              </Field>
              <Field label="Board (optional)">
                <select name="board" defaultValue="" className={inputCls} style={inputStyle}>
                  <option value="" style={{ color: "#162d24" }}>Not sure yet</option>
                  <option value="cbse" style={{ color: "#162d24" }}>CBSE</option>
                  <option value="icse" style={{ color: "#162d24" }}>ICSE</option>
                  <option value="state_board" style={{ color: "#162d24" }}>State Board</option>
                </select>
              </Field>
            </motion.div>
          ) : (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-2 gap-3"
            >
              <Field label="Organisation (optional)">
                <input name="organisation" placeholder="Company / college" className={inputCls} style={inputStyle} />
              </Field>
              <Field label="Who it's for (optional)">
                <select name="audience" defaultValue="" className={inputCls} style={inputStyle}>
                  <option value="" style={{ color: "#162d24" }}>Not sure yet</option>
                  {STUDIO_AUDIENCES.map((a) => (
                    <option key={a.value} value={a.value} style={{ color: "#162d24" }}>{a.label}</option>
                  ))}
                </select>
              </Field>
            </motion.div>
          )}
        </AnimatePresence>

        <Field label="Where it came from">
          <select name="source" defaultValue="marketing" className={inputCls} style={inputStyle}>
            {LEAD_SOURCES.map((s) => (
              <option key={s.value} value={s.value} style={{ color: "#162d24" }}>{s.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Notes (optional)" hint="What they asked for, when to call back, anything the team should know.">
          <textarea name="notes" rows={3} className={inputCls} style={inputStyle} />
        </Field>
      </div>

      {state.error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(220,80,60,0.15)", color: "#e8a090" }}>{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
