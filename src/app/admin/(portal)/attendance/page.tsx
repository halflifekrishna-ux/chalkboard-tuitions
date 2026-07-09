import Link from "next/link";
import { ClipboardCheck, Clock, Users, CalendarDays, CheckCircle2, PlayCircle } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { weekdayKey, isoDate, fmtTime } from "@/lib/os/attendance";
import { startSession } from "./actions";

export const dynamic = "force-dynamic";

export default async function TodaysSessionsPage() {
  const supabase = createServerSupabase();
  const now = new Date();
  const today = isoDate(now);
  const dayKey = weekdayKey(now);

  // Batch subjects scheduled today (the recurring templates). One query, joined.
  const { data: subjects } = await supabase
    .from("batch_subjects")
    .select("id, days, start_time, end_time, colour, subject:subjects(name), teacher:teachers(full_name), batch:batches(id, name, grade, status, deleted_at, batch_students(count))")
    .eq("status", "active")
    .is("deleted_at", null)
    .contains("days", [dayKey])
    .order("start_time");

  // Keep only those whose parent batch is active/live.
  const live = (subjects ?? []).filter((s) => {
    const b = s.batch as unknown as { status: string; deleted_at: string | null } | null;
    return b && b.status === "active" && !b.deleted_at;
  });

  // Today's sessions for these subjects (status + marked count). One query.
  const ids = live.map((s) => s.id);
  const { data: sessions } = ids.length
    ? await supabase
        .from("sessions")
        .select("batch_subject_id, status, attendance(count)")
        .eq("session_date", today)
        .in("batch_subject_id", ids)
    : { data: [] };
  const sessionBySubject = new Map(
    (sessions ?? []).map((s) => [s.batch_subject_id, { status: s.status, marked: (s.attendance as unknown as { count: number }[])?.[0]?.count ?? 0 }])
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Today&apos;s Sessions</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </header>

      {!live.length ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <CalendarDays size={32} className="mx-auto mb-3" style={{ color: "rgba(245,240,232,0.25)" }} />
          <p className="text-sm mb-4" style={{ color: "rgba(245,240,232,0.5)" }}>
            No sessions scheduled today. Add subjects with weekdays to your batches.
          </p>
          <Link href="/admin/batches" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>Manage Batches</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {live.map((s) => {
            const subject = s.subject as unknown as { name: string } | null;
            const teacher = s.teacher as unknown as { full_name: string } | null;
            const batch = s.batch as unknown as { name: string; grade: number; batch_students: { count: number }[] } | null;
            const enrolled = batch?.batch_students?.[0]?.count ?? 0;
            const session = sessionBySubject.get(s.id);
            const done = session?.status === "completed";
            const inProgress = session?.status === "in_progress";
            const startWithArgs = startSession.bind(null, s.id, today, s.start_time?.slice(0, 5) ?? null, s.end_time?.slice(0, 5) ?? null);

            return (
              <li key={s.id}>
                <div className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: `1px solid ${done ? "rgba(125,201,143,0.4)" : "rgba(201,162,39,0.2)"}` }}>
                  <div className="flex items-center gap-3">
                    <span className="h-11 w-1.5 rounded-full flex-shrink-0" style={{ background: s.colour }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: "#f4c430" }}>{fmtTime(s.start_time)}</span>
                        <span className="text-base font-semibold truncate" style={{ color: "#f5f0e8" }}>{batch?.name}</span>
                      </div>
                      <p className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: "rgba(245,240,232,0.5)" }}>
                        <span>{subject?.name ?? "—"}</span>
                        {teacher && <span>· {teacher.full_name}</span>}
                        <span className="flex items-center gap-1"><Users size={11} /> {done ? `${session?.marked}/${enrolled} marked` : `${enrolled} students`}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    {done ? (
                      <Link href={`/admin/attendance/${s.id}`} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm" style={{ background: "rgba(125,201,143,0.14)", color: "#7dc98f" }}>
                        <CheckCircle2 size={15} /> Completed · Review / Edit
                      </Link>
                    ) : inProgress ? (
                      <Link href={`/admin/attendance/${s.id}`} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>
                        <ClipboardCheck size={15} /> Continue Marking
                      </Link>
                    ) : (
                      <form action={startWithArgs}>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm active:scale-[0.98] transition-transform" style={{ background: "#c9a227", color: "#162d24" }}>
                          <PlayCircle size={16} /> Start Session
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
