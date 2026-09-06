import { cn } from "@/lib/utils";

/**
 * PortalField — the animated "portal arc" background for the homepage.
 *
 * A luminous gold arc with an emerald fringe rotates slowly around a softly
 * breathing core, over an ambient haze that ties it into the board colour.
 *
 * Implemented in pure CSS (see globals.css): a conic-gradient masked into a
 * ring band, blurred, then rotated. Server component — ships ZERO client
 * JavaScript, no Three.js, no WebGL, no CDN request and no iframe.
 *
 * Guarantees:
 *  - absolute inset-0 + overflow-hidden + pointer-events-none → can never widen
 *    the page or create horizontal scrolling.
 *  - Transparent background, so it blends into whatever colour the section uses
 *    instead of sitting on its own mismatched panel.
 *  - Motion freezes under prefers-reduced-motion (global guard).
 * Used in: (marketing)/page.tsx.
 */
export function PortalField({ className }: { className?: string }) {
  return (
    <div className={cn("portal-field", className)} aria-hidden="true">
      <span className="portal-field__haze" />
      <span className="portal-arc portal-arc--fringe" />
      <span className="portal-arc portal-arc--core" />
      <span className="portal-core" />
    </div>
  );
}
