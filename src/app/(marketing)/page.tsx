import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CinematicHero } from "@/components/marketing/CinematicHero";
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

      {/* ── Cinematic scroll-pinned front door ── */}
      <CinematicHero />

      {/* ── What brings you here? · pathways (the real, tappable choices) ── */}
      <section className="relative bg-board-deep text-chalk pt-10 pb-16 sm:pt-14 sm:pb-24">
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
