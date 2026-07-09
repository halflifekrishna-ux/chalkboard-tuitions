import Link from "next/link";
import { Users, ClipboardCheck, UserPlus, CalendarClock, Activity } from "lucide-react";
import { requireAdmin } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { weekdayKey } from "@/lib/os/attendance";

export const dynamic = "force-dynamic";

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "rgba(22,45,36,0.7)",
        border: `1px solid ${accent ? "rgba(244,196,48,0.4)" : "rgba(201,162,39,0.15)"}`,
      }}
    >
      <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "rgba(245,240,232,0.45)" }}>
        {label}
      </p>
      <p className="font-playfair text-2xl font-bold" style={{ color: accent ? "#f4c430" : "#f5f0e8" }}>
        {value}
      </p>
    </div>
  );
}

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const supabase = createServerSupabase();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const todayKey = weekdayKey(now);

  const [students, sessions, attendance, activity, messages, pendingHomework, pendingFees, messagesQueued, todayClasses] = await Promise.all([
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null),
    supabase
      .from("class_sessions")
      .select("id, status, start_time, class:classes(name)")
      .eq("session_date", today)
      .order("start_time"),
    supabase.from("attendance").select("status, session:class_sessions!inner(session_date)").eq("session.session_date", today),
    supabase.from("activity_logs").select("id, summary, created_at").order("created_at", { ascending: false }).limit(8),
    supabase
      .from("communications")
      .select("id", { count: "exact", head: true })
      .eq("direction", "outgoing")
      .gte("occurred_at", `${today}T00:00:00`),
    supabase
      .from("homework")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("due_date", today),
    supabase
      .from("fees")
      .select("id", { count: "exact", head: true })
      .in("status", ["due", "partially_paid", "overdue"])
      .is("deleted_at", null),
    supabase
      .from("communication_queue")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "processing", "failed"]),
    supabase
      .from("classes")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("is_active", true)
      .contains("days", [todayKey]),
  ]);

  const att = attendance.data ?? [];
  const present = att.filter((a) => a.status === "present").length;
  const absent = att.filter((a) => a.status === "absent").length;
  const late = att.filter((a) => a.status === "late").length;
  const todaySessions = sessions.data ?? [];
  const markedToday = att.length;
  const attendancePct = markedToday ? Math.round(((present + late) / markedToday) * 100) : 0;
  const completedSessions = todaySessions.filter((s) => s.status === "completed").length;
  const todayClassCount = todayClasses.count ?? 0;

  const firstName = admin.full_name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
          {greeting}, {firstName}
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </header>

      {/* Quick actions — thumb-reach first on mobile */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/admin/students/new"
          className="flex items-center gap-3 rounded-2xl p-4 font-bold text-sm active:scale-[0.98] transition-transform"
          style={{ background: "#c9a227", color: "#162d24" }}
        >
          <UserPlus size={20} /> Add Student
        </Link>
        <Link
          href="/admin/attendance"
          className="flex items-center gap-3 rounded-2xl p-4 font-bold text-sm active:scale-[0.98] transition-transform"
          style={{ background: "rgba(22,45,36,0.9)", color: "#f4c430", border: "1px solid rgba(244,196,48,0.4)" }}
        >
          <ClipboardCheck size={20} /> Attendance
        </Link>
      </div>

      {/* Today at a glance */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>
          Today
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Active Students" value={students.count ?? 0} accent />
          <StatCard label="Attendance %" value={markedToday ? `${attendancePct}%` : "—"} accent />
          <StatCard label="Classes Done" value={`${completedSessions}/${todayClassCount}`} />
          <StatCard label="Marked Today" value={markedToday} />
          <StatCard label="Present" value={present} />
          <StatCard label="Absent" value={absent} />
          <StatCard label="Messages Sent" value={messages.count ?? 0} />
          <StatCard label="Messages Queued" value={messagesQueued.count ?? 0} />
        </div>
      </section>

      {/* Today's classes */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>
          Today&apos;s Classes
        </h2>
        <div
          className="rounded-2xl divide-y"
          style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}
        >
          {todaySessions.length === 0 ? (
            <div className="p-6 flex items-center gap-3">
              <CalendarClock size={18} style={{ color: "rgba(245,240,232,0.3)" }} />
              <p className="text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>
                No classes scheduled today. Sessions appear here once Classes are set up.
              </p>
            </div>
          ) : (
            todaySessions.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>
                    {(s.class as unknown as { name: string } | null)?.name ?? "Class"}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(245,240,232,0.45)" }}>
                    {s.start_time?.slice(0, 5) ?? "—"} · {s.status.replace("_", " ")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>
          Recent Activity
        </h2>
        <div
          className="rounded-2xl"
          style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}
        >
          {!activity.data?.length ? (
            <div className="p-6 flex items-center gap-3">
              <Activity size={18} style={{ color: "rgba(245,240,232,0.3)" }} />
              <p className="text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>
                Activity will appear here as you add students and mark attendance.
              </p>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
              {activity.data.map((a) => (
                <li key={a.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-sm" style={{ color: "rgba(245,240,232,0.8)" }}>
                    {a.summary}
                  </p>
                  <time className="text-[11px] whitespace-nowrap" style={{ color: "rgba(245,240,232,0.35)" }}>
                    {new Date(a.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="pt-2">
        <Link href="/admin/students" className="text-sm font-semibold inline-flex items-center gap-2" style={{ color: "#f4c430" }}>
          <Users size={15} /> View all students →
        </Link>
      </div>
    </div>
  );
}
