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
 * Used in: (studio)/learning-studio/page.tsx (the question section).
 */
export function ProgrammeMarquee({
  items,
  direction = "left",
  durationClass,
  className,
  tone = "dark",
}: {
  items: string[];
  direction?: "left" | "right";
  durationClass: string;
  className?: string;
  tone?: "dark" | "cream";
}) {
  return (
    // data-allow-overflow: the row is meant to run past its clip box; tells
    // scripts/overflow-qa.mjs this isn't clipped content.
    <div className={cn("relative overflow-hidden", className)} aria-label={items.join(", ")} data-allow-overflow>
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
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium sm:text-[15px]",
                  tone === "dark" ? "border-chalk/20 text-chalk/75" : "border-board/20 text-ink/75"
                )}
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
