import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { STUDIO_PAGES, studioAlternates, studioGraph, studioService, breadcrumbs } from "@/lib/studio";
import { Scene, Inner, Kicker, Statement, Steps, Pills, TrackCard } from "@/components/marketing/learning-studio/Scene";
import { CourseBuildLazy } from "@/components/marketing/learning-studio/CourseBuildLazy";
import { CourseBuildStatic } from "@/components/marketing/learning-studio/CourseBuildStatic";
import { StudioFaq, type Faq } from "@/components/marketing/learning-studio/StudioFaq";
import { StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * /learning-studio/custom-courses: courses built from a client's own material.
 *
 * This is a new service: built, not yet run for a client. The page says so
 * plainly ("opening to our first partners now") and answers "have you done
 * this before?" honestly in the FAQ. No sample client, no portfolio.
 *
 * Search target: custom e-learning development, turning a deck or SOP into
 * an e-learning course, Storyline development. Tools are listed because we
 * build in whatever the client already uses.
 */

const PAGE = STUDIO_PAGES.customCourses;

export const metadata: Metadata = {
  title: { absolute: "Custom E-Learning Course Development | Chalkboard Learning Studio" },
  description:
    "Your deck, SOP or expert knowledge built into an interactive course. Storyline, Rise, Captivate or your tool, packaged as SCORM or xAPI with learner reporting.",
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: "Your material, built into a course people practise in",
    description: "Custom e-learning built from your own material, in the authoring tool you use. Opening to our first partners now.",
    url: studioAlternates(PAGE.path).canonical,
    type: "website",
    siteName: "Chalkboard Learning Studio",
  },
};

const FORMATS = [
  { kicker: "Decide", title: "Branching scenarios", body: "A situation, a choice and a consequence. People learn what happens before it happens at work." },
  { kicker: "Do", title: "Simulations", body: "A process or a piece of software, walked through step by step, with the learner doing each step." },
  { kicker: "Check", title: "Questions that teach", body: "Every wrong answer explains itself, so a quiz becomes another chance to learn." },
  { kicker: "Repeat", title: "Short modules", body: "Five-minute pieces people can finish between calls or shifts, and come back to." },
];

const AUTHORING = [
  "Articulate Storyline 360",
  "Articulate Rise 360",
  "Adobe Captivate",
  "iSpring Suite",
  "Lectora",
  "Elucidat",
  "Camtasia",
  "H5P",
];

const STANDARDS = ["SCORM 1.2", "SCORM 2004", "xAPI", "cmi5"];

const STEPS = [
  {
    title: "Hand it over",
    body: "A deck, an SOP, recorded calls or an hour with the one expert who knows it all. However messy.",
  },
  {
    title: "Storyboard",
    body: "We map what people need to be able to do and how each screen gets them there. You approve it before anything is built.",
  },
  {
    title: "Build",
    body: "In your authoring tool, with your branding. You review working modules, not mock-ups.",
  },
  {
    title: "Launch and report",
    body: "Packaged for your LMS. You see who finished and where people dropped off.",
  },
];

const COURSE_FAQS: Faq[] = [
  {
    q: "What is custom e-learning development?",
    a: "Building an online course from your own material for your own people, instead of buying a generic one off the shelf. Ours start from what people need to be able to do, and turn your content into scenarios, simulations and practice.",
  },
  {
    q: "Can you turn our PowerPoint or SOP into an e-learning course?",
    a: "Yes. That's the usual starting point. We storyboard it with you first, then build it as interactive modules rather than slides with a next button.",
  },
  {
    q: "Which authoring tools do you build in?",
    a: "Whichever your team uses or prefers: Articulate Storyline 360 and Rise 360, Adobe Captivate, iSpring Suite, Lectora, Elucidat, Camtasia or H5P. If you don't have one, we'll recommend one for what you're building.",
  },
  {
    q: "Will it work with our LMS?",
    a: "Yes. We package courses as SCORM 1.2, SCORM 2004, xAPI or cmi5, which standards-based learning management systems accept. That's also what gives you completion and score reporting.",
  },
  {
    q: "Have you built courses for other companies?",
    a: "Not yet for a company. Course design is part of every program we run, and the demo on this page shows how we build. We're taking on our first course-build partners now.",
  },
  {
    q: "How does a project start?",
    a: "Send us the material and tell us who it's for. We reply with a proposed storyboard approach, a timeline and what it costs.",
  },
];

const schema = studioGraph(
  studioService({
    id: "custom-courses",
    name: "Custom e-learning course development",
    description:
      "Interactive courses built from a client's own material: branching scenarios, simulations and practice, built in the client's authoring tool and packaged as SCORM or xAPI with learner reporting.",
    path: PAGE.path,
    serviceType: "E-learning development",
    audience: "business",
  }),
  breadcrumbs([STUDIO_PAGES.hub, PAGE])
);

