import Link from "next/link";
import { ClipboardCheck, Clock, Users, CalendarDays, CheckCircle2 } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { weekdayKey, isoDate, fmtTime } from "@/lib/os/attendance";

export const dynamic = "force-dynamic";

export default async function TodaysClassesPage() {
  const supabase = createServerSupabase();
  const now = new Date();
  const today = isoDate(now);
  const dayKey = weekdayKey(now);

  // Classes scheduled today (day-code in days[]), plus enrolment + today's session status.
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, grade, start_time, end_time, days, subject:subjects(name), teacher:teachers(full_name), class_students(count)")
    .is("deleted_at", null)
    .eq("is_active", true)
    .contains("days", [dayKey])
    .order("start_time");

  const classIds = (classes ?? []).map((c) => c.id);
  const { data: sessions } = classIds.length
    ? await supabase
        .from("class_sessions")
        .select("class_id, status, attendance(count)")
        .eq("session_date", today)
        .in("class_id", classIds)
    : { data: [] };

  const sessionByClass = new Map(
    (sessions ?? []).map((s) => [
      s.class_id,
      { status: s.status, marked: (s.attendance as unknown as { count: number }[])?.[0]?.count ?? 0 },
    ])
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
          Today&apos;s Classes
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </header>

      {!classes?.length ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <CalendarDays size={32} className="mx-auto mb-3" style={{ color: "rgba(245,240,232,0.25)" }} />
          <p className="text-sm mb-4" style={{ color: "rgba(245,240,232,0.5)" }}>
            No classes scheduled today. Set class days under Classes.
          </p>
          <Link href="/admin/classes" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>
            Manage Classes
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {classes.map((c) => {
            const subject = c.subject as unknown as { name: string } | null;
            const teacher = c.teacher as unknown as { full_name: string } | null;
            const enrolled = (c.class_students as unknown as { count: number }[])?.[0]?.count ?? 0;
            const session = sessionByClass.get(c.id);
            const done = session?.status === "completed";

            return (
              <li key={c.id}>
                <Link
                  href={`/admin/attendance/${c.id}`}
                  className="block rounded-2xl p-4 active:scale-[0.99] transition-transform"
                  style={{
                    background: "rgba(22,45,36,0.7)",
                    border: `1px solid ${done ? "rgba(125,201,143,0.4)" : "rgba(201,162,39,0.2)"}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-semibold text-base" style={{ color: "#f5f0e8" }}>{c.name}</p>
                    {done ? (
                      <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#7dc98f" }}>
                        <CheckCircle2 size={14} /> Done
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold rounded-full px-2.5 py-1" style={{ background: "rgba(244,196,48,0.15)", color: "#f4c430" }}>
                        <ClipboardCheck size={13} /> Take
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs" style={{ color: "rgba(245,240,232,0.5)" }}>
                    <span>{subject?.name ?? "—"} · Grade {c.grade}</span>
                    {teacher && <span>· {teacher.full_name}</span>}
                    <span className="flex items-center gap-1"><Clock size={12} /> {fmtTime(c.start_time)}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {done ? `${session?.marked}/${enrolled} marked` : `${enrolled} students`}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
