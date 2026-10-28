import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { STUDIO_PAGES, studioAlternates, studioGraph, studioService, breadcrumbs } from "@/lib/studio";
import { Scene, Inner, Kicker, Statement, Steps, TrackCard } from "@/components/marketing/learning-studio/Scene";
import { StatBand } from "@/components/marketing/learning-studio/Portfolio";
import { StudioFaq, type Faq } from "@/components/marketing/learning-studio/StudioFaq";
import { StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * /learning-studio/companies: the door for an L&D lead, a team manager or a
 * founder buying training for a team. The colleges door is its own page; the
 * two never share a pitch.
 *
 * Search target: corporate training programs, training for teams.
 */

const PAGE = STUDIO_PAGES.companies;

export const metadata: Metadata = {
  title: { absolute: "Corporate Training Programs for Teams | Chalkboard Learning Studio" },
  description:
    "Corporate training built around the work your team does: AI at work, sales, customer support and leadership, plus courses built from your own material. On site in Bengaluru or online.",
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: "Corporate training built around the work your team does",
    description: "AI at work, sales, customer support and leadership, plus courses built from your own material.",
    url: studioAlternates(PAGE.path).canonical,
    type: "website",
    siteName: "Chalkboard Learning Studio",
  },
};

const TRACKS = [
  {
    id: "ai-at-work",
    kicker: "Most asked",
    title: "AI at work",
    service: "AI training for teams",
    body: "Your team writes the first draft, then uses AI to make it better. Generative AI, prompt writing and checking what comes back.",
    pills: ["Generative AI", "Prompt writing", "AI-assisted work"],
    href: STUDIO_PAGES.aiTraining.path,
    cta: "AI training for teams",
  },
  {
    id: "sales",
    kicker: "Revenue",
    title: "Sales",
    service: "Sales training",
    body: "Discovery that earns the second meeting, handling the objection that stalls the deal, and the call after a no.",
    pills: ["Discovery", "Objection handling", "Follow-up"],
  },
  {
    id: "support",
    kicker: "Customers",
    title: "Customer support",
    service: "Customer support training",
    body: "De-escalation and first-contact resolution, practised on tickets that look like yours.",
    pills: ["De-escalation", "First-contact resolution", "Tone"],
  },
  {
    id: "leadership",
    kicker: "Managers",
    title: "How a team runs",
    service: "Team effectiveness and leadership training",
    body: "Feedback that lands, clean handoffs, and decisions that still hold after the meeting.",
    pills: ["Feedback", "Handoffs", "Decisions"],
  },
  {
    id: "custom-courses",
    kicker: "Your material",
    title: "Courses built for you",
    service: "Custom course development",
    body: "A deck, an SOP or one expert's knowledge, built into scenarios and practice people can do on their own.",
    pills: ["Storyline", "Rise", "SCORM / xAPI"],
    href: STUDIO_PAGES.customCourses.path,
    cta: "Custom course development",
  },
];

const STEPS = [
  { title: "Diagnose", body: "We talk to the people being trained and the people who manage them, and look at samples of their real work." },
  { title: "Design", body: "An outline built around the gap we found. Nothing gets built until you approve it." },
  { title: "Run", body: "On site in Bengaluru or live online. People practise on their own work and get feedback while they do it." },
  { title: "Measure", body: "Attendance, feedback and progress for every learner, so you can see what changed and plan the next round." },
];

const FAQS: Faq[] = [
  {
    q: "What corporate training does Chalkboard Learning Studio offer?",
    a: "AI at work, sales, customer support, and team effectiveness and leadership, plus custom courses built from your own material. Each program is designed around what your team needs to be able to do, so no two are the same.",
  },
  {
    q: "Can you train our team to use AI well?",
    a: "Yes. Our AI training is built on one rule: people write the first draft themselves, then use AI to improve it. It covers prompt writing, AI-assisted work and checking what AI gets wrong, in the tools your team is allowed to use.",
  },
  {
    q: "How long is a program?",
    a: "It depends on the gap. One skill can be a focused workshop; a change in how a team works usually runs as sessions over several weeks, each built on the work done since the last.",
  },
  {
    q: "Do you run training online?",
    a: "Yes. Live online sessions run the same way as on-site sessions in Bengaluru, with exercises on each person's own work.",
  },
  {
    q: "Can you build a course from our own material?",
    a: "Yes. We storyboard it with you, then build it as scenarios and practice in your authoring tool, packaged for your LMS with completion and score reporting.",
  },
  {
    q: "How does it start?",
    a: "A short call about the outcome you need and who it's for. We reply with a proposed outline and what it costs before anything is built.",
  },
];

