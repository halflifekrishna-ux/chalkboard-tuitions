import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ChalkWave } from "@/components/ui/chalk-wave";
import { Pathways } from "@/components/marketing/Pathways";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";

export const metadata: Metadata = {
  title: { absolute: "Chalkboard — Learning, differently." },
  description:
    "Chalkboard is a modern learning ecosystem: Chalkboard Tuitions (school learning, LKG–10), Chalkboard Learning Studio (college & corporate learning), and Chalkboard OS. Choose your path.",
  keywords: ["Chalkboard", "Chalkboard Learning", "Chalkboard Tuitions", "Chalkboard Learning Studio", "Chalkboard OS"],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Chalkboard — Learning, differently.",
    description: "A modern learning ecosystem — tuitions, professional learning, and the technology behind it.",
    url: SITE_URL,
    type: "website",
    siteName: "Chalkboard",
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Chalkboard",
  legalName: "Chalkboard Learning Services LLP",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-dark.png`,
  description:
    "Chalkboard is a modern learning ecosystem spanning school tuitions, professional & institutional learning, and the technology platform that powers them.",
  brand: ["Chalkboard Tuitions", "Chalkboard Learning Studio", "Chalkboard OS"],
  sameAs: ["https://www.instagram.com/chalkboard.tuitions/"],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      {/* ── Poster hero ── */}
      <section
        className="relative overflow-hidden bg-board-deep text-chalk flex items-center min-h-[72svh] lg:min-h-[80vh] pt-24 pb-14 sm:pt-28 sm:pb-16"
        style={{ backgroundImage: "radial-gradient(ellipse 70% 55% at 20% 10%, rgba(244,196,48,0.10), transparent 60%)" }}
      >
        <ChalkWave />
        {/* keep text legible over the wave */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-board-deep via-board-deep/40 to-transparent" />

        <Container className="relative z-10">
          <div className="max-w-4xl">
            <span className="block font-special-elite text-sm sm:text-base uppercase tracking-[0.32em] text-chalk-yellow/90">Chalkboard</span>
            <h1 className="mt-5 font-playfair font-black tracking-tight break-words leading-[1.02] text-[clamp(2.5rem,8.5vw,6rem)]">
              Learning,{" "}
              <span className="italic font-bold text-chalk-yellow">differently.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg sm:text-xl text-chalk/60 leading-relaxed">
              One ecosystem for every stage of learning — from the classroom to the workplace.
            </p>
          </div>
        </Container>
      </section>

      {/* ── What brings you here? · pathways (continues on the board) ── */}
      <section className="relative bg-board-deep text-chalk pt-2 pb-16 sm:pb-24">
        <Container>
          <h2 className="mb-6 font-playfair text-2xl sm:text-3xl font-bold text-chalk">What brings you here?</h2>
          <Pathways />
        </Container>
      </section>

      {/* ── A small trust moment ── */}
      <Section bg="cream" size="sm">
        <Container size="narrow">
          <p className="text-center">
            <span className="block font-playfair text-xl sm:text-2xl font-bold text-board dark:text-chalk">Built on years of learning experience.</span>
            <span className="mt-3 block text-base text-gray-600 dark:text-chalk/65 leading-relaxed">
              <span className="font-semibold text-board dark:text-chalk">Home Tuitions Bangalore</span>, operating since 2018,
              is the foundation behind Chalkboard Tuitions.
            </span>
          </p>
        </Container>
      </Section>
    </>
  );
}
