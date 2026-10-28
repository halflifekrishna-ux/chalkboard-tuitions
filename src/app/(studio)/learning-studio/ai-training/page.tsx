import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { STUDIO_PAGES, studioAlternates, studioGraph, studioService, breadcrumbs } from "@/lib/studio";
import { Scene, Inner, Kicker, Statement, Pills, Steps } from "@/components/marketing/learning-studio/Scene";
import { PromptLessonLazy } from "@/components/marketing/learning-studio/PromptLessonLazy";
import { HeroDemo, NeuralField, WordReveal, RuleSequence, type RuleCard } from "@/components/marketing/learning-studio/AiMotion";
import { StudioFaq, type Faq } from "@/components/marketing/learning-studio/StudioFaq";
import { StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * /learning-studio/ai-training: the Studio's flagship page.
 *
 * "AI-first" never floats here as an adjective. It's tied to two things only:
 *   1. The draft-before-AI rule: learners write first, then use AI to refine.
 *   2. AI as the subject: generative AI, prompt writing and AI-assisted work
 *      taught as curriculum.
 * Nothing on this page claims we run our own operations on AI.
 *
 * Search target: AI training for (non-technical) teams, generative AI
 * workshops for employees. The rule is the angle nobody else in that SERP has.
 *
 * This is the Studio's showcase page, so it carries the richest motion: the
 * hero's draft-then-refine loop, the pinned rule sequence, words that light
 * up as you read, a glowing frame around the live lesson. All of it is CSS
 * (see AiMotion.tsx and studio.css), built for a phone first.
 */

const PAGE = STUDIO_PAGES.aiTraining;

export const metadata: Metadata = {
  title: { absolute: "AI Training for Non-Technical Teams | Chalkboard Learning Studio" },
  description:
    "Hands-on AI training where people write the first draft themselves, then use AI to refine it. Generative AI and prompt writing for teams, on site or live online.",
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: "AI training where your team writes the first draft",
    description: "Write it first, then let AI make it better. Generative AI, prompt writing and AI-assisted work, taught on your team's own work.",
    url: studioAlternates(PAGE.path).canonical,
    type: "website",
    siteName: "Chalkboard Learning Studio",
  },
};

/* The exercise, shown three ways. Illustrative copy, not a client's work. */
const DRAFTS: [RuleCard, RuleCard, RuleCard] = [
  {
    tag: "AI first",
    text: "Results-driven professional with strong analytical skills and a passion for leveraging data to drive impact.",
    note: "Fast, and it could describe anyone.",
    bad: true,
  },
  {
    tag: "Their own draft",
    text: "Made a Power BI dashboard for the college canteen that showed which items sold out by noon.",
    note: "Rough, and true to them.",
  },
  {
    tag: "Then refined with AI",
    text: "Built a Power BI dashboard of canteen sales by hour, showing which items sold out before noon and when to restock.",
    note: "Still theirs. Now it reads well.",
  },
];

const CURRICULUM = [
  {
    title: "Generative AI, plainly",
    body: "What the tools are good at, where they make things up, and what not to paste into them.",
  },
  {
    title: "Prompt writing",
    body: "Giving AI the audience, the context and the goal, so the answer has something to aim at.",
  },
  {
    title: "AI-assisted work",
    body: "Drafts, summaries, analysis and reviews in the tools your team already has access to.",
  },
  {
    title: "Checking the output",
    body: "Catching the confident mistake before it reaches a customer or a manager.",
  },
];

const FORMATS = [
  {
    title: "A workshop",
    body: "A focused session on one kind of work, such as client emails or weekly reports. On site in Bengaluru or live online.",
  },
  {
    title: "A program",
    body: "Sessions spread over several weeks, each built on the work your team did since the last one. Practice modules sit in between.",
  },
];

