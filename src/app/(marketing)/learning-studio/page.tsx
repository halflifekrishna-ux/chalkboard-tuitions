import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown, Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CONTACT_EMAIL } from "@/lib/contact";
import { StudioEnquiryForm } from "@/components/marketing/learning-studio/StudioEnquiryForm";
import { Reveal } from "@/components/marketing/Reveal";
import { HeroPin } from "@/components/marketing/learning-studio/HeroPin";
import { SectionEnter } from "@/components/marketing/learning-studio/SectionEnter";
import { ProgrammeMarquee } from "@/components/marketing/learning-studio/ProgrammeMarquee";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";

export const metadata: Metadata = {
  title: "Chalkboard Learning Studio — Professional & Institutional Learning",
  description:
    "Chalkboard Learning Studio designs learning programmes for corporates, colleges and professionals — from capability building and leadership development to placement readiness and faculty training.",
  alternates: { canonical: `${SITE_URL}/learning-studio` },
  openGraph: {
    title: "Chalkboard Learning Studio — Professional & Institutional Learning",
    description:
      "Learning programmes for corporates, colleges and professionals in Bengaluru — capability building, leadership, placement readiness and faculty training.",
    url: `${SITE_URL}/learning-studio`,
    type: "website",
  },
};

function Eyebrow({ label, tone = "light" }: { label: string; tone?: "light" | "dark" }) {
  return (
    <span
      className={
        "inline-flex items-center gap-2.5 font-special-elite text-[11px] uppercase tracking-[0.28em] sm:text-xs " +
        (tone === "dark" ? "text-chalk-yellow/90" : "text-gold")
      }
    >
      <span className={tone === "dark" ? "h-px w-6 bg-chalk-yellow/40" : "h-px w-6 bg-gold/50"} />
      {label}
    </span>
  );
}

/* ── Programme content — treated as programme areas Chalkboard Learning
   Studio designs for, not a claim that every item is a currently-running
   fixed course. ── */
const CORPORATE_TOPICS = [
  "AI FOR BUSINESS",
  "LEADERSHIP PROGRAMMES",
  "DATA & ANALYTICS",
  "GENERATIVE AI WORKSHOPS",
  "COMMUNICATION SKILLS",
  "DIGITAL TRANSFORMATION",
  "PRODUCTIVITY & AUTOMATION",
  "TEAM EFFECTIVENESS",
];
const CORPORATE_FORMATS = [
  "WORKSHOPS",
  "BOOTCAMPS",
  "LEARNING PROGRAMMES",
  "TRAINER-LED SESSIONS",
  "CUSTOM PROGRAMMES",
  "CAPABILITY BUILDING",
];
const COLLEGE_AREAS = [
  "AI & Machine Learning",
  "Data Analytics",
  "Full Stack Development",
  "Cloud",
  "Cybersecurity",
  "Soft Skills",
  "Career Readiness",
  "Digital Technology",
];

const LIFECYCLE = [
  { n: "01", title: "Understand", body: "We start with the real gap — skills, outcomes or capability — not a fixed course catalogue." },
  { n: "02", title: "Design", body: "A tailored blend of workshops, e-learning and coaching, built around your context and constraints." },
  { n: "03", title: "Deliver", body: "Structured delivery with clear milestones, facilitators and materials — not a one-off session." },
  { n: "04", title: "Measure", body: "Reviewed against agreed outcomes, with reporting you can take to your own stakeholders." },
];

const CAPABILITIES = [
  "Custom Curriculum",
  "Trainer-led Delivery",
  "College Programs",
  "Corporate Learning",
  "Professional Upskilling",
  "Assessments",
  "Progress Tracking",
  "Learning Operations",
];

