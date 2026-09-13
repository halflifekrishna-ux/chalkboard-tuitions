import type { Metadata } from "next";
import { UserPlus, ClipboardCheck, Wallet, MessageCircle, BarChart3, GraduationCap, Sparkles } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";

export const metadata: Metadata = {
  title: "Chalkboard OS — The Platform Powering Chalkboard",
  description:
    "Chalkboard OS is the technology platform that runs Chalkboard — admissions, attendance, fees, parent communication and analytics in one place.",
  alternates: { canonical: `${SITE_URL}/os` },
  openGraph: {
    title: "Chalkboard OS — The Platform Powering Chalkboard",
    description:
      "Admissions, attendance, fees, parent communication and analytics for a learning centre — in one calm, reliable system.",
    url: `${SITE_URL}/os`,
    type: "website",
  },
};

const capabilities = [
  { icon: UserPlus, name: "Admissions & Students", body: "Enrolment, student records and family details in one organised place." },
  { icon: ClipboardCheck, name: "Attendance", body: "Fast, session-based attendance — mark a whole class in seconds." },
  { icon: Wallet, name: "Fees", body: "Invoices, receipts and reminders. (Rolling out.)" },
  { icon: MessageCircle, name: "Parent Communication", body: "Automated WhatsApp updates that keep parents in the loop." },
  { icon: BarChart3, name: "Analytics", body: "Attendance and progress insights across batches. (Coming soon.)" },
  { icon: GraduationCap, name: "Learning Management", body: "Homework, assessments and reports. (On the roadmap.)" },
];

export default function OSPage() {
  return (
    <>
      <Hero
        eyebrow="Chalkboard OS"
        title="The platform"
        highlight="powering Chalkboard."
        subtitle="Chalkboard OS is the technology behind the scenes — bringing admissions, attendance, fees and parent communication into one calm, reliable system."
        primary={{ label: "Login", href: "/admin/login" }}
      />

      <Section bg="white">
        <Container>
          <SectionHeading eyebrow="What it does" title="One platform for running a learning centre" subtitle="Built for how tuition centres actually operate — fast on a phone, quiet when it should be." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c) => (
              <div key={c.name} className="rounded-2xl border border-gray-100 dark:border-chalk/10 bg-cream-bg/60 dark:bg-board/20 p-6">
                <c.icon size={22} className="text-gold" />
                <h3 className="mt-4 font-playfair text-lg font-bold text-board dark:text-chalk">{c.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-chalk/60">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-board-deep text-chalk px-6 py-8 text-center">
            <Sparkles size={20} className="text-chalk-yellow" />
            <p className="font-playfair text-lg font-semibold">Already part of Chalkboard?</p>
            <p className="text-sm text-chalk/60 max-w-md">Sign in to manage your centre. Access is invite-only for staff today; parent and student portals are on the way.</p>
            <div className="mt-2">
              <Button href="/admin/login" variant="primary">Login to Chalkboard OS</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
