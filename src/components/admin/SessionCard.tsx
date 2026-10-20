import Link from "next/link";
import { Users, CheckCircle2, PlayCircle, ClipboardCheck, MapPin, User } from "lucide-react";
import type { TodaySession } from "@/lib/os/sessions";
import { NON_DELIVERED, STATE_META } from "@/lib/os/session-meta";
import { fmtTime } from "@/lib/os/attendance";
import { CategoryBadge, StateBadge } from "./SessionBadges";

function fmtClock(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/**
 * One session card — who it's for, the mix of subjects it can run, time,
 * student count, status. The action adapts to the session state: a class that
 * didn't happen offers no attendance to mark. `startForm` is the Start Session
 * control for not-started sessions.
 */
export function SessionCard({ s, startForm }: { s: TodaySession; startForm?: React.ReactNode }) {
  const done = s.state === "completed";
  const inProgress = s.state === "in_progress";
  const showCoverage = done || inProgress;
  const isIndividual = s.category === "individual_attention";
  const notHeld = NON_DELIVERED.includes(s.state);

  const border = done
    ? "rgba(125,201,143,0.4)"
    : inProgress
    ? "rgba(244,196,48,0.45)"
    : notHeld
    ? "rgba(232,120,100,0.25)"
    : "rgba(201,162,39,0.2)";

  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: `1px solid ${border}`, opacity: notHeld ? 0.85 : 1 }}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold truncate" style={{ color: "#f5f0e8" }}>{s.headline}</span>
            {done && <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "rgba(125,201,143,0.15)", color: "#7dc98f" }}>Completed</span>}
            {inProgress && <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "rgba(244,196,48,0.15)", color: "#f4c430" }}>In progress</span>}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {isIndividual && <CategoryBadge category={s.category} />}
            {notHeld && <StateBadge state={s.state} holidayDerived={s.holidayDerived} />}
          </div>

          <p className="text-xs mt-1.5 flex items-center gap-2 flex-wrap" style={{ color: "rgba(245,240,232,0.5)" }}>
            {isIndividual ? (
              <span className="flex items-center gap-1"><User size={11} /> {s.batchName}</span>
            ) : (
              <span>Grade {s.grade}</span>
            )}
            {s.room && <span className="flex items-center gap-1"><MapPin size={11} /> {s.room}</span>}
            <span className="flex items-center gap-1">
              <Users size={11} /> {done ? `${s.marked}/${s.enrolled} marked` : isIndividual ? "1 student" : `${s.enrolled} students`}
            </span>
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

          {notHeld && s.stateNote && (
            <p className="text-[11px] mt-1.5 italic" style={{ color: "rgba(245,240,232,0.55)" }}>“{s.stateNote}”</p>
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
        {!s.startTime ? (
          <Link href={`/admin/batches/${s.batchId}/edit`} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm min-h-[44px]" style={{ background: "rgba(244,196,48,0.14)", color: "#f4c430" }}>
            Set this class&apos;s timing first
          </Link>
        ) : notHeld ? (
          <p className="text-xs text-center py-2" style={{ color: "rgba(245,240,232,0.45)" }}>
            {s.holidayDerived
              ? "Public holiday — mark attendance only if the class was held anyway."
              : `${STATE_META[s.state].label} — no attendance to take.`}
          </p>
        ) : done ? (
          <Link href={`/admin/attendance/${s.batchId}`} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm min-h-[44px]" style={{ background: "rgba(125,201,143,0.14)", color: "#7dc98f" }}>
            <CheckCircle2 size={15} /> Review / Edit
          </Link>
        ) : inProgress ? (
          <Link href={`/admin/attendance/${s.batchId}`} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm min-h-[44px] active:scale-[0.98] transition-transform" style={{ background: "#c9a227", color: "#162d24" }}>
            <ClipboardCheck size={15} /> Continue Marking
          </Link>
        ) : (
          startForm ?? (
            <Link href={`/admin/attendance/${s.batchId}`} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm min-h-[44px]" style={{ background: "#c9a227", color: "#162d24" }}>
              <PlayCircle size={16} /> Start Session
            </Link>
          )
        )}
      </div>

      <span className="sr-only">{fmtTime(s.startTime)}</span>
    </div>
  );
}
