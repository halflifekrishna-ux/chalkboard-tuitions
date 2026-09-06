"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal — scroll-triggered fade/rise using IntersectionObserver.
 * Deliberately tiny (no animation library) so the homepage stays light.
 * Shows immediately under prefers-reduced-motion. Content is always in the DOM
 * (only opacity/transform change), so SEO and screen readers are unaffected;
 * a <noscript> rule in the page reveals everything if JS never runs.
 *
 * Props: delay (ms, staggering), className, children.
 * Used in: (marketing)/page.tsx.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      // Trigger a little before it enters, so it never "pops" in late.
      { rootMargin: "200px 0px 0px 0px", threshold: 0.01 }
    );
    io.observe(el);

    // Failsafe: never leave content invisible if the observer never fires
    // (headless capture, odd browsers, restored bfcache pages…).
    const failsafe = window.setTimeout(() => setShown(true), 1600);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <div ref={ref} className={cn("reveal", shown && "reveal--in", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
