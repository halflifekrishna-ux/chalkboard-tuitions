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
    default: "Chalkboard Tuitions | Small-Batch Daily Tuitions in Bangalore",
    template: "%s | Chalkboard Tuitions",
  },
  description:
    "Expert tuitions for Grades 1–10 in Kammanahalli & Kalyan Nagar, Bangalore. Max 8 students per batch. CBSE, ICSE & Karnataka State Board covered. Book your FREE demo class today.",
  keywords: [
    "tuitions near me",
    "tuition centre Kammanahalli",
    "Kalyan Nagar tuitions",
    "CBSE tuitions Bangalore",
    "ICSE coaching Bangalore",
    "Karnataka State Board tuitions",
    "small batch tuitions Bangalore",
    "grade 10 board coaching Bangalore",
    "KSEEB coaching",
    "daily tuitions Bangalore",
  ],
  authors: [{ name: "Chalkboard Tuitions" }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Chalkboard Tuitions | Small-Batch Daily Tuitions in Bangalore",
    description:
      "Expert tuitions for Grades 1–10. Max 8 students per batch. 5 days a week. CBSE, ICSE & State Board. Kammanahalli & Kalyan Nagar, Bangalore.",
    type: "website",
    url: SITE_URL,
    locale: "en_IN",
    siteName: "Chalkboard Tuitions",
    images: [
      {
        url: "/logo-dark.png",
        width: 1080,
        height: 1080,
        alt: "Chalkboard Tuitions — Small Batch Tuitions Bangalore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chalkboard Tuitions | Small-Batch Daily Tuitions in Bangalore",
    description:
      "Expert tuitions for Grades 1–10. Max 8 students per batch. Kammanahalli & Kalyan Nagar, Bangalore.",
    images: ["/logo-dark.png"],
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
