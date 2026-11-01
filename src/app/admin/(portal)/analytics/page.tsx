import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { todayIST } from "@/lib/os/enrolment";
import { BOARD_LABELS } from "@/lib/os/types";
import {
  computeStudentInsights, EARLY_EXIT_DAYS,
  type AttendanceRate, type InsightDetail, type InsightMark, type InsightStint, type InsightStudent, type MonthRow, type Tally,
} from "@/lib/os/student-insights";

export const dynamic = "force-dynamic";

/** Below this, a percentage says more about the sample than about the students. */
const MIN_FOR_PERCENT = 20;
const JOINED = "#c9a227";
const EXITED = "#4a9eca";
const cardStyle = { background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" };
const muted = "rgba(245,240,232,0.5)";

function Tile({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="rounded-2xl p-4" style={cardStyle}>
      <p className="text-[10px] uppercase tracking-wide" style={{ color: muted }}>{label}</p>
      <p className="font-playfair text-2xl font-bold mt-1" style={{ color: "#f5f0e8" }}>{value}</p>
      {note && <p className="text-[11px] mt-1" style={{ color: muted }}>{note}</p>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>{title}</h2>
      <div className="rounded-2xl p-4" style={cardStyle}>{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm" style={{ color: muted }}>{children}</p>;
}

function Ranked({ rows, empty }: { rows: Tally[]; empty: string }) {
  if (!rows.length) return <Empty>{empty}</Empty>;
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between gap-3 text-sm" style={{ color: "#f5f0e8" }}>
            <span className="min-w-0 truncate">{r.label}</span>
            <span className="font-semibold">{r.count}</span>
          </div>
          <div className="h-1.5 mt-1 rounded-full" style={{ background: "rgba(245,240,232,0.06)" }}>
            <div className="h-full rounded-full" style={{ width: `${(r.count / max) * 100}%`, background: EXITED }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MonthlyChart({ months }: { months: MonthRow[] }) {
  const max = Math.max(1, ...months.map((m) => Math.max(m.joined, m.exited)));
  return (
    <>
      <div className="flex gap-4 text-xs mb-3" style={{ color: muted }}>
        <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: JOINED }} /> Joined</span>
        <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: EXITED }} /> Exited</span>
      </div>
      <div className="flex items-end gap-1 h-32" role="img" aria-label="Students joined and exited each month for the last 12 months. The table below has the numbers.">
        {months.map((m) => (
          <div key={m.month} title={`${m.label}: ${m.joined} joined, ${m.exited} exited`} className="flex-1 min-w-0 h-full flex items-end justify-center gap-0.5">
            <div className="w-1/2 max-w-[10px] rounded-t" style={{ height: `${(m.joined / max) * 100}%`, background: JOINED }} />
            <div className="w-1/2 max-w-[10px] rounded-t" style={{ height: `${(m.exited / max) * 100}%`, background: EXITED }} />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1.5" aria-hidden>
        {months.map((m) => <span key={m.month} className="flex-1 min-w-0 text-center text-[9px]" style={{ color: muted }}>{m.label.slice(0, 1)}</span>)}
      </div>
      <details className="mt-3">
        <summary className="text-xs font-semibold cursor-pointer" style={{ color: muted }}>Show the numbers</summary>
        <table className="w-full text-xs mt-2" style={{ color: "rgba(245,240,232,0.8)" }}>
          <thead><tr style={{ color: muted }}><th className="text-left font-medium py-1">Month</th><th className="text-right font-medium">Joined</th><th className="text-right font-medium">Exited</th></tr></thead>
          <tbody>
            {months.map((m) => <tr key={m.month}><td className="py-1">{m.month}</td><td className="text-right">{m.joined}</td><td className="text-right">{m.exited}</td></tr>)}
          </tbody>
        </table>
      </details>
    </>
  );
}

function rateText({ attended, total }: AttendanceRate) {
  if (!total) return "No marks yet";
  const counts = `${attended} of ${total} classes`;
  return total < MIN_FOR_PERCENT ? counts : `${Math.round((attended / total) * 100)}% (${counts})`;
}

function stayText(days: number | null) {
  if (days === null) return "—";
  return days < 60 ? `${Math.round(days)} days` : `${(days / 30.44).toFixed(1)} months`;
}

/** PostgREST caps a response, so read every page; these totals must not silently undercount. */
async function readAll<T>(page: (from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> {
  const size = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += size) {
    const { data, error } = await page(from, from + size - 1);
    if (error) throw new Error("Couldn't load the student insights.");
    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < size) return rows;
  }
}

export default async function AnalyticsPage() {
  await requireCapability("analytics.view");
  const supabase = createServerSupabase();
  const today = todayIST();

  const [students, stints, details, marks] = await Promise.all([
    readAll<InsightStudent>((a, b) => supabase.from("students").select("id, full_name, grade, board, status, deleted_at").order("id").range(a, b)),
    readAll<InsightStint>((a, b) => supabase.from("student_enrolments").select("id, student_id, joined_on, exit_type, exited_on, classes_at_exit, date_confirmed").order("id").range(a, b)),
    readAll<InsightDetail>((a, b) => supabase.from("student_exit_details").select("enrolment_id, reason").order("enrolment_id").range(a, b)),
    readAll<{ student_id: string; status: string; session: { session_date: string } }>((a, b) => supabase.from("attendance").select("student_id, status, session:sessions!inner(session_date)").order("id").range(a, b)),
  ]);
  const flatMarks: InsightMark[] = marks.map((m) => ({ student_id: m.student_id, status: m.status, session_date: m.session.session_date }));

  const i = computeStudentInsights(students, stints, details, flatMarks, today, BOARD_LABELS);
  const net = i.joinedThisMonth - i.exitedThisMonth;
  const noExits = "No exits recorded yet.";

  return (
    <div className="space-y-6 pb-6">
      <header>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Student insights</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>Who joined, who left, and why · Super Admin only</p>
      </header>

      {i.needsFixing.length > 0 && (
        <section className="rounded-2xl p-4" style={{ background: "rgba(244,196,48,0.08)", border: "1px solid rgba(244,196,48,0.3)" }}>
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#f4c430" }}>
            <AlertTriangle size={15} /> These numbers are provisional: {i.needsFixing.length} {i.needsFixing.length === 1 ? "record needs" : "records need"} checking
          </p>
          <ul className="mt-2 space-y-1.5">
            {i.needsFixing.map((n) => (
              <li key={`${n.studentId}-${n.issue}`} className="text-sm">
                <Link href={`/admin/students/${n.studentId}`} className="font-semibold underline" style={{ color: "#f5f0e8" }}>{n.name}</Link>
                <span style={{ color: "rgba(245,240,232,0.6)" }}>: {n.issue}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tile label="Current students" value={i.current} note={i.paused ? `plus ${i.paused} inactive` : undefined} />
        <Tile label="Joined this month" value={i.joinedThisMonth} />
        <Tile label="Exited this month" value={i.exitedThisMonth} />
        <Tile label="Net this month" value={net > 0 ? `+${net}` : net} />
      </div>

      <Panel title="Joins and exits, last 12 months"><MonthlyChart months={i.months} /></Panel>

      <div className="grid grid-cols-2 gap-3">
        <Tile label="Typical stay before leaving" value={stayText(i.medianStayDays)} note={i.stayCount ? `median of ${i.stayCount} ${i.stayCount === 1 ? "exit" : "exits"} with dates` : "No dated exits yet"} />
        <Tile label={`Left within ${EARLY_EXIT_DAYS} days`} value={i.earlyExits} note={`of ${i.datedExits} dated ${i.datedExits === 1 ? "exit" : "exits"}`} />
      </div>

      <Panel title={`Why students left (${i.exitedTotal})`}><Ranked rows={i.reasons} empty={noExits} /></Panel>

      <div className="grid sm:grid-cols-2 gap-5">
        <Panel title="Exits by grade"><Ranked rows={i.byGrade} empty={noExits} /></Panel>
        <Panel title="Exits by board"><Ranked rows={i.byBoard} empty={noExits} /></Panel>
      </div>
      <Panel title="Exits by class"><Ranked rows={i.byClass} empty="No exits from a class yet." /></Panel>

      <Panel title="Attendance, last 30 days">
        <div className="flex justify-between gap-4 py-1 text-sm" style={{ color: "#f5f0e8" }}>
          <span>Before students left</span><span className="font-semibold text-right">{rateText(i.beforeExit)}</span>
        </div>
        <div className="flex justify-between gap-4 py-1 text-sm" style={{ color: "#f5f0e8" }}>
          <span>Current students</span><span className="font-semibold text-right">{rateText(i.currentAttendance)}</span>
        </div>
        <p className="text-[11px] mt-2" style={{ color: muted }}>A falling rate before exits suggests attendance can warn you early. Percentages appear from {MIN_FOR_PERCENT} marks.</p>
      </Panel>
    </div>
  );
}
