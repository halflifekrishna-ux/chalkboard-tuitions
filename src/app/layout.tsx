import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Special_Elite } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://chalkboardtuitions.in"
  ),
  title: {
    default: "Chalkboard Tuitions | Small-Batch Daily Tuitions in Bangalore",
    template: "%s | Chalkboard Tuitions",
  },
  description:
    "Expert tuitions for Grades 1–10 in Kammanahalli & Kalyan Nagar. Max 8 students per batch. CBSE, ICSE & State Board covered. Book your FREE demo class today.",
  keywords: [
    "tuitions near me",
    "tuition centre Kammanahalli",
    "Kalyan Nagar tuitions",
    "CBSE tuitions Bangalore",
    "ICSE coaching Bangalore",
    "small batch tuitions",
    "home tuitions Bangalore",
    "10th board coaching Bangalore",
    "KSEEB coaching",
  ],
  authors: [{ name: "Chalkboard Tuitions" }],
  openGraph: {
    title: "Chalkboard Tuitions | Small-Batch Daily Tuitions",
    description:
      "Expert tuitions for Grades 1–10. Max 8 students per batch. 5 days a week. CBSE, ICSE & State Board. Kammanahalli & Kalyan Nagar, Bangalore.",
    type: "website",
    locale: "en_IN",
    siteName: "Chalkboard Tuitions",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Chalkboard Tuitions — Small Batch Tuitions Bangalore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chalkboard Tuitions | Small-Batch Daily Tuitions",
    description:
      "Expert tuitions for Grades 1–10. Max 8 students. Kammanahalli & Kalyan Nagar, Bangalore.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