/* Trainer intake — email only, prefilled so profiles arrive in a consistent shape. */
const TRAINER_ASKS = [
  "The topics and skills you train",
  "Formats you deliver — workshops, bootcamps, longer programmes",
  "Who you've trained — teams, students, faculty",
  "A short proposal or a sample session outline",
  "Your CV, and a LinkedIn or portfolio link",
];
const TRAINER_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Trainer profile — [Your name]")}&body=${encodeURIComponent(
  "Name:\nTopics / skills I train:\nFormats (workshop, bootcamp, programme):\nAudiences I've trained:\nLinkedIn / portfolio:\n\nShort proposal or session idea:\n\n(Please attach your CV.)"
)}`;

/* Reused from the previous /learning-studio content — real sectors Chalkboard
   Learning Studio already works with, not invented case studies. */
const SECTORS = [
  { n: "01", name: "Colleges", body: "Placement readiness, campus training and faculty development that lift student outcomes." },
  { n: "02", name: "Corporates", body: "Role-based upskilling, onboarding academies and leadership learning that stick." },
  { n: "03", name: "Schools", body: "Teacher training, curriculum support and technology-enabled learning programs." },
  { n: "04", name: "NGOs", body: "Scalable, outcome-focused learning programs for community and skilling initiatives." },
  { n: "05", name: "Government", body: "Large-scale training and capacity-building with measurable, auditable outcomes." },
  { n: "06", name: "Startups", body: "Fast, practical enablement — from sales readiness to product and process training." },
];

export default function LearningStudioPage() {
  return (
    <div className="bg-board-deep">
      {/* If JS never runs, reveal everything rather than leaving it transparent. */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      {/* ── 01 — Statement ── */}
      <HeroPin>
        <section className="relative flex h-full min-h-[100svh] items-center overflow-hidden bg-board-deep text-chalk">
          <div aria-hidden className="grid-dots pointer-events-none" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: "linear-gradient(180deg, rgba(7,17,13,0.35) 0%, transparent 30%, transparent 72%, rgba(7,17,13,0.85) 100%)" }}
          />
          <Container className="relative z-10">
            <div className="max-w-3xl">
              <Eyebrow label="Chalkboard Learning Studio" tone="dark" />
              <h1 className="mt-6 break-words font-playfair font-black leading-[1.03] tracking-tight text-[clamp(2.5rem,8vw,5.25rem)]">
                Learning that moves
                <br />
                <span className="italic text-chalk-yellow">people forward.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-chalk/65">
                Learning programmes designed for colleges, teams and professionals — from classroom to workplace.
              </p>
              <p className="mt-8 text-sm text-chalk/45">
                Looking for school tuitions?{" "}
                <Link href="/tuitions" className="whitespace-nowrap font-semibold text-chalk/70 underline decoration-chalk/25 underline-offset-4 hover:text-chalk-yellow">
                  That&rsquo;s Chalkboard Tuitions →
                </Link>
              </p>
            </div>
          </Container>
          <div aria-hidden className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-chalk/40">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">Scroll to explore</span>
            <ChevronDown size={18} className="animate-bounce" />
          </div>
        </section>
      </HeroPin>

      {/* ── 02 — Who we build for ── */}
      <SectionEnter>
        <section className="relative overflow-hidden bg-board-deep py-20 text-chalk sm:py-28">
          <div aria-hidden className="grid-dots pointer-events-none" />
          <Container className="relative">
            <Reveal>
              <Eyebrow label="Who We Build For" tone="dark" />
              <h2 className="mt-5 max-w-2xl break-words font-playfair text-[clamp(2rem,5.5vw,3.5rem)] font-bold leading-[1.08] tracking-tight">
                Different learners.
                <br />
                Different problems.
              </h2>
            </Reveal>

            {/* grid-cols-1 = minmax(0,1fr): without it the implicit auto track
                grows to the marquee's max-content width and the cards get
                silently clipped by the section's overflow-hidden on phones. */}
            <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-5">
              {/* Corporate — primary, dominant */}
              <Reveal delay={80} className="relative min-w-0 lg:col-span-3">
                {/* Offset anchor, not scroll-margin: Next.js's hash scroll on a fresh
                    load/cross-page nav ignores scroll-margin and parks the target at
                    y=0, under the fixed navbar. Sitting 112px above the card keeps
                    its heading clear however the page got here. */}
                <span id="corporates" aria-hidden className="pointer-events-none absolute -top-28 left-0" />
                <div
                  className="relative min-w-0 overflow-hidden rounded-2xl border p-7 sm:p-10"
                  style={{ borderColor: "rgba(244,196,48,0.3)", background: "linear-gradient(155deg, rgba(244,196,48,0.08) 0%, rgba(7,17,13,0.4) 55%)" }}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-chalk-yellow/80">For organisations</span>
                  <h3 className="mt-3 font-playfair text-2xl font-bold sm:text-3xl">Corporate Learning</h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-chalk/65 sm:text-lg">
                    Build capability. Upskill teams.
                    <br />
                    Create learning that actually gets used.
                  </p>

                  <div className="mt-9 space-y-2.5">
                    <ProgrammeMarquee items={CORPORATE_TOPICS} direction="left" durationClass="marquee-duration-slow" />
                    <ProgrammeMarquee items={CORPORATE_FORMATS} direction="right" durationClass="marquee-duration-medium" />
                  </div>

                  <a href="#enquire" className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-chalk-yellow">
                    Talk to us about a programme <ArrowRight size={15} />
                  </a>
                </div>
              </Reveal>

              {/* College — secondary, visually smaller */}
              <Reveal delay={160} className="relative min-w-0 lg:col-span-2">
                <span id="colleges" aria-hidden className="pointer-events-none absolute -top-28 left-0" />
                <div className="h-full min-w-0 rounded-2xl border border-chalk/10 bg-chalk/[0.03] p-6 sm:p-7">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-chalk/45">For institutions</span>
                  <h3 className="mt-3 font-playfair text-xl font-bold sm:text-2xl">College Learning</h3>
                  <p className="mt-3 text-sm leading-relaxed text-chalk/55 sm:text-base">
                    Industry-ready learning for students and faculty.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-x-3 gap-y-2">
                    {COLLEGE_AREAS.map((a) => (
                      <span key={a} className="text-xs text-chalk/45">
                        {a}
                      </span>
                    ))}
                  </div>
                  <a href="#enquire" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-chalk/70">
                    Talk to us <ArrowRight size={14} />
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Closing graphic beat — the section's signature typographic
                moment as it hands off to "03 What We Build". Decorative
                only: "Learning Studio" is already announced by the eyebrow
                above and the nav, so this is aria-hidden. */}
            <p
              aria-hidden
              className="mt-20 select-none text-center font-playfair font-black uppercase leading-[0.88] tracking-tight text-[clamp(2.75rem,13vw,8.5rem)] sm:mt-28"
              style={{
                backgroundImage: "linear-gradient(180deg, rgba(244,196,48,0.55) 0%, rgba(244,196,48,0.06) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Learning Studio
            </p>
          </Container>
        </section>
      </SectionEnter>

      {/* ── 03 — What we build ── */}
      <section className="relative overflow-hidden bg-cream-bg py-20 text-board sm:py-28">
        <Container className="relative">
          <Reveal>
            <Eyebrow label="What We Build" />
            <h2 className="mt-5 max-w-2xl break-words font-playfair text-[clamp(1.75rem,4.8vw,3rem)] font-bold leading-[1.12] tracking-tight text-board">
              We don&rsquo;t just deliver courses.
              <br />
              We build learning experiences.
            </h2>
          </Reveal>

          <div className="mt-14 divide-y divide-board/10 border-t border-board/10">
            {LIFECYCLE.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="grid grid-cols-[3rem_1fr] gap-4 py-6 sm:grid-cols-[5rem_1fr_2fr] sm:items-baseline sm:gap-8 sm:py-8">
                  <span className="font-playfair text-2xl font-black text-gold/40 sm:text-3xl">{s.n}</span>
                  <h3 className="font-playfair text-lg font-bold text-board sm:text-xl">{s.title}</h3>
                  <p className="col-start-2 min-w-0 text-sm leading-relaxed text-gray-600 sm:col-start-3 sm:text-base">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 04 — How we work / capability ── */}
      <section className="relative overflow-hidden bg-white py-20 text-board sm:py-28">
        <Container className="relative">
          <Reveal>
            <Eyebrow label="How We Work" />
            <h2 className="mt-5 max-w-2xl break-words font-playfair text-[clamp(1.75rem,4.8vw,3rem)] font-bold leading-[1.12] tracking-tight text-board">
              Built around the learner.
              <br />
              Designed around the outcome.
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-14 grid gap-x-8 border-t border-board/10 sm:grid-cols-2">
              {CAPABILITIES.map((c, i) => (
                <div
                  key={c}
                  className="flex min-w-0 items-baseline justify-between gap-4 border-b border-board/10 py-4"
                >
                  <span className="min-w-0 truncate text-base font-medium text-board sm:text-lg">{c}</span>
                  <span className="shrink-0 font-playfair text-xs font-bold text-gold/50">{String(i + 1).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── 05 — Selected work ── */}
      <section className="relative overflow-hidden bg-board-deep bg-chalk-lines py-20 text-chalk sm:py-28">
        <Container className="relative">
          <Reveal>
            <Eyebrow label="Selected Work" tone="dark" />
            <h2 className="mt-5 max-w-2xl break-words font-playfair text-[clamp(1.75rem,4.8vw,3rem)] font-bold leading-[1.12] tracking-tight">
              Where we&rsquo;ve worked.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-x-10 gap-y-2 border-t border-chalk/10 sm:grid-cols-2">
            {SECTORS.map((s, i) => (
              <Reveal key={s.n} delay={(i % 3) * 70}>
                <div className="min-w-0 border-b border-chalk/10 py-6">
                  <div className="flex items-baseline gap-4">
                    <span className="font-playfair text-lg font-black text-chalk-yellow/40">{s.n}</span>
                    <h3 className="font-playfair text-xl font-bold text-chalk sm:text-2xl">{s.name}</h3>
                  </div>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-chalk/55 sm:text-base">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <p className="mt-10 text-sm text-chalk/40">Programme details and references available on request.</p>
          </Reveal>
        </Container>
      </section>

      {/* ── Enquire — Learning Studio's own, email-only form (never the Tuitions demo form) ── */}
      <section id="enquire" className="relative overflow-hidden bg-board-deep py-20 text-chalk sm:py-28">
        <div aria-hidden className="grid-dots pointer-events-none" />
        <Container className="relative">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="min-w-0 lg:col-span-5">
              <Eyebrow label="Start a Conversation" tone="dark" />
              <h2 className="mt-5 break-words font-playfair text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[1.08] tracking-tight">
                Have a learning
                <br />
                problem to solve?
              </h2>
              <p className="mt-4 font-playfair text-xl italic text-chalk-yellow/90 sm:text-2xl">Let&rsquo;s build it.</p>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-chalk/60">
                Tell us who the learning is for and what needs to change. We&rsquo;ll reply by email.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-6 inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-chalk/80 hover:text-chalk-yellow"
              >
                <Mail size={15} aria-hidden className="shrink-0" /> {CONTACT_EMAIL}
              </a>
              <p className="mt-10 max-w-sm border-t border-chalk/10 pt-5 text-sm leading-relaxed text-chalk/45">
                This form is for organisations, institutions and professionals. Looking for tuitions for your child?{" "}
                <Link href="/tuitions" className="whitespace-nowrap font-semibold text-chalk/75 underline decoration-chalk/30 underline-offset-4 hover:text-chalk-yellow">
                  Chalkboard Tuitions →
                </Link>
              </p>
            </Reveal>
            <Reveal delay={100} className="min-w-0 lg:col-span-7">
              <StudioEnquiryForm />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── For trainers — the supply side; deliberately after the buyer's form ── */}
      <section id="trainers" className="relative overflow-hidden bg-cream-bg py-20 text-board sm:py-24">
        <Container className="relative">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="min-w-0 lg:col-span-5">
              <Eyebrow label="For Trainers" />
              <h2 className="mt-5 break-words font-playfair text-[clamp(1.75rem,4.8vw,3rem)] font-bold leading-[1.12] tracking-tight text-board">
                Train with us.
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-gray-600">
                We&rsquo;re building a network of trainers, subject experts and facilitators. If you design or deliver
                programmes, tell us what you teach.
              </p>
            </Reveal>
            <Reveal delay={100} className="min-w-0 lg:col-span-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Email us with</p>
              <ul className="mt-4 divide-y divide-board/10 border-y border-board/10">
                {TRAINER_ASKS.map((t) => (
                  <li key={t} className="py-3.5 text-base text-board">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href={TRAINER_MAILTO}
                  className="inline-flex items-center gap-2 rounded-md bg-board px-5 py-3 text-sm font-semibold text-chalk transition-colors hover:bg-board-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  <Mail size={15} aria-hidden /> Email your profile
                </a>
                <span className="min-w-0 break-all text-sm text-gray-500">{CONTACT_EMAIL}</span>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </div>
  );
}
