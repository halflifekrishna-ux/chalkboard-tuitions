import { cn } from "@/lib/utils";

/**
 * SectionHeading — eyebrow + title + subtitle, used to open every section.
 * Props:
 *   eyebrow?  small uppercase kicker
 *   title     the heading (renders as <h2> by default; pass as="h1" for hero)
 *   subtitle? supporting line
 *   align: "center" (default) | "left"
 *   tone: "light" (on cream/white) | "dark" (on board-green)
 * Used in: WhyChooseUs, Studio/OS/About sections, most page bands.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "light",
  as: As = "h2",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "text-center mx-auto max-w-2xl" : "text-left max-w-2xl", className)}>
      {eyebrow && (
        <span
          className={cn(
            "inline-block mb-3 text-xs font-semibold uppercase tracking-[0.18em]",
            tone === "dark" ? "text-chalk-yellow" : "text-gold"
          )}
        >
          {eyebrow}
        </span>
      )}
      <As
        className={cn(
          "font-playfair font-bold tracking-tight",
          As === "h1" ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl lg:text-4xl",
          tone === "dark" ? "text-chalk" : "text-board dark:text-chalk"
        )}
      >
        {title}
      </As>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-base sm:text-lg leading-relaxed",
            tone === "dark" ? "text-chalk/60" : "text-gray-600 dark:text-chalk/60"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
