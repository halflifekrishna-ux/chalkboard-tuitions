import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PortalShader } from "@/components/ui/portal-shader";
import { Reveal } from "@/components/marketing/Reveal";
import { Pathways } from "@/components/marketing/Pathways";
import { CONTACT_EMAIL } from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";

export const metadata: Metadata = {
  title: { absolute: "Chalkboard — Learning, differently." },
  description:
    "Chalkboard is a learning ecosystem in Bengaluru: Chalkboard Tuitions for Grades 1–10, and Chalkboard Learning Studio for sales, support and team training. Built on Home Tuitions Bangalore, teaching since 2018.",
  keywords: ["Chalkboard", "Chalkboard Learning", "Chalkboard Tuitions", "Chalkboard Learning Studio", "Chalkboard OS"],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Chalkboard — Learning, differently.",
    description: "Tuitions for Grades 1–10 and training for teams at work — built on Home Tuitions Bangalore, teaching in Bengaluru since 2018.",
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
  email: CONTACT_EMAIL,
  logo: `${SITE_URL}/logo-dark.png`,
  description:
    "Chalkboard is a modern learning ecosystem spanning school tuitions, professional & institutional learning, and the technology platform that powers them.",
  brand: ["Chalkboard Tuitions", "Chalkboard Learning Studio", "Chalkboard OS"],
  sameAs: ["https://www.instagram.com/chalkboard.tuitions/"],
};

export default function HomePage() {
  return (
    <div className="bg-[#07110d] text-chalk">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      {/* If JS never runs, reveal everything rather than leaving it transparent. */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      {/* ── Hero: portal field ── */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        <PortalShader />

        {/* legibility scrim + chalk-line texture (decorative) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(100deg, rgba(7,17,13,0.9) 0%, rgba(7,17,13,0.68) 30%, rgba(7,17,13,0.24) 60%, rgba(7,17,13,0) 100%), linear-gradient(180deg, rgba(7,17,13,0.45) 0%, transparent 26%, transparent 76%, rgba(7,17,13,0.9) 100%), repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(245,240,232,0.022) 27px, rgba(245,240,232,0.022) 28px)",
          }}
        />

        <Container className="relative z-10">
          <div className="max-w-4xl">
            <span className="block font-special-elite text-sm sm:text-base uppercase tracking-[0.34em] text-chalk-yellow/90">
              Chalkboard
            </span>
            <h1 className="mt-5 break-words font-playfair font-black leading-[1.02] tracking-tight text-[clamp(2.75rem,9vw,6.5rem)]">
              Learning,{" "}
              <span className="italic font-bold text-chalk-yellow">differently.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-chalk/65 sm:text-xl">
              One ecosystem for every stage of learning — from the classroom to the workplace.
            </p>
          </div>
        </Container>

        <div aria-hidden className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-chalk/40">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">What brings you here?</span>
          <ChevronDown size={18} className="animate-bounce" />
        </div>
      </section>

      {/* ── Pathways ── */}
      <section className="relative py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-64" style={{ background: "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(244,196,48,0.07), transparent 70%)" }} />
        <Container className="relative z-10">
          <Reveal>
            <h2 className="mb-8 font-playfair text-3xl font-bold tracking-tight sm:text-4xl">What brings you here?</h2>
          </Reveal>
          <Reveal delay={90}>
            <Pathways />
          </Reveal>
        </Container>
      </section>

      {/* ── Trust — small, elegant, fades into the footer ── */}
      <section className="relative pb-24 pt-4" style={{ backgroundImage: "linear-gradient(180deg, transparent 0%, rgba(22,45,36,0.55) 100%)" }}>
        <Container size="narrow">
          <Reveal>
            <div className="border-t border-chalk/10 pt-10 text-center">
              <p className="font-playfair text-xl font-bold sm:text-2xl">This started with a teacher.</p>
              <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-chalk/55">
                <span className="font-semibold text-chalk/85">Home Tuitions Bangalore</span> has run since 2018.
                Chalkboard is the same teachers and the same standard — and the reason we are strict about how a
                thing gets taught.
              </p>
              <Link
                href="/about"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-chalk-yellow underline decoration-chalk-yellow/30 underline-offset-4 transition-colors hover:decoration-chalk-yellow"
              >
                Read how it started
                <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
