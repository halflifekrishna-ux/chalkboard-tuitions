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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";

export const metadata: Metadata = {
  title: "Small-Batch Tuitions in Bangalore — CBSE, ICSE & State Board (LKG–10)",
  description:
    "Chalkboard Tuitions: expert small-batch daily tuitions for Grades LKG–10 in Kammanahalli & Kalyan Nagar, Bangalore. Max 8 students per batch. CBSE, ICSE & Karnataka State Board. Book your free demo class.",
  alternates: { canonical: `${SITE_URL}/tuitions` },
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
      <Features />
      <Testimonials />
      <Pricing />
      <About />
      <FAQ />
      <Contact />
    </>
  );
}
