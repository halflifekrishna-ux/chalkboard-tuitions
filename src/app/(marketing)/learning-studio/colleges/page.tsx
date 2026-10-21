import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SITE_URL, OG_IMAGES } from "@/lib/site";
import { Reveal } from "@/components/marketing/Reveal";
import { TransformBoring } from "@/components/marketing/learning-studio/TransformBoring";
import { StudioFaq, type Faq } from "@/components/marketing/learning-studio/StudioFaq";
import { Eyebrow, StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * /learning-studio/colleges — the colleges & universities page. Same studio,
 * different reader (a placement officer, a dean, a training & placement cell),
 * so a different story:
 *
 *   1. Hook   — the gap every placement cell knows: students who know the
 *               syllabus and freeze in the interview.
 *   2. Show   — TransformBoring: a textbook communication slide rebuilt as
 *               something a student has to do. That is the programme.
 *   3. Offer  — placement readiness, industry tracks, faculty development.
 *   4. Act    — college questions, then the enquiry form preset to colleges.
 */

const PAGE_URL = `${SITE_URL}/learning-studio/colleges`;

export const metadata: Metadata = {
  title: { absolute: "Placement Training for Colleges in Bengaluru | Chalkboard" },
  description:
    "Placement readiness, industry tech tracks and faculty development for colleges and universities in Bengaluru — programmes your students actually practise.",
  keywords: [
    "placement training for colleges Bangalore",
    "campus placement training Bengaluru",
    "placement readiness programme",
    "soft skills training for students",
    "faculty development programme Bangalore",
    "college training partner Bengaluru",
    "industry ready training for engineering students",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Graduates who are ready on day one",
    description:
      "Placement readiness, industry tracks and faculty development for colleges and universities — built as practice, not lectures.",
    url: PAGE_URL,
    type: "website",
    images: OG_IMAGES,
    siteName: "Chalkboard Learning Studio",
  },
};

const STRANDS = [
  {
    n: "01",
    title: "Placement readiness",
    service: "Campus placement readiness training",
    body: "Interviews, group discussions and workplace communication — practised in scenarios with feedback, not explained on slides.",
  },
  {
    n: "02",
    title: "Industry tracks",
    service: "Industry technology tracks for students",
    body: "Short, applied tracks alongside the degree.",
    tags: ["AI & Machine Learning", "Data Analytics", "Full Stack Development", "Cloud", "Cybersecurity"],
  },
  {
    n: "03",
    title: "Faculty development",
    service: "Faculty development programmes",
    body: "Help your teachers turn a lecture into something students do — the same method you can try below.",
  },
];

const COLLEGE_FAQS: Faq[] = [
  {
    q: "What programmes does Chalkboard Learning Studio run for colleges?",
    a: "Placement readiness (interviews, group discussions, workplace communication), short industry tracks in AI, data, full stack, cloud and cybersecurity, and faculty development. Each is scoped to your students and your placement goals.",
  },
  {
    q: "Will it clash with our academic calendar?",
    a: "No. Programmes are planned around your semester, exam and placement-season dates — alongside the academic calendar rather than competing with it.",
  },
  {
    q: "Do you train on campus in Bengaluru?",
    a: "Yes — on campus across Bengaluru, and live online for institutions elsewhere in India.",
  },
  {
    q: "Can you train our faculty to teach this way?",
    a: "Yes. Faculty development covers how to turn existing lectures into scenarios, choices and practice — the same build as the communication module on this page.",
  },
  {
    q: "How does it start?",
    a: "A short conversation with your placement or training cell about the students, the timeline and the outcome you need. We come back with a proposed programme and what it costs.",
  },
];

const collegeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${PAGE_URL}#programmes`,
      name: "Chalkboard Learning Studio — programmes for colleges and universities",
      url: PAGE_URL,
      provider: { "@id": `${SITE_URL}/learning-studio#studio` },
      areaServed: [
        { "@type": "City", name: "Bengaluru" },
        { "@type": "Country", name: "India" },
      ],
      audience: { "@type": "EducationalAudience", educationalRole: "student" },
      serviceType: STRANDS.map((s) => s.service),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Chalkboard", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Learning Studio", item: `${SITE_URL}/learning-studio` },
        { "@type": "ListItem", position: 3, name: "Colleges & universities", item: PAGE_URL },
      ],
    },
  ],
};

