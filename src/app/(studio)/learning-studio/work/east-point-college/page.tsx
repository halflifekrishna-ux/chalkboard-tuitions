import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { STUDIO_PAGES, STUDIO_ID, studioAlternates, studioGraph, breadcrumbs } from "@/lib/studio";
import { Scene, Inner, Kicker, Statement, BigStat, TrackCard } from "@/components/marketing/learning-studio/Scene";
import { StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * The East Point case study. Every fact on this page comes from the brief the
 * college work was cleared under: two MOU programs, 80 students across both
 * cohorts, no session missed, both extending into the next semester, the
 * trainer who left mid-program, and one faculty quote cleared for the web.
 *
 * What isn't here on purpose: dates, trainer names, placement numbers and the
 * college's own goals. Add them when they're confirmed, not before.
 */

const PAGE = STUDIO_PAGES.eastPoint;
const URL = studioAlternates(PAGE.path).canonical;

export const metadata: Metadata = {
  title: { absolute: "East Point College Case Study: 80 Students, 0 Sessions Missed | Chalkboard Learning Studio" },
  description:
    "How Chalkboard Learning Studio runs two MOU programs at East Point College of Management, Bengaluru: a BCA Placement Accelerator and a B.Com Industry Accelerator.",
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: "East Point College: two programs, 80 students, no session missed",
    description: "A BCA Placement Accelerator and a B.Com Industry Accelerator, run under MOU at East Point College of Management, Bengaluru.",
    url: URL,
    type: "article",
    siteName: "Chalkboard Learning Studio",
  },
};

const PROGRAMS = [
  {
    id: "bca-placement-accelerator",
    title: "BCA Placement Accelerator",
    body: "For BCA students heading into technical placement rounds. The tools employers test, learned hands-on alongside the degree.",
    pills: ["SQL", "Python", "Git & GitHub", "Excel", "Power BI"],
  },
  {
    id: "bcom-industry-accelerator",
    title: "B.Com Industry Accelerator",
    body: "For B.Com students. A FinTech track, taught with a hired FinTech specialist, and a general branch.",
    pills: ["FinTech", "General branch"],
  },
];

const AT_A_GLANCE = [
  { value: "2", label: "live programs" },
  { value: "80", label: "students across both cohorts" },
  { value: "0", label: "sessions missed" },
  { value: "2 of 2", label: "programs continuing next semester" },
];

