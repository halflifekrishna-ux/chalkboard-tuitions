"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionTemplate, useReducedMotion, type Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ChalkWave } from "@/components/ui/chalk-wave";

/**
 * CinematicHero — the homepage front-door hero. A scroll-pinned "the board
 * lights up" reveal: a chalk-circle of warm light expands as you scroll while
 * the headline reveals word-by-word. Built with position:sticky + Framer
 * useScroll (no GSAP/Lenis/video). Isolated client island; the rest of the page
 * stays server-rendered.
 *
 * Guarantees:
 *  - No horizontal overflow: the light layer is inset-0 clip-path (can't exceed
 *    the box); headline uses fluid clamp + break-words.
 *  - prefers-reduced-motion: the pin collapses (CSS, see globals) and the light
 *    layer + words render static — a clean poster, no trapped scroll.
 *  - Mobile-first: shorter pin track, gentler reveal.
 * Used in: (marketing)/page.tsx.
 */

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: "35%", rotate: 6 },
  show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function CinematicHero() {
  const trackRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const radius = useTransform(scrollYProgress, [0, 0.8], [16, 135]);
  const clip = useMotionTemplate`circle(${radius}% at 50% 42%)`;
  const cueOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);

  return (
    <section ref={trackRef} className="cinematic-track relative bg-board-deep text-chalk h-[150svh] lg:h-[185vh]">
      <div className="cinematic-sticky sticky top-0 flex items-center overflow-hidden h-[100svh]">
        {/* ambient chalk field */}
        <ChalkWave />

        {/* expanding warm-light disc — the board "lighting up" */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath: reduce ? "circle(135% at 50% 42%)" : clip,
            background:
              "radial-gradient(circle at 50% 42%, rgba(244,196,48,0.22) 0%, rgba(45,106,79,0.28) 38%, rgba(22,45,36,0) 70%)",
          }}
        />
        {/* keep text legible over both layers */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-board-deep via-board-deep/30 to-transparent" />

        <Container className="relative z-10">
          <div className="max-w-4xl">
            <span className="block font-special-elite text-sm sm:text-base uppercase tracking-[0.32em] text-chalk-yellow/90">Chalkboard</span>
            <motion.h1
              variants={container}
              initial={reduce ? "show" : "hidden"}
              animate="show"
              className="mt-5 font-playfair font-black tracking-tight break-words leading-[1.02] text-[clamp(2.5rem,8.5vw,6rem)]"
            >
              <motion.span variants={word} className="inline-block will-change-transform">Learning,</motion.span>{" "}
              <motion.span variants={word} className="inline-block italic font-bold text-chalk-yellow will-change-transform">differently.</motion.span>
            </motion.h1>
            <motion.p
              variants={word}
              initial={reduce ? "show" : "hidden"}
              animate="show"
              className="mt-6 max-w-md text-lg sm:text-xl text-chalk/60 leading-relaxed"
            >
              One ecosystem for every stage of learning — from the classroom to the workplace.
            </motion.p>
          </div>
        </Container>

        {/* scroll cue (fades as the board opens) */}
        <motion.div
          style={{ opacity: reduce ? 0 : cueOpacity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-chalk/45"
          aria-hidden
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">What brings you here?</span>
          <ChevronDown size={18} className="animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