export default function CollegesPage() {
  return (
    <div className="bg-board-deep">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collegeSchema) }} />
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      {/* ── 1 · Hook — the gap every placement cell knows ── */}
      <section className="relative flex min-h-[86svh] items-center overflow-hidden bg-board-deep pb-24 pt-28 text-chalk sm:pt-32">
        <div aria-hidden className="grid-dots pointer-events-none" />
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <Eyebrow label="Learning Studio · Colleges & Universities" tone="dark" />
            <h1 className="mt-6 break-words font-playfair font-black leading-[1.04] tracking-tight text-[clamp(2.4rem,7vw,4.75rem)]">
              Placement training
              <br />
              <span className="italic text-chalk-yellow">students practise, not sit through.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-chalk/70">
              Your students know the syllabus. Then the interviewer asks them to handle a disagreement, and they
              freeze. Chalkboard Learning Studio runs placement readiness, industry tracks and faculty development
              for colleges and universities in Bengaluru — built as practice, so the skill is there on the day.
            </p>
            <a
              href="#transform"
              className="mt-9 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-chalk-dark"
              style={{ background: "linear-gradient(135deg, #f4c430 0%, #c9a227 100%)" }}
            >
              Try what your students would do <ArrowDown size={15} />
            </a>
            <p className="mt-8 text-sm text-chalk/55">
              Training a company team?{" "}
              <Link href="/learning-studio" className="whitespace-nowrap font-semibold text-chalk/70 underline decoration-chalk/25 underline-offset-4 hover:text-chalk-yellow">
                That&rsquo;s here →
              </Link>
            </p>
          </div>
        </Container>
      </section>

      {/* ── 2 · Show — the programme, as a student meets it ── */}
      <TransformBoring
        eyebrow="Try it as a student"
        title="The communication chapter, rebuilt as something you do."
      />

      {/* ── 3 · Offer ── */}
      <section className="relative overflow-hidden bg-cream-bg py-20 text-board sm:py-28">
        <Container className="relative">
          <Reveal>
            <Eyebrow label="What We Run" />
            <h2 className="mt-5 max-w-2xl break-words font-playfair text-[clamp(1.75rem,4.8vw,3rem)] font-bold leading-[1.12] tracking-tight text-board">
              Three strands.
              <br />
              One outcome: ready on day one.
            </h2>
          </Reveal>

          <div className="mt-14 divide-y divide-board/10 border-t border-board/10">
            {STRANDS.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="grid grid-cols-[3rem_1fr] gap-4 py-6 sm:grid-cols-[5rem_1fr_2fr] sm:items-baseline sm:gap-8 sm:py-8">
                  <span className="font-playfair text-2xl font-black text-gold/70 sm:text-3xl">{s.n}</span>
                  <h3 className="font-playfair text-lg font-bold text-board sm:text-xl">{s.title}</h3>
                  <div className="col-start-2 min-w-0 sm:col-start-3">
                    <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{s.body}</p>
                    {s.tags && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {s.tags.map((t) => (
                          <li key={t} className="rounded-full border border-board/15 px-3 py-1 text-xs font-medium text-board/75">
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 4 · Act ── */}
      <StudioFaq faqs={COLLEGE_FAQS} />

      <StudioEnquire
        title={
          <>
            Placement season
            <br />
            coming up?
          </>
        }
        line="Tell us about your students, your timeline and what needs to change. We reply by email with a proposed programme and cost."
        defaultAudience="College / institution"
        elsewhere={["companies", "trainers", "tuitions"]}
      />
    </div>
  );
}