const schema = studioGraph(
  {
    "@type": "Article",
    "@id": `${URL}#article`,
    headline: "East Point College of Management: two programs, 80 students, no session missed",
    description: metadata.description,
    url: URL,
    datePublished: PAGE.updated,
    dateModified: PAGE.updated,
    image: `${URL}/opengraph-image`,
    author: { "@id": STUDIO_ID },
    publisher: { "@id": STUDIO_ID },
    about: { "@type": "CollegeOrUniversity", name: "East Point College of Management", address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" } },
    mainEntityOfPage: URL,
  },
  // The two programs are real courses with real students, so Course markup fits.
  ...PROGRAMS.map((p) => ({
    "@type": "Course",
    "@id": `${URL}#${p.id}`,
    name: p.title,
    description: `${p.body} Topics: ${p.pills.join(", ")}.`,
    provider: { "@id": STUDIO_ID },
    url: URL,
    inLanguage: "en",
    teaches: p.pills,
  })),
  breadcrumbs([STUDIO_PAGES.hub, STUDIO_PAGES.work, PAGE])
);

export default function EastPointCaseStudy() {
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
          <nav aria-label="Breadcrumb" className="text-sm text-chalk/70">
            <Link href={STUDIO_PAGES.work.path} className="underline decoration-chalk/30 underline-offset-4 hover:text-chalk-yellow">
              Our work
            </Link>
            <span aria-hidden> / </span>
            <span>East Point College of Management</span>
          </nav>
          <div className="mt-8">
            <Kicker tone="dark">Case study · Bengaluru</Kicker>
          </div>
          <h1 className="mt-7 max-w-5xl break-words font-playfair font-bold leading-[1.03] tracking-tight text-[clamp(2.5rem,8.4vw,5.75rem)]">
            Two programs. 80 students. <span className="font-playfair text-chalk-yellow">No session missed.</span>
          </h1>
          <span aria-hidden className="sx-hero-line mt-9 block h-px w-full max-w-md bg-gradient-to-r from-chalk-yellow/80 to-transparent" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-chalk/75 sm:text-xl">
            East Point College of Management in Bengaluru runs BCA and B.Com degrees. Under MOUs with the college, we run a
            program alongside each.
          </p>
        </Inner>
      </section>

      {/* ── At a glance ── */}
      <Scene tone="cream" labelledBy="glance">
        <Inner>
          <Kicker tone="cream">At a glance</Kicker>
          <h2 id="glance" className="sr-only">
            East Point programs at a glance
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {AT_A_GLANCE.map((s) => (
              <li key={s.label} className="sx-rise border-t border-board/20 pt-5">
                <p className="font-playfair text-[clamp(3rem,12vw,5.5rem)] font-black leading-none tracking-tight lining-nums text-board">
                  {s.value}
                </p>
                <p className="mt-3 text-base text-ink/80">{s.label}</p>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm text-sage-deep">Figures as of October 2026.</p>
        </Inner>
      </Scene>

      {/* ── The programs ── */}
      <Scene tone="dark" labelledBy="programs">
        <Inner>
          <Kicker tone="dark">What we run</Kicker>
          <h2 id="programs" className="sx-focus mt-8 max-w-3xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            One program for each degree.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {PROGRAMS.map((p) => (
              <TrackCard key={p.id} tone="dark" kicker="MOU program" title={p.title} body={p.body} pills={p.pills} />
            ))}
          </div>
          <p className="sx-rise mt-10 max-w-xl text-lg leading-relaxed text-chalk/75">
            Both are interactive. Students do the task, get feedback and try again. When AI comes in, they write the first
            draft themselves and use AI to refine it.
          </p>
        </Inner>
      </Scene>

      {/* ── What went wrong ── */}
      <Scene tone="cream" labelledBy="trainer">
        <Inner>
          <Kicker tone="cream">What went wrong</Kicker>
          <Statement id="trainer" className="mt-8">
            A trainer left in the middle of the program.
          </Statement>
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <p className="sx-rise text-lg leading-relaxed text-ink/80">
              The usual fix is to pause, hire and pick up where things stopped. A college can&rsquo;t afford that in the
              middle of a semester, and students don&rsquo;t get those weeks back.
            </p>
            <p className="sx-rise text-lg leading-relaxed text-ink/80">
              We redesigned the curriculum around the trainer who stayed, so the timetable the college had already published
              could hold. Students didn&rsquo;t lose a session.
            </p>
          </div>
        </Inner>
      </Scene>

      {/* ── The result ── */}
      <Scene tone="dark" labelledBy="result">
        <Inner>
          <Kicker tone="dark">Where it stands</Kicker>
          <h2 id="result" className="sr-only">
            Where the East Point programs stand
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-20">
            <BigStat
              tone="dark"
              value="0"
              label="sessions missed"
              source="Across both programs, including the weeks after the trainer left. Both programs continue into the next semester."
            />
            <blockquote className="sx-focus">
              <p className="font-playfair text-[clamp(1.7rem,4.4vw,2.9rem)] leading-[1.18]">
                &ldquo;Nobody in Bangalore is doing interactive training like this, or going this deep on AI with students.&rdquo;
              </p>
              <footer className="mt-6 text-base text-chalk/70">Faculty, East Point College of Management</footer>
            </blockquote>
          </div>
        </Inner>
      </Scene>

      {/* ── Next ── */}
      <Scene tone="cream" labelledBy="next">
        <Inner>
          <Kicker tone="cream">For your college</Kicker>
          <h2 id="next" className="sx-focus mt-8 max-w-3xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            The same build, fitted to your students.
          </h2>
          <div className="sx-rise mt-10 flex flex-wrap gap-x-8 gap-y-4">
            <Link
              href={STUDIO_PAGES.colleges.path}
              className="inline-flex items-center gap-2 text-sm font-semibold text-board underline decoration-gold-deep/50 underline-offset-4 hover:decoration-gold-deep"
            >
              Programs for colleges <ArrowRight size={15} aria-hidden />
            </Link>
            <Link
              href={STUDIO_PAGES.aiTraining.path}
              className="inline-flex items-center gap-2 text-sm font-semibold text-board underline decoration-gold-deep/50 underline-offset-4 hover:decoration-gold-deep"
            >
              How we teach AI <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </Inner>
      </Scene>

      <StudioEnquire
        title={<>Want this for your students?</>}
        line="Tell us about your students, your semester and what needs to change. We reply by email with a proposed program and what it costs."
        defaultAudience="College / institution"
        elsewhere={["companies", "colleges"]}
      />
    </>
  );
}

