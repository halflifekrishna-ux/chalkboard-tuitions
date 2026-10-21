import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { Features } from "@/components/sections/Features";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { About } from "@/components/sections/About";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";
import { JsonLd } from "@/components/JsonLd";
import { LegacyProof } from "@/components/marketing/LegacyProof";
import { SITE_URL, OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Tuitions in Kammanahalli & Kalyan Nagar | Chalkboard" },
  description:
    "Small-batch tuitions for Grades 1–10 in Kammanahalli & Kalyan Nagar, Bengaluru. Max 8 per batch. CBSE, ICSE & State Board. Book a free demo class.",
  keywords: [
    "tuition centre Kammanahalli",
    "tuition classes Kalyan Nagar",
    "CBSE tuitions Bangalore",
    "ICSE tuitions Bengaluru",
    "state board tuitions Bangalore",
    "small batch tuition centre near me",
  ],
  alternates: { canonical: `${SITE_URL}/tuitions` },
  openGraph: {
    title: "Small-Batch Tuitions in Kammanahalli & Kalyan Nagar, Bengaluru",
    description:
      "Grades 1–10, CBSE · ICSE · State Board. Max 8 students per batch, five days a week. Book a free demo class.",
    url: `${SITE_URL}/tuitions`,
    type: "website",
    siteName: "Chalkboard",
    images: OG_IMAGES,
  },
};

/**
 * /tuitions — the conversion-focused tuitions page. Composed from the existing,
 * proven section components (reused, not rewritten). Navbar + Footer are
 * provided by the (marketing) layout.
 */
export default function TuitionsPage() {
  return (
    <>
      <JsonLd />
      <Hero />
      <Stats />
      <LegacyProof />
      <Features />
      <Testimonials />
      <Pricing />
      <About />
      <FAQ />
      <Contact />
    </>
  );
}
