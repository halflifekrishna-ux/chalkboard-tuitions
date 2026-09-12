import Link from "next/link";
import { UserPlus, ClipboardCheck, Users, Activity, MessageCircle, PlayCircle, CalendarClock, AlertCircle } from "lucide-react";
import { requireAdmin } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { getSessionsForDate } from "@/lib/os/sessions";
import { isoDate } from "@/lib/os/attendance";
import { SessionCard } from "@/components/admin/SessionCard";
import { startSession } from "./attendance/actions";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: `1px solid ${accent ? "rgba(244,196,48,0.4)" : "rgba(201,162,39,0.15)"}` }}>
      <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "rgba(245,240,232,0.45)" }}>{label}</p>
      <p className="font-playfair text-2xl font-bold" style={{ color: accent ? "#f4c430" : "#f5f0e8" }}>{value}</p>
    </div>
  );
}

function SectionHeader({ title, href, cta }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs uppercase tracking-widest font-semibold" style={{ color: "rgba(245,240,232,0.4)" }}>{title}</h2>
      {href && <Link href={href} className="text-xs font-semibold" style={{ color: "#f4c430" }}>{cta ?? "View all"} →</Link>}
    </div>
  );
}

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const supabase = createServerSupabase();
  const now = new Date();
  const today = isoDate(now);

  // Next school day that actually has scheduled sessions (for "Upcoming").
  const upcoming = new Date(now);
  upcoming.setDate(upcoming.getDate() + 1);

  const [todaySessions, upcomingSessions, students, attendance, activity, messages, queue] = await Promise.all([
    getSessionsForDate(now),
    getSessionsForDate(upcoming),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
    supabase.from("attendance").select("status, session:sessions!inner(session_date)").eq("session.session_date", today),
    supabase.from("activity_logs").select("id, summary, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("communications").select("id", { count: "exact", head: true }).eq("direction", "outgoing").gte("occurred_at", `${today}T00:00:00`),
    supabase.from("communication_queue").select("status"),
  ]);

  const att = attendance.data ?? [];
  const present = att.filter((a) => a.status === "present").length;
  const late = att.filter((a) => a.status === "late").length;
  const markedToday = att.length;
  const attendancePct = markedToday ? Math.round(((present + late) / markedToday) * 100) : 0;

  const notStarted = todaySessions.filter((s) => s.state === "not_started");
  const inProgress = todaySessions.filter((s) => s.state === "in_progress");
  const completed = todaySessions.filter((s) => s.state === "completed");

  const q = (queue.data ?? []).reduce((a, r) => ({ ...a, [r.status]: (a[r.status] ?? 0) + 1 }), {} as Record<string, number>);
  const pendingQueue = (q.pending ?? 0) + (q.processing ?? 0);
  const failedQueue = q.failed ?? 0;

  const firstName = admin.full_name.split(" ")[0];
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const upcomingLabel = WEEKDAYS[upcoming.getDay()];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>{greeting}, {firstName}</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </header>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/students/new" className="flex items-center gap-3 rounded-2xl p-4 font-bold text-sm active:scale-[0.98] transition-transform" style={{ background: "#c9a227", color: "#162d24" }}>
          <UserPlus size={20} /> Add Student
        </Link>
        <Link href="/admin/attendance" className="flex items-center gap-3 rounded-2xl p-4 font-bold text-sm active:scale-[0.98] transition-transform" style={{ background: "rgba(22,45,36,0.9)", color: "#f4c430", border: "1px solid rgba(244,196,48,0.4)" }}>
          <ClipboardCheck size={20} /> Attendance
        </Link>
      </div>

      {/* Today at a glance */}
      <section>
        <SectionHeader title="Today" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Active Students" value={students.count ?? 0} accent />
          <StatCard label="Attendance %" value={markedToday ? `${attendancePct}%` : "—"} accent />
          <StatCard label="Sessions Done" value={`${completed.length}/${todaySessions.length}`} />
          <StatCard label="Messages Sent" value={messages.count ?? 0} />
        </div>
      </section>

      {/* WhatsApp queue alert */}
      {(pendingQueue > 0 || failedQueue > 0) && (
        <Link href="/admin/whatsapp" className="flex items-center gap-3 rounded-2xl p-4" style={{ background: failedQueue ? "rgba(220,80,60,0.1)" : "rgba(244,196,48,0.08)", border: `1px solid ${failedQueue ? "rgba(232,120,100,0.3)" : "rgba(244,196,48,0.25)"}` }}>
          {failedQueue ? <AlertCircle size={18} style={{ color: "#e8a090" }} /> : <MessageCircle size={18} style={{ color: "#f4c430" }} />}
          <div className="flex-1 text-sm">
            <span style={{ color: "#f5f0e8" }}>
              {pendingQueue > 0 && `${pendingQueue} WhatsApp message${pendingQueue === 1 ? "" : "s"} queued`}
              {pendingQueue > 0 && failedQueue > 0 && " · "}
              {failedQueue > 0 && `${failedQueue} failed`}
            </span>
          </div>
          <span className="text-xs font-semibold" style={{ color: "#f4c430" }}>Open →</span>
        </Link>
      )}

      {/* In-progress sessions (resume first) */}
      {inProgress.length > 0 && (
        <section>
          <SectionHeader title="Continue Session" />
          <div className="space-y-3">
            {inProgress.map((s) => <SessionCard key={s.batchId} s={s} />)}
          </div>
        </section>
      )}

      {/* Sessions to start */}
      <section>
        <SectionHeader title="Today's Sessions" href="/admin/attendance" cta="Calendar" />
        {todaySessions.length === 0 ? (
          <div className="rounded-2xl p-6 flex items-center gap-3" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
            <CalendarClock size={18} style={{ color: "rgba(245,240,232,0.3)" }} />
            <p className="text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>No sessions scheduled today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notStarted.map((s) => {
              const startForm = (
                <form action={startSession.bind(null, s.batchId, today, s.startTime, s.endTime)}>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm active:scale-[0.98] transition-transform" style={{ background: "#c9a227", color: "#162d24" }}>
                    <PlayCircle size={16} /> Start Session
                  </button>
                </form>
              );
              return <SessionCard key={s.batchId} s={s} startForm={startForm} />;
            })}
            {notStarted.length === 0 && (
              <p className="text-sm px-1" style={{ color: "rgba(245,240,232,0.45)" }}>All of today&apos;s sessions are started or complete. 🎉</p>
            )}
          </div>
        )}
      </section>

      {/* Completed today */}
      {completed.length > 0 && (
        <section>
          <SectionHeader title="Completed Sessions" />
          <div className="space-y-3">
            {completed.map((s) => <SessionCard key={s.batchId} s={s} />)}
          </div>
        </section>
      )}

      {/* Upcoming (next day with sessions) */}
      {upcomingSessions.length > 0 && (
        <section>
          <SectionHeader title={`Upcoming · ${upcomingLabel}`} />
          <div className="rounded-2xl divide-y" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
            {upcomingSessions.map((s) => (
              <div key={s.batchId} className="p-3.5 flex items-center gap-3" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
                <span className="h-8 w-1 rounded-full flex-shrink-0" style={{ background: s.subjects[0]?.colour ?? "#c9a227" }} />
                <span className="text-xs font-bold w-14" style={{ color: "#f4c430" }}>{s.startTime ?? "—"}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#f5f0e8" }}>{s.batchName}</p>
                  <p className="text-[11px] truncate" style={{ color: "rgba(245,240,232,0.45)" }}>{s.subjects.map((sub) => sub.name).join(", ") || "No subjects yet"}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent activity */}
      <section>
        <SectionHeader title="Recent Activity" />
        <div className="rounded-2xl" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          {!activity.data?.length ? (
            <div className="p-6 flex items-center gap-3">
              <Activity size={18} style={{ color: "rgba(245,240,232,0.3)" }} />
              <p className="text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>Activity appears here as you work.</p>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
              {activity.data.map((a) => (
                <li key={a.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-sm" style={{ color: "rgba(245,240,232,0.8)" }}>{a.summary}</p>
                  <time className="text-[11px] whitespace-nowrap" style={{ color: "rgba(245,240,232,0.35)" }}>
                    {new Date(a.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="pt-1 pb-2">
        <Link href="/admin/students" className="text-sm font-semibold inline-flex items-center gap-2" style={{ color: "#f4c430" }}>
          <Users size={15} /> View all students →
        </Link>
      </div>
    </div>
  );
}
