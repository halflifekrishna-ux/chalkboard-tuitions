import { cn } from "@/lib/utils";

/**
 * Motion pieces for the AI training page. All server components: every effect
 * is CSS in (studio)/studio.css under "AI training". The time-based loops run
 * on the compositor (transform, opacity, masks), and the scroll effects are
 * scroll-driven animations, so a phone gets the show without paying for it in
 * JavaScript.
 *
 * Every effect has a finished, static fallback for reduced motion and for
 * browsers without the feature. Nothing is hidden waiting on an animation.
 */

/* ── Hero: the draft-then-refine loop ─────────────────────────────────────── */

/**
 * A small editor window. The learner's line types itself in, an AI pass sweeps
 * over it in gold, and the refined line appears beneath. Loops. Decorative:
 * the same example is written out properly in "The rule" below.
 */
export function HeroDemo({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("ai-demo relative", className)}>
      <div className="ai-demo-glow pointer-events-none absolute -inset-6 rounded-[2rem]" />
      <div className="relative overflow-hidden rounded-2xl border border-chalk/15 bg-[#132a21]/90 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex items-center gap-2 border-b border-chalk/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-chalk/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-chalk/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-chalk/20" />
          <span className="ml-3 text-[11px] font-medium tracking-wide text-chalk/60">resume.docx</span>
          <span className="ai-demo-status ml-auto rounded-full border border-chalk-yellow/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-chalk-yellow">
            AI pass
          </span>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk/60">01 · You write</p>
            <p className="ai-demo-draft mt-2 text-[15px] leading-relaxed text-chalk sm:text-base">
              Made a Power BI dashboard for the college canteen that showed which items sold out by noon.
              <span className="ai-demo-caret ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-chalk-yellow" />
            </p>
          </div>

          <div className="relative">
            <span className="ai-demo-scan pointer-events-none absolute -inset-x-5 -top-2 h-px bg-gradient-to-r from-transparent via-chalk-yellow to-transparent sm:-inset-x-6" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-yellow">02 · AI refines</p>
            <p className="ai-demo-refined mt-2 text-[15px] leading-relaxed text-chalk sm:text-base">
              Built a Power BI dashboard of canteen sales by hour, showing which items sold out before noon and when to
              restock.
            </p>
          </div>

          <div className="ai-demo-kept flex flex-wrap items-center gap-2 border-t border-chalk/10 pt-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk/60">Kept</span>
            {["Power BI", "canteen", "before noon"].map((k) => (
              <span key={k} className="rounded-full border border-chalk/20 px-2.5 py-0.5 text-[11px] text-chalk/80">
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A faint field of connected nodes behind the hero, with light travelling
 * along the links. Pure SVG + CSS stroke animation.
 */
const NODES: [number, number][] = [
  [40, 60], [150, 30], [250, 110], [360, 50], [450, 140],
  [90, 190], [210, 230], [330, 200], [430, 270], [140, 320], [280, 340], [400, 380],
];
const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 2], [6, 7], [7, 3], [7, 8], [4, 8], [5, 9], [9, 10], [10, 6], [10, 11], [8, 11],
];

export function NeuralField({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 500 420" className={cn("ai-neural pointer-events-none", className)} fill="none">
      {LINKS.map(([a, b], i) => (
        <line
          key={`l${i}`}
          x1={NODES[a][0]}
          y1={NODES[a][1]}
          x2={NODES[b][0]}
          y2={NODES[b][1]}
          className="ai-link"
          style={{ animationDelay: `${(i % 6) * 0.9}s` }}
        />
      ))}
      {NODES.map(([x, y], i) => (
        <circle key={`n${i}`} cx={x} cy={y} r={i % 4 === 0 ? 4 : 2.5} className="ai-node" style={{ animationDelay: `${(i % 5) * 0.7}s` }} />
      ))}
    </svg>
  );
}

/* ── Scroll: words that light up as you read ──────────────────────────────── */

/**
 * A heading whose words brighten one after another as it scrolls through the
 * screen. The text is ordinary text (one span per word), so it reads and
 * indexes normally. Words start at a contrast that still passes for large type.
 */
export function WordReveal({ text, as: Tag = "h2", id, className }: { text: string; as?: "h2" | "p"; id?: string; className?: string }) {
  const words = text.split(" ");
  return (
    <Tag id={id} className={cn("ai-words", className)}>
      {words.map((w, i) => (
        <span key={i} style={{ ["--i" as string]: i, ["--n" as string]: words.length }}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

/* ── Scroll: the rule, pinned and played in sequence ──────────────────────── */

export type RuleCard = { tag: string; text: string; note: string; bad?: boolean };

/**
 * The three versions of one resume line, played as you scroll. The section
 * pins; on a phone the cards replace one another, on a wide screen they sit
 * side by side and light up in turn. The AI-first line gets struck through,
 * and the refined line gets a gold underline that sweeps across it.
 *
 * Without scroll-driven animation (or with reduced motion) it's the plain
 * three-card layout, strike-through already drawn.
 */
export function RuleSequence({ cards, intro }: { cards: [RuleCard, RuleCard, RuleCard]; intro: string }) {
  return (
    <div className="ai-rule-track mt-8">
      <div className="ai-rule-stage">
        <p className="mb-8 max-w-xl text-lg leading-relaxed text-ink/80">{intro}</p>
        <div className="ai-rule-progress mb-6 hidden items-center gap-3" aria-hidden>
          <span className="relative h-px flex-1 overflow-hidden bg-board/15">
            <span className="ai-rule-bar absolute inset-0 origin-left bg-gold-deep" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-ink">Scroll</span>
        </div>
        <ol className="ai-rule-cards grid grid-cols-1 gap-4 lg:grid-cols-3">
          {cards.map((d, i) => (
            <li
              key={d.tag}
              className={cn(
                `ai-card ai-card-${i + 1} flex flex-col rounded-2xl border p-6 sm:p-7`,
                d.bad ? "border-rust/30 bg-[#f3e6dd]" : "border-board/15 bg-white"
              )}
            >
              <span className={cn("text-[11px] font-semibold uppercase tracking-[0.2em]", d.bad ? "text-rust" : "text-gold-ink")}>
                {String(i + 1).padStart(2, "0")} · {d.tag}
              </span>
              <p className={cn("mt-4 font-playfair text-xl leading-snug sm:text-[1.4rem]", d.bad ? "ai-strike text-ink/75" : "text-ink")}>
                <span className={cn("font-playfair", i === 2 && "ai-sweep-text")}>&ldquo;{d.text}&rdquo;</span>
              </p>
              <p className={cn("mt-auto pt-6 text-sm font-semibold", d.bad ? "text-rust" : "text-board")}>{d.note}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
