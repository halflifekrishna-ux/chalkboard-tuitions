import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, MessageCircle } from "lucide-react";
import { Contact } from "@/components/sections/Contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";

export const metadata: Metadata = {
  title: "Contact Chalkboard Tuitions — Book a Free Demo Class in Bangalore",
  description:
    "Book a free demo class with Chalkboard Tuitions, or ask about batches and timings in Kammanahalli & Kalyan Nagar, Bengaluru. Grades 1–10, CBSE, ICSE and State Board.",
  keywords: [
    "tuition centre near me Bangalore",
    "book free demo class Bangalore",
    "tuitions Kammanahalli contact",
    "tuitions Kalyan Nagar contact",
  ],
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Book a Free Demo Class — Chalkboard Tuitions, Bengaluru",
    description:
      "Tell us your child's grade and board, and we'll find a batch that fits. Kammanahalli & Kalyan Nagar, Bengaluru.",
    url: `${SITE_URL}/contact`,
    type: "website",
  },
};

const facts = [
  { icon: MapPin, label: "Two centres", value: "Kammanahalli & Kalyan Nagar" },
  { icon: Clock, label: "Class timings", value: "4–8 PM, Monday to Friday" },
  { icon: MessageCircle, label: "Reply time", value: "Within 30 minutes on WhatsApp" },
];

/**
 * /contact — the Chalkboard Tuitions contact page. The page owns the <h1> and a
 * short lede; the shared <Contact /> section below carries the form, map and
 * WhatsApp route. Learning Studio enquiries go to /learning-studio#enquire.
 */
export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-board pt-28 pb-16 sm:pt-32">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-20"
          style={{ background: "radial-gradient(ellipse 60% 100% at 50% 0%, #f4c430, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="font-special-elite text-[11px] uppercase tracking-[0.28em] text-chalk-yellow/90">
            Talk to us
          </span>
          <h1 className="mt-5 font-playfair text-4xl font-black leading-[1.08] tracking-tight text-chalk sm:text-5xl lg:text-6xl">
            Come see a class before
            <span className="text-chalk-yellow"> you decide.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-chalk/65 sm:text-lg">
            Sit your child in a real batch, meet the teacher, and watch how a room of eight
            actually runs. Tell us the grade and board below and we&apos;ll find a slot that fits —
            usually within the same week.
          </p>

          <dl className="mt-12 grid gap-4 sm:grid-cols-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-chalk/10 bg-chalk/[0.04] px-5 py-5 text-left backdrop-blur-sm"
              >
                <Icon size={16} className="text-chalk-yellow" aria-hidden />
                <dt className="mt-3 font-special-elite text-[10px] uppercase tracking-[0.18em] text-chalk/40">
                  {label}
                </dt>
                <dd className="mt-1 text-sm font-medium leading-snug text-chalk/85">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 text-sm text-chalk/45">
            Looking for corporate, college or trainer programmes? Head to{" "}
            <Link
              href="/learning-studio#enquire"
              className="whitespace-nowrap font-semibold text-chalk/75 underline decoration-chalk/30 underline-offset-4 transition-colors hover:text-chalk-yellow"
            >
              Chalkboard Learning Studio →
            </Link>
          </p>
        </div>
      </section>

      <Contact />
    </>
  );
}
