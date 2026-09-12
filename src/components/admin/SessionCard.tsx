import Link from "next/link";
import { Users, CheckCircle2, PlayCircle, ClipboardCheck, MapPin } from "lucide-react";
import type { TodaySession } from "@/lib/os/sessions";
import { fmtTime } from "@/lib/os/attendance";

function fmtClock(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/**
 * One session card — batch, the mix of subjects it can run, time, student
 * count, status, started/completed times. The action adapts to the session
 * state. `startForm` is the bound Start Session server action (form) for
 * not-started sessions.
 */
export function SessionCard({ s, startForm }: { s: TodaySession; startForm?: React.ReactNode }) {
  const done = s.state === "completed";
  const inProgress = s.state === "in_progress";
  const showCoverage = done || inProgress;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "rgba(22,45,36,0.7)", border: `1px solid ${done ? "rgba(125,201,143,0.4)" : inProgress ? "rgba(244,196,48,0.45)" : "rgba(201,162,39,0.2)"}` }}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold truncate" style={{ color: "#f5f0e8" }}>{s.batchName}</span>
            {done && <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "rgba(125,201,143,0.15)", color: "#7dc98f" }}>Completed</span>}
            {inProgress && <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "rgba(244,196,48,0.15)", color: "#f4c430" }}>In progress</span>}
          </div>
          <p className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: "rgba(245,240,232,0.5)" }}>
            <span>Grade {s.grade}</span>
            {s.room && <span className="flex items-center gap-1"><MapPin size={11} /> {s.room}</span>}
            <span className="flex items-center gap-1"><Users size={11} /> {done ? `${s.marked}/${s.enrolled} marked` : `${s.enrolled} students`}</span>
          </p>

          {s.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {s.subjects.map((sub) => {
                const covered = !showCoverage || s.coveredSubjectIds.includes(sub.subjectId);
                return (
                  <span
                    key={sub.id}
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold"
                    style={{ background: covered ? `${sub.colour}22` : "rgba(245,240,232,0.04)", color: covered ? "#f5f0e8" : "rgba(245,240,232,0.3)" }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: covered ? sub.colour : "rgba(245,240,232,0.2)" }} />
                    {sub.name}
                  </span>
                );
              })}
            </div>
          )}

          {(s.startedAt || s.completedAt) && (
            <p className="text-[11px] mt-1.5" style={{ color: "rgba(245,240,232,0.35)" }}>
              {s.startedAt && `Started ${fmtClock(s.startedAt)}`}
              {s.startedAt && s.completedAt && " · "}
              {s.completedAt && `Completed ${fmtClock(s.completedAt)}`}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3">
        {done ? (
          <Link href={`/admin/attendance/${s.batchId}`} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm" style={{ background: "rgba(125,201,143,0.14)", color: "#7dc98f" }}>
            <CheckCircle2 size={15} /> Review / Edit
          </Link>
        ) : inProgress ? (
          <Link href={`/admin/attendance/${s.batchId}`} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm active:scale-[0.98] transition-transform" style={{ background: "#c9a227", color: "#162d24" }}>
            <ClipboardCheck size={15} /> Continue Marking
          </Link>
        ) : (
          startForm ?? (
            <Link href={`/admin/attendance/${s.batchId}`} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>
              <PlayCircle size={16} /> Start Session
            </Link>
          )
        )}
      </div>

      <span className="sr-only">{fmtTime(s.startTime)}</span>
    </div>
  );
}
