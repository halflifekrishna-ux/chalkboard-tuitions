import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { STUDIO_PAGES, linkTo, studioAlternates, studioGraph, studioService, breadcrumbs } from "@/lib/studio";
import { Scene, Inner, Kicker, Statement, BigStat, Steps, TrackCard } from "@/components/marketing/learning-studio/Scene";
import { ProgrammeMarquee } from "@/components/marketing/learning-studio/ProgrammeMarquee";
import { StudioFaq, type Faq } from "@/components/marketing/learning-studio/StudioFaq";
import { StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * /learning-studio: the hub. Its job is to say what the Studio does in one
 * line, show the method behind it, and send each reader to their page.
 *
 * One idea per section, alternating dark and cream:
 *   hero → the question → how we work → who it's for → companies →
 *   proof → the draft-first rule → questions → enquiry.
 *
 * The interactive demos that used to live here (the prompt lesson, the course
 * build) belong on the pages they demonstrate. They were also most of this
 * page's main-thread time on a phone.
 */

const PAGE = STUDIO_PAGES.hub;

export const metadata: Metadata = {
  title: { absolute: "Custom Corporate Training Programs | Chalkboard Learning Studio" },
  description:
    "Training designed around what your people need to be able to do. AI at work, sales, support and leadership for companies. Placement and industry programs for colleges.",
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: "Custom training built around what your people need to be able to do",
    description:
      "AI at work, sales, support and leadership for companies. Placement and industry programs for colleges. A diagnosis first, then a design.",
    url: studioAlternates(PAGE.path).canonical,
    type: "website",
    siteName: "Chalkboard Learning Studio",
  },
};

/* Things a person might need to be able to do. Examples, not a catalogue. */
const ABILITIES = [
  "Write the first draft before opening AI",
  "Handle the second objection",
  "Close a ticket on first contact",
  "Query a database without help",
  "Give feedback that lands",
  "Explain a cash-flow statement to a client",
  "Push code a reviewer can follow",
  "Run a stand-up in ten minutes",
];

const STEPS = [
  {
    title: "Diagnose",
    body: "We talk to the people being trained and the people who manage them. Then we look at samples of their real work.",
  },
  {
    title: "Design",
    body: "You get an outline built around the gap we found. Nothing gets built until you approve it.",
  },
  {
    title: "Run",
    body: "On site in Bengaluru or live online. People practise on their own work and get feedback while they do it.",
  },
  {
    title: "Measure",
    body: "You see who finished and where people got stuck, so the next round starts from evidence.",
  },
];

/* What companies bring us. Capabilities: there's no client list here yet, and we don't pretend otherwise. */
const COMPANY_WORK = [
  {
    id: "ai-at-work",
    title: "AI at work",
    service: "AI training for teams",
    body: "Getting a usable result from AI without handing it the thinking.",
  },
  {
    id: "sales",
    title: "Sales",
    service: "Sales training",
    body: "Discovery that earns the second meeting. The call after a no.",
  },
  {
    id: "support",
    title: "Customer support",
    service: "Customer support training",
    body: "De-escalation and first-contact resolution, practised on real tickets.",
  },
  {
    id: "leadership",
    title: "How a team runs",
    service: "Team effectiveness and leadership training",
    body: "Feedback that lands, and decisions that still hold after the meeting.",
  },
  {
    id: "custom-courses",
    title: "Courses built for you",
    service: "Custom course development",
    body: "Your own material, built into practice people can work through on their own.",
  },
];

