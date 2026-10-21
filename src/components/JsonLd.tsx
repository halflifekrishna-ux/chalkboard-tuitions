import { CONTACT_EMAIL } from "@/lib/contact";
import { SITE_URL } from "@/lib/site";
import { TUITIONS_FAQS } from "@/lib/tuitions-faq";
import { CENTRE } from "@/lib/tuitions-location";

const SUBJECTS = [
  "CBSE curriculum",
  "ICSE curriculum",
  "Karnataka State Board (KSEEB)",
  "Mathematics tutoring",
  "Science tutoring",
  "English tutoring",
  "Social Studies tutoring",
  "Grade 10 board exam preparation",
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // One centre, one node: the same name, address, phone and pin as the
      // Google Business Profile (all from src/lib/tuitions-location.ts).
      // The tuition business sits under "Chalkboard" — the homepage's
      // #organization — alongside the Learning Studio.
      "@type": ["EducationalOrganization", "LocalBusiness"],
      "@id": `${SITE_URL}/tuitions#tuitions`,
      name: CENTRE.name,
      alternateName: "Chalkboard Tuitions Kammanahalli",
      url: `${SITE_URL}/tuitions`,
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
      logo: `${SITE_URL}/logo-dark.png`,
      image: `${SITE_URL}/logo-dark.png`,
      description:
        "Small-batch daily tuitions for Grades 1–10 at Pooja Arcade, Kammanahalli Main Road, Bengaluru — serving Kalyan Nagar, HRBR Layout, Banaswadi and St Thomas Town. Maximum 8 students per batch. CBSE, ICSE and Karnataka State Board.",
      telephone: CENTRE.phone,
      email: CONTACT_EMAIL,
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, UPI, Bank Transfer",
      address: {
        "@type": "PostalAddress",
        streetAddress: CENTRE.street,
        addressLocality: CENTRE.city,
        addressRegion: CENTRE.region,
        postalCode: CENTRE.postalCode,
        addressCountry: "IN",
      },
      geo: { "@type": "GeoCoordinates", ...CENTRE.geo },
      hasMap: CENTRE.mapsUrl,
      areaServed: CENTRE.areasServed.map((name) => ({ "@type": "Place", name })),
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: CENTRE.hours.opens,
        closes: CENTRE.hours.closes,
      },
      sameAs: [CENTRE.instagram, CENTRE.facebook, "https://www.urbanpro.com/bangalore/chalkboard-tuitions-kammanahalli/65161031"],
      knowsAbout: SUBJECTS,
      slogan: "Small batches. Real attention. Steady progress.",
      makesOffer: {
        "@type": "Offer",
        name: "Free demo class",
        description: "A full trial class alongside the batch, with no obligation to enrol.",
        price: "0",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
    },

    // Mirrors the FAQ section rendered on this same page — Google requires the
    // answers to be visible on the page carrying this markup.
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/tuitions#faq`,
      mainEntity: TUITIONS_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
