import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { STUDIO_PAGES, studioAlternates, studioGraph, studioService, breadcrumbs } from "@/lib/studio";
import { programsFor, FIRST_YEAR } from "@/lib/portfolio";
import { ProgramGrid } from "@/components/marketing/learning-studio/Portfolio";
import { Scene, Inner, Kicker, Statement, BigStat, Steps } from "@/components/marketing/learning-studio/Scene";
import { TransformBoring } from "@/components/marketing/learning-studio/TransformBoring";
import { StudioFaq, type Faq } from "@/components/marketing/learning-studio/StudioFaq";
import { StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * /learning-studio/colleges: for a placement officer, a dean or a training
 * and placement cell.
 *
 * Search target: "campus recruitment training for colleges" and "training
 * partner for colleges". The audit found "placement training … Bangalore" is a
 * students' search (institutes selling to individuals), so the page speaks to
 * the college buying for its students.
 *
 * Proof comes from src/lib/portfolio.ts: every college program we've run,
 * each with its own results. Only tracks we've taught are listed. Faculty
 * development is not an offer, so it isn't here.
 */

const PAGE = STUDIO_PAGES.colleges;

export const metadata: Metadata = {
  title: { absolute: "Campus Recruitment Training for Colleges | Chalkboard Learning Studio" },
  description:
    "Placement readiness and industry tracks run as practice: SQL, Python, Excel, Power BI, cybersecurity and FinTech. Six college programs since 2023, every one measured.",
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: "Placement and industry training for colleges, run as practice",
    description: "Six college programs since 2023: placement accelerators, Advanced Excel, cybersecurity and FinTech. 97% rated our Excel program 4 or 5 out of 5.",
    url: studioAlternates(PAGE.path).canonical,
    type: "website",
    siteName: "Chalkboard Learning Studio",
  },
};

const STRANDS = [
  {
    id: "placement-readiness",
    service: "Campus recruitment training",
    body: "Preparation for placement drives, run as practice with feedback on every attempt.",
  },
  {
    id: "industry-tracks",
    service: "Industry tracks for students",
    body: "Applied tracks alongside the degree: SQL, Python, Git and GitHub, Excel, Power BI, cybersecurity and FinTech.",
  },
];

const COLLEGE_PROGRAMS = programsFor("college");

const STEPS = [
  {
    title: "Scope it with your placement cell",
    body: "Which students, which roles your recruiters hire for, and what they can't yet do in an interview.",
  },
  {
    title: "Fit it to the semester",
    body: "Sessions planned around exams and placement season, alongside the degree rather than on top of it.",
  },
  {
    title: "Run it on campus",
    body: "Students practise on real tasks and get feedback on every attempt. Trainers plan as one team, so a change of trainer doesn't cost a session.",
  },
  {
    title: "Report back",
    body: "Attendance and progress for every student, so the college sees where each one stands before the drive.",
  },
];

const COLLEGE_FAQS: Faq[] = [
  {
    q: "What does Chalkboard Learning Studio run for colleges?",
    a: "Campus recruitment training and applied industry tracks. We've run programs in SQL, Python, Git and GitHub, Excel, Power BI, cybersecurity and FinTech. Each program is scoped to your students and the roles they're applying for.",
  },
  {
    q: "What is campus recruitment training?",
    a: "Training that prepares final-year students for placement drives and the rounds recruiters run. Ours is built as practice: students attempt the task, get feedback and try again, so the skill is there on the day.",
  },
  {
    q: "How is it set up with the college?",
    a: "Usually through an MOU with the college, which is how our current placement programs run. Shorter skill programs can also run as a single engagement.",
  },
  {
    q: "Will it clash with our academic calendar?",
    a: "No. We plan around your semester, exams and placement season, and our programs run alongside the degree.",
  },
  {
    q: "Do you train on campus?",
    a: "Yes, on campus in Bengaluru. For colleges elsewhere, ask us about live online delivery.",
  },
  {
    q: "How does it start?",
    a: "A conversation with your placement or training cell about the students, the timeline and the outcome you need. We come back with a proposed program and what it costs.",
  },
];

const collegeSchema = studioGraph(
  ...STRANDS.map((s) =>
    studioService({ id: s.id, name: s.service, description: s.body, path: PAGE.path, serviceType: s.service, audience: "college" })
  ),
  breadcrumbs([STUDIO_PAGES.hub, PAGE])
);

