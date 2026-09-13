"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown } from "lucide-react";

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
 * Pinned and scrubbed on every viewport, phones included — HeroPin already
 * pins on mobile in this codebase, and 100svh keeps iOS browser chrome from
 * shifting the track. The phone gets tighter geometry (a fanned strip rather
 * than a wide spine) instead of a smaller copy of the desktop spacing, which
 * would push frames off-screen. Only reduced-motion visitors get the plain
 * stacked list.
 *
 * Scroll progress is measured by hand from window.scrollY against this
 * element's own box — same reasoning as HeroPin.tsx, whose comment explains
 * why framer-motion's `offset` shorthand under-delivers here.
 */

const ACTS = [
  { kicker: "01 · You hand it over", line: "A deck, an SOP, or one expert who knows it all. However messy." },
  { kicker: "02 · We storyboard it", line: "You approve the flow before a single screen gets built." },
  { kicker: "03 · We build it", line: "Decisions to make, things to drag, scores to chase." },
  { kicker: "04 · You see who did what", line: "Who finished, who struggled, exactly where they dropped off." },
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

/** One storyboard frame, carried through all four acts by the shared progress.
 *  `i` picks the content; `slot` is its place in the row, which differs on a
 *  phone because only three of the five are shown there. */
function Frame({
  i,
  slot,
  count,
  progress,
  mobile,
}: {
  i: number;
  slot: number;
  count: number;
  progress: MotionValue<number>;
  mobile: boolean;
}) {
  const s = SCATTER[i];
  // Spacing is set so the outermost frame's far edge still clears the screen
  // with a margin: three frames at 112px apart reach 160px from centre, inside
  // the 179px a 390px phone allows.
  const mid = (count - 1) / 2;
  const spineX = (slot - mid) * (mobile ? 112 : 132);
  const stackX = (slot - mid) * (mobile ? 9 : 16);
  const scatterScale = mobile ? 3.2 : 6;

  // act 1 scattered → act 2 in line → act 3 turned into the room → act 4 stacked
  const x = useTransform(progress, [0, 0.3, 0.62, 0.86], [s.x * scatterScale, spineX, spineX, stackX]);
  const y = useTransform(progress, [0, 0.3, 0.62, 0.86], [s.y * (mobile ? 2.4 : 4), 0, 0, slot * -4]);
  const rotate = useTransform(progress, [0, 0.3, 0.62, 0.86], [s.r, 0, 0, (slot - mid) * 1.5]);
  const rotateY = useTransform(progress, [0.3, 0.62, 0.86], [0, mobile ? -13 : -22, 0]);
  const z = useTransform(progress, [0.3, 0.62, 0.86], [0, slot * (mobile ? 10 : 26), 0]);
  const scale = useTransform(progress, [0.62, 0.86, 1], [1, 0.94, 0.94]);

  // the frame draws itself in, then fills — and in the last act, when the
  // frames collapse into a deck, everything but the front card empties out.
  // Left filled they overlap into unreadable mush.
  const isTop = slot === count - 1;
  const borderOpacity = useTransform(progress, [0.12, 0.34], [0.25, 1]);
  const fillOpacity = useTransform(
    progress,
    [0.5, 0.66, 0.84, 0.93],
    isTop ? [0, 1, 1, 1] : [0, 1, 1, 0]
  );
  const numberOpacity = useTransform(progress, [0.84, 0.93], [1, isTop ? 1 : 0]);
  const noteOpacity = useTransform(progress, [0.02, 0.16, 0.34], [0, 1, 0]);

  return (
    <motion.div
      style={{ x, y, rotate, rotateY, z, scale }}
      className="absolute left-1/2 top-1/2 -ml-[48px] -mt-[83px] h-[166px] w-[96px] sm:-ml-[74px] sm:-mt-[105px] sm:h-[210px] sm:w-[148px]"
    >
      {/* act 1 — a loose chalk note */}
      <motion.div
        style={{ opacity: noteOpacity }}
        className="absolute inset-0 flex items-center justify-center rounded-lg px-3 text-center text-[11px] font-semibold uppercase tracking-[0.1em] leading-snug text-chalk/80"
      >
        {FRAME_LABELS[i]}
      </motion.div>

      {/* acts 2-4 — the frame itself */}
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute inset-0 rounded-lg border border-dashed border-chalk-yellow/70"
      >
        <motion.span
          style={{ opacity: numberOpacity }}
          className="absolute -top-5 left-0 text-[11px] font-bold tracking-[0.14em] text-chalk/55"
        >
          {String(slot + 1).padStart(2, "0")}
        </motion.span>

        <motion.div style={{ opacity: fillOpacity }} className="flex h-full flex-col justify-between p-2.5">
          <span className="text-[9px] font-bold uppercase leading-tight tracking-[0.06em] text-chalk-yellow sm:text-[10px] sm:tracking-[0.1em]">
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
        <div className="h-1 w-8 rounded-full bg-chalk/40" />
        <div className="rounded border border-chalk-yellow/50 bg-chalk-yellow/10 px-1.5 py-1 text-[9px] text-chalk-yellow">
          Push back
        </div>
        <div className="rounded border border-chalk/15 px-1.5 py-1 text-[9px] text-chalk/60">Concede</div>
      </div>
    );
  }
  if (i === 3) {
    return (
      <div className="space-y-1.5" aria-hidden>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((n) => (
            <span key={n} className={`h-1.5 w-1.5 rounded-full ${n < 3 ? "bg-chalk-yellow" : "bg-chalk/40"}`} />
          ))}
        </div>
        <p className="text-[9px] font-semibold text-chalk/65">streak · 3</p>
        <div className="h-1 w-full overflow-hidden rounded-full bg-chalk/25">
          <div className="h-full w-2/3 rounded-full bg-chalk-yellow/90" />
        </div>
      </div>
    );
  }
  if (i === 4) {
    return (
      <div className="flex items-end gap-1" aria-hidden>
        {[6, 11, 8, 15, 19].map((h, n) => (
          <span key={n} className="w-1.5 rounded-sm bg-chalk-yellow/85" style={{ height: h }} />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-1" aria-hidden>
      <div className="h-1 w-full rounded-full bg-chalk/35" />
      <div className="h-1 w-4/5 rounded-full bg-chalk/30" />
      <div className="h-1 w-2/3 rounded-full bg-chalk/25" />
    </div>
  );
}

/* Five legible frames do not fit across a phone — they end up overlapping and
   the labels collide. A phone gets the three that carry the story. */
const MOBILE_FRAMES = [0, 2, 4];

function Stage({ progress, mobile }: { progress: MotionValue<number>; mobile: boolean }) {
  const shown = mobile ? MOBILE_FRAMES : FRAME_LABELS.map((_, i) => i);
  return (
    <div className="relative h-[270px] w-full sm:h-[360px]" style={{ perspective: mobile ? 900 : 1400 }}>
      <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {shown.map((i, slot) => (
          <Frame key={i} i={i} slot={slot} count={shown.length} progress={progress} mobile={mobile} />
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
      <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-chalk-yellow sm:text-[13px]">
        {act.kicker}
      </span>
      <p className="mx-auto mt-3.5 max-w-xl text-balance text-xl font-medium leading-snug text-chalk sm:text-3xl">{act.line}</p>
    </motion.div>
  );
}

/** Only the act you're in is lit. */
function Captions({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="relative mx-auto mt-10 h-[152px] max-w-2xl sm:h-[130px]">
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
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-chalk-yellow">
            {act.kicker}
          </span>
          <p className="mt-2.5 text-lg leading-snug text-chalk/90">{act.line}</p>
        </motion.li>
      ))}
    </ol>
  );
}


/* What a buyer receives. The animation shows the process; this says what lands
   on their desk, which is what turns a nice scroll into an enquiry. */
const DELIVERABLES = [
  { k: "You bring", v: "The expertise your people already have — and the thing they keep getting wrong." },
  { k: "You sign off", v: "A storyboard, before a single screen is built." },
  { k: "You get", v: "Working modules: branching scenarios, simulations, gamified practice." },
  { k: "It runs", v: "On your platform or ours. Classroom, sales floor or support desk." },
  { k: "You track", v: "Completions, scores, and the exact screen people quit on." },
  { k: "You own it", v: "The files are yours. Change them later with us or without us." },
];

function Deliverables() {
  return (
    <div className="mx-auto max-w-4xl px-5 pb-20 sm:px-6 sm:pb-24">
      {/* The lesson further down is the proof; this is the pointer to it. */}
      <a
        href="#interactive"
        className="group mb-8 flex w-full items-center gap-4 rounded-2xl border border-chalk-yellow/30 bg-chalk-yellow/[0.07] p-5 text-left transition-colors hover:border-chalk-yellow/60 hover:bg-chalk-yellow/10"
      >
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-chalk-yellow/15 text-chalk-yellow transition-transform group-hover:translate-y-0.5">
          <ArrowDown size={18} />
        </span>
        <span className="min-w-0">
          <span className="block text-[15px] font-bold text-chalk">Want to feel the difference?</span>
          <span className="mt-0.5 block text-sm text-chalk/55">
            Further down, this page turns into a short lesson. Thirty seconds, and you&rsquo;ll learn something.
          </span>
        </span>
      </a>

      <dl className="grid gap-px overflow-hidden rounded-2xl border border-chalk/10 bg-chalk/25 sm:grid-cols-2">
        {DELIVERABLES.map((d) => (
          <div key={d.k} className="bg-board-deep p-5 sm:p-6">
            <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-chalk-yellow">
              {d.k}
            </dt>
            <dd className="mt-2 text-[15px] leading-snug text-chalk/80">{d.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <a
          href="#enquire"
          className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)] px-7 py-3.5 text-sm font-bold text-chalk-dark transition-transform active:scale-[0.98]"
        >
          Talk about building one
        </a>
        <p className="text-xs text-chalk/60">
          Simulations, branching scenarios, gamified practice — whatever the material actually needs.
        </p>
      </div>
    </div>
  );
}

export function CourseBuild() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrub, setScrub] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      setScrub(!reduce.matches);
      setMobile(narrow.matches);
    };
    sync();
    reduce.addEventListener("change", sync);
    narrow.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
    };
  }, []);

  const progress = useActProgress(trackRef, scrub);

  const header = (
    <div className="text-center">
      <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-chalk-yellow sm:text-[13px]">
        How it gets built
      </span>
      <h2 className="mx-auto mt-5 max-w-3xl text-balance font-playfair text-[clamp(1.6rem,5.4vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-chalk">
        Outsource the whole thing — your raw material in, a finished course out.
      </h2>
    </div>
  );

  if (!scrub) {
    return (
      <section id="course-building" className="relative scroll-mt-20 overflow-hidden bg-board-deep bg-chalk-lines py-20 text-chalk">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {header}
          <Stacked />
        </div>
        <div className="mt-14">
          <Deliverables />
        </div>
      </section>
    );
  }

  return (
    <section id="course-building" className="relative scroll-mt-20 bg-board-deep text-chalk">
      <div ref={trackRef} className={`relative ${mobile ? "h-[340svh]" : "h-[420svh]"}`}>
        {/* pt-16 keeps the eyebrow clear of the fixed navbar — without it the
            centred block puts the section label right under the header bar. */}
        <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden bg-board-deep bg-chalk-lines pt-16">
          <div className="mx-auto w-full max-w-5xl px-5 sm:px-6">
            {header}
            <Stage progress={progress} mobile={mobile} />
            <Captions progress={progress} />
          </div>
        </div>
      </div>
      <Deliverables />
    </section>
  );
}
