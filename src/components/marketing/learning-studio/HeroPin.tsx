"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * HeroPin — pins the hero at full-screen while the page scrolls a little
 * further, subtly shrinking and rotating it so the next section visibly
 * "gives way" to it. This is the one scroll-linked framer-motion effect on
 * the page (the project's existing animation dependency — the same
 * useScroll/useTransform/motion.div API the "motion/react" package ships,
 * so this avoids loading a second copy of the same engine); every other
 * reveal on /learning-studio uses the existing IntersectionObserver-based
 * <Reveal>, which is far cheaper still.
 *
 * Disabled (renders a plain static full-height hero) on:
 *   - prefers-reduced-motion
 *   - narrow viewports (<768px) — mobile gets the content, not the choreography,
 *     per the brief: "do not make content feel trapped inside a 3D effect."
 *
 * Used in: (marketing)/learning-studio/page.tsx (section 01).
 */
export function HeroPin({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    setAnimate(!reduce && wide);
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -2.5]);
  const opacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0.55]);

  if (!animate) {
    return <div className="relative min-h-[100svh]">{children}</div>;
  }

  return (
    <div ref={wrapRef} className="relative h-[150vh]">
      {/* bg-board-deep here, not just on the (now-rotated) child: as the hero
          rotates, its corners lift clear of the viewport edges — this fills
          that sliver with the same board colour instead of whatever sits
          behind the sticky layer. */}
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-board-deep">
        <motion.div style={{ scale, rotate, opacity }} className="h-full origin-center">
          {children}
        </motion.div>
      </div>
    </div>
  );
}
