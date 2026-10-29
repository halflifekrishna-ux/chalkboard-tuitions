import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { STUDIO_PAGES, studioAlternates, studioGraph, breadcrumbs } from "@/lib/studio";
import { PROGRAMS, FIRST_YEAR } from "@/lib/portfolio";
import { Scene, Inner, Kicker, Statement, Steps, Pills } from "@/components/marketing/learning-studio/Scene";
import { ProgramGrid, StatBand } from "@/components/marketing/learning-studio/Portfolio";
import { ProgrammeMarquee } from "@/components/marketing/learning-studio/ProgrammeMarquee";
import { StudioFaq, type Faq } from "@/components/marketing/learning-studio/StudioFaq";
import { StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * /learning-studio: the hub. One line, then the split straight away:
 * companies go one way, colleges the other. After that, the method, the
 * record (the portfolio) and the draft-first rule.
 *
 * Company detail lives on /companies, college detail on /colleges. The hub
 * targets the brand and the broad "training for companies and colleges"
 * query so it doesn't compete with either.
 */

const PAGE = STUDIO_PAGES.hub;
const COUNT = PROGRAMS.length;

export const metadata: Metadata = {
  title: { absolute: "Chalkboard Learning Studio | Training for Companies and Colleges" },
  description: `Custom training built around what your people need to be able to do. Corporate training in AI, sales, support and leadership, and placement programs for colleges. ${COUNT} programs since ${FIRST_YEAR}.`,
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: "Custom training built around what your people need to be able to do",
    description: `Corporate training and college placement programs. ${COUNT} programs since ${FIRST_YEAR}, every one measured.`,
    url: studioAlternates(PAGE.path).canonical,
    type: "website",
    siteName: "Chalkboard Learning Studio",
  },
};

const ABILITIES = [
  "Write the first draft before opening AI",
  "Handle the second objection",
  "Close a ticket on first contact",
  "Query a database without help",
  "Give feedback that lands",
  "Clean a messy dataset in Excel",
  "Push code a reviewer can follow",
  "Spot a phishing email before clicking",
];

const STEPS = [
  { title: "Diagnose", body: "We talk to the people being trained and the people who manage them. Then we look at samples of their real work." },
  { title: "Design", body: "You get an outline built around the gap we found. Nothing gets built until you approve it." },
  { title: "Run", body: "On site in Bengaluru or live online. People practise on their own work and get feedback while they do it." },
  { title: "Measure", body: "Every program ends with feedback from every learner, so the next round starts from evidence." },
];

const DOORS = [
  {
    href: STUDIO_PAGES.companies.path,
    kicker: "For companies",
    title: "Training for your team",
    body: "AI at work, sales, customer support and leadership. Courses built from your own material.",
    pills: ["AI at work", "Sales", "Support", "Leadership", "Custom courses"],
    cta: "Training for companies",
  },
  {
    href: STUDIO_PAGES.colleges.path,
    kicker: "For colleges",
    title: "Programs for your students",
    body: "Placement readiness and industry tracks, run on campus alongside the degree.",
    pills: ["Placement readiness", "SQL & Python", "Excel & Power BI", "Cybersecurity", "FinTech"],
    cta: "Programs for colleges",
  },
];

const HUB_FAQS: Faq[] = [
  {
    q: "What does Chalkboard Learning Studio do?",
    a: "We design and run training around a skill people need to use. For companies that means AI at work, sales, customer support and leadership, plus courses built from their own material. For colleges it means placement readiness and industry tracks such as SQL, Python, Excel, Power BI, cybersecurity and FinTech.",
  },
  {
    q: "Do you have a course catalogue?",
    a: "No. Every program starts from what your people need to be able to do, and we design from there. Two teams that both ask for AI training usually need different things.",
  },
  {
    q: "Where do you run training?",
    a: "On site in Bengaluru, and live online. Self-paced material can sit alongside either.",
  },
  {
    q: "How does it start?",
    a: "A short call about the outcome you need and who it's for. We reply with a proposed outline and what it costs before anything is built.",
  },
  {
    q: "Where is the Studio based?",
    a: "Bengaluru, India. Chalkboard Learning Studio is part of Chalkboard Learning Services LLP.",
  },
];

const hubSchema = studioGraph(breadcrumbs([PAGE]));

