import { cn } from "@/lib/utils";
import { PROGRAMS, FIRST_YEAR, type Program } from "@/lib/portfolio";
import { Pills } from "@/components/marketing/learning-studio/Scene";

/**
 * Portfolio pieces, all reading src/lib/portfolio.ts. A card per program:
 * period and audience, what it taught, how it ran, and its one headline
 * result with the basis written underneath (never a bare number).
 */

type Tone = "dark" | "cream";

export function ProgramCard({ p, tone }: { p: Program; tone: Tone }) {
  const dark = tone === "dark";
  return (
    <article
      className={cn(
        "sx-rise flex h-full flex-col rounded-2xl border p-6 sm:p-7",
        dark ? "border-chalk/15 bg-white/[0.03]" : "border-board/15 bg-white"
      )}
    >
      <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.2em]", dark ? "text-chalk-yellow" : "text-gold-ink")}>
        <span>{p.period}</span>
        <span aria-hidden className={dark ? "text-chalk/30" : "text-board/30"}>/</span>
        <span>{p.audience === "college" ? "College program" : "Company program"}</span>
      </p>
      <h3 className="mt-4 font-playfair text-2xl font-bold leading-tight">{p.title}</h3>
      <p className={cn("mt-1 text-sm", dark ? "text-chalk/70" : "text-sage-deep")}>{p.client}</p>
      <p className={cn("mt-4 text-base leading-relaxed", dark ? "text-chalk/75" : "text-ink/80")}>{p.summary}</p>
      <div className="mt-5">
        <Pills tone={tone} items={[...p.topics, ...(p.facts ?? [])]} />
      </div>
      {p.result && (
        <div className={cn("mt-auto pt-6", "border-t", dark ? "border-chalk/15" : "border-board/15", "mt-6")}>
          <p className="flex items-baseline gap-3">
            <span className={cn("font-playfair text-4xl font-black leading-none lining-nums", dark ? "text-chalk-yellow" : "text-board")}>{p.result.value}</span>
            <span className="text-sm font-semibold">{p.result.label}</span>
          </p>
          <p className={cn("mt-2 text-xs leading-relaxed", dark ? "text-chalk/60" : "text-sage-deep")}>{p.result.basis}</p>
        </div>
      )}
    </article>
  );
}

export function ProgramGrid({ programs, tone }: { programs: Program[]; tone: Tone }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {programs.map((p) => (
        <ProgramCard key={p.id} p={p} tone={tone} />
      ))}
    </div>
  );
}

/** The headline numbers, each with where it comes from. */
export const PORTFOLIO_STATS = [
  { value: String(PROGRAMS.length), label: "programs run", basis: `Since ${FIRST_YEAR}` },
  { value: "97%", label: "rated 4 or 5 out of 5", basis: "Advanced Excel 2025, 77 responses" },
  { value: "100%", label: "said sessions were engaging", basis: "Cybersecurity 2023, 22 responses" },
  { value: "0", label: "sessions missed", basis: "2026 programs, 80 students" },
];

export function StatBand({ tone }: { tone: Tone }) {
  const dark = tone === "dark";
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
      {PORTFOLIO_STATS.map((s) => (
        <li key={s.label} className={cn("sx-rise border-t pt-5", dark ? "border-chalk/20" : "border-board/20")}>
          <p className={cn("font-playfair text-[clamp(3rem,11vw,5rem)] font-black leading-none tracking-tight lining-nums", dark ? "text-chalk-yellow" : "text-board")}>
            {s.value}
          </p>
          <p className="mt-3 text-base font-semibold">{s.label}</p>
          <p className={cn("mt-1 text-xs", dark ? "text-chalk/60" : "text-sage-deep")}>{s.basis}</p>
        </li>
      ))}
    </ul>
  );
}
