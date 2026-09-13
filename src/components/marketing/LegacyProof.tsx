"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";

/**
 * LegacyProof — the inherited-trust block on /tuitions.
 *
 * Every tuition centre in Bangalore claims small batches. What can't be copied
 * is a public record parents can go and read for themselves, so the section
 * exists to hand them that record rather than make another claim.
 *
 * The quotes are verbatim from the Google profile and attributed by name, so a
 * parent can click through and find the same words. Never paraphrase them into
 * something snappier — invented praise is the one thing that would undo what
 * this section is for.
 *
 * Deliberately no AggregateRating markup: these reviews belong to the Home
 * Tuitions Bangalore profile on Google, and Google's structured-data policy
 * disallows marking up ratings you collected elsewhere as your own. Shown as
 * plain attributed proof instead, which carries the same weight with a parent
 * and none of the manual-action risk.
 */

const REVIEWS_URL = "https://maps.app.goo.gl/hRzdE5WesLdoGDpg6";

/** Live figures from the Home Tuitions Bangalore Google profile. */
export const RATING = { value: 4.9, count: 43 };

/* Verbatim from Google. Trimmed only where Google itself truncates, never
   reworded — a parent can click through and find the same words. */
const DEFAULT_QUOTES: ReviewQuote[] = [
  {
    text: "Great place to send your kids to get the best education coaching. Emphasising conceptual clarity over rote learning for in-depth knowledge.",
    name: "Manikandan Kj",
  },
  {
    text: "The personalised attention and tailored learning plan have greatly contributed to academic progress. Their expertise, teaching style, and commitment to student success make them an excellent choice.",
    name: "Sarikonda Karthik Raju",
  },
  {
    text: "Tutors' knowledge and way of making things easier for learners is praise worthy.",
    name: "Imran Hassan",
  },
];

export interface ReviewQuote {
  text: string;
  name: string;
}

export function LegacyProof({ quotes = DEFAULT_QUOTES }: { quotes?: ReviewQuote[] }) {
  return (
    <section
      aria-labelledby="legacy-heading"
      className="relative overflow-hidden bg-board py-20 text-chalk sm:py-24"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.022) 27px, rgba(255,255,255,0.022) 28px)",
      }}
    >
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <span className="font-special-elite text-[11px] uppercase tracking-[0.28em] text-chalk-yellow/85">
            Teaching here since 2018
          </span>

          <h2
            id="legacy-heading"
            className="mx-auto mt-5 max-w-2xl text-balance font-playfair text-[clamp(1.8rem,5vw,3rem)] font-bold leading-[1.12] tracking-tight"
          >
            Check our work before you trust us with your child.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-chalk/60">
            These teachers have been taking these batches for years, as{" "}
            <span className="text-chalk/85">Home Tuitions Bangalore</span> — rated{" "}
            <span className="font-semibold text-chalk-yellow">{RATING.value}</span> by{" "}
            <span className="text-chalk/85">{RATING.count} parents</span> on Google, going back eight
            years.
          </p>

          <a
            href={REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-2.5 rounded-xl border border-chalk-yellow/35 bg-chalk-yellow/10 px-6 py-3.5 text-sm font-semibold text-chalk-yellow transition-all hover:border-chalk-yellow/70 hover:bg-chalk-yellow/15"
          >
            <span className="flex" aria-hidden>
              {[0, 1, 2, 3, 4].map((n) => (
                <Star key={n} size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </span>
            Read the reviews on Google
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>

        {quotes.length > 0 && (
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {quotes.map((q, i) => (
              <motion.figure
                key={q.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-chalk/10 bg-chalk/[0.04] p-5"
              >
                <blockquote className="text-sm leading-relaxed text-chalk/80">
                  &ldquo;{q.text}&rdquo;
                </blockquote>
                <figcaption className="mt-3 font-special-elite text-[10px] uppercase tracking-[0.16em] text-chalk/40">
                  {q.name}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
