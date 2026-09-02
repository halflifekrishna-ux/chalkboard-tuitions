import { cn } from "@/lib/utils";

/**
 * Container — max-width + horizontal padding wrapper used by every section.
 * Props: size ("default" 7xl | "narrow" 4xl | "wide" full), className, children.
 * Used in: all marketing sections and pages.
 */
export function Container({
  size = "default",
  className,
  children,
}: {
  size?: "default" | "narrow" | "wide";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        size === "default" && "max-w-7xl",
        size === "narrow" && "max-w-4xl",
        size === "wide" && "max-w-none",
        className
      )}
    >
      {children}
    </div>
  );
}
