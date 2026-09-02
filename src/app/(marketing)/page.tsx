import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
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

      {/* ── The front door ── */}
      <section
        className="relative overflow-hidden bg-board-deep text-chalk pt-28 pb-14 sm:pt-32 sm:pb-20 lg:min-h-[92vh] lg:flex lg:items-center"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 15% 0%, rgba(244,196,48,0.10), transparent 60%), repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.02) 27px, rgba(255,255,255,0.02) 28px)",
        }}
      >
        <Container className="relative z-10 w-full">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Statement (asymmetric left). min-w-0 lets the grid track shrink
                to the viewport instead of expanding to the headline's width. */}
            <div className="lg:col-span-5 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-chalk-yellow">Welcome to Chalkboard</span>
              <h1 className="mt-4 font-playfair font-black tracking-tight leading-[1.05] break-words text-[2.5rem] sm:text-6xl lg:text-7xl">
                Learning,{" "}
                <span className="italic font-bold text-chalk-yellow">differently.</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-chalk/55 leading-relaxed max-w-md">
                One ecosystem for every stage of learning — from the classroom to the workplace.
              </p>
            </div>

            {/* Pathways (right / stacked on mobile) */}
            <div className="lg:col-span-7 min-w-0">
              <p className="mb-4 font-playfair text-xl sm:text-2xl text-chalk/80">What brings you here?</p>
              <Pathways />
            </div>
          </div>
        </Container>
      </section>

      {/* ── Ecosystem statement (compact) ── */}
      <Section bg="cream" size="sm">
        <Container>
          <p className="font-playfair text-2xl sm:text-3xl font-bold text-board dark:text-chalk max-w-3xl leading-snug">
            From the classroom to the workplace, Chalkboard builds learning experiences for every stage.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              ["Chalkboard Tuitions", "Personalised academic learning for Grades LKG–10."],
              ["Chalkboard Learning Studio", "Professional & institutional learning programs."],
              ["Chalkboard OS", "The technology platform powering the ecosystem."],
            ].map(([name, line]) => (
              <div key={name} className="border-t-2 border-gold/30 pt-3">
                <h2 className="font-playfair text-base font-bold text-board dark:text-chalk">{name}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-chalk/60 leading-relaxed">{line}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Trust (accurate wording) ── */}
      <Section bg="white" size="sm">
        <Container size="narrow">
          <p className="text-center text-base sm:text-lg text-gray-600 dark:text-chalk/70 leading-relaxed">
            Built on years of learning experience. <span className="font-semibold text-board dark:text-chalk">Home Tuitions Bangalore</span>,
            operating since 2018, is the foundation behind Chalkboard Tuitions.
          </p>
        </Container>
      </Section>
    </>
  );
}
