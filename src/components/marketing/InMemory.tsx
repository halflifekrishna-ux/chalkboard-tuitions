"use client";

import { motion } from "framer-motion";

/**
 * InMemory — Uma Maheshwari, who founded Home Tuitions Bangalore and taught
 * until the end of her life.
 *
 * Deliberately type-only: no portrait, no stock imagery, no ornament beyond a
 * chalk rule. The restraint is the design. Everything here is first-hand from
 * the founder; nothing about her is embellished, and the family relationship
 * is left unstated at his request.
 *
 * Used on /about, directly beneath the philosophy section.
 */
export function InMemory() {
  return (
    <section
      aria-labelledby="in-memory-heading"
      className="relative overflow-hidden bg-board-deep py-24 text-chalk sm:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.02) 27px, rgba(255,255,255,0.02) 28px)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-56 w-[680px] max-w-full -translate-x-1/2 opacity-20"
        style={{ background: "radial-gradient(ellipse at center top, #f4c430, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-2xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-special-elite text-[11px] uppercase tracking-[0.3em] text-chalk-yellow/80">
            In memory
          </span>

          <h2
            id="in-memory-heading"
            className="mt-6 font-playfair text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[1.02] tracking-tight"
          >
            Uma Maheshwari
          </h2>
          <p className="mt-3 font-special-elite text-xs uppercase tracking-[0.2em] text-chalk/40">
            Founder · Home Tuitions Bangalore
          </p>

          <div className="mt-10 h-px w-24 bg-chalk-yellow/40" />

          <div className="mt-10 space-y-6 text-[17px] leading-relaxed text-chalk/75 sm:text-lg">
            <p>
              She was family. How exactly doesn&rsquo;t matter here — she was more than a mother to me,
              and more than a teacher.
            </p>
            <p>
              I watched her work for years, and I was there whenever she needed me. She was pure
              energy. She taught the way she lived, at full tilt, and she had no patience for a child
              repeating an answer they couldn&rsquo;t explain.
            </p>
          </div>

          <blockquote className="my-12 border-l-2 border-chalk-yellow/50 pl-6">
            <p className="font-playfair text-2xl font-bold leading-snug text-chalk sm:text-3xl">
              Understand it, or we start again.
            </p>
          </blockquote>

          <div className="space-y-6 text-[17px] leading-relaxed text-chalk/75 sm:text-lg">
            <p>
              When her health gave way she kept teaching. Students were still coming to her at the
              end, because she would not have had it any other way.
            </p>
            <p className="text-chalk/90">They still talk about her. That hasn&rsquo;t faded.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
