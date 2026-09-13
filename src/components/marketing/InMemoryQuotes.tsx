"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/**
 * Two parents, years apart, describing the thing her section just described.
 * Placed directly under it so the claim and the corroboration sit together —
 * a stranger saying "conceptual clarity over rote learning" carries what our
 * own prose cannot.
 *
 * Verbatim from the Home Tuitions Bangalore Google profile. Never reworded.
 */

const REVIEWS_URL = "https://maps.app.goo.gl/hRzdE5WesLdoGDpg6";

const QUOTES = [
  {
    text: "Emphasising conceptual clarity over rote learning for in-depth knowledge.",
    name: "Manikandan Kj",
    when: "Google review",
  },
  {
    text: "Tutors' knowledge and way of making things easier for learners is praise worthy.",
    name: "Imran Hassan",
    when: "Google review",
  },
];

export function InMemoryQuotes() {
  return (
    <section className="relative bg-board-deep pb-24 text-chalk sm:pb-28">
      <div className="mx-auto max-w-2xl px-5 sm:px-6">
        <div className="h-px w-full bg-chalk/10" />

        <p className="mt-10 font-special-elite text-[11px] uppercase tracking-[0.28em] text-chalk/35">
          She never wrote this down. Parents did.
        </p>

        <div className="mt-7 space-y-7">
          {QUOTES.map((q, i) => (
            <motion.figure
              key={q.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <blockquote className="font-playfair text-xl leading-snug text-chalk/90 sm:text-2xl">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <figcaption className="mt-2.5 font-special-elite text-[10px] uppercase tracking-[0.18em] text-chalk/35">
                {q.name} · {q.when}
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <a
          href={REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-9 inline-flex items-center gap-1.5 text-sm font-semibold text-chalk-yellow/90 underline decoration-chalk-yellow/25 underline-offset-4 transition-colors hover:decoration-chalk-yellow"
        >
          43 more, going back eight years
          <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </section>
  );
}
