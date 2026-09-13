"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * StudioFaq — the questions buyers actually type, answered short.
 *
 * The accordion and the FAQPage JSON-LD are rendered from this one array on
 * purpose: Google requires the marked-up answers to be visible on the page, and
 * two hand-maintained copies drift apart the first time someone edits one.
 *
 * These also carry the page's commercial long-tail — corporate training in
 * Bengaluru, sales and support enablement, custom course building — without
 * turning the page into a wall of prose.
 */

const FAQS = [
  {
    q: "What kind of training does Chalkboard Learning Studio run?",
    a: "Sales performance, customer support, team effectiveness, leadership and productivity programmes — for corporate teams, colleges and institutions in Bengaluru and remotely. Programmes are scoped to the gap you actually have, not picked off a catalogue.",
  },
  {
    q: "Can you build a course out of our own material?",
    a: "Yes. We take what your experts already know and shape it into something people can learn from — storyboarded end to end, then built as branching scenarios, simulations or gamified practice, depending on what the material needs.",
  },
  {
    q: "Do you deliver in person in Bangalore, or online?",
    a: "Both. In-person sessions across Bengaluru, live online delivery for distributed teams, and self-paced material when people need to learn on their own schedule.",
  },
  {
    q: "Do you work with colleges?",
    a: "Yes — placement readiness, campus training and faculty development. Programmes run alongside the academic calendar rather than competing with it.",
  },
  {
    q: "How does an engagement start?",
    a: "A short scoping conversation about the outcome you need and who it is for. We come back with a proposed shape, a timeline and what it costs before anything is built.",
  },
];

export function StudioFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="studio-faq-heading"
      className="relative scroll-mt-20 overflow-hidden bg-cream-bg py-20 text-board sm:py-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <span className="inline-flex items-center gap-2.5 font-special-elite text-[11px] uppercase tracking-[0.28em] text-gold">
          <span className="h-px w-6 bg-gold/50" />
          Common questions
        </span>
        <h2
          id="studio-faq-heading"
          className="mt-5 font-playfair text-[clamp(1.75rem,4.8vw,3rem)] font-bold leading-[1.12] tracking-tight text-board"
        >
          Before you ask.
        </h2>

        <dl className="mt-10 divide-y divide-board/10 border-t border-board/10">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <dt>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left"
                  >
                    <span className="text-base font-semibold text-board sm:text-lg">{f.q}</span>
                    <ChevronDown
                      size={18}
                      className={`mt-0.5 shrink-0 text-gold transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </dt>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.dd
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 text-[15px] leading-relaxed text-gray-600">{f.a}</p>
                    </motion.dd>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