const AI_FAQS: Faq[] = [
  {
    q: "What is AI training for teams?",
    a: "Training that teaches people to use generative AI tools well in their own jobs: writing prompts, checking what comes back, and fitting AI into the work they already do. Ours is built around one rule: write the first draft yourself, then use AI to improve it.",
  },
  {
    q: "Why write the first draft without AI?",
    a: "Because the draft is where the thinking happens. People who start with AI get a fast, generic answer and can't tell when it's wrong. People who start with their own draft give AI something real to improve, and they keep the judgement.",
  },
  {
    q: "Who is it for?",
    a: "Mostly non-technical teams: sales, support, operations, HR, finance and managers. Engineering teams use the same rule with code: write it, then let AI review and refine it.",
  },
  {
    q: "Which AI tools do you teach?",
    a: "The ones your team is allowed to use. ChatGPT, Microsoft Copilot, Gemini and Claude all work with the same method, so we teach in your approved tool and on your own kind of work.",
  },
  {
    q: "Can it run online?",
    a: "Yes. Live online sessions follow the same structure as on-site ones in Bengaluru, with exercises on each person's own work.",
  },
  {
    q: "Do you teach AI to college students too?",
    a: "Yes. Our college programs teach the same draft-first rule with resumes, pitches and code.",
  },
];

const aiSchema = studioGraph(
  studioService({
    id: "ai-training",
    name: "AI training for teams",
    description:
      "Hands-on generative AI training for non-technical teams. Learners write the first draft themselves, then use AI to refine it. Covers generative AI basics, prompt writing, AI-assisted work and checking AI output.",
    path: PAGE.path,
    serviceType: "AI training",
    audience: "business",
  }),
  breadcrumbs([STUDIO_PAGES.hub, PAGE])
);

