const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";

const localBusiness = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["EducationalOrganization", "LocalBusiness"],
      "@id": `${SITE_URL}/#organization`,
      name: "Chalkboard Tuitions",
      url: SITE_URL,
      logo: `${SITE_URL}/logo-dark.png`,
      image: `${SITE_URL}/logo-dark.png`,
      description:
        "Small-batch daily tuitions for Grades 1–10 in Kammanahalli and Kalyan Nagar, Bangalore. Max 8 students per batch. CBSE, ICSE and Karnataka State Board covered.",
      telephone: "+917411446381",
      email: "chalkboardtuitions@gmail.com",
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, UPI, Bank Transfer",
      openingHours: "Mo-Fr 16:00-20:00",
      sameAs: ["https://www.instagram.com/chalkboard.tuitions/"],
      hasMap: "https://www.google.com/maps/search/Kammanahalli+Bangalore+Karnataka+India",
      location: [
        {
          "@type": "Place",
          name: "Chalkboard Tuitions — Kammanahalli",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Kammanahalli",
            addressRegion: "Karnataka",
            addressCountry: "IN",
            addressCity: "Bangalore",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 13.0275,
            longitude: 77.6477,
          },
        },
        {
          "@type": "Place",
          name: "Chalkboard Tuitions — Kalyan Nagar",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Kalyan Nagar",
            addressRegion: "Karnataka",
            addressCountry: "IN",
            addressCity: "Bangalore",
          },
        },
      ],
      knowsAbout: [
        "CBSE curriculum",
        "ICSE curriculum",
        "Karnataka State Board (KSEEB)",
        "Mathematics tutoring",
        "Science tutoring",
        "English tutoring",
        "Grades 1 to 10 education",
      ],
      offers: {
        "@type": "Offer",
        description: "Free demo class with no obligation",
        price: "0",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
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
            text: "We run weekday batches from 4 PM to 8 PM. WhatsApp us to check current slot availability for your preferred grade.",
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
            text: "Three ways: weekly WhatsApp updates covering topics taught and homework assigned; monthly printed progress cards after formal tests; and a direct WhatsApp line to reach us anytime.",
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
    />
  );
}
