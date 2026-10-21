import type { Metadata } from "next";
import { SITE_URL, OG_IMAGES } from "@/lib/site";
import { isContactTopic } from "@/lib/contact";
import { ContactRouter } from "@/components/marketing/ContactRouter";

export const metadata: Metadata = {
  title: { absolute: "Contact Chalkboard — Tuitions, Training & Colleges" },
  description:
    "Contact Chalkboard in Bengaluru: book a free tuition demo class in Kammanahalli, or enquire about corporate training, college programmes or training with us.",
  keywords: [
    "Chalkboard contact",
    "book free demo class Bangalore",
    "tuitions Kammanahalli contact",
    "corporate training enquiry Bengaluru",
    "college placement training enquiry",
  ],
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact Chalkboard",
    description: "Tuitions, training for teams, college programmes — tell us what you need and we'll route you to the right people.",
    url: `${SITE_URL}/contact`,
    type: "website",
    images: OG_IMAGES,
  },
};

/**
 * /contact — the one contact page for all of Chalkboard. The ContactRouter
 * asks what the visitor is contacting us about and shows the matching route.
 * `?for=` preselects a route (from a CTA elsewhere, or a shared link); the
 * canonical stays /contact so the variants never compete in search.
 */
export default function ContactPage({ searchParams }: { searchParams: { for?: string } }) {
  return <ContactRouter initial={isContactTopic(searchParams.for) ? searchParams.for : null} />;
}
