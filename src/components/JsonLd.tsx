import { CONTACT_EMAIL } from "@/lib/contact";
import { SITE_URL } from "@/lib/site";
import { TUITIONS_FAQS } from "@/lib/tuitions-faq";

const PHONE = "+917411446381";
const INSTAGRAM = "https://www.instagram.com/chalkboard.tuitions/";
const FACEBOOK = "https://www.facebook.com/chalkboardtuitions";
const MAP = "https://maps.app.goo.gl/GUPsuattjnL3HrsT7";

/** The catchment both centres actually draw from. */
const AREAS_SERVED = [
  "Kammanahalli",
  "Kalyan Nagar",
  "HRBR Layout",
  "Banaswadi",
  "Lingarajapuram",
  "Bengaluru",
].map((name) => ({ "@type": "Place", name }));

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

/**
 * One branch of the tuition centre. Google treats each physical location as its
 * own LocalBusiness, tied back to the brand via parentOrganization — a single
 * node with a `location` array does not surface both centres.
 */
function branch({
  id,
  name,
  locality,
  postalCode,
  geo,
}: {
  id: string;
  name: string;
  locality: string;
  postalCode: string;
  geo?: { latitude: number; longitude: number };
}) {
  return {
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": `${SITE_URL}/#${id}`,
    name,
    parentOrganization: { "@id": `${SITE_URL}/tuitions#tuitions` },
    url: `${SITE_URL}/tuitions`,
    image: `${SITE_URL}/logo-dark.png`,
    telephone: PHONE,
    email: CONTACT_EMAIL,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Bank Transfer",
    address: {
      "@type": "PostalAddress",
      streetAddress: locality,
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode,
      addressCountry: "IN",
    },
    ...(geo ? { geo: { "@type": "GeoCoordinates", ...geo } } : {}),
    areaServed: AREAS_SERVED,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "16:00",
      closes: "20:00",
    },
    hasMap: MAP,
    sameAs: [INSTAGRAM, FACEBOOK],
  };
}

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["EducationalOrganization", "LocalBusiness"],
      // The tuition business, not the umbrella: "Chalkboard" (the homepage's
      // #organization) is its parent, alongside the Learning Studio.
      "@id": `${SITE_URL}/tuitions#tuitions`,
      name: "Chalkboard Tuitions",
      alternateName: "Chalkboard Tuitions Bangalore",
      url: `${SITE_URL}/tuitions`,
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
      logo: `${SITE_URL}/logo-dark.png`,
      image: `${SITE_URL}/logo-dark.png`,
      description:
        "Small-batch daily tuitions for Grades 1–10 in Kammanahalli and Kalyan Nagar, Bengaluru. Maximum 8 students per batch, five days a week. CBSE, ICSE and Karnataka State Board covered.",
      telephone: PHONE,
      email: CONTACT_EMAIL,
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, UPI, Bank Transfer",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Kammanahalli",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        postalCode: "560084",
        addressCountry: "IN",
      },
      geo: { "@type": "GeoCoordinates", latitude: 13.0175, longitude: 77.6383 },
      areaServed: AREAS_SERVED,
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "16:00",
        closes: "20:00",
      },
      sameAs: [INSTAGRAM, FACEBOOK],
      hasMap: MAP,
      knowsAbout: SUBJECTS,
      numberOfEmployees: { "@type": "QuantitativeValue", minValue: 2 },
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

    branch({
      id: "kammanahalli",
      name: "Chalkboard Tuitions — Kammanahalli",
      locality: "Kammanahalli",
      postalCode: "560084",
      geo: { latitude: 13.0175, longitude: 77.6383 },
    }),
    branch({
      id: "kalyan-nagar",
      name: "Chalkboard Tuitions — Kalyan Nagar",
      locality: "Kalyan Nagar",
      postalCode: "560043",
      geo: { latitude: 13.0237, longitude: 77.6408 },
    }),

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
