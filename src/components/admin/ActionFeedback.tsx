"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { MutationResult } from "@/lib/os/errors";

const OFFLINE = "Couldn't reach the server. Check your connection and try again.";

/**
 * Idle → Loading → Success | Error for any Server Action returning a
 * MutationResult. `onSuccess` runs INSIDE the transition, so a follow-up
 * navigation keeps the button disabled until it lands — no double submits,
 * and nothing navigates unless the action actually succeeded.
 */
export function useAction<Args extends unknown[], R extends MutationResult>(
  fn: (...args: Args) => Promise<R>,
  opts: { onSuccess?: (res: R) => void } = {}
) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const onSuccess = useRef(opts.onSuccess);
  onSuccess.current = opts.onSuccess;

  const run = useCallback(
    (...args: Args) =>
      new Promise<R | null>((resolve) => {
        setError(null);
        setMessage(null);
        startTransition(async () => {
          try {
            const res = await fn(...args);
            if (!res.ok) {
              setError(res.error ?? "Something went wrong. Please try again.");
            } else {
              if (res.message) setMessage(res.message);
              onSuccess.current?.(res);
            }
            resolve(res);
          } catch {
            setError(OFFLINE);
            resolve(null);
          }
        });
      }),
    [fn]
  );

  const clear = useCallback(() => { setError(null); setMessage(null); }, []);
  return { run, pending, error, message, clear };
}

/** One line of feedback. Errors are announced to screen readers. */
export function Feedback({ error, message, className = "" }: { error?: string | null; message?: string | null; className?: string }) {
  if (error) {
    return (
      <p role="alert" className={`text-sm rounded-xl px-3 py-2.5 flex items-start gap-2 ${className}`} style={{ background: "rgba(220,80,60,0.14)", color: "#e8a090" }}>
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" aria-hidden /> <span>{error}</span>
      </p>
    );
  }
  if (message) {
    return (
      <p role="status" className={`text-sm rounded-xl px-3 py-2.5 flex items-start gap-2 ${className}`} style={{ background: "rgba(125,201,143,0.14)", color: "#7dc98f" }}>
        <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" aria-hidden /> <span>{message.replace(/^✓\s*/, "")}</span>
      </p>
    );
  }
  return null;
}
