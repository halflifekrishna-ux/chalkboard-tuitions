import Link from "next/link";
import { Users, CheckCircle2, PlayCircle, ClipboardCheck } from "lucide-react";
import type { TodaySession } from "@/lib/os/sessions";
import { fmtTime } from "@/lib/os/attendance";

function fmtClock(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/**
 * One session card — batch, subject, teacher, time, student count, status,
 * started/completed times. The action adapts to the session state.
 * `startForm` is the bound Start Session server action (form) for not-started.
 */
export function SessionCard({ s, startForm }: { s: TodaySession; startForm?: React.ReactNode }) {
  const done = s.state === "completed";
  const inProgress = s.state === "in_progress";

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "rgba(22,45,36,0.7)", border: `1px solid ${done ? "rgba(125,201,143,0.4)" : inProgress ? "rgba(244,196,48,0.45)" : "rgba(201,162,39,0.2)"}` }}
    >
      <div className="flex items-center gap-3">
        <span className="h-11 w-1.5 rounded-full flex-shrink-0" style={{ background: s.colour }} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold truncate" style={{ color: "#f5f0e8" }}>{s.batchName}</span>
            {done && <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "rgba(125,201,143,0.15)", color: "#7dc98f" }}>Completed</span>}
            {inProgress && <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "rgba(244,196,48,0.15)", color: "#f4c430" }}>In progress</span>}
          </div>
          <p className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: "rgba(245,240,232,0.5)" }}>
            <span style={{ color: "#f5f0e8" }}>{s.subjectName}</span>
            {s.teacherName && <span>· {s.teacherName}</span>}
            <span>· Grade {s.grade}</span>
            <span className="flex items-center gap-1"><Users size={11} /> {done ? `${s.marked}/${s.enrolled} marked` : `${s.enrolled} students`}</span>
          </p>
          {(s.startedAt || s.completedAt) && (
            <p className="text-[11px] mt-1" style={{ color: "rgba(245,240,232,0.35)" }}>
              {s.startedAt && `Started ${fmtClock(s.startedAt)}`}
              {s.startedAt && s.completedAt && " · "}
              {s.completedAt && `Completed ${fmtClock(s.completedAt)}`}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3">
        {done ? (
          <Link href={`/admin/attendance/${s.batchSubjectId}`} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm" style={{ background: "rgba(125,201,143,0.14)", color: "#7dc98f" }}>
            <CheckCircle2 size={15} /> Review / Edit
          </Link>
        ) : inProgress ? (
          <Link href={`/admin/attendance/${s.batchSubjectId}`} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm active:scale-[0.98] transition-transform" style={{ background: "#c9a227", color: "#162d24" }}>
            <ClipboardCheck size={15} /> Continue Marking
          </Link>
        ) : (
          startForm ?? (
            <Link href={`/admin/attendance/${s.batchSubjectId}`} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>
              <PlayCircle size={16} /> Start Session
            </Link>
          )
        )}
      </div>

      {/* time badge shown by parent grouping; keep inline fallback */}
      {!s.startTime && null}
      <span className="sr-only">{fmtTime(s.startTime)}</span>
    </div>
  );
}
