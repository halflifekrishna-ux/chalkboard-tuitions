import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The Learning Studio's page kit. One idea per section, big type, a lot of
 * room. Every piece is a server component: motion comes from the sx-* classes
 * in (studio)/studio.css, which are scroll-driven CSS and ship no JS.
 *
 * Built phone-first: sizes start at 390px wide and scale up with clamp().
 *
 * Note: globals.css sets every <span> to the sans face, so a highlighted word
 * inside a Playfair heading needs its own font-playfair class.
 */

type Tone = "dark" | "cream";

/** A full-bleed section. Alternate tones down the page. */
export function Scene({
  tone,
  id,
  className,
  children,
  labelledBy,
}: {
  tone: Tone;
  id?: string;
  className?: string;
  children: React.ReactNode;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "relative scroll-mt-16 overflow-hidden py-24 sm:py-32",
        tone === "dark" ? "bg-board text-chalk" : "bg-chalk text-ink",
        className
      )}
    >
      {children}
    </section>
  );
}

export function Inner({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}

/** Small uppercase label with a gold hairline that draws in. */
export function Kicker({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.22em]",
        tone === "dark" ? "text-chalk-yellow" : "text-gold-ink"
      )}
    >
      <span aria-hidden className={cn("sx-draw block h-px w-8", tone === "dark" ? "bg-chalk-yellow/60" : "bg-gold-deep/50")} />
      {children}
    </p>
  );
}

/** One sentence, very large, that sharpens as it scrolls in. (leading-* goes after text-[…]: cn() drops it otherwise.) */
export function Statement({
  as: Tag = "h2",
  id,
  className,
  children,
}: {
  as?: "h1" | "h2" | "p";
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      id={id}
      className={cn(
        "sx-focus max-w-5xl break-words font-playfair font-bold tracking-tight text-[clamp(2.4rem,8.4vw,5.75rem)] leading-[1.05]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/** A giant number with its source underneath in small muted type. */
export function BigStat({ value, label, source, tone }: { value: string; label: string; source: string; tone: Tone }) {
  return (
    <figure className="sx-rise">
      <p
        className={cn(
          "sx-focus font-playfair font-black tracking-tight lining-nums text-[clamp(8rem,40vw,17rem)] leading-none",
          tone === "dark" ? "text-chalk-yellow" : "text-board"
        )}
      >
        {value}
      </p>
      <figcaption className="mt-4 max-w-md">
        <span className="block text-xl font-semibold sm:text-2xl">{label}</span>
        <span className={cn("mt-3 block text-sm leading-relaxed", tone === "dark" ? "text-chalk/60" : "text-sage-deep")}>
          {source}
        </span>
      </figcaption>
    </figure>
  );
}

/** A numbered process. A gold rule draws down the left as you scroll it. */
export function Steps({ steps, tone }: { steps: { title: string; body: string }[]; tone: Tone }) {
  return (
    <ol className="relative mt-14 sm:mt-20">
      <span
        aria-hidden
        className={cn("sx-draw-y absolute bottom-6 left-[1.15rem] top-6 w-px sm:left-[1.65rem]", tone === "dark" ? "bg-chalk-yellow/35" : "bg-gold-deep/35")}
      />
      {steps.map((s, i) => (
        <li key={s.title} className="relative grid grid-cols-[2.3rem_1fr] gap-5 pb-12 last:pb-0 sm:grid-cols-[3.3rem_1fr] sm:gap-8">
          <span
            className={cn(
              "sx-step relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold sm:h-[3.3rem] sm:w-[3.3rem] sm:text-base",
              tone === "dark" ? "border-chalk-yellow/50 bg-board text-chalk-yellow" : "border-gold-ink/40 bg-chalk text-gold-ink"
            )}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 pt-1 sm:pt-2.5">
            <h3 className="font-playfair text-2xl font-bold sm:text-3xl">{s.title}</h3>
            <p className={cn("mt-3 max-w-xl text-base leading-relaxed sm:text-lg", tone === "dark" ? "text-chalk/70" : "text-ink/80")}>
              {s.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Outlined pill chips. */
export function Pills({ items, tone }: { items: string[]; tone: Tone }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((t) => (
        <li
          key={t}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            tone === "dark" ? "border-chalk/20 text-chalk/75" : "border-board/20 text-board/80"
          )}
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

/** A card for one audience or track. The whole card is the link. */
export function TrackCard({
  href,
  kicker,
  title,
  body,
  pills,
  cta,
  tone,
}: {
  href: string;
  kicker: string;
  title: string;
  body: string;
  pills?: string[];
  cta: string;
  tone: Tone;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "sx-rise group flex h-full flex-col rounded-2xl border p-6 transition-colors sm:p-8",
        tone === "dark"
          ? "border-chalk/15 bg-white/[0.03] hover:border-chalk-yellow/50"
          : "border-board/15 bg-white/60 hover:border-gold-deep/60"
      )}
    >
      <span className={cn("text-[11px] font-semibold uppercase tracking-[0.2em]", tone === "dark" ? "text-chalk-yellow" : "text-gold-ink")}>
        {kicker}
      </span>
      <h3 className="mt-4 font-playfair text-2xl font-bold leading-tight sm:text-[1.75rem]">{title}</h3>
      <p className={cn("mt-3 text-base leading-relaxed", tone === "dark" ? "text-chalk/70" : "text-ink/80")}>{body}</p>
      {pills && (
        <div className="mt-5">
          <Pills items={pills} tone={tone} />
        </div>
      )}
      <span
        className={cn(
          "mt-auto inline-flex items-center gap-1.5 pt-7 text-sm font-semibold",
          tone === "dark" ? "text-chalk" : "text-board"
        )}
      >
        {cta}
        <ArrowUpRight size={16} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
