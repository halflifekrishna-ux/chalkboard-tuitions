import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";

export const metadata: Metadata = {
  title: "Contact Chalkboard Tuitions — Book a Free Assessment",
  description:
    "Book a free tuition assessment with Chalkboard Tuitions, or ask about batches and timings in Kammanahalli & Kalyan Nagar, Bangalore.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

/**
 * /contact — the Chalkboard Tuitions contact page (demo form → /api/contact,
 * WhatsApp, location map). Learning Studio has its own email-only enquiry
 * form at /learning-studio#enquire; the section here points Studio visitors
 * there instead of taking their enquiry on the Tuitions form.
 */
export default function ContactPage() {
  return (
    <div className="pt-16">
      <Contact />
    </div>
  );
}
