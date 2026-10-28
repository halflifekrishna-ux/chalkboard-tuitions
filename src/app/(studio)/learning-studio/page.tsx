import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { STUDIO_PAGES, studioAlternates, studioGraph, studioService, breadcrumbs } from "@/lib/studio";
import { Reveal } from "@/components/marketing/Reveal";
import { CourseBuild } from "@/components/marketing/learning-studio/CourseBuild";
import { PromptLessonCard } from "@/components/marketing/learning-studio/PromptLesson";
import { StudioFaq } from "@/components/marketing/learning-studio/StudioFaq";
import { Eyebrow, StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * /learning-studio — the companies page. One reader (whoever owns learning and
 * development at a company), one purpose (get them to send a brief), and four
 * parts, each earning the next:
 *
 *   1. Hook   — the hero *is* a lesson: the visitor learns to write a better
 *               AI prompt in under a minute, so the claim is proved before
 *               it is made.
 *   2. Show   — CourseBuild: raw material in, finished course out, told in
 *               pictures while they scroll.
 *   3. Offer  — what we train, and how it is delivered.
 *   4. Act    — the questions buyers ask, then the brief form.
 *
 * Colleges and trainers have their own pages (/learning-studio/colleges,
 * /learning-studio/trainers). Anything that doesn't serve this arc belongs
 * there, not here.
 */

const PAGE = STUDIO_PAGES.hub;

export const metadata: Metadata = {
  title: { absolute: "Corporate Training in Bengaluru | Chalkboard Learning Studio" },
  description:
    "Interactive corporate training in Bengaluru: AI training, sales, customer support and leadership workshops, plus custom courses built from your material.",
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: "Corporate training your team learns by doing",
    description:
      "AI, sales, support and leadership training in Bengaluru — and custom courses built from your own material. Try a 60-second lesson on the page.",
    url: studioAlternates(PAGE.path).canonical,
    type: "website",
    siteName: "Chalkboard Learning Studio",
  },
};

/* The things teams actually call us about. Outcome first, not topic first. */
const PRACTICES = [
  {
    n: "01",
    id: "ai-training",
    title: "AI at work",
    service: "AI and prompt-writing training",
    body: "AI training that gets your team a usable first draft — for the emails, reports and analysis your team already writes. The lesson at the top of this page is a slice of it.",
  },
  {
    n: "02",
    id: "sales-training",
    title: "Sales teams",
    service: "Sales performance training",
    body: "Discovery that earns the second meeting, objection handling, and the call after the no.",
  },
  {
    n: "03",
    id: "support-training",
    title: "Customer support",
    service: "Customer support training",
    body: "De-escalation, first-contact resolution, and the tone that keeps a customer through a bad day.",
  },
  {
    n: "04",
    id: "leadership-training",
    title: "How a team runs",
    service: "Team effectiveness and leadership programmes",
    body: "Handoffs, feedback that lands, and decisions that survive the meeting they were made in.",
  },
  {
    n: "05",
    id: "custom-courses",
    title: "Courses built for you",
    service: "Custom course design and build",
    body: "Your own material — a deck, an SOP, one expert’s head — storyboarded, then built as scenarios, simulations and practice.",
  },
];

const studioSchema = studioGraph(
  ...PRACTICES.map((p) =>
    studioService({
      id: p.id,
      name: p.service,
      description: p.body,
      path: PAGE.path,
      serviceType: p.service,
      audience: "business",
    })
  ),
  breadcrumbs([PAGE])
);

/* Facts we can stand behind, not invented headline numbers. */
const HOW = [
  { k: "In person or online", v: "Workshops across Bengaluru, live online for distributed teams, self-paced when people need it." },
  { k: "Storyboard first", v: "You approve the flow before a single screen is built — no surprises at the end." },
  { k: "Running in colleges now", v: "Two programmes live at East Point College of Management in Bengaluru. 80 students, no session missed." },
];

