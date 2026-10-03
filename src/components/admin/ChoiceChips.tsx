"use client";

/** Large, obvious toggle chips — used for subjects and days. */
export function ChoiceChips<T extends string>({
  options,
  selected,
  onToggle,
  disabled = false,
  label,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            onClick={() => onToggle(o.value)}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold min-h-[44px] transition-colors active:scale-95 disabled:opacity-50"
            style={on ? { background: "#c9a227", color: "#162d24" } : { background: "rgba(245,240,232,0.07)", color: "rgba(245,240,232,0.75)", border: "1px solid rgba(245,240,232,0.1)" }}
          >
            {on ? "✓ " : ""}{o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Two big mutually exclusive options with a one-line explanation each. */
export function ChoiceCards<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  label,
}: {
  options: { value: T; label: string; hint: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className="text-left rounded-xl px-4 py-3 min-h-[56px] transition-colors disabled:opacity-50"
            style={on ? { background: "rgba(201,162,39,0.18)", border: "1.5px solid #c9a227" } : { background: "rgba(245,240,232,0.05)", border: "1.5px solid rgba(245,240,232,0.1)" }}
          >
            <span className="block text-sm font-bold" style={{ color: on ? "#f4c430" : "#f5f0e8" }}>{on ? "● " : "○ "}{o.label}</span>
            <span className="block text-xs mt-0.5" style={{ color: "rgba(245,240,232,0.5)" }}>{o.hint}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Pick exactly one student — for Individual Attention. */
export function StudentPicker({
  students,
  value,
  onChange,
  disabled = false,
}: {
  students: { id: string; full_name: string }[];
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  if (!students.length) {
    return (
      <p className="text-sm rounded-xl px-3 py-3" style={{ background: "rgba(245,240,232,0.05)", color: "rgba(245,240,232,0.6)" }}>
        No students are enrolled in this batch yet. Add them under the Students tab first.
      </p>
    );
  }
  return (
    <div role="radiogroup" aria-label="Student" className="rounded-xl divide-y overflow-hidden max-h-64 overflow-y-auto" style={{ background: "rgba(245,240,232,0.04)", border: "1px solid rgba(245,240,232,0.1)" }}>
      {students.map((s) => {
        const on = value === s.id;
        return (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(s.id)}
            className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-left disabled:opacity-50"
            style={{ background: on ? "rgba(201,162,39,0.16)" : "transparent", borderColor: "rgba(245,240,232,0.06)" }}
          >
            <span className="h-5 w-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: `2px solid ${on ? "#c9a227" : "rgba(245,240,232,0.3)"}` }}>
              {on && <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#c9a227" }} />}
            </span>
            <span className="text-sm font-semibold" style={{ color: on ? "#f4c430" : "#f5f0e8" }}>{s.full_name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(245,240,232,0.6)" }}>{children}</p>
      {hint && <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,232,0.42)" }}>{hint}</p>}
    </div>
  );
}

export const inputCls = "w-full rounded-xl px-3 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227] disabled:opacity-50";
export const inputStyle: React.CSSProperties = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8", colorScheme: "dark" };
