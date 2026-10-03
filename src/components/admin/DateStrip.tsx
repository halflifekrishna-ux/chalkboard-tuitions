"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays, ChevronDown } from "lucide-react";
import { BrandSpinner } from "./Loader";
import type { DayCount } from "@/lib/os/sessions";

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay(); // 0 = Sun
  copy.setDate(copy.getDate() + (day === 0 ? -6 : 1 - day)); // Monday first
  copy.setHours(0, 0, 0, 0);
  return copy;
}

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * The calendar Nanditha navigates by: a week strip that expands into a full
 * month. Every day that has classes carries a dot — gold while something is
 * still unmarked, green once the day is fully marked — so she can see at a
 * glance where attendance is missing without opening each day.
 *
 * Month and week moves go through the URL (`?date=`), so the server supplies
 * that month's counts; the tapped day lights up immediately and a spinner
 * shows while the day loads.
 */
export function DateStrip({
  selected,
  basePath,
  counts = {},
}: {
  selected: string;
  basePath: string;
  counts?: Record<string, DayCount>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [optimistic, setOptimistic] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const shown = optimistic ?? selected;
  const selectedDate = useMemo(() => new Date(`${shown}T00:00:00`), [shown]);
  const todayIso = toIso(new Date());

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; }),
    [weekStart]
  );

  // Month grid, padded to whole weeks starting Monday.
  const monthCells = useMemo(() => {
    const first = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const gridStart = startOfWeek(first);
    const last = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const cells: Date[] = [];
    for (const d = new Date(gridStart); d <= last || cells.length % 7 !== 0; d.setDate(d.getDate() + 1)) {
      cells.push(new Date(d));
      if (cells.length > 41) break;
    }
    return cells;
  }, [selectedDate]);

  const go = (iso: string) => {
    setOptimistic(iso);
    startTransition(() => router.push(iso === todayIso ? basePath : `${basePath}?date=${iso}`));
  };

  const shift = (dir: -1 | 1) => {
    const next = new Date(selectedDate);
    if (open) next.setMonth(next.getMonth() + dir);
    else next.setDate(next.getDate() + dir * 7);
    go(toIso(next));
  };

  return (
    <div className="rounded-2xl p-3" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <button
          onClick={() => shift(-1)}
          aria-label={open ? "Previous month" : "Previous week"}
          className="h-9 w-9 flex items-center justify-center rounded-lg"
          style={{ color: "rgba(245,240,232,0.6)" }}
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold min-h-[36px]"
          style={{ color: "#f5f0e8" }}
        >
          {selectedDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          {pending ? (
            <BrandSpinner size="sm" />
          ) : (
            <ChevronDown size={15} style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform .2s" }} aria-hidden />
          )}
        </button>

        <div className="flex items-center gap-1">
          {shown !== todayIso && (
            <button onClick={() => go(todayIso)} className="text-[11px] font-bold rounded-lg px-2.5 py-1.5 min-h-[32px]" style={{ background: "rgba(201,162,39,0.18)", color: "#f4c430" }}>
              Today
            </button>
          )}
          <button
            onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
            aria-label="Jump to a date"
            className="h-9 w-9 flex items-center justify-center rounded-lg"
            style={{ color: "rgba(245,240,232,0.6)" }}
          >
            <CalendarDays size={17} />
          </button>
          <input ref={dateInputRef} type="date" value={shown} onChange={(e) => e.target.value && go(e.target.value)} className="sr-only" aria-hidden tabIndex={-1} />
          <button onClick={() => shift(1)} aria-label={open ? "Next month" : "Next week"} className="h-9 w-9 flex items-center justify-center rounded-lg" style={{ color: "rgba(245,240,232,0.6)" }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {open && (
        <div className="grid grid-cols-7 gap-1 mb-1" aria-hidden>
          {WEEK_LABELS.map((l, i) => (
            <span key={i} className="text-center text-[10px] font-bold py-1" style={{ color: "rgba(245,240,232,0.3)" }}>{l}</span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-7 gap-1">
        {(open ? monthCells : weekDays).map((d) => {
          const iso = toIso(d);
          const isSelected = iso === shown;
          const isToday = iso === todayIso;
          const otherMonth = open && d.getMonth() !== selectedDate.getMonth();
          const count = counts[iso];
          const allDone = !!count && count.scheduled > 0 && count.done >= count.scheduled;
          const dotColour = isSelected ? "#162d24" : allDone ? "#7dc98f" : "#c9a227";

          return (
            <button
              key={iso}
              onClick={() => go(iso)}
              aria-current={isSelected ? "date" : undefined}
              aria-label={`${d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}${
                count ? ` — ${count.scheduled} class${count.scheduled === 1 ? "" : "es"}, ${count.done} marked` : " — no classes"
              }`}
              className="relative flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 min-h-[46px]"
              style={{ opacity: otherMonth ? 0.3 : 1 }}
            >
              {isSelected && (
                <motion.span
                  layoutId="date-strip-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "#c9a227" }}
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              {!isSelected && isToday && (
                <span className="absolute inset-0 rounded-xl" style={{ border: "1.5px solid rgba(244,196,48,0.55)" }} aria-hidden />
              )}

              {!open && (
                <span className="relative text-[10px] font-bold" style={{ color: isSelected ? "#162d24" : "rgba(245,240,232,0.4)" }}>
                  {d.toLocaleDateString("en-IN", { weekday: "narrow" })}
                </span>
              )}
              <span
                className="relative text-sm font-bold"
                style={{ color: isSelected ? "#162d24" : isToday ? "#f4c430" : count ? "#f5f0e8" : "rgba(245,240,232,0.45)" }}
              >
                {d.getDate()}
              </span>
              <span className="relative flex items-center gap-0.5 h-1.5" aria-hidden>
                {count
                  ? Array.from({ length: Math.min(count.scheduled || 1, 3) }).map((_, i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: dotColour }} />
                    ))
                  : null}
              </span>
            </button>
          );
        })}
      </div>

      {open && (
        <p className="flex items-center justify-center gap-3 text-[10px] mt-2.5 pt-2.5" style={{ color: "rgba(245,240,232,0.4)", borderTop: "1px solid rgba(245,240,232,0.07)" }}>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#c9a227" }} /> classes to mark</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#7dc98f" }} /> all marked</span>
        </p>
      )}
    </div>
  );
}
