"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * SectionEnter — the section immediately after the pinned hero begins
 * scaled down and counter-rotated, then settles to scale 1 / 0deg as it
 * scrolls into place — so it visibly "arrives" over the shrinking hero
 * rather than just appearing. Gentler magnitude on mobile, not absent.
 *
 * Progress is computed from real pixel measurements (raw window scrollY
 * against this element's own on-screen position), not framer-motion's
 * `useScroll({ target, offset })` keyword shorthand — see the long comment
 * in HeroPin.tsx for why that shorthand under-delivers on a page with real
 * content below the tracked element.
 *
 * Used in: (marketing)/learning-studio/page.tsx (section 02, directly after HeroPin).
 */
export function SectionEnter({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAnimate(!reduce);
    const mq = window.matchMedia("(max-width: 767px)");
    const syncMobile = () => setMobile(mq.matches);
    syncMobile();
    mq.addEventListener("change", syncMobile);

    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const docTop = rect.top + window.scrollY;
      const vh = window.innerHeight;
      // progress 0 when this section's top is at the viewport's bottom edge
      // (about to enter); progress 1 once it has risen to 35% down the
      // viewport — well before it reaches the top, so it's clearly settled
      // by the time a reader's eye gets there.
      setRange([docTop - vh, docTop - vh * 0.35]);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", measure);

    return () => {
      mq.removeEventListener("change", syncMobile);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, range, mobile ? [0.92, 1] : [0.8, 1]);
  const rotate = useTransform(scrollY, range, mobile ? [3, 0] : [6, 0]);

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
