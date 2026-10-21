/**
 * The canonical public origin. Every canonical, OG url, sitemap entry and
 * JSON-LD @id is built from this, so the fallback must be the real domain —
 * when NEXT_PUBLIC_SITE_URL was unset in Vercel, the old vercel.app fallback
 * told Google the vercel.app copy was the original of every page.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.chalkboardlearning.in").replace(/\/$/, "");

/**
 * Share card for every page. Each page sets its own `openGraph`, and Next
 * replaces (not merges) the parent's — which silently drops the card that
 * app/opengraph-image.tsx would otherwise inject. Pass this explicitly.
 */
export const OG_IMAGES = [
  {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "Chalkboard — tuitions, corporate training and college programmes in Bengaluru",
  },
];
