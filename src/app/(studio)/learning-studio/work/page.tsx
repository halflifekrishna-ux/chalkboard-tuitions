import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { STUDIO_PAGES, studioAlternates, studioGraph, studioUrl, breadcrumbs } from "@/lib/studio";
import { Scene, Inner, Kicker, Pills } from "@/components/marketing/learning-studio/Scene";
import { StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * /learning-studio/work. One partner so far, shown in full. No logo wall, no
 * "trusted by", no client count: the page says how early we are and lets the
 * one real case study carry the weight. Add a card here per real engagement.
 */

const PAGE = STUDIO_PAGES.work;

export const metadata: Metadata = {
  title: { absolute: "Our Work: Training Case Studies | Chalkboard Learning Studio" },
  description:
    "Case studies from Chalkboard Learning Studio. Two programs running at East Point College of Management, Bengaluru, with 80 students and no session missed.",
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: "Our work, shown in full",
    description: "Two programs running at East Point College of Management, Bengaluru. 80 students, no session missed.",
    url: studioAlternates(PAGE.path).canonical,
    type: "website",
    siteName: "Chalkboard Learning Studio",
  },
};

const schema = studioGraph(
  {
    "@type": "CollectionPage",
    "@id": `${studioUrl(PAGE.path)}#page`,
    name: "Our work",
    url: studioUrl(PAGE.path),
    hasPart: [
      {
        "@type": "Article",
        "@id": `${studioUrl(STUDIO_PAGES.eastPoint.path)}#article`,
        headline: "East Point College of Management: two programs, 80 students, no session missed",
        url: studioUrl(STUDIO_PAGES.eastPoint.path),
      },
    ],
  },
  breadcrumbs([STUDIO_PAGES.hub, PAGE])
);

export default function WorkPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-board pb-20 pt-32 text-chalk sm:pb-28 sm:pt-40">
        <div aria-hidden className="grid-dots pointer-events-none" />
        <Inner className="relative">
          <Kicker tone="dark">Our work</Kicker>
          <h1 className="mt-7 max-w-4xl break-words font-playfair font-bold leading-[1.03] tracking-tight text-[clamp(2.6rem,9vw,6rem)]">
            One partner so far. <span className="font-playfair text-chalk-yellow">Shown in full.</span>
          </h1>
          <span aria-hidden className="sx-hero-line mt-9 block h-px w-full max-w-md bg-gradient-to-r from-chalk-yellow/80 to-transparent" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-chalk/75 sm:text-xl">
            We&rsquo;re early. Our first programs are running at a college in Bengaluru, and we&rsquo;d rather show you all of
            it than a wall of logos.
          </p>
        </Inner>
      </section>

      {/* ── The case study ── */}
      <Scene tone="cream" labelledBy="cases">
        <Inner>
          <h2 id="cases" className="sr-only">
            Case studies
          </h2>
          <Link
            href={STUDIO_PAGES.eastPoint.path}
            className="sx-rise group grid grid-cols-1 gap-10 rounded-3xl border border-board/15 bg-white/70 p-7 transition-colors hover:border-gold-ink/60 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-end"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-ink">
                Case study · Colleges · Bengaluru
              </span>
              <h3 className="mt-5 font-playfair text-[clamp(1.9rem,5vw,3.25rem)] font-bold leading-[1.08] tracking-tight">
                East Point College of Management
              </h3>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink/80">
                A BCA Placement Accelerator and a B.Com Industry Accelerator, run under MOU. A trainer left mid-program and
                no session was dropped.
              </p>
              <div className="mt-6">
                <Pills tone="cream" items={["SQL", "Python", "Power BI", "FinTech"]} />
              </div>
              <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-board">
                Read the case study
                <ArrowUpRight size={16} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-6 border-t border-board/15 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <p>
                <span className="block font-playfair text-6xl font-black leading-none lining-nums text-board">80</span>
                <span className="mt-2 block text-sm text-ink/80">students</span>
              </p>
              <p>
                <span className="block font-playfair text-6xl font-black leading-none lining-nums text-board">0</span>
                <span className="mt-2 block text-sm text-ink/80">sessions missed</span>
              </p>
            </div>
          </Link>
        </Inner>
      </Scene>

      {/* ── Companies ── */}
      <Scene tone="dark" labelledBy="first">
        <Inner>
          <Kicker tone="dark">For companies</Kicker>
          <h2 id="first" className="sx-focus mt-8 max-w-4xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            The next case study could be your team.
          </h2>
          <p className="sx-rise mt-8 max-w-xl text-lg leading-relaxed text-chalk/75">
            We&rsquo;re taking on our first company partners now, for AI at work and for courses built from your own material.
            You&rsquo;d get the same attention East Point gets.
          </p>
          <div className="sx-rise mt-10 flex flex-wrap gap-x-8 gap-y-4">
            <Link href={STUDIO_PAGES.aiTraining.path} className="inline-flex items-center gap-2 text-sm font-semibold text-chalk-yellow underline decoration-chalk-yellow/40 underline-offset-4 hover:decoration-chalk-yellow">
              AI training for teams <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </Inner>
      </Scene>

      <StudioEnquire
        title={<>Want to be next?</>}
        line="Tell us who the training is for and what needs to change. We reply by email with a proposed outline and what it costs."
        defaultAudience="Corporate team"
        elsewhere={["colleges", "trainers"]}
      />
    </>
  );
}
