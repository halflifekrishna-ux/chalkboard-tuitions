"use client";

import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday as the first day
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * A week-at-a-glance calendar strip for jumping between days — Nandi can see
 * the whole Mon–Sat week and tap straight to any day, or open the native
 * picker to jump further. Navigates via `?date=YYYY-MM-DD` on `basePath`.
 */
export function DateStrip({ selected, basePath }: { selected: string; basePath: string }) {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const selectedDate = useMemo(() => new Date(`${selected}T00:00:00`), [selected]);
  const todayIso = toIso(new Date());

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; }),
    [weekStart]
  );

  const go = (iso: string) => router.push(iso === todayIso ? basePath : `${basePath}?date=${iso}`);

  const shiftWeek = (dir: -1 | 1) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + dir * 7);
    go(toIso(next));
  };

  return (
    <div className="rounded-2xl p-3" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
      <div className="flex items-center justify-between mb-2.5">
        <button onClick={() => shiftWeek(-1)} aria-label="Previous week" className="p-1.5 rounded-lg" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ChevronLeft size={16} />
        </button>
        <p className="text-xs font-semibold" style={{ color: "rgba(245,240,232,0.55)" }}>
          {weekStart.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </p>
        <div className="flex items-center gap-1">
          {selected !== todayIso && (
            <button onClick={() => go(todayIso)} className="text-[11px] font-bold rounded-lg px-2 py-1" style={{ background: "rgba(201,162,39,0.15)", color: "#f4c430" }}>
              Today
            </button>
          )}
          <button
            onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
            aria-label="Jump to date"
            className="p-1.5 rounded-lg"
            style={{ color: "rgba(245,240,232,0.5)" }}
          >
            <CalendarDays size={16} />
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={selected}
            onChange={(e) => e.target.value && go(e.target.value)}
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          />
          <button onClick={() => shiftWeek(1)} aria-label="Next week" className="p-1.5 rounded-lg" style={{ color: "rgba(245,240,232,0.5)" }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const iso = toIso(d);
          const isSelected = iso === selected;
          const isToday = iso === todayIso;
          return (
            <button key={iso} onClick={() => go(iso)} className="relative flex flex-col items-center gap-1 py-2 rounded-xl">
              {isSelected && (
                <motion.span
                  layoutId="date-strip-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "#c9a227" }}
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <span className="relative text-[10px] font-bold" style={{ color: isSelected ? "#162d24" : "rgba(245,240,232,0.4)" }}>
                {d.toLocaleDateString("en-IN", { weekday: "narrow" })}
              </span>
              <span
                className="relative text-sm font-bold h-5 flex items-center justify-center"
                style={{
                  color: isSelected ? "#162d24" : isToday ? "#f4c430" : "#f5f0e8",
                }}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
