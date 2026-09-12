"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * HeroPin — pins the hero at full-screen while the page scrolls further,
 * shrinking and rotating it so the next section visibly "gives way" to it.
 *
 * Progress is computed by hand from real pixel measurements (raw window
 * scrollY mapped against the wrapper's own on-screen start/end), not from
 * framer-motion's `useScroll({ target, offset: ["start start","end end"] })`
 * keyword shorthand — that shorthand resolves "container" against the
 * *whole document*, not the viewport, once there's real content below the
 * hero (the reference component never had any, so its version happened to
 * look right by accident). With real page content below it, that shorthand
 * only finished the transform near the very bottom of the page — visually
 * indistinguishable from no animation at all while the hero was on screen.
 *
 * The pinned (180svh) layout is what the server renders, so for almost every
 * visitor the page height never changes after hydration. If it did, every
 * deep link below the hero (/learning-studio#enquire from the footer, etc.)
 * would land ~80svh short once the hero grew. Reduced-motion visitors get the
 * plain layout after mount and are re-landed on any #anchor.
 *
 * Enabled on every viewport (mobile gets a gentler scale/rotate than desktop,
 * not silence); disabled only under prefers-reduced-motion.
 *
 * Used in: (marketing)/learning-studio/page.tsx (section 01).
 */
export function HeroPin({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const mq = window.matchMedia("(max-width: 767px)");
    const syncMobile = () => setMobile(mq.matches);
    syncMobile();
    mq.addEventListener("change", syncMobile);
    return () => mq.removeEventListener("change", syncMobile);
  }, []);

  useEffect(() => {
    if (reduced) {
      // The hero just collapsed by ~80svh — re-land on any #anchor target.
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) document.getElementById(id)?.scrollIntoView();
      return;
    }
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const docTop = rect.top + window.scrollY;
      const pinEnd = docTop + rect.height - window.innerHeight;
      setRange([docTop, Math.max(pinEnd, docTop + 1)]);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [reduced]);

  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, range, mobile ? [1, 0.92] : [1, 0.78]);
  const rotate = useTransform(scrollY, range, mobile ? [0, -3] : [0, -6]);
  const opacity = useTransform(scrollY, range, [1, 0.55]);

  if (reduced) {
    return <div className="relative min-h-[100svh]">{children}</div>;
  }

  return (
    <div ref={wrapRef} className="relative h-[180svh]">
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
