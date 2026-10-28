import { ChevronDown } from "lucide-react";

/**
 * StudioFaq — the questions buyers actually type, answered short.
 *
 * The accordion and the FAQPage JSON-LD are rendered from this one array on
 * purpose: Google requires the marked-up answers to be visible on the page, and
 * two hand-maintained copies drift apart the first time someone edits one.
 *
 * Native <details>, not a JS accordion: every answer is in the HTML whether
 * it's open or not (the old version unmounted closed answers, so four of five
 * marked-up answers weren't on the page), and it ships no client JavaScript.
 *
 * Each page passes its own list, written for that page's reader.
 */

export type Faq = { q: string; a: string };

export function StudioFaq({ faqs }: { faqs: Faq[] }) {
  return (
    <section
      id="faq"
      aria-labelledby="studio-faq-heading"
      className="relative scroll-mt-20 overflow-hidden bg-chalk py-24 text-ink sm:py-32"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <span className="inline-flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.18em] text-gold-ink sm:text-[13px]">
          <span className="h-px w-6 bg-gold/50" />
          Common questions
        </span>
        <h2
          id="studio-faq-heading"
          className="sx-focus mt-5 font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight"
        >
          Before you ask.
        </h2>

        <div className="mt-10 divide-y divide-board/10 border-t border-board/10">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
                <h3 className="text-base font-semibold sm:text-lg">{f.q}</h3>
                <ChevronDown
                  size={18}
                  aria-hidden
                  className="mt-0.5 shrink-0 text-gold-deep transition-transform duration-300 group-open:rotate-180"
                />
              </summary>
              <p className="pb-6 pr-10 text-base leading-relaxed text-ink/75">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
