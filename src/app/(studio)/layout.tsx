import type { Metadata } from "next";
import { EcosystemNavbar } from "@/components/marketing/EcosystemNavbar";
import { StudioFooter } from "@/components/marketing/learning-studio/StudioFooter";
import { Analytics } from "@/components/marketing/Analytics";
import { STUDIO_NAME } from "@/lib/studio";
import "./studio.css";

/**
 * Learning Studio layout. Its own route group so the Studio gets its own
 * footer and metadata defaults without touching what Tuitions and the rest of
 * the (marketing) group show. URLs are unchanged: route groups don't add a
 * path segment.
 *
 * The defaults here undo two things the root layout sets for the tuition
 * site: the tuition keyword list and "Chalkboard Tuitions" as author.
 */
export const metadata: Metadata = {
  title: { template: `%s | ${STUDIO_NAME}`, default: STUDIO_NAME },
  keywords: null,
  authors: [{ name: STUDIO_NAME }],
  // No images: each Studio route's opengraph-image.tsx supplies the card, and
  // X falls back to og:image when twitter:image is absent.
  twitter: { card: "summary_large_image" },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EcosystemNavbar />
      <main className="studio">{children}</main>
      <StudioFooter />
      <Analytics />
    </>
  );
}
