import type { Metadata } from "next";
import { GraduationCap, Briefcase, MonitorSmartphone } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { TrustBanner } from "@/components/marketing/TrustBanner";
import { CTASection } from "@/components/marketing/CTASection";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";
const WHATSAPP = "917411446381";

export const metadata: Metadata = {
  title: "About Chalkboard — Personalised Learning, Built on Trust",
  description:
    "Chalkboard is a learning company built on the experience of Home Tuitions Bangalore since 2018 — spanning school tuitions, professional learning, and the technology that powers them.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Chalkboard — Personalised Learning, Built on Trust",
    description:
      "A learning company built on the experience of Home Tuitions Bangalore since 2018 — school tuitions, professional learning, and the technology behind them.",
    url: `${SITE_URL}/about`,
    type: "website",
  },
};

const pillars = [
  { icon: GraduationCap, name: "Chalkboard Tuitions", body: "Small-batch, personalised academic learning for Grades 1–10 across CBSE, ICSE and State Board." },
  { icon: Briefcase, name: "Chalkboard Learning Studio", body: "Professional and institutional programs for colleges, corporates, and training partners." },
  { icon: MonitorSmartphone, name: "Chalkboard OS", body: "The technology platform that runs admissions, attendance, fees and communication — and will power learning experiences over time." },
];

export default function AboutPage() {
  return (
    <>
      <Hero
        eyebrow="About Chalkboard"
        title="Why Chalkboard"
        highlight="exists."
        subtitle="We believe every learner deserves personal attention, steady progress, and teachers who genuinely care. Chalkboard exists to make that the standard — not the exception."
      />

      <Section bg="white">
        <Container size="narrow">
          <SectionHeading align="left" eyebrow="Our Philosophy" title="Learning is personal. So is trust." />
          <div className="mt-6 space-y-4 text-gray-600 dark:text-chalk/70 leading-relaxed">
            <p>
              Big classrooms lose children. Crowded tuition rooms lose them faster. We started from a
              simple conviction: when a teacher knows every student by name — their strengths, their
              gaps, their pace — progress follows naturally.
            </p>
            <p>
              That belief shapes everything at Chalkboard: small batches, daily consistency, honest
              assessments, and parents kept genuinely in the loop. We would rather grow slowly and keep
              our standards than grow fast and dilute them.
            </p>
          </div>
        </Container>
      </Section>

      <TrustBanner />

      <Section bg="white">
        <Container>
          <SectionHeading eyebrow="Our Journey" title="From Home Tuitions Bangalore to Chalkboard" subtitle="Same people. Same care. A stronger platform to deliver it." />
          <div className="mt-8 max-w-2xl mx-auto space-y-4 text-center text-gray-600 dark:text-chalk/70 leading-relaxed">
            <p>
              Since 2018, Home Tuitions Bangalore has supported hundreds of students with personalised
              academic help. Chalkboard is the next chapter of that work — the same teachers and values,
              now backed by better structure, better tracking, and technology that keeps families
              informed every step of the way.
            </p>
          </div>
        </Container>
      </Section>

      <Section bg="cream">
        <Container>
          <SectionHeading eyebrow="The Ecosystem" title="Three pillars, one belief" subtitle="Everything Chalkboard builds serves the same goal — learning that actually works." />
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.name} className="rounded-2xl border border-gray-100 dark:border-chalk/10 bg-white dark:bg-board/20 p-6">
                <p.icon size={24} className="text-gold" />
                <h3 className="mt-4 font-playfair text-lg font-bold text-board dark:text-chalk">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-chalk/60">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section bg="white" size="sm">
        <Container size="narrow">
          <SectionHeading align="left" eyebrow="Our Future" title="Learning for every stage of life" />
          <p className="mt-6 text-gray-600 dark:text-chalk/70 leading-relaxed">
            Chalkboard is growing from school tuitions into a broader learning ecosystem — supporting
            students, colleges and organisations alike. The mission stays the same at every stage:
            personal, measurable, trustworthy learning.
          </p>
        </Container>
      </Section>

      <CTASection
        title="Come see the difference for yourself"
        subtitle="Book a free assessment and meet the teachers who will work with your child."
        primary={{ label: "Book a Free Assessment", href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi! I'd like to book a free assessment at Chalkboard.")}`, external: true }}
        secondary={{ label: "Explore Tuitions", href: "/tuitions" }}
      />
    </>
  );
}
