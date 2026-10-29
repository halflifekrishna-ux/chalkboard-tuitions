import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { STUDIO_PAGES, STUDIO_ID, studioAlternates, studioGraph, studioUrl, breadcrumbs } from "@/lib/studio";
import { PROGRAMS, FIRST_YEAR } from "@/lib/portfolio";
import { Scene, Inner, Kicker } from "@/components/marketing/learning-studio/Scene";
import { ProgramGrid, StatBand } from "@/components/marketing/learning-studio/Portfolio";
import { StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * /learning-studio/work: the portfolio. Every program our team has run, newest
 * first, each with its own facts and the one result its feedback supports.
 * The list and the numbers come from src/lib/portfolio.ts.
 */

const PAGE = STUDIO_PAGES.work;
const COUNT = PROGRAMS.length;

export const metadata: Metadata = {
  title: { absolute: "Our Work: Training Programs and Results | Chalkboard Learning Studio" },
  description: `${COUNT} training programs since ${FIRST_YEAR}: placement accelerators, Advanced Excel, cybersecurity and FinTech. 97% of surveyed learners rated our Excel program 4 or 5 out of 5.`,
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: `${COUNT} programs since ${FIRST_YEAR}`,
    description: "Placement accelerators, Advanced Excel, cybersecurity and FinTech, each with its own results.",
    url: studioAlternates(PAGE.path).canonical,
    type: "website",
    siteName: "Chalkboard Learning Studio",
  },
};

const schema = studioGraph(
  {
    "@type": "ItemList",
    "@id": `${studioUrl(PAGE.path)}#programs`,
    name: "Training programs by Chalkboard Learning Studio",
    itemListElement: PROGRAMS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        "@id": `${studioUrl(PAGE.path)}#${p.id}`,
        name: p.title,
        description: p.summary,
        provider: { "@id": STUDIO_ID },
        teaches: p.topics,
        inLanguage: "en",
      },
    })),
  },
  breadcrumbs([STUDIO_PAGES.hub, PAGE])
);

const YEARS = Array.from(new Set(PROGRAMS.map((p) => p.year))).sort((a, b) => b - a);

export default function WorkPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      <section className="relative overflow-hidden bg-board pb-20 pt-32 text-chalk sm:pb-24 sm:pt-40">
        <div aria-hidden className="grid-dots pointer-events-none" />
        <Inner className="relative">
          <Kicker tone="dark">Our work</Kicker>
          <h1 className="mt-7 max-w-4xl break-words font-playfair font-bold leading-[1.03] tracking-tight text-[clamp(2.6rem,9vw,6rem)]">
            {COUNT} programs since {FIRST_YEAR}. <span className="font-playfair text-chalk-yellow">Every one measured.</span>
          </h1>
          <span aria-hidden className="sx-hero-line mt-9 block h-px w-full max-w-md bg-gradient-to-r from-chalk-yellow/80 to-transparent" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-chalk/75 sm:text-xl">
            Placement accelerators, Advanced Excel, cybersecurity and FinTech. Each one was designed around what learners had
            to be able to do, and each one asked them how it went.
          </p>
        </Inner>
      </section>

      <Scene tone="cream" labelledBy="numbers" className="py-20 sm:py-24">
        <Inner>
          <h2 id="numbers" className="sr-only">
            Results across our programs
          </h2>
          <StatBand tone="cream" />
        </Inner>
      </Scene>

      {YEARS.map((y, i) => {
        const tone = i % 2 === 0 ? "dark" : "cream";
        return (
          <Scene key={y} tone={tone} labelledBy={`y${y}`} className="py-20 sm:py-24">
            <Inner>
              <Kicker tone={tone}>Programs</Kicker>
              <h2 id={`y${y}`} className="sx-focus mt-6 font-playfair text-[clamp(2.4rem,7vw,4.5rem)] font-bold leading-none tracking-tight lining-nums">
                {y}
              </h2>
              <div className="mt-10">
                <ProgramGrid programs={PROGRAMS.filter((p) => p.year === y)} tone={tone} />
              </div>
            </Inner>
          </Scene>
        );
      })}

      <Scene tone="cream" labelledBy="next">
        <Inner>
          <Kicker tone="cream">Your program</Kicker>
          <h2 id="next" className="sx-focus mt-8 max-w-3xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            Same method, built around your people.
          </h2>
          <div className="sx-rise mt-10 flex flex-wrap gap-x-8 gap-y-4">
            <Link href={STUDIO_PAGES.companies.path} className="inline-flex items-center gap-2 text-sm font-semibold text-board underline decoration-gold-deep/50 underline-offset-4 hover:decoration-gold-deep">
              Training for companies <ArrowRight size={15} aria-hidden />
            </Link>
            <Link href={STUDIO_PAGES.colleges.path} className="inline-flex items-center gap-2 text-sm font-semibold text-board underline decoration-gold-deep/50 underline-offset-4 hover:decoration-gold-deep">
              Programs for colleges <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </Inner>
      </Scene>

      <StudioEnquire
        title={<>What should your people be able to do?</>}
        line="Tell us who the training is for and what needs to change. We reply by email with a proposed outline and what it costs."
        defaultAudience="Corporate team"
        elsewhere={["companies", "colleges"]}
      />
    </>
  );
}