export default function LearningStudioPage() {
  return (
    <div className="bg-board-deep">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(studioSchema) }} />
      {/* If JS never runs, reveal everything rather than leaving it transparent. */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      {/* ── 1 · Hook — the hero is the lesson ── */}
      <section className="relative overflow-hidden bg-board-deep pb-20 pt-28 text-chalk sm:pb-24 sm:pt-32 lg:flex lg:min-h-[100svh] lg:items-center">
        <div aria-hidden className="grid-dots pointer-events-none" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 40%, rgba(244,196,48,0.08), transparent 70%)" }}
        />
        <Container className="relative z-10 w-full">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-5">
              <h1 className="break-words font-playfair font-black leading-[1.04] tracking-tight text-[clamp(2.25rem,6.2vw,4.25rem)]">
                Corporate training
                <br />
                <span className="italic text-chalk-yellow">people learn by doing.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-chalk/70">
                We design and run interactive training for teams in Bengaluru and online — AI, sales, customer
                support and leadership — and turn your own material into custom courses.
              </p>
              <p className="mt-4 max-w-md text-base font-semibold text-chalk">
                Don&rsquo;t take our word for it. Take the 60-second lesson
                <span className="hidden lg:inline"> on the right</span>
                <span className="lg:hidden"> below</span>.
              </p>
              <p className="mt-8 text-sm text-chalk/55">
                Not a company?{" "}
                <Link href="/learning-studio/colleges" className="whitespace-nowrap font-semibold text-chalk/70 underline decoration-chalk/25 underline-offset-4 hover:text-chalk-yellow">
                  Colleges &amp; universities
                </Link>
                {" · "}
                <Link href="/tuitions" className="whitespace-nowrap font-semibold text-chalk/70 underline decoration-chalk/25 underline-offset-4 hover:text-chalk-yellow">
                  School tuitions
                </Link>
              </p>
            </div>
            <div className="min-w-0 lg:col-span-7">
              <PromptLessonCard className="ring-1 ring-chalk-yellow/20" />
            </div>
          </div>
        </Container>
        <a
          href="#course-building"
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-chalk/55 hover:text-chalk lg:flex"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">How we build it</span>
          <ArrowDown size={16} className="animate-bounce" />
        </a>
      </section>

      {/* ── 2 · Show — raw material in, finished course out ── */}
      <CourseBuild />

      {/* ── 3 · Offer — what we train ── */}
      <section className="relative overflow-hidden bg-cream-bg py-20 text-board sm:py-28">
        <Container className="relative">
          <Reveal>
            <Eyebrow label="What We Train" />
            <h2 className="mt-5 max-w-2xl break-words font-playfair text-[clamp(1.75rem,4.8vw,3rem)] font-bold leading-[1.12] tracking-tight text-board">
              Teams don&rsquo;t need a course.
              <br />
              They need to get better at the hard part.
            </h2>
          </Reveal>

          <div className="mt-14 divide-y divide-board/10 border-t border-board/10">
            {PRACTICES.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="grid grid-cols-[3rem_1fr] gap-4 py-6 sm:grid-cols-[5rem_1fr_2fr] sm:items-baseline sm:gap-8 sm:py-8">
                  <span className="font-playfair text-2xl font-black text-gold-deep sm:text-3xl">{s.n}</span>
                  <h3 className="font-playfair text-lg font-bold text-board sm:text-xl">{s.title}</h3>
                  <p className="col-start-2 min-w-0 text-sm leading-relaxed text-gray-600 sm:col-start-3 sm:text-base">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <dl className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {HOW.map((h) => (
                <div key={h.k} className="min-w-0 border-t-2 border-gold/60 pt-4">
                  <dt className="font-playfair text-lg font-bold text-board">{h.k}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-gray-600">{h.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      {/* ── 4 · Act — the questions, then the brief ── */}
      <StudioFaq />

      <StudioEnquire
        title={
          <>
            Have a team that
            <br />
            needs to get better?
          </>
        }
        line="Tell us who the training is for and what needs to change. We reply by email with a proposed shape, timeline and cost."
        defaultAudience="Corporate team"
        elsewhere={["colleges", "trainers", "tuitions"]}
      />
    </div>
  );
}
