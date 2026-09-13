"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

/**
 * CourseBuild — the Studio's signature section: a chalkboard that assembles a
 * course while you scroll it. Four acts, scrubbed from real scroll position:
 * scattered thinking → an ordered spine → frames that become something you do
 * → a finished thing people complete.
 *
 * Depth is pure CSS 3D (perspective + rotateY/translateZ), deliberately not a
 * second WebGL scene — the page already carries one on Tuitions and a phone
 * paying for another megabyte of runtime would cost more in ranking than the
 * visual earns.
 *
 * Desktop pins and scrubs. Phones get the same four acts as a plain vertical
 * sequence: pinned scrubbing fights the dynamic browser chrome on iOS and
 * reads as jank on a small screen, so the mobile path is the honest one
 * rather than a shrunken copy of the desktop trick.
 *
 * Scroll progress is measured by hand from window.scrollY against this
 * element's own box — same reasoning as HeroPin.tsx, whose comment explains
 * why framer-motion's `offset` shorthand under-delivers here.
 */

const ACTS = [
  { kicker: "01 · Brainstorm", line: "Everything you know, in no particular order." },
  { kicker: "02 · Storyboard", line: "We find the order it should be learned in." },
  { kicker: "03 · Build", line: "Then it becomes something they do — a call to make, a score to chase, a situation to handle." },
  { kicker: "04 · Launch", line: "Built so they finish it. A classroom, a sales floor, a support desk." },
] as const;

/** Where the raw thinking starts: scattered, angled, unordered. */
const SCATTER = [
  { x: -38, y: -30, r: -14 },
  { x: 22, y: -36, r: 9 },
  { x: -18, y: 16, r: 7 },
  { x: 34, y: 22, r: -11 },
  { x: 2, y: -6, r: 4 },
];

const FRAME_LABELS = ["The hook", "The idea", "The decision", "The practice", "The proof"];

function useActProgress(ref: React.RefObject<HTMLDivElement>, enabled: boolean) {
  const [range, setRange] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    if (!enabled) return;
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const docTop = rect.top + window.scrollY;
      const end = docTop + rect.height - window.innerHeight;
      setRange([docTop, Math.max(end, docTop + 1)]);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref, enabled]);

  const { scrollY } = useScroll();
  return useTransform(scrollY, range, [0, 1], { clamp: true });
}

