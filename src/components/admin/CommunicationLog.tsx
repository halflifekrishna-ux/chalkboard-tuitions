"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { MessageCircle, Phone, Mail, StickyNote, MessageSquare, ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react";
import type { ActionState } from "@/app/admin/(portal)/students/actions";
import { COMM_TYPE_LABELS, type CommunicationType, type CommunicationDirection } from "@/lib/os/types";

const TYPE_ICONS: Record<CommunicationType, React.ReactNode> = {
  whatsapp: <MessageCircle size={14} />,
  sms: <MessageSquare size={14} />,
  phone_call: <Phone size={14} />,
  email: <Mail size={14} />,
  note: <StickyNote size={14} />,
};

export interface CommEntry {
  id: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  message: string;
  status: string;
  occurred_at: string;
}

const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };
const selectCls = "rounded-xl px-3 py-2.5 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl px-5 py-2.5 font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60"
      style={{ background: "#c9a227", color: "#162d24" }}
    >
      {pending ? "Saving…" : "Log"}
    </button>
  );
}

export function CommunicationLog({
  entries,
  action,
}: {
  entries: CommEntry[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState<ActionState, FormData>(async (prev, fd) => {
    const result = await action(prev, fd);
    if (!result.error) {
      formRef.current?.reset();
      setOpen(false);
    }
    return result;
  }, {});

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-widest font-semibold" style={{ color: "rgba(245,240,232,0.4)" }}>
          Communication
        </h2>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-1.5"
          style={{ background: "rgba(201,162,39,0.15)", color: "#f4c430" }}
        >
          <Plus size={13} /> {open ? "Cancel" : "Log entry"}
        </button>
      </div>

      {open && (
        <form
          ref={formRef}
          action={formAction}
          className="rounded-2xl p-4 mb-3 space-y-3"
          style={{ background: "rgba(22,45,36,0.9)", border: "1px solid rgba(201,162,39,0.3)" }}
        >
          <div className="grid grid-cols-2 gap-3">
            <select name="type" className={selectCls} style={inputStyle} defaultValue="phone_call">
              {Object.entries(COMM_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v} style={{ color: "#162d24" }}>{l}</option>
              ))}
            </select>
            <select name="direction" className={selectCls} style={inputStyle} defaultValue="outgoing">
              <option value="outgoing" style={{ color: "#162d24" }}>Outgoing</option>
              <option value="incoming" style={{ color: "#162d24" }}>Incoming</option>
            </select>
          </div>
          <textarea
            name="message"
            rows={2}
            required
            placeholder="What was discussed?"
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]"
            style={inputStyle}
          />
          {state.error && <p className="text-xs" style={{ color: "#e8a090" }}>{state.error}</p>}
          <SubmitButton />
        </form>
      )}

      <div className="rounded-2xl" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
        {!entries.length ? (
          <p className="p-5 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>
            No communication logged yet. WhatsApp attendance updates will appear here automatically.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
            {entries.map((c) => (
              <li key={c.id} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: "#c9a227" }}>{TYPE_ICONS[c.type]}</span>
                  <span className="text-xs font-bold" style={{ color: "#f5f0e8" }}>
                    {COMM_TYPE_LABELS[c.type]}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] uppercase tracking-wide" style={{ color: "rgba(245,240,232,0.4)" }}>
                    {c.direction === "incoming" ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                    {c.direction}
                  </span>
                  <time className="ml-auto text-[11px]" style={{ color: "rgba(245,240,232,0.35)" }}>
                    {new Date(c.occurred_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </time>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.75)" }}>
                  {c.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