export default function LearningStudioHub() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }} />
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-board pb-16 pt-28 text-chalk sm:pb-20 sm:pt-36">
        <div aria-hidden className="grid-dots pointer-events-none" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse 55% 45% at 85% 30%, rgba(244,196,48,0.10), transparent 70%)" }}
        />
        <Inner className="relative">
          <Kicker tone="dark">Chalkboard Learning Studio</Kicker>
          <h1 className="mt-7 max-w-5xl break-words font-playfair font-bold leading-[1.03] tracking-tight text-[clamp(2.6rem,9vw,6.25rem)]">
            Custom training built around what your people need to be <span className="font-playfair text-chalk-yellow">able to do.</span>
          </h1>
          <span aria-hidden className="sx-hero-line mt-9 block h-px w-full max-w-md bg-gradient-to-r from-chalk-yellow/80 to-transparent" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-chalk/75 sm:text-xl">
            {COUNT} programs since {FIRST_YEAR}, every one measured. Tell us who you&rsquo;re training.
          </p>

          {/* The split, straight away: two buyers, two doors. */}
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {DOORS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group flex flex-col rounded-2xl border border-chalk/15 bg-white/[0.04] p-6 transition-colors hover:border-chalk-yellow/60 hover:bg-white/[0.06] sm:p-8"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-chalk-yellow">{d.kicker}</span>
                <span className="mt-4 font-playfair text-[clamp(1.6rem,4vw,2.25rem)] font-bold leading-tight">{d.title}</span>
                <span className="mt-3 text-base leading-relaxed text-chalk/75">{d.body}</span>
                <span className="mt-5">
                  <Pills tone="dark" items={d.pills} />
                </span>
                <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-chalk">
                  {d.cta}
                  <ArrowUpRight size={16} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </Inner>
      </section>

      {/* ── The question ── */}
      <Scene tone="cream" labelledBy="question">
        <Inner>
          <Kicker tone="cream">Where every program starts</Kicker>
          <Statement id="question" className="mt-8">
            What do your people need to be <span className="font-playfair text-gold-deep">able to do?</span>
          </Statement>
          <p className="sx-rise mt-8 max-w-xl text-lg leading-relaxed text-ink/80">
            That question comes before any topic or format. The answer decides what we build and how long it runs.
          </p>
        </Inner>
        <div className="sx-rise mt-16 space-y-3">
          <ProgrammeMarquee items={ABILITIES.slice(0, 4)} tone="cream" durationClass="marquee-duration-slow" />
          <ProgrammeMarquee items={ABILITIES.slice(4)} tone="cream" direction="right" durationClass="marquee-duration-slow" />
        </div>
      </Scene>

      {/* ── How we work ── */}
      <Scene tone="dark" id="how" labelledBy="how-heading">
        <Inner>
          <Kicker tone="dark">How we work</Kicker>
          <Statement id="how-heading" className="mt-8">
            A diagnosis first.
            <br />
            Then a design.
          </Statement>
          <Steps steps={STEPS} tone="dark" />
        </Inner>
      </Scene>

      {/* ── Our record ── */}
      <Scene tone="cream" labelledBy="record">
        <Inner>
          <Kicker tone="cream">Our record</Kicker>
          <h2 id="record" className="sx-focus mt-8 max-w-4xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            {COUNT} programs since {FIRST_YEAR}. Every one measured.
          </h2>
          <div className="mt-12">
            <StatBand tone="cream" />
          </div>
          <div className="mt-16">
            <ProgramGrid programs={PROGRAMS.slice(0, 3)} tone="cream" />
          </div>
          <blockquote className="sx-focus mt-16 max-w-4xl border-l-2 border-gold-deep/60 pl-6">
            <p className="font-playfair text-[clamp(1.5rem,3.6vw,2.4rem)] leading-[1.2]">
              &ldquo;Nobody in Bangalore is doing interactive training like this, or going this deep on AI with students.&rdquo;
            </p>
            <footer className="mt-4 text-sm text-sage-deep">Faculty, East Point College of Management</footer>
          </blockquote>
          <Link
            href={STUDIO_PAGES.work.path}
            className="sx-rise mt-12 inline-flex items-center gap-2 text-sm font-semibold text-board underline decoration-gold-deep/50 underline-offset-4 hover:decoration-gold-deep"
          >
            See all {COUNT} programs <ArrowRight size={15} aria-hidden />
          </Link>
        </Inner>
      </Scene>

      {/* ── The draft-first rule ── */}
      <Scene tone="dark" labelledBy="rule">
        <Inner>
          <Kicker tone="dark">The rule we teach by</Kicker>
          <Statement id="rule" className="mt-8">
            Write it first.
            <br />
            <span className="font-playfair text-chalk-yellow">Then</span> let AI make it better.
          </Statement>
          <p className="sx-rise mt-8 max-w-xl text-lg leading-relaxed text-chalk/75">
            A resume or a sales pitch: the learner drafts it, then uses AI to refine it. Skip the draft and you never learn
            what good looks like.
          </p>
          <Link
            href={STUDIO_PAGES.aiTraining.path}
            className="sx-rise mt-10 inline-flex items-center gap-2 text-sm font-semibold text-chalk-yellow underline decoration-chalk-yellow/40 underline-offset-4 hover:decoration-chalk-yellow"
          >
            How we teach AI <ArrowRight size={15} aria-hidden />
          </Link>
        </Inner>
      </Scene>

      <StudioFaq faqs={HUB_FAQS} />

      <StudioEnquire
        title={<>What should your people be able to do next quarter?</>}
        line="Tell us who it's for and what needs to change. We reply by email with a proposed outline and what it costs."
        defaultAudience="Corporate team"
        elsewhere={["companies", "colleges", "trainers"]}
      />
    </>
  );
}

