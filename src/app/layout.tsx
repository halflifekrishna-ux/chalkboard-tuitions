import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Special_Elite } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { WhatsAppFab } from "@/components/ui/whatsapp-fab";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const specialElite = Special_Elite({
  subsets: ["latin"],
  variable: "--font-special-elite",
  weight: "400",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboard-tuitions.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Chalkboard — Personalised Learning in Bangalore",
    template: "%s | Chalkboard",
  },
  description:
    "Expert tuitions for Grades 1–10 in Kammanahalli & Kalyan Nagar, Bangalore. Max 8 students per batch. CBSE, ICSE & Karnataka State Board covered. Book your free demo class today.",
  keywords: [
    "tuitions near me",
    "tuition centre Kammanahalli",
    "tuition classes Kalyan Nagar",
    "tuitions in HRBR Layout",
    "tuition centre Banaswadi",
    "CBSE tuitions Bangalore",
    "ICSE coaching Bengaluru",
    "Karnataka State Board tuitions",
    "small batch tuitions Bangalore",
    "grade 10 board coaching Bangalore",
    "KSEEB coaching",
    "home tuitions Bangalore",
  ],
  authors: [{ name: "Chalkboard Tuitions" }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Chalkboard Tuitions | Small-Batch Daily Tuitions in Bangalore",
    description:
      "Expert tuitions for Grades 1–10. Max 8 students per batch, five days a week. CBSE, ICSE & State Board. Kammanahalli & Kalyan Nagar, Bengaluru.",
    type: "website",
    url: SITE_URL,
    locale: "en_IN",
    siteName: "Chalkboard Tuitions",
    // Card art comes from app/opengraph-image.tsx — a real 1200×630 landscape
    // card. Setting `images` here would override it with the square logo.
  },
  twitter: {
    card: "summary_large_image",
    title: "Chalkboard Tuitions | Small-Batch Daily Tuitions in Bangalore",
    description:
      "Expert tuitions for Grades 1–10. Max 8 students per batch. Kammanahalli & Kalyan Nagar, Bengaluru.",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "education",
};

export const viewport = {
  themeColor: "#1e3a2f",
  colorScheme: "light dark" as const,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${specialElite.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <WhatsAppFab />
        </ThemeProvider>
      </body>
    </html>
  );
}
