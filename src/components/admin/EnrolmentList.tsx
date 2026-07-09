"use client";

import { useOptimistic, useTransition } from "react";
import { Check } from "lucide-react";

export interface EnrolCandidate {
  id: string;
  full_name: string;
  admission_number: string | null;
  grade: number;
  enrolled: boolean;
}

export function EnrolmentList({
  students,
  onToggle,
}: {
  students: EnrolCandidate[];
  onToggle: (studentId: string, enrolled: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    students,
    (state, { id, enrolled }: { id: string; enrolled: boolean }) =>
      state.map((s) => (s.id === id ? { ...s, enrolled } : s))
  );

  const enrolledCount = optimistic.filter((s) => s.enrolled).length;

  return (
    <div>
      <p className="text-xs mb-3" style={{ color: "rgba(245,240,232,0.45)" }}>
        {enrolledCount} enrolled · tap to toggle {isPending && "· saving…"}
      </p>
      <ul className="space-y-2">
        {optimistic.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  setOptimistic({ id: s.id, enrolled: !s.enrolled });
                  await onToggle(s.id, !s.enrolled);
                })
              }
              className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left active:scale-[0.99] transition-transform"
              style={{
                background: s.enrolled ? "rgba(201,162,39,0.15)" : "rgba(245,240,232,0.05)",
                border: `1px solid ${s.enrolled ? "rgba(201,162,39,0.45)" : "rgba(245,240,232,0.08)"}`,
              }}
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold truncate" style={{ color: "#f5f0e8" }}>
                  {s.full_name}
                </span>
                <span className="block text-[11px]" style={{ color: "rgba(245,240,232,0.45)" }}>
                  {s.admission_number ?? "—"} · Grade {s.grade}
                </span>
              </span>
              <span
                className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center"
                style={{
                  background: s.enrolled ? "#c9a227" : "rgba(245,240,232,0.1)",
                  color: s.enrolled ? "#162d24" : "transparent",
                }}
              >
                <Check size={14} strokeWidth={3} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
