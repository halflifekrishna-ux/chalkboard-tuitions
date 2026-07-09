"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Confirmation gate for destructive actions (archive / delete / reset).
 * Renders a trigger; on click opens a dialog. Confirm runs `action`.
 * Escape or backdrop cancels. Never use for normal, reversible work.
 */
export function ConfirmButton({
  action,
  triggerLabel,
  triggerIcon,
  title,
  body,
  confirmLabel = "Confirm",
  className,
  style,
}: {
  action: () => Promise<void>;
  triggerLabel: string;
  triggerIcon?: React.ReactNode;
  title: string;
  body: string;
  confirmLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !isPending) setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isPending]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} style={style}>
        {triggerIcon} {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5"
            style={{ background: "#162d24", border: "1px solid rgba(232,120,100,0.4)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={22} className="flex-shrink-0 mt-0.5" style={{ color: "#e8a090" }} aria-hidden />
              <div>
                <h2 id="confirm-title" className="font-playfair text-lg font-bold mb-1" style={{ color: "#f5f0e8" }}>{title}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.6)" }}>{body}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 rounded-xl py-3 font-bold text-sm"
                style={{ background: "rgba(245,240,232,0.08)", color: "#f5f0e8" }}
              >
                Cancel
              </button>
              <button
                ref={confirmRef}
                type="button"
                disabled={isPending}
                onClick={() => startTransition(async () => { await action(); })}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm disabled:opacity-60"
                style={{ background: "#c0503c", color: "#fff" }}
              >
                {isPending ? <><Loader2 size={15} className="animate-spin" /> Working…</> : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
