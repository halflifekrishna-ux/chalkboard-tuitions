import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";

export const metadata: Metadata = {
  title: "Contact Chalkboard — Book a Free Assessment or Talk to Us",
  description:
    "Get in touch with Chalkboard. Book a free tuition assessment, ask about batches and timings in Kammanahalli & Kalyan Nagar, Bangalore, or reach the Learning Studio team.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

/**
 * /contact — unified contact page. Reuses the existing tuition contact section
 * (form → /api/contact, WhatsApp, location map). Studio "Talk to Sales" links
 * here; the message field lets institutional enquiries identify themselves.
 */
export default function ContactPage() {
  return (
    <div className="pt-16">
      <Contact />
    </div>
  );
}
