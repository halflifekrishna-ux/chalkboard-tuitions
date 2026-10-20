import Link from "next/link";
import { CalendarDays, PartyPopper } from "lucide-react";
import { getSessionsForDate, groupByTime, getMonthOverview, getHoliday } from "@/lib/os/sessions";
import { requireCapability } from "@/lib/os/auth";
import { can } from "@/lib/os/permissions";
import { isoDate, fmtTime } from "@/lib/os/attendance";
import { SessionCard } from "@/components/admin/SessionCard";
import { DateStrip } from "@/components/admin/DateStrip";
import { StartSessionButton } from "@/components/admin/StartSessionButton";
import { HolidayControl } from "@/components/admin/HolidayControl";

export const dynamic = "force-dynamic";

export default async function TodaysSessionsPage({ searchParams }: { searchParams: { date?: string } }) {
  const admin = await requireCapability("attendance.mark");
  const today = isoDate(new Date());
  const selected = searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date) ? searchParams.date : today;
  const viewDate = new Date(`${selected}T00:00:00`);
  const isToday = selected === today;

  const [sessions, monthCounts, holiday] = await Promise.all([
    getSessionsForDate(viewDate),
    getMonthOverview(selected),
    getHoliday(selected),
  ]);
  const groups = groupByTime(sessions);

  const doneCount = sessions.filter((s) => s.state === "completed").length;
  const canManageHolidays = can(admin.role, "batches.manage");

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
          {isToday ? "Today's Sessions" : "Sessions"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          {viewDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          {sessions.length > 0 && ` · ${doneCount}/${sessions.length} done`}
        </p>
      </header>

      <DateStrip selected={selected} basePath="/admin/attendance" counts={monthCounts} />

      {holiday && (
        <section className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(220,80,60,0.1)", border: "1px solid rgba(232,120,100,0.3)" }}>
          <p className="flex items-center gap-2 font-semibold" style={{ color: "#e8a090" }}>
            <PartyPopper size={18} aria-hidden /> Public Holiday — {holiday.name}
          </p>
          <p className="text-sm" style={{ color: "rgba(245,240,232,0.65)" }}>
            Classes scheduled today show as not conducted. If a class ran anyway, you can still mark its attendance.
          </p>
          {canManageHolidays && <HolidayControl date={selected} holidayName={holiday.name} />}
        </section>
      )}

      {!sessions.length ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <CalendarDays size={32} className="mx-auto mb-3" style={{ color: "rgba(245,240,232,0.25)" }} />
          <p className="text-sm mb-4" style={{ color: "rgba(245,240,232,0.5)" }}>
            {isToday ? "No classes run today." : "No classes run on this day."} Classes show up here on the days they&apos;re scheduled.
          </p>
          <Link href="/admin/batches" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>Manage classes</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.time ?? "none"} className="flex gap-3">
              {/* Time rail (calendar-style) */}
              <div className="flex-shrink-0 w-14 pt-4 text-right">
                <span className="text-sm font-bold" style={{ color: "#f4c430" }}>{group.time ? fmtTime(`${group.time}`) : "—"}</span>
              </div>
              {/* Sessions at this time */}
              <div className="flex-1 space-y-3 min-w-0">
                {group.items.map((s) => {
                  const startForm = (
                    <StartSessionButton
                      batchId={s.batchId}
                      date={selected}
                      startTime={s.startTime}
                      endTime={s.endTime}
                      label={isToday ? "Start Session" : "Mark Attendance"}
                    />
                  );
                  return <SessionCard key={s.batchId} s={s} startForm={startForm} />;
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {canManageHolidays && !holiday && (
        <div className="pt-1 pb-4">
          <HolidayControl date={selected} holidayName={null} />
        </div>
      )}
    </div>
  );
}
