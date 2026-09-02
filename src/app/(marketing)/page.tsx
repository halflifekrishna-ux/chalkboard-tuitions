import type { Metadata } from "next";
import { Briefcase, MonitorSmartphone } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { TrustBanner } from "@/components/marketing/TrustBanner";
import { WhyChooseUs } from "@/components/marketing/WhyChooseUs";
import { JourneyStrip } from "@/components/marketing/JourneyStrip";
import { CTASection } from "@/components/marketing/CTASection";
import { JsonLd } from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";
const WHATSAPP = "917411446381";
const assess = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi! I'd like to book a free assessment for my child at Chalkboard Tuitions.")}`;

export const metadata: Metadata = {
  title: { absolute: "Chalkboard — Personalised Tuitions in Bangalore | Grades LKG–10, CBSE · ICSE · State" },
  description:
    "Chalkboard Tuitions: small daily batches (max 8), expert teachers and progress tracking for Grades LKG–10 across Kammanahalli & Kalyan Nagar, Bangalore. CBSE, ICSE & State Board. Trusted since 2018. Book a free assessment.",
  alternates: { canonical: SITE_URL },
};

export default function HomePage() {
  return (
    <>
      <JsonLd />

      <Hero
        eyebrow="Chalkboard Tuitions · Bangalore"
        title="Personalised tuitions for"
        highlight="Grades LKG–10."
        subtitle="Small daily batches, expert teachers and steady progress tracking — for CBSE, ICSE and State Board students across Kammanahalli and Kalyan Nagar. Trusted by families since 2018."
        chips={["Grades LKG–10", "CBSE · ICSE · State", "Max 8 per batch", "5 days a week", "Kammanahalli & Kalyan Nagar", "Since 2018"]}
        primary={{ label: "Book a Free Assessment", href: assess, external: true }}
        secondary={{ label: "Explore Tuitions", href: "/tuitions" }}
        note="Free assessment · No obligation · We usually reply within a day."
      />

      <TrustBanner />

      <WhyChooseUs subtitle="Everything we do is built around one thing — your child making real, visible progress." />

      <CTASection
        title="Book your child's free assessment"
        subtitle="We'll understand where your child is today and show you exactly how Chalkboard can help — no pressure, no obligation."
        primary={{ label: "Book a Free Assessment", href: assess, external: true }}
        secondary={{ label: "See courses & timings", href: "/tuitions" }}
      />

      {/* Secondary journey — introduced only after the Tuitions story is told */}
      <JourneyStrip
        eyebrow="Chalkboard Learning Studio"
        title="Looking for corporate or college learning?"
        description="Beyond school tuitions, Chalkboard Learning Studio delivers professional and institutional programs — for colleges, corporates, and training partners."
        cta={{ label: "Explore Learning Studio", href: "/learning-studio" }}
        icon={<Briefcase size={22} />}
      />

      {/* Quiet OS utility */}
      <JourneyStrip
        tone="dark"
        eyebrow="Chalkboard OS"
        title="Already a Chalkboard student or team member?"
        description="Access admissions, attendance, fees and parent communication in one place."
        cta={{ label: "Login", href: "/admin/login" }}
        icon={<MonitorSmartphone size={22} />}
      />
    </>
  );
}
