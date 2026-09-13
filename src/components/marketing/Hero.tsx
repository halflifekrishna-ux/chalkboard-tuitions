import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * Hero — reusable, prop-driven hero band (server component, no client JS).
 * Props:
 *   eyebrow?  small kicker
 *   title / highlight  headline; `highlight` renders in gold after the title
 *   subtitle  supporting paragraph
 *   chips?    trust facts shown as pills (e.g. Grades 1–10, CBSE·ICSE·State, Max 8)
 *   primary / secondary  { label, href, external? } CTAs
 *   note?     small reassurance line under the CTAs
 * Used in: homepage; reusable on sub-pages.
 */
export interface HeroCTA {
  label: string;
  href: string;
  external?: boolean;
}

export function Hero({
  eyebrow,
  title,
  highlight,
  subtitle,
  chips,
  primary,
  secondary,
  note,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle: string;
  chips?: string[];
  primary?: HeroCTA;
  secondary?: HeroCTA;
  note?: string;
}) {
  return (
    <section
      className="relative overflow-hidden bg-board-deep text-chalk pt-28 pb-16 sm:pt-36 sm:pb-24"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(244,196,48,0.10), transparent 70%), repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.02) 27px, rgba(255,255,255,0.02) 28px)",
      }}
    >
      <Container className="relative z-10">
        <div className="max-w-3xl">
          {eyebrow && (
            <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-chalk-yellow">
              {eyebrow}
            </span>
          )}
          <h1 className="font-playfair font-black tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            {title}
            {highlight && (
              <>
                {" "}
                <span className="text-chalk-yellow">{highlight}</span>
              </>
            )}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-chalk/70 leading-relaxed max-w-2xl">{subtitle}</p>

          {chips && chips.length > 0 && (
            <ul className="mt-7 flex flex-wrap gap-2.5" aria-label="Key facts">
              {chips.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-chalk-yellow/25 bg-chalk/5 px-3.5 py-1.5 text-sm font-medium text-chalk/85"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}

          {(primary || secondary) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primary && (
                <Button href={primary.href} external={primary.external} size="lg" variant="primary">
                  {primary.label}
                </Button>
              )}
              {secondary && (
                <Button href={secondary.href} external={secondary.external} size="lg" variant="onDark">
                  {secondary.label}
                </Button>
              )}
            </div>
          )}

          {note && <p className="mt-4 text-sm text-chalk/45">{note}</p>}
        </div>
      </Container>
    </section>
  );
}
