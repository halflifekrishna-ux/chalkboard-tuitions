import { cn } from "@/lib/utils";

/**
 * Section — vertical rhythm + background variant for page bands.
 * Props:
 *   bg: "cream" (default warm) | "white" | "dark" (board-green) | "transparent"
 *   size: "default" | "sm" | "lg" vertical padding
 *   id, className, children
 * Used in: all marketing pages to compose consistent, alternating bands.
 */
export function Section({
  bg = "cream",
  size = "default",
  id,
  className,
  children,
}: {
  bg?: "cream" | "white" | "dark" | "transparent";
  size?: "default" | "sm" | "lg";
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20",
        size === "sm" && "py-12 sm:py-16",
        size === "default" && "py-16 sm:py-24",
        size === "lg" && "py-20 sm:py-32",
        bg === "cream" && "bg-cream-bg dark:bg-board-deep/40",
        bg === "white" && "bg-white dark:bg-board/10",
        bg === "dark" && "bg-board-deep text-chalk",
        className
      )}
    >
      {children}
    </section>
  );
}
