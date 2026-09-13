import type { Metadata } from "next";
import { GraduationCap, Briefcase, MonitorSmartphone } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { TrustBanner } from "@/components/marketing/TrustBanner";
import { CTASection } from "@/components/marketing/CTASection";
import { InMemory } from "@/components/marketing/InMemory";
import { InMemoryQuotes } from "@/components/marketing/InMemoryQuotes";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";
const WHATSAPP = "917411446381";

export const metadata: Metadata = {
  title: "About Chalkboard — The Teacher This Was Built On",
  description:
    "Chalkboard grew out of Home Tuitions Bangalore, founded by the late Uma Maheshwari, who taught until the end of her life. The same teachers, the same standard, a structure built to carry it further.",
  keywords: [
    "Home Tuitions Bangalore",
    "Uma Maheshwari",
    "Chalkboard Tuitions about",
    "tuition centre Bangalore since 2018",
  ],
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Chalkboard — The Teacher This Was Built On",
    description:
      "Chalkboard grew out of Home Tuitions Bangalore and the way one teacher insisted on being understood, not repeated.",
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
        title="Someone taught us"
        highlight="how to do this."
        subtitle="Chalkboard did not start with a business plan. It started with a teacher, and a way of teaching worth keeping."
      />

      <Section bg="white">
        <Container size="narrow">
          <SectionHeading align="left" eyebrow="Our Philosophy" title="Learning is personal. So is trust." />
          <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Big classrooms lose children. Crowded tuition rooms lose them faster. Keep the room small
              enough that a teacher knows every child&rsquo;s name, pace and blind spots, and progress
              stops being a surprise.
            </p>
            <p>
              We did not arrive at that from theory. We watched it work, for years, in one teacher&rsquo;s
              classes.
            </p>
          </div>
        </Container>
      </Section>

      <InMemory />
      <InMemoryQuotes />

      <TrustBanner />

      <Section bg="white">
        <Container>
          <SectionHeading eyebrow="The Handover" title="From Home Tuitions Bangalore to Chalkboard" subtitle="The same teachers. The same standard. A structure built to carry it further." />
          <div className="mt-8 max-w-2xl mx-auto space-y-4 text-gray-600 leading-relaxed">
            <p>
              Chalkboard began there. I brought together the teachers she worked with, kept the way she
              taught, and built the structure she never had the time to build — proper records, honest
              tracking, parents who actually hear from us.
            </p>
            <p>
              I spend my working life in learning and development. She is the reason I care about it at
              all. So Chalkboard is not only a tuition centre: it is meant to hold every kind of
              learning, for school children, for graduates, and for teams at work.
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
