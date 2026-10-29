import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { STUDIO_PAGES, studioAlternates, studioGraph, breadcrumbs } from "@/lib/studio";
import { CONTACT_EMAIL } from "@/lib/contact";
import { Reveal } from "@/components/marketing/Reveal";
import { Eyebrow } from "@/components/marketing/learning-studio/StudioParts";

/*
 * /learning-studio/trainers — the supply side. It used to sit at the bottom of
 * the buyer's page, where it asked a company to read a pitch meant for someone
 * else. Here it tells one story to one reader: who we want, how we work,
 * send us your profile. Email only — the mailto is prefilled so profiles
 * arrive in a consistent shape.
 */

const PAGE = STUDIO_PAGES.trainers;

export const metadata: Metadata = {
  title: "Freelance Trainers & Facilitators, Bengaluru",
  description:
    "Chalkboard Learning Studio is building a network of trainers, subject experts and facilitators in Bengaluru. Tell us what you teach and who you have trained.",
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: "Train with Chalkboard Learning Studio",
    description: "A network of trainers, subject experts and facilitators. Tell us what you teach.",
    url: studioAlternates(PAGE.path).canonical,
    type: "website",
    siteName: "Chalkboard Learning Studio",
  },
};

const LOOKING_FOR = [
  { k: "Subject experts", v: "You know a field deeply — AI, sales, support, data, engineering, leadership — and can teach it." },
  { k: "Facilitators", v: "You can hold a room, run an exercise and make a quiet group talk." },
  { k: "Course designers", v: "You can take a messy brief and storyboard it into something people learn from." },
];

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

const trainersSchema = studioGraph(breadcrumbs([STUDIO_PAGES.hub, PAGE]));

export default function TrainersPage() {
  return (
    <div className="bg-cream-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(trainersSchema) }} />
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      {/* ── 1 · Hook ── */}
      <section className="relative overflow-hidden bg-board-deep pb-20 pt-32 text-chalk sm:pb-24 sm:pt-40">
        <div aria-hidden className="grid-dots pointer-events-none" />
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <Eyebrow label="Learning Studio · For Trainers" tone="dark" />
            <h1 className="mt-6 break-words font-playfair font-black leading-[1.04] tracking-tight text-[clamp(2.4rem,7vw,4.5rem)]">
              Train with us.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-chalk/70">
              We&rsquo;re building a network of freelance trainers, subject experts and facilitators in Bengaluru
              and online. If you design or deliver programmes for teams, colleges or faculty, tell us what you teach.
            </p>
          </div>
        </Container>
      </section>

      {/* ── 2 · Who we're looking for ── */}
      <section className="relative py-20 text-board sm:py-24">
        <Container className="relative">
          <Reveal>
            <Eyebrow label="Who We Work With" />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {LOOKING_FOR.map((l, i) => (
              <Reveal key={l.k} delay={i * 80} className="min-w-0">
                <div className="border-t-2 border-gold/60 pt-4">
                  <h2 className="font-playfair text-xl font-bold text-board">{l.k}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">{l.v}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <p className="mt-12 max-w-2xl text-base leading-relaxed text-gray-600">
              Everything we build is interactive — learners decide, practise and get feedback rather than watch.
              See what that looks like on{" "}
              <Link href="/learning-studio" className="font-semibold text-board underline decoration-gold/50 underline-offset-4">
                the companies page
              </Link>
              .
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ── 3 · Act ── */}
      <section className="relative border-t border-board/10 pb-24 pt-16 text-board sm:pb-28">
        <Container className="relative">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="min-w-0 lg:col-span-5">
              <h2 className="break-words font-playfair text-[clamp(1.75rem,4.8vw,3rem)] font-bold leading-[1.12] tracking-tight">
                Send us your profile.
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-gray-600">
                One email with the five things listed here — that is all we need to start.
              </p>
            </Reveal>
            <Reveal delay={100} className="min-w-0 lg:col-span-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep">Email us with</p>
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
