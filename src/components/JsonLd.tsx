import { CONTACT_EMAIL } from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";
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
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
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
      "@id": `${SITE_URL}/#organization`,
      name: "Chalkboard Tuitions",
      alternateName: "Chalkboard Tuitions Bangalore",
      url: SITE_URL,
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

    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Chalkboard",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-IN",
    },

    // Mirrors the FAQ section rendered on this same page — Google requires the
    // answers to be visible on the page carrying this markup.
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/tuitions#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What grades and boards do you cover?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We cover Grades 1 through 10 across all three major boards — CBSE, ICSE, and Karnataka State Board (KSEEB). Every lesson is mapped to your child's specific board syllabus and exam pattern.",
          },
        },
        {
          "@type": "Question",
          name: "Why only 8 students per batch?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We believe individual attention is non-negotiable. With 8 students, every teacher knows every child's name, weaknesses, and learning style. Every doubt gets addressed before the class ends.",
          },
        },
        {
          "@type": "Question",
          name: "How does the free demo class work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Book a slot via WhatsApp or our contact form. We'll schedule a full demo class where your child participates alongside the batch. You see the quality, methodology, and environment before paying anything.",
          },
        },
        {
          "@type": "Question",
          name: "What subjects do you teach?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "For Grades 1–5: Maths, English, Environmental Studies, Hindi/Kannada. For Grades 6–10: Maths, Science (Physics, Chemistry, Biology), Social Studies, English, Hindi, and Kannada.",
          },
        },
        {
          "@type": "Question",
          name: "What are the class timings?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We run weekday batches from 4 PM to 8 PM, Monday to Friday. WhatsApp us to check current slot availability for your preferred grade.",
          },
        },
        {
          "@type": "Question",
          name: "Where are your centres in Bangalore?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We have two centres in north-east Bengaluru — Kammanahalli and Kalyan Nagar — serving families from HRBR Layout, Banaswadi, Lingarajapuram and the surrounding areas.",
          },
        },
        {
          "@type": "Question",
          name: "Are the workbooks included in the fee?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — branded Chalkboard Tuitions workbooks are included in all packages. These are curated workbooks with exercises, solved examples, and board-pattern questions. No extra charges for materials.",
          },
        },
        {
          "@type": "Question",
          name: "How do you communicate with parents?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Three ways: weekly WhatsApp updates covering topics taught and homework assigned; monthly printed progress cards for Grades 8–10 after formal tests; and a direct WhatsApp line to reach us anytime.",
          },
        },
        {
          "@type": "Question",
          name: "Is there a registration or admission fee?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "There is a seasonal admission fee that varies by board and grade. We do run offers where the registration fee is fully waived — WhatsApp us to check current promotions before enrolling.",
          },
        },
        {
          "@type": "Question",
          name: "Can I switch from monthly to an annual plan?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Many parents start monthly and switch to annual in Month 2 or 3. Annual packages save you up to ₹6,000 compared to 12 months of monthly billing.",
          },
        },
      ],
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