export default function CustomCoursesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
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
          <Kicker tone="dark">Custom courses · New</Kicker>
          <h1 className="mt-7 max-w-5xl break-words font-playfair font-bold leading-[1.03] tracking-tight text-[clamp(2.5rem,8.6vw,6rem)]">
            Your material, built into a course people <span className="font-playfair text-chalk-yellow">practise in.</span>
          </h1>
          <span aria-hidden className="sx-hero-line mt-9 block h-px w-full max-w-md bg-gradient-to-r from-chalk-yellow/80 to-transparent" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-chalk/75 sm:text-xl">
            A deck, an SOP or what one expert knows. We storyboard it with you and build it in your tool. We&rsquo;re opening
            this to our first partners now.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="#enquire"
              className="inline-flex items-center gap-2 rounded-full bg-chalk-yellow px-6 py-3.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Send us your material <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="#course-building" className="inline-flex items-center gap-2 text-sm font-semibold text-chalk/80 hover:text-chalk-yellow">
              Watch one get built <ArrowDown size={15} aria-hidden />
            </Link>
          </div>
        </Inner>
      </section>

      {/* ── The provocation ── */}
      <Scene tone="cream" labelledBy="read">
        <Inner>
          <Kicker tone="cream">The problem with most courses</Kicker>
          <Statement id="read" className="mt-8">
            If people only read it, they <span className="font-playfair text-gold-deep">won&rsquo;t be able to do it.</span>
          </Statement>
          <p className="sx-rise mt-8 max-w-xl text-lg leading-relaxed text-ink/80">
            So every course we build asks people to decide, try and get it wrong somewhere safe. Scroll on and watch one come
            together.
          </p>
        </Inner>
      </Scene>

      <CourseBuildLazy>
        <CourseBuildStatic />
      </CourseBuildLazy>

      {/* ── Formats ── */}
      <Scene tone="cream" labelledBy="formats">
        <Inner>
          <Kicker tone="cream">What we build</Kicker>
          <h2 id="formats" className="sx-focus mt-8 max-w-3xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            Whatever the material needs people to do.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {FORMATS.map((f) => (
              <TrackCard key={f.title} tone="cream" kicker={f.kicker} title={f.title} body={f.body} />
            ))}
          </div>
        </Inner>
      </Scene>

      {/* ── Tools ── */}
      <Scene tone="dark" labelledBy="tools">
        <Inner>
          <Kicker tone="dark">Tools and standards</Kicker>
          <h2 id="tools" className="sx-focus mt-8 max-w-4xl font-playfair text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight">
            Built in the tool you already use.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="sx-rise">
              <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-chalk-yellow">Authoring tools</h3>
              <div className="mt-5">
                <Pills tone="dark" items={AUTHORING} />
              </div>
            </div>
            <div className="sx-rise">
              <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-chalk-yellow">Packaged for your LMS</h3>
              <div className="mt-5">
                <Pills tone="dark" items={STANDARDS} />
              </div>
              <p className="mt-5 max-w-md text-base leading-relaxed text-chalk/70">
                Standards-based LMSs accept these packages, and they&rsquo;re what give you completions, scores and drop-off
                points.
              </p>
            </div>
          </div>
        </Inner>
      </Scene>

      {/* ── Process ── */}
      <Scene tone="cream" labelledBy="process">
        <Inner>
          <Kicker tone="cream">How a build runs</Kicker>
          <Statement id="process" className="mt-8">
            You approve the storyboard before a screen gets built.
          </Statement>
          <Steps steps={STEPS} tone="cream" />
        </Inner>
      </Scene>

      {/* ── First partners ── */}
      <Scene tone="dark" labelledBy="first">
        <Inner>
          <Kicker tone="dark">Opening now</Kicker>
          <Statement id="first" className="mt-8">
            This is new. <span className="font-playfair text-chalk-yellow">You&rsquo;d be one of the first.</span>
          </Statement>
          <p className="sx-rise mt-8 max-w-xl text-lg leading-relaxed text-chalk/75">
            We&rsquo;ve built the method and we use it in every program we run. A first partner works directly with the people
            designing the course, and shapes how we do it from here.
          </p>
          <Link
            href={STUDIO_PAGES.work.path}
            className="sx-rise mt-8 inline-flex items-center gap-2 text-sm font-semibold text-chalk-yellow underline decoration-chalk-yellow/40 underline-offset-4 hover:decoration-chalk-yellow"
          >
            See the work we can show <ArrowRight size={15} aria-hidden />
          </Link>
        </Inner>
      </Scene>

      <StudioFaq faqs={COURSE_FAQS} />

      <StudioEnquire
        title={<>What should your course teach people to do?</>}
        line="Tell us what the material is and who it's for. We reply by email with a proposed approach, a timeline and what it costs."
        defaultAudience="Corporate team"
        elsewhere={["colleges", "trainers"]}
      />
    </>
  );
}