export default function CollegesPage() {

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collegeSchema) }} />
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      {/* ── Hero ── */}
      <section className="relative flex min-h-[88svh] items-center overflow-hidden bg-board pb-20 pt-28 text-chalk sm:pt-32">
        <div aria-hidden className="grid-dots pointer-events-none" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse 50% 45% at 80% 35%, rgba(244,196,48,0.10), transparent 70%)" }}
        />
        <Inner className="relative">
          <Kicker tone="dark">For colleges and universities</Kicker>
          <h1 className="mt-7 max-w-5xl break-words font-playfair font-bold leading-[1.03] tracking-tight text-[clamp(2.5rem,8.4vw,5.75rem)]">
            Placement and industry training, built so students can <span className="font-playfair text-chalk-yellow">do the work.</span>
          </h1>
          <span aria-hidden className="sx-hero-line mt-9 block h-px w-full max-w-md bg-gradient-to-r from-chalk-yellow/80 to-transparent" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-chalk/75 sm:text-xl">
            Your students know the syllabus. Recruiters ask them to use it. We run campus recruitment training and industry
            tracks as practice, inside your semester.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="#enquire"
              className="inline-flex items-center gap-2 rounded-full bg-chalk-yellow px-6 py-3.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Talk to us about your students <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="#programs" className="inline-flex items-center gap-2 text-sm font-semibold text-chalk/80 hover:text-chalk-yellow">
              Programs we&rsquo;ve run <ArrowDown size={15} aria-hidden />
            </Link>
          </div>
        </Inner>
      </section>

      {/* ── The gap ── */}
      <Scene tone="cream" labelledBy="gap">
        <Inner>
          <Kicker tone="cream">The gap</Kicker>
          <Statement id="gap" className="mt-8">
            Knowing the answer and saying it in the interview are <span className="font-playfair text-gold-deep">two different skills.</span>
          </Statement>
          <p className="sx-rise mt-8 max-w-xl text-lg leading-relaxed text-ink/80">
            Lectures build the first one. Only practice builds the second. Try one chapter the way your students would.
          </p>
        </Inner>
      </Scene>

      <TransformBoring eyebrow="Try it as a student" title="The communication chapter, rebuilt as something you do." />

      {/* ── Programs running now ── */}
      <Scene tone="cream" id="programs" labelledBy="programs-heading">
        <Inner>
          <Kicker tone="cream">Programs we&rsquo;ve run</Kicker>
          <h2 id="programs-heading" className="sx-focus mt-8 max-w-3xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            {COLLEGE_PROGRAMS.length} college programs since {FIRST_YEAR}.
          </h2>
          <div className="mt-12">
            <ProgramGrid programs={COLLEGE_PROGRAMS} tone="cream" />
          </div>
          <p className="sx-rise mt-8 max-w-xl text-base leading-relaxed text-ink/80">
            Building something different for your students? Tracks are designed around the roles your recruiters hire for.
          </p>
        </Inner>
      </Scene>

      {/* ── Proof ── */}
      <Scene tone="dark" labelledBy="proof">
        <Inner>
          <Kicker tone="dark">What happened</Kicker>
          <h2 id="proof" className="sr-only">
            How our college programs run
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
            <BigStat
              tone="dark"
              value="0"
              label="sessions missed"
              source="Across the 2026 placement and industry programs, 80 students in all. Both continue into the next semester."
            />
            <div className="sx-rise">
              <h3 className="font-playfair text-2xl font-bold sm:text-3xl">A trainer left mid-program</h3>
              <p className="mt-4 text-lg leading-relaxed text-chalk/75">
                We rebuilt the curriculum around the trainer who stayed. The timetable held, and students didn&rsquo;t lose a
                single session.
              </p>
              <blockquote className="mt-10 border-l-2 border-chalk-yellow/60 pl-5">
                <p className="font-playfair text-xl leading-snug sm:text-2xl">
                  &ldquo;Nobody in Bangalore is doing interactive training like this, or going this deep on AI with students.&rdquo;
                </p>
                <footer className="mt-3 text-sm text-chalk/70">Faculty, East Point College of Management</footer>
              </blockquote>
              <Link
                href={STUDIO_PAGES.work.path}
                className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-chalk-yellow underline decoration-chalk-yellow/40 underline-offset-4 hover:decoration-chalk-yellow"
              >
                See every program and its results <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
          </div>
        </Inner>
      </Scene>

      {/* ── Draft first, with students ── */}
      <Scene tone="cream" labelledBy="ai-rule">
        <Inner>
          <Kicker tone="cream">AI, taught properly</Kicker>
          <Statement id="ai-rule" className="mt-8">
            Students write the resume first. <span className="font-playfair text-gold-deep">AI comes second.</span>
          </Statement>
          <p className="sx-rise mt-8 max-w-xl text-lg leading-relaxed text-ink/80">
            The same goes for a pitch or a block of code. A student who drafted it can tell when AI makes it worse, and
            that&rsquo;s what an interviewer is testing for.
          </p>
          <Link
            href={STUDIO_PAGES.aiTraining.path}
            className="sx-rise mt-8 inline-flex items-center gap-2 text-sm font-semibold text-board underline decoration-gold-deep/50 underline-offset-4 hover:decoration-gold-deep"
          >
            How we teach AI <ArrowRight size={15} aria-hidden />
          </Link>
        </Inner>
      </Scene>

      {/* ── How it runs ── */}
      <Scene tone="dark" labelledBy="how">
        <Inner>
          <Kicker tone="dark">How a college program runs</Kicker>
          <Statement id="how" className="mt-8">
            Planned with your placement cell. Run on your campus.
          </Statement>
          <Steps steps={STEPS} tone="dark" />
        </Inner>
      </Scene>

      <StudioFaq faqs={COLLEGE_FAQS} />

      <StudioEnquire
        title={<>Placement season coming up?</>}
        line="Tell us about your students, your timeline and what needs to change. We reply by email with a proposed program and what it costs."
        defaultAudience="College / institution"
        elsewhere={["companies", "trainers"]}
      />
    </>
  );
}