const HUB_FAQS: Faq[] = [
  {
    q: "What does Chalkboard Learning Studio do?",
    a: "We design and run training around a skill people need to use at work. For companies that means AI at work, sales, customer support and leadership. For colleges it means placement readiness and industry tracks. We also build courses from a client's own material.",
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

const hubSchema = studioGraph(
  ...COMPANY_WORK.map((w) =>
    studioService({ id: w.id, name: w.service, description: w.body, path: PAGE.path, serviceType: w.service, audience: "business" })
  ),
  breadcrumbs([PAGE])
);

export default function LearningStudioHub() {
  const ai = linkTo("aiTraining");
  const courses = linkTo("customCourses");
  const work = linkTo("work");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }} />
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      {/* ── Hero ── */}
      <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-board pb-20 pt-28 text-chalk sm:pt-32">
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
            Tell us what has to change at work or on campus. We find the gap and design the training around it.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="#enquire"
              className="inline-flex items-center gap-2 rounded-full bg-chalk-yellow px-6 py-3.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Start a conversation <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="#how" className="inline-flex items-center gap-2 text-sm font-semibold text-chalk/80 hover:text-chalk-yellow">
              How we work <ArrowDown size={15} aria-hidden />
            </Link>
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

      {/* ── Who it's for ── */}
      <Scene tone="cream" labelledBy="doors">
        <Inner>
          <Kicker tone="cream">Who we work with</Kicker>
          <h2 id="doors" className="sx-focus mt-8 font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            Pick the door that fits.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            <TrackCard
              tone="cream"
              href={ai.href}
              kicker="For companies"
              title="AI training that starts with a blank page"
              body="Learners write the draft themselves, then use AI to sharpen it. They keep the judgement and gain the speed."
              pills={["Generative AI", "Prompt writing", "AI-assisted work"]}
              cta={ai.live ? "AI training for teams" : "Ask us about AI training"}
            />
            <TrackCard
              tone="cream"
              href={STUDIO_PAGES.colleges.path}
              kicker="For colleges"
              title="Placement and industry tracks"
              body="Running now at East Point College of Management in Bengaluru, with 80 students across two programs."
              pills={["SQL", "Python", "Power BI", "FinTech"]}
              cta="Programs for colleges"
            />
            <TrackCard
              tone="cream"
              href={courses.href}
              kicker="For companies"
              title="Courses built from your material"
              body="A deck, an SOP or what one expert knows, turned into practice people can do on their own. We're opening this to our first partners now."
              pills={["Scenarios", "Simulations", "Learner reporting"]}
              cta={courses.live ? "Custom course development" : "Ask us about a custom course"}
            />
            <TrackCard
              tone="cream"
              href={STUDIO_PAGES.trainers.path}
              kicker="For trainers"
              title="Teach with us"
              body="Subject experts, facilitators and course designers who want to teach this way."
              cta="Train with us"
            />
          </div>
        </Inner>
      </Scene>

      {/* ── Companies ── */}
      <Scene tone="dark" labelledBy="companies">
        <Inner>
          <Kicker tone="dark">Training for companies</Kicker>
          <h2 id="companies" className="sx-focus mt-8 max-w-3xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            Teams get stuck in the same places.
          </h2>
          <ul className="mt-14 border-t border-chalk/15">
            {COMPANY_WORK.map((w, i) => (
              <li key={w.id} className="sx-rise grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-2 border-b border-chalk/15 py-7 sm:grid-cols-[4rem_14rem_1fr] sm:items-baseline sm:gap-x-8">
                <span className="font-playfair text-xl text-chalk-yellow">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-playfair text-xl font-bold sm:text-2xl">{w.title}</h3>
                <p className="col-start-2 text-base leading-relaxed text-chalk/70 sm:col-start-3 sm:text-lg">{w.body}</p>
              </li>
            ))}
          </ul>
        </Inner>
      </Scene>

      {/* ── Proof ── */}
      <Scene tone="cream" labelledBy="proof">
        <Inner>
          <Kicker tone="cream">Running now</Kicker>
          <h2 id="proof" className="sr-only">
            Programs running at East Point College of Management
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
            <BigStat
              tone="cream"
              value="0"
              label="sessions missed"
              source="Across two live programs and 80 students at East Point College of Management, Bengaluru. Both programs continue into the next semester."
            />
            <div className="sx-rise">
              <h3 className="font-playfair text-2xl font-bold sm:text-3xl">When a trainer left mid-program</h3>
              <p className="mt-4 text-lg leading-relaxed text-ink/80">
                We rebuilt the curriculum around the trainer who stayed. The timetable held and no session was dropped.
              </p>
              <blockquote className="mt-10 border-l-2 border-gold-deep/60 pl-5">
                <p className="font-playfair text-xl italic leading-snug sm:text-2xl">
                  &ldquo;Nobody in Bangalore is doing interactive training like this, or going this deep on AI with students.&rdquo;
                </p>
                <footer className="mt-3 text-sm text-sage-deep">Faculty, East Point College of Management</footer>
              </blockquote>
              <Link
                href={work.live ? work.href : STUDIO_PAGES.colleges.path}
                className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-board underline decoration-gold-deep/50 underline-offset-4 hover:decoration-gold-deep"
              >
                {work.live ? "Read the East Point case study" : "See the college programs"} <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
          </div>
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
            href={ai.href}
            className="sx-rise mt-10 inline-flex items-center gap-2 text-sm font-semibold text-chalk-yellow underline decoration-chalk-yellow/40 underline-offset-4 hover:decoration-chalk-yellow"
          >
            {ai.live ? "How we teach AI" : "Ask us about AI training"} <ArrowRight size={15} aria-hidden />
          </Link>
        </Inner>
      </Scene>

      <StudioFaq faqs={HUB_FAQS} />

      <StudioEnquire
        title={
          <>
            What should your people be able to do next quarter?
          </>
        }
        line="Tell us who it's for and what needs to change. We reply by email with a proposed outline and what it costs."
        defaultAudience="Corporate team"
        elsewhere={["colleges", "trainers"]}
      />
    </>
  );
}
