/**
 * The canonical public origin. Every canonical, OG url, sitemap entry and
 * JSON-LD @id is built from this, so the fallback must be the real domain —
 * when NEXT_PUBLIC_SITE_URL was unset in Vercel, the old vercel.app fallback
 * told Google the vercel.app copy was the original of every page.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.chalkboardlearning.in").replace(/\/$/, "");
