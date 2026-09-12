"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * SectionEnter — the section immediately after the pinned hero begins very
 * slightly scaled down and counter-rotated, then settles to scale 1 / 0deg
 * as it scrolls into place — so it visibly "arrives" over the shrinking
 * hero rather than just appearing. Subtle on desktop, near-static on mobile.
 *
 * Used in: (marketing)/learning-studio/page.tsx (section 02, directly after HeroPin).
 */
export function SectionEnter({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    setAnimate(!reduce && wide);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [1.5, 0]);

  if (!animate) {
    return (
      <div ref={ref} className={cn("relative", className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} style={{ scale, rotate }} className={cn("relative origin-top", className)}>
      {children}
    </motion.div>
  );
}
