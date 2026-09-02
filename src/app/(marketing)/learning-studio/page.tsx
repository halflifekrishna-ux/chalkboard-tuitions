import type { Metadata } from "next";
import { GraduationCap, Building2, Users2, HeartHandshake, Landmark, Rocket } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { CTASection } from "@/components/marketing/CTASection";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";

export const metadata: Metadata = {
  title: "Chalkboard Learning Studio — Professional & Institutional Learning",
  description:
    "Chalkboard Learning Studio delivers corporate training, campus & placement readiness, faculty development, e-learning and instructional design for colleges, corporates, NGOs, government and startups.",
  alternates: { canonical: `${SITE_URL}/learning-studio` },
};

const audiences = [
  { id: "colleges", icon: GraduationCap, name: "For Colleges", body: "Placement readiness, campus training and faculty development that lift student outcomes." },
  { id: "schools", icon: Users2, name: "For Schools", body: "Teacher training, curriculum support and technology-enabled learning programs." },
  { id: "corporates", icon: Building2, name: "For Corporates", body: "Role-based upskilling, onboarding academies and leadership learning that stick." },
  { id: "ngos", icon: HeartHandshake, name: "For NGOs", body: "Scalable, outcome-focused learning programs for community and skilling initiatives." },
  { id: "government", icon: Landmark, name: "For Government", body: "Large-scale training and capacity-building with measurable, auditable outcomes." },
  { id: "startups", icon: Rocket, name: "For Startups", body: "Fast, practical enablement — from sales readiness to product and process training." },
];

const model = [
  { step: "Problems", body: "We start with the real gap — skills, outcomes, or capability — not a fixed course catalogue." },
  { step: "Solutions", body: "A tailored blend of workshops, e-learning and coaching designed around your context." },
  { step: "Programs", body: "Structured delivery with clear milestones, facilitators and materials." },
  { step: "Outcomes", body: "Measured against agreed metrics, with reporting you can take to stakeholders." },
];

const capabilities = [
  "Corporate Training", "Campus Training", "Placement Readiness", "Faculty Development",
  "E-learning", "Instructional Design", "Learning Consulting", "Technology-Enabled Learning",
];

export default function LearningStudioPage() {
  return (
    <>
      <Hero
        eyebrow="Chalkboard Learning Studio"
        title="Professional & institutional"
        highlight="learning solutions."
        subtitle="Beyond school tuitions, Chalkboard Learning Studio partners with colleges, corporates and institutions to design learning that changes outcomes — not just attendance."
        primary={{ label: "Talk to Sales", href: "/contact" }}
        secondary={{ label: "See what we do", href: "#model" }}
      />

      <Section bg="white">
        <Container>
          <SectionHeading eyebrow="Who we work with" title="Solutions built around your audience" subtitle="B2B and institutional learning starts with who you are and the outcome you need." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map((a) => (
              <div key={a.id} id={a.id} className="scroll-mt-24 rounded-2xl border border-gray-100 dark:border-chalk/10 bg-cream-bg/60 dark:bg-board/20 p-6">
                <a.icon size={24} className="text-gold" />
                <h3 className="mt-4 font-playfair text-lg font-bold text-board dark:text-chalk">{a.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-chalk/60">{a.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section bg="cream" id="model">
        <Container>
          <SectionHeading eyebrow="How we work" title="From problem to measurable outcome" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {model.map((m, i) => (
              <div key={m.step} className="rounded-2xl bg-white dark:bg-board/20 border border-gray-100 dark:border-chalk/10 p-6">
                <span className="font-playfair text-2xl font-black text-gold/30">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-playfair text-lg font-bold text-board dark:text-chalk">{m.step}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-chalk/60">{m.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section bg="white" size="sm">
        <Container>
          <SectionHeading eyebrow="Capabilities" title="What we deliver" />
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {capabilities.map((c) => (
              <span key={c} className="rounded-full border border-board/15 dark:border-chalk/15 bg-cream-bg/60 dark:bg-board/20 px-4 py-2 text-sm font-medium text-board dark:text-chalk">
                {c}
              </span>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-chalk/45">
            Case studies and references available on request.
          </p>
        </Container>
      </Section>

      <CTASection
        eyebrow="Let's build it together"
        title="Design a learning program for your organisation"
        subtitle="Tell us your audience and the outcome you're after — we'll propose an approach."
        primary={{ label: "Talk to Sales", href: "/contact" }}
      />
    </>
  );
}
