"use client";

import { useEffect, useRef } from "react";
import { createNoise2D } from "simplex-noise";
import { cn } from "@/lib/utils";

/**
 * ChalkWave — ambient "chalk field" background. A handful of low-opacity chalk/
 * gold lines drift across the board via simplex noise, like ideas moving on a
 * chalkboard. Isolated client component; the rest of the homepage stays server.
 *
 * Guarantees (per brief):
 *  - absolute inset-0 · overflow-hidden · pointer-events-none → never affects
 *    layout width and can never cause horizontal scrolling.
 *  - viewBox is stretched (preserveAspectRatio="none") with non-scaling strokes,
 *    so it fills any box without contributing intrinsic width.
 *  - Touch/mobile: fewer lines, lower amplitude, NO pointer tracking.
 *  - prefers-reduced-motion: draws one static frame, no animation loop.
 *  - Pauses when off-screen or the tab is hidden (CPU friendly).
 *  - Looks fine with animation fully disabled — it's purely decorative.
 */
export function ChalkWave({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const MAX = 7;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(max-width: 640px)").matches;

    const count = touch ? 4 : MAX;
    const amp = touch ? 12 : 22;
    const W = 1000;
    const H = 1000;
    const PTS = 24;
    const noise = createNoise2D();

    const lines = Array.from({ length: count }, (_, i) => ({
      baseY: (H / (count + 1)) * (i + 1),
      seed: i * 12.9898,
      freq: 0.0016 + i * 0.00022,
      speed: 0.00007 + i * 0.000012,
      color: i % 3 === 1 ? "#f4c430" : "#f5f0e8",
      opacity: i % 3 === 1 ? 0.16 : 0.1,
    }));

    // Style the active paths; hide the rest.
    pathRefs.current.forEach((p, i) => {
      if (!p) return;
      if (i < count) {
        p.style.opacity = String(lines[i].opacity);
        p.setAttribute("stroke", lines[i].color);
        p.style.display = "";
      } else {
        p.style.display = "none";
      }
    });

    const pointer = { x: 0.5, active: false };

    const buildD = (l: (typeof lines)[number], t: number, px: number | null) => {
      let d = "";
      for (let k = 0; k <= PTS; k++) {
        const x = (W / PTS) * k;
        const n = noise(x * l.freq + l.seed, t * l.speed);
        const influence = px == null ? 0 : Math.max(0, 1 - Math.abs(x / W - px) * 3) * 16 * Math.sin(t * 0.0011 + l.seed);
        const y = l.baseY + n * amp + influence;
        d += `${k === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      return d;
    };

    const draw = (t: number, px: number | null) => {
      for (let i = 0; i < count; i++) {
        const p = pathRefs.current[i];
        if (p) p.setAttribute("d", buildD(lines[i], t, px));
      }
    };

    if (reduce) {
      draw(0, null);
      return;
    }

    let raf = 0;
    let last = 0;
    let running = true;
    const loop = (t: number) => {
      if (!running) return;
      if (t - last > 40) {
        // ~25fps
        last = t;
        draw(t, pointer.active ? pointer.x : null);
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      running = true;
      last = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    start();

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 });
    io.observe(wrap);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    let onMove: ((e: PointerEvent) => void) | undefined;
    if (!touch) {
      onMove = (e) => {
        const r = wrap.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) / r.width;
        pointer.active = true;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
    }

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      if (onMove) window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={wrapRef} className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none">
        {Array.from({ length: MAX }).map((_, i) => (
          <path
            key={i}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            fill="none"
            strokeWidth={1.6}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
