import { CATEGORY_META, STATE_META, type SessionCategory, type SessionState } from "@/lib/os/session-meta";

export function CategoryBadge({ category }: { category: SessionCategory }) {
  const m = CATEGORY_META[category];
  return (
    <span className="inline-flex items-center text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
}

export function StateBadge({ state, holidayDerived = false }: { state: SessionState; holidayDerived?: boolean }) {
  const m = STATE_META[state];
  const label = holidayDerived ? "Public holiday — not conducted" : m.label;
  return (
    <span className="inline-flex items-center text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: m.bg, color: m.color }}>
      {label}
    </span>
  );
}
