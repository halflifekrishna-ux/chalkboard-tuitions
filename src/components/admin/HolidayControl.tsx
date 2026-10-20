"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PartyPopper } from "lucide-react";
import { addHoliday, removeHoliday } from "@/app/admin/(portal)/attendance/actions";
import { useAction, Feedback } from "./ActionFeedback";

/** Mark or clear a public holiday for one date. Deliberately small. */
export function HolidayControl({ date, holidayName }: { date: string; holidayName: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState("");

  const add = useAction(addHoliday, { onSuccess: () => { setOpen(false); setName(""); router.refresh(); } });
  const remove = useAction(removeHoliday, { onSuccess: () => { setConfirming(false); router.refresh(); } });

  if (holidayName) {
    return (
      <div className="space-y-2">
        {confirming ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: "rgba(245,240,232,0.6)" }}>Remove this holiday?</span>
            <button type="button" onClick={() => remove.run(date)} disabled={remove.pending} className="text-xs font-bold rounded-lg px-3 py-2 min-h-[36px] disabled:opacity-60" style={{ background: "rgba(220,80,60,0.18)", color: "#e8a090" }}>
              {remove.pending ? "Removing…" : "Yes, remove"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={remove.pending} className="text-xs font-semibold px-2 py-2" style={{ color: "rgba(245,240,232,0.55)" }}>
              Keep
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="text-xs font-semibold underline underline-offset-2" style={{ color: "rgba(245,240,232,0.55)" }}>
            Not a holiday? Remove it
          </button>
        )}
        <Feedback error={remove.error} message={remove.message} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!open ? (
        <button type="button" onClick={() => { setOpen(true); add.clear(); }} className="flex items-center gap-2 text-xs font-semibold py-2" style={{ color: "rgba(245,240,232,0.55)" }}>
          <PartyPopper size={14} /> Mark this day as a public holiday
        </button>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); add.run(date, name); }}
          className="rounded-2xl p-3 space-y-2.5"
          style={{ background: "rgba(22,45,36,0.9)", border: "1px solid rgba(201,162,39,0.25)" }}
        >
          <label className="block text-xs font-semibold" style={{ color: "rgba(245,240,232,0.6)" }} htmlFor="holiday-name">
            Holiday name
          </label>
          <input
            id="holiday-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ganesh Chaturthi"
            autoFocus
            className="w-full rounded-xl px-3 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]"
            style={{ background: "rgba(245,240,232,0.08)", color: "#f5f0e8" }}
          />
          <p className="text-[11px]" style={{ color: "rgba(245,240,232,0.45)" }}>
            Classes scheduled on this day will show as “not conducted”. Nothing is deleted.
          </p>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={add.pending} className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm min-h-[44px] disabled:opacity-60" style={{ background: "#c9a227", color: "#162d24" }}>
              {add.pending ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : "Save holiday"}
            </button>
            <button type="button" onClick={() => setOpen(false)} disabled={add.pending} className="text-sm font-semibold px-3 py-2.5" style={{ color: "rgba(245,240,232,0.55)" }}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <Feedback error={add.error} message={add.message} />
    </div>
  );
}
