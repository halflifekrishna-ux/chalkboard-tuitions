"use client";

import { useRouter } from "next/navigation";
import { Loader2, PlayCircle } from "lucide-react";
import { startSession } from "@/app/admin/(portal)/attendance/actions";
import { useAction, Feedback } from "./ActionFeedback";

/**
 * Start Session. Navigates only once the session actually exists — a failure
 * stays on screen with the button ready to try again, instead of redirecting
 * as though it had worked.
 */
export function StartSessionButton({
  batchId,
  date,
  startTime,
  endTime,
  label = "Start Session",
}: {
  batchId: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  label?: string;
}) {
  const router = useRouter();
  const { run, pending, error } = useAction(startSession, {
    onSuccess: () => router.push(`/admin/attendance/${batchId}?date=${date}`),
  });

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => run(batchId, date, startTime, endTime)}
        disabled={pending}
        aria-busy={pending}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm min-h-[44px] active:scale-[0.98] transition-transform disabled:opacity-60"
        style={{ background: "#c9a227", color: "#162d24" }}
      >
        {pending ? <><Loader2 size={16} className="animate-spin" /> Starting…</> : <><PlayCircle size={16} /> {label}</>}
      </button>
      {error && (
        <Feedback error={error} />
      )}
      {error && !startTime && (
        <a href={`/admin/batches/${batchId}/edit`} className="block text-center text-xs font-bold" style={{ color: "#f4c430" }}>
          Set this class&apos;s time →
        </a>
      )}
    </div>
  );
}
