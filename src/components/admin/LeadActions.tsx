"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { Check, Loader2, MessageSquarePlus, ShieldCheck, X } from "lucide-react";
import type { LeadActionState } from "@/app/admin/(portal)/leads/actions";
import { LEAD_STATUS_META, OWNER_NEXT_STATUSES, type LeadStatus } from "@/lib/os/leads";

const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";
const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };
const cardStyle = { background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60" style={{ background: "#c9a227", color: "#162d24" }}>
      {pending && <Loader2 size={15} className="animate-spin" />} {pending ? pendingLabel : label}
    </button>
  );
}

/** Super Admin gate for studio leads — approve releases it to the studio's BD. */
export function ApprovalPanel({
  leadName,
  ownerName,
  approveAction,
  rejectAction,
}: {
  leadName: string;
  ownerName: string | null;
  approveAction: () => Promise<void>;
  rejectAction: (reason: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <section className="rounded-2xl p-4" style={{ background: "rgba(244,196,48,0.06)", border: "1px solid rgba(244,196,48,0.3)" }}>
      <p className="flex items-center gap-2 text-sm font-bold mb-1" style={{ color: "#f4c430" }}>
        <ShieldCheck size={16} /> Your approval needed
      </p>
      <p className="text-xs mb-3" style={{ color: "rgba(245,240,232,0.55)" }}>
        {leadName} is a Learning Studio lead. Approving hands it to {ownerName ?? "the studio owner"} to work.
      </p>

      {rejecting ? (
        <div className="space-y-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this one a no? (optional)"
            className={inputCls}
            style={inputStyle}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => startTransition(() => rejectAction(reason))}
              disabled={isPending}
              className="rounded-xl px-4 py-2.5 font-bold text-sm disabled:opacity-60"
              style={{ background: "rgba(220,80,60,0.18)", color: "#e8a090" }}
            >
              Confirm reject
            </button>
            <button onClick={() => setRejecting(false)} className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.5)" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => startTransition(() => approveAction())}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60"
            style={{ background: "#c9a227", color: "#162d24" }}
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Approve & send to studio
          </button>
          <button onClick={() => setRejecting(true)} className="flex items-center gap-1.5 text-xs font-semibold px-2" style={{ color: "rgba(232,160,144,0.85)" }}>
            <X size={13} /> Reject
          </button>
        </div>
      )}
    </section>
  );
}

/** The owner's working panel: where the lead is now, and what happens next. */
export function StatusPanel({
  currentStatus,
  defaultNextAction,
  defaultNextActionAt,
  updateAction,
}: {
  currentStatus: LeadStatus;
  defaultNextAction: string | null;
  defaultNextActionAt: string | null;
  updateAction: (prev: LeadActionState, formData: FormData) => Promise<LeadActionState>;
}) {
  const [state, formAction] = useFormState<LeadActionState, FormData>(updateAction, {});
  const [status, setStatus] = useState<LeadStatus>(
    OWNER_NEXT_STATUSES.includes(currentStatus) ? currentStatus : "contacted"
  );

  return (
    <form action={formAction} className="rounded-2xl p-4 space-y-4" style={cardStyle}>
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "rgba(245,240,232,0.6)" }}>Move this lead</p>
        <input type="hidden" name="status" value={status} />
        <div className="grid grid-cols-2 gap-2">
          {OWNER_NEXT_STATUSES.map((s) => {
            const meta = LEAD_STATUS_META[s];
            const on = status === s;
            return (
              <motion.button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                aria-pressed={on}
                whileTap={{ scale: 0.96 }}
                animate={{ scale: on ? 1.02 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 26 }}
                className="rounded-xl py-2.5 text-sm font-bold"
                style={{
                  background: on ? meta.bg : "rgba(245,240,232,0.05)",
                  border: `1.5px solid ${on ? meta.color : "transparent"}`,
                  color: on ? meta.color : "rgba(245,240,232,0.5)",
                }}
              >
                {meta.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {status === "lost" ? (
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Reason (optional)</label>
          <input name="lost_reason" placeholder="Went elsewhere, out of budget…" className={inputCls} style={inputStyle} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Next action</label>
            <input name="next_action" defaultValue={defaultNextAction ?? ""} placeholder="Call back, send fees…" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>When</label>
            <input type="date" name="next_action_at" defaultValue={defaultNextActionAt ?? ""} className={inputCls} style={inputStyle} />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>What happened (optional)</label>
        <input name="note" placeholder="Spoke to the parent, wants a demo class…" className={inputCls} style={inputStyle} />
      </div>

      {state.error && <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(220,80,60,0.15)", color: "#e8a090" }}>{state.error}</p>}
      {state.ok && <p className="text-xs" style={{ color: "#7dc98f" }}>Saved.</p>}

      <SubmitButton label="Save update" pendingLabel="Saving…" />
    </form>
  );
}

export function NotePanel({ addNoteAction }: { addNoteAction: (prev: LeadActionState, formData: FormData) => Promise<LeadActionState> }) {
  const [state, formAction] = useFormState<LeadActionState, FormData>(addNoteAction, {});
  return (
    <form action={formAction} className="rounded-2xl p-4 space-y-3" style={cardStyle}>
      <p className="flex items-center gap-2 text-xs font-semibold" style={{ color: "rgba(245,240,232,0.6)" }}>
        <MessageSquarePlus size={14} /> Add a note
      </p>
      <input name="note" placeholder="Anything worth remembering…" className={inputCls} style={inputStyle} />
      {state.error && <p className="text-xs" style={{ color: "#e8a090" }}>{state.error}</p>}
      <SubmitButton label="Add note" pendingLabel="Adding…" />
    </form>
  );
}
