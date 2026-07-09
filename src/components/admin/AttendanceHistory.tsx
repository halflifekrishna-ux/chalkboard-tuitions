import { ATTENDANCE_META, type AttendanceStatus } from "@/lib/os/attendance";

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  className: string;
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: "rgba(245,240,232,0.05)" }}>
      <p className="font-playfair text-xl font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: "rgba(245,240,232,0.4)" }}>{label}</p>
    </div>
  );
}

/** Compact month calendar with per-day status dots. */
function MiniCalendar({ records }: { records: AttendanceRecord[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startPad = first.getDay();

  const byDay = new Map<number, AttendanceStatus>();
  for (const r of records) {
    const d = new Date(r.date);
    if (d.getFullYear() === year && d.getMonth() === month) byDay.set(d.getDate(), r.status);
  }

  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <p className="text-xs font-semibold mb-2" style={{ color: "rgba(245,240,232,0.5)" }}>
        {now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
      </p>
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[9px] font-bold" style={{ color: "rgba(245,240,232,0.3)" }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const status = byDay.get(day);
          const meta = status ? ATTENDANCE_META[status] : null;
          const isToday = day === now.getDate();
          return (
            <div
              key={i}
              className="aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold"
              style={{
                background: meta ? meta.bg : "rgba(245,240,232,0.03)",
                border: isToday ? "1px solid rgba(244,196,48,0.5)" : "none",
                color: meta ? meta.color : "rgba(245,240,232,0.35)",
              }}
              title={status ? `${day}: ${meta!.label}` : undefined}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AttendanceHistory({ records }: { records: AttendanceRecord[] }) {
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  // Late still counts as attended for the percentage.
  const pct = total ? Math.round(((present + late) / total) * 100) : 0;
  const recent = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <section>
      <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>
        Attendance
      </h2>
      <div className="rounded-2xl p-4 space-y-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
        {total === 0 ? (
          <p className="text-sm py-2" style={{ color: "rgba(245,240,232,0.45)" }}>
            No attendance recorded yet.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="text-center flex-shrink-0">
                <p className="font-playfair text-3xl font-bold" style={{ color: pct >= 75 ? "#7dc98f" : pct >= 50 ? "#f4c430" : "#e8a090" }}>{pct}%</p>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: "rgba(245,240,232,0.4)" }}>Attendance</p>
              </div>
              <div className="grid grid-cols-4 gap-2 flex-1">
                <StatBox label="Present" value={present} color={ATTENDANCE_META.present.color} />
                <StatBox label="Absent" value={absent} color={ATTENDANCE_META.absent.color} />
                <StatBox label="Late" value={late} color={ATTENDANCE_META.late.color} />
                <StatBox label="Excused" value={excused} color={ATTENDANCE_META.excused.color} />
              </div>
            </div>

            <div className="h-px w-full" style={{ background: "rgba(201,162,39,0.12)" }} />

            <MiniCalendar records={records} />

            <div className="h-px w-full" style={{ background: "rgba(201,162,39,0.12)" }} />

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "rgba(245,240,232,0.5)" }}>Recent sessions</p>
              <ul className="space-y-1.5">
                {recent.map((r, i) => {
                  const meta = ATTENDANCE_META[r.status];
                  return (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span style={{ color: "rgba(245,240,232,0.7)" }}>
                        {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {r.className}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold" style={{ color: meta.color }}>
                        {meta.emoji} {meta.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
