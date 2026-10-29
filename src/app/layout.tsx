import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Special_Elite } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { WhatsAppFab } from "@/components/ui/whatsapp-fab";
import { SITE_URL, OG_IMAGES } from "@/lib/site";

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

// Only the Tuitions page uses this face. Not preloaded, so other pages stop
// paying for it on first paint; Tuitions still loads it when it's used.
const specialElite = Special_Elite({
  subsets: ["latin"],
  variable: "--font-special-elite",
  weight: "400",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Chalkboard — Personalised Learning in Bangalore",
    template: "%s | Chalkboard",
  },
  description:
    "Expert tuitions for Grades 1–10 in Kammanahalli, Bangalore, near Kalyan Nagar. Max 8 students per batch. CBSE, ICSE & Karnataka State Board covered. Book your free demo class today.",
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
      "Expert tuitions for Grades 1–10. Max 8 students per batch, five days a week. CBSE, ICSE & State Board. Kammanahalli, Bengaluru.",
    type: "website",
    url: SITE_URL,
    locale: "en_IN",
    siteName: "Chalkboard Tuitions",
    images: OG_IMAGES,
  },
  // No title/description here: pages don't set their own, so a fixed Tuitions
  // line would show on the Studio pages. Without them, X falls back to each
  // page's og:title and og:description.
  twitter: {
    card: "summary_large_image",
    images: OG_IMAGES,
  },
  // Search Console ownership token for the chalkboard-tuitions.vercel.app
  // URL-prefix property (used to watch the old URLs drop out of the index).
  verification: { google: "4OkWSu2Uyy1YMkrG7Np2KO0-yhcvvQAbu8QkWZuFGSQ" },
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
      lang="en-IN"
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