export default function AiTrainingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aiSchema) }} />
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
        <NeuralField className="absolute -right-24 top-16 w-[620px] max-w-none opacity-60 sm:-right-10 lg:right-0 lg:top-1/2 lg:w-[700px] lg:-translate-y-1/2 lg:opacity-70" />
        <Inner className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-7">
          <Kicker tone="dark">AI training for teams</Kicker>
          <h1 className="mt-7 max-w-5xl break-words font-playfair font-bold leading-[1.03] tracking-tight text-[clamp(2.5rem,8.6vw,5.25rem)]">
            AI training where your team writes the <span className="ai-shine font-playfair text-chalk-yellow">first draft.</span>
          </h1>
          <span aria-hidden className="sx-hero-line mt-9 block h-px w-full max-w-md bg-gradient-to-r from-chalk-yellow/80 to-transparent" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-chalk/75 sm:text-xl">
            Start with AI and you get a fast, average answer. Start with your own draft and AI has something worth
            improving.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="#enquire"
              className="inline-flex items-center gap-2 rounded-full bg-chalk-yellow px-6 py-3.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Plan a session for your team <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="#try" className="inline-flex items-center gap-2 text-sm font-semibold text-chalk/80 hover:text-chalk-yellow">
              Try a 60-second lesson <ArrowDown size={15} aria-hidden />
            </Link>
          </div>
          </div>
          <HeroDemo className="min-w-0 lg:col-span-5" />
        </Inner>
      </section>

      {/* ── The rule, played as you scroll ──
          A plain section (no overflow clipping) so the stage can pin. */}
      <section aria-labelledby="rule" className="relative bg-chalk pt-24 text-ink sm:pt-32">
        <Inner>
          <Kicker tone="cream">The rule</Kicker>
          <Statement id="rule" className="mt-8">
            The draft comes <span className="font-playfair text-gold-deep">before</span> the AI.
          </Statement>
          <RuleSequence
            cards={DRAFTS}
            intro="Here's the exercise with one line from a student's resume. Same skill, three ways to get there."
          />
          <p className="pb-24 pt-6 text-sm text-sage-deep sm:pb-32">An example of the exercise. Teams do it with their own emails, reports and code.</p>
        </Inner>
      </section>

      {/* ── Why it works ── */}
      <Scene tone="dark" labelledBy="why">
        <Inner>
          <Kicker tone="dark">Why draft first</Kicker>
          <WordReveal
            id="why"
            text="The thinking stays with the person. The speed comes from the tool."
            className="mt-8 max-w-4xl font-playfair text-[clamp(2.4rem,7vw,4.75rem)] font-bold leading-[1.06] tracking-tight"
          />
          <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
            <div className="sx-rise border-t border-chalk-yellow/40 pt-6">
              <h3 className="font-playfair text-2xl font-bold">They can tell when AI is wrong</h3>
              <p className="mt-3 text-lg leading-relaxed text-chalk/70">
                Someone who wrote the first version knows what they meant. They notice when the polished version quietly
                changes it.
              </p>
            </div>
            <div className="sx-rise border-t border-chalk-yellow/40 pt-6">
              <h3 className="font-playfair text-2xl font-bold">AI gets something real to work on</h3>
              <p className="mt-3 text-lg leading-relaxed text-chalk/70">
                A rough draft carries the facts, the customer and the point. Refining it takes one good prompt. Writing from
                nothing takes ten.
              </p>
            </div>
          </div>
        </Inner>
      </Scene>

      {/* ── What we teach ── */}
      <Scene tone="cream" labelledBy="curriculum">
        <Inner>
          <Kicker tone="cream">What we teach</Kicker>
          <h2 id="curriculum" className="sx-focus mt-8 max-w-3xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            AI is the subject, taught on your team&rsquo;s own work.
          </h2>
          <Steps steps={CURRICULUM} tone="cream" />
          <div className="sx-rise mt-14 max-w-2xl">
            <p className="text-sm font-semibold text-ink">Built for the role in front of us</p>
            <div className="mt-4">
              <Pills tone="cream" items={["Sales", "Customer support", "Operations", "HR", "Finance", "Managers", "Engineering"]} />
            </div>
          </div>
        </Inner>
      </Scene>

      {/* ── Try it ── */}
      <Scene tone="dark" id="try" labelledBy="try-heading">
        <Inner className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <Kicker tone="dark">Try it</Kicker>
            <h2 id="try-heading" className="sx-focus mt-8 font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
              Sixty seconds. One better prompt.
            </h2>
            <p className="sx-rise mt-6 max-w-md text-lg leading-relaxed text-chalk/75">
              A short explanation, a choice between two prompts, then you write one and see what it&rsquo;s missing. A
              workshop works the same way.
            </p>
          </div>
          <div className="ai-frame min-w-0 lg:col-span-7">
            <PromptLessonLazy />
          </div>
        </Inner>
      </Scene>

      {/* ── Formats ── */}
      <Scene tone="cream" labelledBy="formats">
        <Inner>
          <Kicker tone="cream">How it runs</Kicker>
          <h2 id="formats" className="sx-focus mt-8 max-w-3xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            Sized to the gap, in Bengaluru or online.
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
            {FORMATS.map((f) => (
              <div key={f.title} className="ai-tilt rounded-2xl border border-board/15 bg-white/70 p-7 sm:p-9">
                <h3 className="font-playfair text-2xl font-bold sm:text-3xl">{f.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-ink/80">{f.body}</p>
              </div>
            ))}
          </div>
        </Inner>
      </Scene>

      {/* ── Already in a classroom ── */}
      <Scene tone="dark" labelledBy="proof">
        <Inner>
          <Kicker tone="dark">Already in a classroom</Kicker>
          <h2 id="proof" className="sr-only">
            What educators say about how we teach AI
          </h2>
          <blockquote className="sx-focus mt-10 max-w-4xl">
            <p className="font-playfair text-[clamp(1.9rem,5vw,3.4rem)] leading-[1.15]">
              &ldquo;Nobody in Bangalore is doing interactive training like this, or going this deep on AI with students.&rdquo;
            </p>
            <footer className="mt-6 text-base text-chalk/70">Faculty, East Point College of Management</footer>
          </blockquote>
          <p className="sx-rise mt-10 max-w-xl text-lg leading-relaxed text-chalk/75">
            Our students write first and use AI second, and our 2026 Advanced Excel program taught AI-assisted analysis through
            real-world case studies. Your team gets the same rule, applied to its own work.
          </p>
          <Link
            href={STUDIO_PAGES.work.path}
            className="sx-rise mt-8 inline-flex items-center gap-2 text-sm font-semibold text-chalk-yellow underline decoration-chalk-yellow/40 underline-offset-4 hover:decoration-chalk-yellow"
          >
            See our programs and their results <ArrowRight size={15} aria-hidden />
          </Link>
        </Inner>
      </Scene>

      <StudioFaq faqs={AI_FAQS} />

      <StudioEnquire
        title={<>What does your team write every week?</>}
        line="Tell us the team, the work and the tools you're allowed to use. We reply by email with a proposed session and what it costs."
        defaultAudience="Corporate team"
        elsewhere={["colleges", "trainers"]}
      />
    </>
  );
}
