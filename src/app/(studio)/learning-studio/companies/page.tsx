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
  title: { absolute: "Corporate Training: AI, POSH, Data, Communication | Chalkboard" },
  description:
    "Corporate training and eLearning for teams in Bengaluru, across India and abroad. AI at work, POSH, Excel and Power BI, communication and custom courses, on site or live online.",
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: "Corporate training for teams in India and abroad",
    description: "AI at work, POSH, data, communication and eLearning, built around the work your team does.",
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
    service: "AI capability training for teams",
    body: "Your team writes the first draft, then uses AI to make it better. Generative AI, prompt writing and checking what comes back.",
    pills: ["Generative AI", "Prompt writing", "AI-assisted work"],
    href: STUDIO_PAGES.aiTraining.path,
    cta: "AI training for teams",
  },
  {
    id: "posh",
    kicker: "Compliance",
    title: "POSH awareness",
    service: "POSH awareness training",
    body: "Awareness sessions under the POSH Act, 2013, built on situations your people will recognise from their own workplace.",
    pills: ["POSH Act, 2013", "Case discussion", "Managers and staff"],
  },
  {
    id: "data",
    kicker: "Numbers",
    title: "Data and Excel",
    service: "Excel and Power BI training",
    body: "Excel, Power BI and dashboards, practised on your own reports so the first thing people build is something they need.",
    pills: ["Excel", "Power BI", "Dashboards"],
  },
  {
    id: "communication",
    kicker: "People",
    title: "Communication",
    service: "Business communication training",
    body: "Emails that get answered, updates that do not run long, and the difficult conversation with a client or a manager.",
    pills: ["Writing", "Presenting", "Difficult conversations"],
  },
  {
    id: "custom-courses",
    kicker: "Your material",
    title: "eLearning built for you",
    service: "Custom eLearning development",
    body: "A deck, an SOP or one expert's knowledge, built into scenarios and practice people can do on their own. Packaged as SCORM or xAPI for your LMS.",
    pills: ["Storyline", "Rise", "SCORM / xAPI"],
    href: STUDIO_PAGES.customCourses.path,
    cta: "Custom course development",
  },
  {
    id: "other",
    kicker: "Something else",
    title: "Sales, support, leadership, onboarding",
    service: "Team effectiveness and onboarding training",
    body: "If your team needs it and it is not listed, tell us. We design it around the gap, then bring in the right trainer.",
    pills: ["Sales", "Customer support", "Onboarding"],
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
    a: "AI at work, POSH awareness, Excel and Power BI, business communication, and custom eLearning built from your own material. If your team needs something else, tell us and we design it around the gap.",
  },
  {
    q: "Can you train our team to use AI well?",
    a: "Yes. Our AI training is built on one rule: people write the first draft themselves, then use AI to improve it. It covers prompt writing, AI-assisted work and checking what AI gets wrong, in the tools your team is allowed to use.",
  },
  {
    q: "Do you run POSH awareness sessions?",
    a: "Yes. We run them as case-based sessions for managers and staff, built around the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013. We name the trainer in the proposal before you commit.",
  },
  {
    q: "Do you train teams outside India?",
    a: "Yes, online. Sessions run live in your team's working hours, with exercises on their own work. Courses we build as eLearning are packaged as SCORM or xAPI for any LMS.",
  },
  {
    q: "Who delivers the training?",
    a: "A trainer matched to the topic. Once you tell us the subject and the audience, the proposal says who will run it.",
  },
  {
    q: "How does it start?",
    a: "A short call about the outcome you need and who it is for. We reply with a proposed outline and a quote before anything is built. You can also write to connect@chalkboardlearning.in.",
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
            Corporate training for teams in India and abroad, built around <span className="font-playfair text-chalk-yellow">their actual work.</span>
          </h1>
          <span aria-hidden className="sx-hero-line mt-9 block h-px w-full max-w-md bg-gradient-to-r from-chalk-yellow/80 to-transparent" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-chalk/75 sm:text-xl">
            AI at work, POSH, data, communication and eLearning. We find the gap first, then design the training around it.
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
            Pick the problem. We build the program.
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

      <Scene tone="dark" labelledBy="reach">
        <Inner>
          <Kicker tone="dark">India and abroad</Kicker>
          <Statement id="reach" className="mt-8">
            Same program.
            <br />
            Wherever the team sits.
          </Statement>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-chalk/75">
            Bengaluru teams can train on site. Teams elsewhere in India, the Middle East, the UK, Europe, the US and Australia train live online, in their own working hours, with the same exercises on their own work.
          </p>
        </Inner>
      </Scene>

      <StudioFaq faqs={FAQS} />

      <StudioEnquire
        title={<>What should your team be able to do next quarter?</>}
        line="Tell us who it's for and what needs to change. We reply by email with a proposed outline and a quote."
        defaultAudience="Corporate team"
        elsewhere={["colleges", "trainers"]}
      />
    </>
  );
}
