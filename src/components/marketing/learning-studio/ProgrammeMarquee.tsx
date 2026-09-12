import { cn } from "@/lib/utils";

/**
 * ProgrammeMarquee — a calm, medium-paced strip of programme labels drifting
 * across the viewport. Pure CSS (translateX keyframe on a doubled, flex-nowrap
 * row) — no JS animation loop, no layout-affecting width, no marquee library.
 *
 * - Contained by the parent's overflow-hidden; the animated row itself is
 *   width:max-content so it never forces the page to scroll horizontally.
 * - The list is duplicated once for a seamless loop; the duplicate is
 *   aria-hidden so screen readers hear each label exactly once.
 * - Speed is deliberately slow (see globals.css `marqueeSlide`: 46–64s) —
 *   labels should be comfortably readable, not a flashy ticker.
 * - Frozen by the sitewide prefers-reduced-motion guard in globals.css.
 *
 * Used in: (marketing)/learning-studio/page.tsx (section 02, corporate side).
 */
export function ProgrammeMarquee({
  items,
  direction = "left",
  durationClass,
  className,
}: {
  items: string[];
  direction?: "left" | "right";
  durationClass: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)} aria-label={items.join(", ")}>
      <div
        className={cn(
          "flex w-max items-center gap-3 whitespace-nowrap",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right",
          durationClass
        )}
      >
        {[items, items].map((group, gi) => (
          <div key={gi} className="flex items-center gap-3" aria-hidden={gi === 1 ? true : undefined}>
            {group.map((label, i) => (
              <span
                key={`${gi}-${i}`}
                className="rounded-[3px] border border-chalk/15 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-chalk/55 sm:text-xs"
              >
                {label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
