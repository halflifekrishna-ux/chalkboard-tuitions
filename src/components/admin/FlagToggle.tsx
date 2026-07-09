"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFeatureFlag } from "@/app/admin/(portal)/developer/actions";

export function FlagToggle({ flagKey, label, enabled }: { flagKey: string; label: string; enabled: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(enabled);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm font-medium" style={{ color: "#f5f0e8" }}>{label}</p>
        <p className="text-[11px] font-mono" style={{ color: "rgba(245,240,232,0.35)" }}>{flagKey}</p>
      </div>
      <button
        role="switch"
        aria-checked={optimistic}
        aria-label={`Toggle ${label}`}
        disabled={isPending}
        onClick={() => startTransition(async () => { setOptimistic(!optimistic); await toggleFeatureFlag(flagKey, !optimistic); })}
        className="relative h-6 w-11 rounded-full transition-colors flex-shrink-0"
        style={{ background: optimistic ? "#c9a227" : "rgba(245,240,232,0.15)" }}
      >
        <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: optimistic ? "22px" : "2px" }} />
      </button>
    </div>
  );
}