/** One storyboard frame, carried through all four acts by the shared progress. */
function Frame({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const s = SCATTER[i];
  const spineX = (i - 2) * 132;
  const stackX = (i - 2) * 16;

  // act 1 scattered → act 2 in line → act 3 turned into the room → act 4 stacked
  const x = useTransform(progress, [0, 0.3, 0.62, 0.86], [s.x * 6, spineX, spineX, stackX]);
  const y = useTransform(progress, [0, 0.3, 0.62, 0.86], [s.y * 4, 0, 0, i * -4]);
  const rotate = useTransform(progress, [0, 0.3, 0.62, 0.86], [s.r, 0, 0, (i - 2) * 1.5]);
  const rotateY = useTransform(progress, [0.3, 0.62, 0.86], [0, -22, 0]);
  const z = useTransform(progress, [0.3, 0.62, 0.86], [0, i * 26, 0]);
  const scale = useTransform(progress, [0.62, 0.86, 1], [1, 0.94, 0.94]);

  // the frame draws itself in, then fills
  const borderOpacity = useTransform(progress, [0.12, 0.34], [0.25, 1]);
  const fillOpacity = useTransform(progress, [0.5, 0.66], [0, 1]);
  const noteOpacity = useTransform(progress, [0.02, 0.16, 0.34], [0, 1, 0]);

  return (
    <motion.div
      style={{ x, y, rotate, rotateY, z, scale }}
      className="absolute left-1/2 top-1/2 h-[168px] w-[118px] -translate-x-1/2 -translate-y-1/2 sm:h-[210px] sm:w-[148px]"
    >
      {/* act 1 — a loose chalk note */}
      <motion.div
        style={{ opacity: noteOpacity }}
        className="absolute inset-0 flex items-center justify-center rounded-lg px-3 text-center font-special-elite text-[11px] leading-snug text-chalk/70"
      >
        {FRAME_LABELS[i]}
      </motion.div>

      {/* acts 2-4 — the frame itself */}
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute inset-0 rounded-lg border border-dashed border-chalk-yellow/45"
      >
        <span className="absolute -top-5 left-0 font-special-elite text-[10px] tracking-[0.18em] text-chalk/35">
          {String(i + 1).padStart(2, "0")}
        </span>

        <motion.div style={{ opacity: fillOpacity }} className="flex h-full flex-col justify-between p-2.5">
          <span className="font-special-elite text-[9px] uppercase tracking-[0.14em] text-chalk-yellow/80">
            {FRAME_LABELS[i]}
          </span>
          <FrameContent i={i} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** What each frame turns into — a branch, a score, a simulation, a result. */
function FrameContent({ i }: { i: number }) {
  if (i === 2) {
    return (
      <div className="space-y-1.5" aria-hidden>
        <div className="h-1 w-8 rounded-full bg-chalk/20" />
        <div className="rounded border border-chalk-yellow/50 bg-chalk-yellow/10 px-1.5 py-1 text-[9px] text-chalk-yellow">
          Push back
        </div>
        <div className="rounded border border-chalk/15 px-1.5 py-1 text-[9px] text-chalk/45">Concede</div>
      </div>
    );
  }
  if (i === 3) {
    return (
      <div className="space-y-1.5" aria-hidden>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((n) => (
            <span key={n} className={`h-1.5 w-1.5 rounded-full ${n < 3 ? "bg-chalk-yellow" : "bg-chalk/20"}`} />
          ))}
        </div>
        <p className="font-special-elite text-[9px] text-chalk/50">streak · 3</p>
        <div className="h-1 w-full overflow-hidden rounded-full bg-chalk/10">
          <div className="h-full w-2/3 rounded-full bg-chalk-yellow/70" />
        </div>
      </div>
    );
  }
  if (i === 4) {
    return (
      <div className="flex items-end gap-1" aria-hidden>
        {[6, 11, 8, 15, 19].map((h, n) => (
          <span key={n} className="w-1.5 rounded-sm bg-chalk-yellow/60" style={{ height: h }} />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-1" aria-hidden>
      <div className="h-1 w-full rounded-full bg-chalk/15" />
      <div className="h-1 w-4/5 rounded-full bg-chalk/12" />
      <div className="h-1 w-2/3 rounded-full bg-chalk/10" />
    </div>
  );
}

function Stage({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="relative h-[300px] w-full sm:h-[360px]" style={{ perspective: 1400 }}>
      <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {FRAME_LABELS.map((_, i) => (
          <Frame key={i} i={i} progress={progress} />
        ))}
      </div>
    </div>
  );
}

/** One act's caption. Its own component so the hooks aren't called in a loop. */
function Caption({ act, i, progress }: { act: (typeof ACTS)[number]; i: number; progress: MotionValue<number> }) {
  // Each act owns a quarter of the scrub. The fade-out finishes before the next
  // act's fade-in begins — overlapping windows stack two captions on the same
  // absolute position and both render at once.
  const start = i * 0.25;
  const opacity = useTransform(
    progress,
    [start - 0.03, start + 0.03, start + 0.19, start + 0.24],
    [0, 1, 1, 0]
  );
  const y = useTransform(progress, [start - 0.03, start + 0.03], [14, 0]);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-0 text-center">
      <span className="font-special-elite text-[11px] uppercase tracking-[0.28em] text-chalk-yellow/90">
        {act.kicker}
      </span>
      <p className="mx-auto mt-3 max-w-xl text-balance text-lg leading-snug text-chalk sm:text-2xl">{act.line}</p>
    </motion.div>
  );
}

/** Only the act you're in is lit. */
function Captions({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="relative mx-auto mt-10 h-[132px] max-w-2xl sm:h-[112px]">
      {ACTS.map((act, i) => (
        <Caption key={act.kicker} act={act} i={i} progress={progress} />
      ))}
    </div>
  );
}

/** Phones and reduced-motion visitors: the same four acts, told plainly. */
function Stacked() {
  return (
    <ol className="mt-10 space-y-3">
      {ACTS.map((act) => (
        <motion.li
          key={act.kicker}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-chalk/10 bg-chalk/[0.03] p-5"
        >
          <span className="font-special-elite text-[10px] uppercase tracking-[0.24em] text-chalk-yellow/90">
            {act.kicker}
          </span>
          <p className="mt-2.5 text-base leading-snug text-chalk/90">{act.line}</p>
        </motion.li>
      ))}
    </ol>
  );
}

export function CourseBuild() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrub, setScrub] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");
    const sync = () => setScrub(wide.matches && !reduce.matches);
    sync();
    reduce.addEventListener("change", sync);
    wide.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      wide.removeEventListener("change", sync);
    };
  }, []);

  const progress = useActProgress(trackRef, scrub);

  const header = (
    <div className="text-center">
      <span className="font-special-elite text-[11px] uppercase tracking-[0.28em] text-chalk-yellow/90">
        Course building
      </span>
      <h2 className="mx-auto mt-5 max-w-3xl text-balance font-playfair text-[clamp(1.9rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-chalk">
        You know the thing. We make it learnable.
      </h2>
    </div>
  );

  if (!scrub) {
    return (
      <section id="course-building" className="relative scroll-mt-20 overflow-hidden bg-board-deep bg-chalk-lines py-20 text-chalk">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {header}
          <Stacked />
          <p className="mt-8 text-center text-sm text-chalk/50">
            Simulations, branching scenarios, gamified practice — whatever the material actually needs.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="course-building" className="relative scroll-mt-20 bg-board-deep text-chalk">
      <div ref={trackRef} className="relative h-[420svh]">
        <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden bg-board-deep bg-chalk-lines">
          <div className="mx-auto w-full max-w-5xl px-6">
            {header}
            <Stage progress={progress} />
            <Captions progress={progress} />
          </div>
        </div>
      </div>
    </section>
  );
}
