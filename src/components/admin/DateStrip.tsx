"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { addDays, fmtDate } from "@/lib/os/attendance";

/**
 * A week-at-a-glance calendar strip for jumping between days — the whole
 * Mon–Sun week is tappable, and the calendar button opens the native picker to
 * jump further.
 *
 * All arithmetic is done on YYYY-MM-DD strings rather than Date objects. The
 * previous version built Dates from the browser's clock, so "today" here could
 * disagree with the server's idea of today, and stepping a week across a DST or
 * month boundary went through local-time maths that doesn't always land on the
 * same weekday.
 *
 * `today` comes from the server so both ends agree on which day is highlighted.
 */
export function DateStrip({
  selected,
  today,
  basePath,
}: {
  selected: string;
  today: string;
  basePath: string;
}) {
  const router = useRouter();

  // Monday-first week containing `selected`, in calendar space.
  const weekStart = useMemo(() => {
    const [y, m, d] = selected.split("-").map(Number);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sun
    return addDays(selected, dow === 0 ? -6 : 1 - dow);
  }, [selected]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const go = (iso: string) => router.push(iso === today ? basePath : `${basePath}?date=${iso}`);

  // "September 2026", or "Sep – Oct 2026" when the week straddles two months.
  const label = useMemo(() => {
    const a = fmtDate(days[0], { month: "long", year: "numeric" });
    const b = fmtDate(days[6], { month: "long", year: "numeric" });
    return a === b ? a : `${fmtDate(days[0], { month: "short" })} – ${fmtDate(days[6], { month: "short", year: "numeric" })}`;
  }, [days]);

  return (
    <div className="rounded-2xl p-3" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <button onClick={() => go(addDays(weekStart, -7))} aria-label="Previous week" className="p-1.5 rounded-lg shrink-0" style={{ color: "rgba(245,240,232,0.6)" }}>
          <ChevronLeft size={16} />
        </button>
        <p className="text-xs font-semibold truncate" style={{ color: "rgba(245,240,232,0.6)" }}>{label}</p>
        <div className="flex items-center gap-1 shrink-0">
          {selected !== today && (
            <button onClick={() => go(today)} className="text-[11px] font-bold rounded-lg px-2 py-1" style={{ background: "rgba(201,162,39,0.15)", color: "#f4c430" }}>
              Today
            </button>
          )}
          {/* The native picker is opened by the input itself, sitting invisibly
              over the button. showPicker() is unreliable on a hidden input and
              throws outright in some browsers, which left this doing nothing. */}
          <span className="relative p-1.5 rounded-lg" style={{ color: "rgba(245,240,232,0.6)" }}>
            <CalendarDays size={16} aria-hidden />
            <input
              type="date"
              value={selected}
              onChange={(e) => e.target.value && go(e.target.value)}
              aria-label="Jump to a date"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </span>
          <button onClick={() => go(addDays(weekStart, 7))} aria-label="Next week" className="p-1.5 rounded-lg" style={{ color: "rgba(245,240,232,0.6)" }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((iso) => {
          const isSelected = iso === selected;
          const isToday = iso === today;
          return (
            <button
              key={iso}
              onClick={() => go(iso)}
              aria-current={isSelected ? "date" : undefined}
              aria-label={fmtDate(iso)}
              className="relative flex flex-col items-center gap-1 py-2 rounded-xl"
            >
              {isSelected && (
                <motion.span
                  layoutId="date-strip-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "#c9a227" }}
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <span className="relative text-[10px] font-bold" style={{ color: isSelected ? "#162d24" : "rgba(245,240,232,0.5)" }}>
                {fmtDate(iso, { weekday: "narrow" })}
              </span>
              <span
                className="relative text-sm font-bold h-5 flex items-center justify-center"
                style={{ color: isSelected ? "#162d24" : isToday ? "#f4c430" : "#f5f0e8" }}
              >
                {Number(iso.slice(8, 10))}
              </span>
              {/* today keeps a marker even when another day is selected */}
              <span
                className="relative h-1 w-1 rounded-full"
                style={{ background: isToday && !isSelected ? "#f4c430" : "transparent" }}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
