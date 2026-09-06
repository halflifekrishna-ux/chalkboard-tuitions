import { cn } from "@/lib/utils";

/**
 * LiquidGlow — the animated liquid-gradient field behind the homepage.
 * Pure CSS (see globals.css): blurred brand-colour blobs pushed through a
 * contrast() threshold produce sharp, flowing "liquid metal" edges that drift
 * continuously. Server component — ships ZERO client JavaScript.
 *
 * Guarantees:
 *  - absolute inset-0 + overflow-hidden + pointer-events-none → can never widen
 *    the page or create horizontal scrolling.
 *  - Mobile gets a softer/cheaper filter; desktop gets the full high-contrast
 *    liquid and a fourth blob.
 *  - Freezes under prefers-reduced-motion (global guard).
 * Used in: (marketing)/page.tsx.
 */
export function LiquidGlow({ className }: { className?: string }) {
  return (
    <div className={cn("liquid-field", className)} aria-hidden="true">
      <div className="liquid-field__inner">
        <span className="liquid-blob liquid-blob--a" />
        <span className="liquid-blob liquid-blob--b" />
        <span className="liquid-blob liquid-blob--c" />
        <span className="liquid-blob liquid-blob--d" />
      </div>
    </div>
  );
}