const schema = studioGraph(
  ...TRACKS.map((t) => studioService({ id: t.id, name: t.service, description: t.body, path: PAGE.path, serviceType: t.service, audience: "business" })),
  breadcrumbs([STUDIO_PAGES.hub, PAGE])
);

export default function CompaniesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      <section className="relative flex min-h-[88svh] items-center overflow-hidden bg-board pb-20 pt-28 text-chalk sm:pt-32">
        <div aria-hidden className="grid-dots pointer-events-none" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse 50% 45% at 80% 35%, rgba(244,196,48,0.10), transparent 70%)" }}
        />
        <Inner className="relative">
          <Kicker tone="dark">For companies</Kicker>
          <h1 className="mt-7 max-w-5xl break-words font-playfair font-bold leading-[1.03] tracking-tight text-[clamp(2.5rem,8.6vw,6rem)]">
            Corporate training built around the work your team does <span className="font-playfair text-chalk-yellow">every week.</span>
          </h1>
          <span aria-hidden className="sx-hero-line mt-9 block h-px w-full max-w-md bg-gradient-to-r from-chalk-yellow/80 to-transparent" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-chalk/75 sm:text-xl">
            AI at work, sales, customer support and leadership. We find the gap first, then design the training around it.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="#enquire"
              className="inline-flex items-center gap-2 rounded-full bg-chalk-yellow px-6 py-3.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Talk to us about your team <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="#tracks" className="inline-flex items-center gap-2 text-sm font-semibold text-chalk/80 hover:text-chalk-yellow">
              What we train <ArrowDown size={15} aria-hidden />
            </Link>
          </div>
        </Inner>
      </section>

      <Scene tone="cream" id="tracks" labelledBy="tracks-heading">
        <Inner>
          <Kicker tone="cream">What we train</Kicker>
          <h2 id="tracks-heading" className="sx-focus mt-8 max-w-3xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            Teams get stuck in the same places.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {TRACKS.map((t) => (
              <TrackCard key={t.id} tone="cream" kicker={t.kicker} title={t.title} body={t.body} pills={t.pills} href={t.href} cta={t.cta} />
            ))}
          </div>
        </Inner>
      </Scene>

      <Scene tone="dark" labelledBy="how">
        <Inner>
          <Kicker tone="dark">How we work</Kicker>
          <Statement id="how" className="mt-8">
            A diagnosis first.
            <br />
            Then a design.
          </Statement>
          <Steps steps={STEPS} tone="dark" />
        </Inner>
      </Scene>

      <Scene tone="cream" labelledBy="record">
        <Inner>
          <Kicker tone="cream">Our record</Kicker>
          <h2 id="record" className="sx-focus mt-8 max-w-3xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            We measure every program we run.
          </h2>
          <div className="mt-12">
            <StatBand tone="cream" />
          </div>
          <Link
            href={STUDIO_PAGES.work.path}
            className="sx-rise mt-12 inline-flex items-center gap-2 text-sm font-semibold text-board underline decoration-gold-deep/50 underline-offset-4 hover:decoration-gold-deep"
          >
            See the programs <ArrowRight size={15} aria-hidden />
          </Link>
        </Inner>
      </Scene>

      <StudioFaq faqs={FAQS} />

      <StudioEnquire
        title={<>What should your team be able to do next quarter?</>}
        line="Tell us who it's for and what needs to change. We reply by email with a proposed outline and what it costs."
        defaultAudience="Corporate team"
        elsewhere={["colleges", "trainers"]}
      />
    </>
  );
}
