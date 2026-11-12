import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { STUDIO_PAGES, SAMPLE_LESSONS, STUDIO_ID, studioAlternates, studioGraph, studioUrl, breadcrumbs } from "@/lib/studio";
import { PROGRAMS, ENROLMENTS, FIRST_YEAR, RECORD } from "@/lib/portfolio";
import { Scene, Inner, Kicker } from "@/components/marketing/learning-studio/Scene";
import { ProgramTiles, StatBand } from "@/components/marketing/learning-studio/Portfolio";
import { LessonPlayer } from "@/components/marketing/learning-studio/LessonPlayer";
import { StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * /learning-studio/work: the portfolio. Numbers first, then three sample
 * lessons a visitor can play inside the page, then the programs we have run
 * as short tiles. The list and the numbers come from src/lib/portfolio.ts.
 *
 * The lessons run in a frame, so search engines credit their text to the
 * lessons file, not to this page. The lesson list beside the player and the
 * LearningResource entries in the JSON-LD are what make this page findable
 * for them.
 */

const PAGE = STUDIO_PAGES.work;
const LESSONS_ID = "lessons";

const LESSONS = [
  {
    name: "Using AI at work",
    line: "Spot the made-up fact, then hide the secrets in a message before it goes to an AI.",
    teaches: ["Checking AI answers", "Keeping private data out of AI tools"],
    hash: "ai",
  },
  {
    name: "POSH basics",
    line: "Five things that happen at work. Okay or not okay? Then where to go for help.",
    teaches: ["Recognising workplace harassment", "Where a POSH complaint goes"],
    hash: "posh",
  },
  {
    name: "Spot the phish",
    line: "Find the four clues that give a fake email away, and what to do next.",
    teaches: ["Phishing email red flags", "Reporting a suspicious email"],
    hash: "phish",
  },
];

const DESCRIPTION = `${RECORD}, with 97% to 100% positive feedback. Play three sample eLearning lessons on this page: AI at work, POSH basics and phishing awareness.`;

export const metadata: Metadata = {
  title: { absolute: "Our Work: Sample eLearning Lessons and Training Results | Chalkboard Learning Studio" },
  description: DESCRIPTION,
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: `${RECORD}. Play three sample lessons.`,
    description: "Sample eLearning lessons you can play on the page, and the results of the training programs we have run.",
    url: studioAlternates(PAGE.path).canonical,
    type: "website",
    siteName: "Chalkboard Learning Studio",
  },
};

const schema = studioGraph(
  {
    "@type": "ItemList",
    "@id": `${studioUrl(PAGE.path)}#${LESSONS_ID}`,
    name: "Sample eLearning lessons by Chalkboard Learning Studio",
    itemListElement: LESSONS.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LearningResource",
        "@id": `${studioUrl(SAMPLE_LESSONS.path)}#${l.hash}`,
        name: l.name,
        description: l.line,
        url: `${studioUrl(SAMPLE_LESSONS.path)}#${l.hash}`,
        learningResourceType: "Interactive lesson",
        interactivityType: "active",
        timeRequired: "PT2M",
        isAccessibleForFree: true,
        inLanguage: "en",
        teaches: l.teaches,
        provider: { "@id": STUDIO_ID },
      },
    })),
  },
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
            {ENROLMENTS} student enrolments since {FIRST_YEAR}. <span className="font-playfair text-chalk-yellow">Every program measured.</span>
          </h1>
          <span aria-hidden className="sx-hero-line mt-9 block h-px w-full max-w-md bg-gradient-to-r from-chalk-yellow/80 to-transparent" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-chalk/75 sm:text-xl">
            Corporate training, college programs and eLearning. See the numbers, then play three sample lessons right here
            on the page.
          </p>
          <a
            href={`#${LESSONS_ID}`}
            className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-chalk-yellow underline decoration-chalk-yellow/50 underline-offset-4 hover:decoration-chalk-yellow"
          >
            Play a sample lesson <ArrowRight size={15} aria-hidden />
          </a>
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

      <Scene tone="dark" id={LESSONS_ID} labelledBy="lessons-heading" className="py-20 sm:py-24">
        <Inner>
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <Kicker tone="dark">Sample eLearning lessons</Kicker>
              <h2 id="lessons-heading" className="sx-focus mt-6 max-w-xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
                Play three short lessons, right here.
              </h2>
              <p className="mt-6 inline-flex items-start gap-3 rounded-2xl border border-chalk-yellow/40 bg-chalk-yellow/10 px-4 py-3 text-base font-semibold text-chalk">
                <MousePointerClick size={20} aria-hidden className="mt-0.5 shrink-0 text-chalk-yellow" />
                <span>This is live. Tap a lesson and play it on this page. Nothing opens in a new tab, and there is no sign-up.</span>
              </p>
              <ul className="mt-8 space-y-5">
                {LESSONS.map((l) => (
                  <li key={l.hash} className="border-l-2 border-chalk-yellow/50 pl-4">
                    <h3 className="font-playfair text-xl font-bold">{l.name}</h3>
                    <p className="mt-1 text-base leading-relaxed text-chalk/75">{l.line}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-8 max-w-md text-sm leading-relaxed text-chalk/60">
                Two minutes each, and each one has its own look. We build lessons like these in your tools: Storyline, Rise,
                Captivate, iSpring, Elucidat, H5P or Vyond, as SCORM or xAPI for any LMS.
              </p>
            </div>
            <LessonPlayer fallbackHref={SAMPLE_LESSONS.path} />
          </div>
        </Inner>
      </Scene>

      <Scene tone="cream" labelledBy="programs-heading" className="py-20 sm:py-24">
        <Inner>
          <Kicker tone="cream">Programs</Kicker>
          <h2 id="programs-heading" className="sx-focus mt-6 max-w-3xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            What we have run, and how it went.
          </h2>
          <div className="mt-10">
            <ProgramTiles programs={PROGRAMS} tone="cream" />
          </div>
        </Inner>
      </Scene>

      <Scene tone="dark" labelledBy="next">
        <Inner>
          <Kicker tone="dark">Your program</Kicker>
          <h2 id="next" className="sx-focus mt-8 max-w-3xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            Same method, built around your people.
          </h2>
          <div className="sx-rise mt-10 flex flex-wrap gap-x-8 gap-y-4">
            <Link href={STUDIO_PAGES.companies.path} className="inline-flex items-center gap-2 text-sm font-semibold text-chalk underline decoration-chalk-yellow/50 underline-offset-4 hover:decoration-chalk-yellow">
              Training for companies <ArrowRight size={15} aria-hidden />
            </Link>
            <Link href={STUDIO_PAGES.colleges.path} className="inline-flex items-center gap-2 text-sm font-semibold text-chalk underline decoration-chalk-yellow/50 underline-offset-4 hover:decoration-chalk-yellow">
              Programs for colleges <ArrowRight size={15} aria-hidden />
            </Link>
            <Link href={STUDIO_PAGES.customCourses.path} className="inline-flex items-center gap-2 text-sm font-semibold text-chalk underline decoration-chalk-yellow/50 underline-offset-4 hover:decoration-chalk-yellow">
              Custom eLearning courses <ArrowRight size={15} aria-hidden />
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
