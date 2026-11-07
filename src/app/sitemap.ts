import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { STUDIO_PAGES, studioUrl } from "@/lib/studio";
import { POSTS, postPath } from "@/lib/insights";

/**
 * Last real content change (YYYY-MM-DD) of each page outside the Studio
 * registry. Bump a date only when that page's content changes. Using the build
 * time instead (new Date()) told Google every page changed on every deploy, and
 * Google stops trusting a sitemap's lastmod once it sees that.
 */
const PAGE_UPDATED = {
  home: "2026-10-28",
  tuitions: "2026-10-22",
  contact: "2026-10-22",
  about: "2026-10-28",
  os: "2026-10-21",
} as const;

/**
 * Public routes only. /admin is the OS and is noindex + auth-guarded, so it
 * never belongs in here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const at = (key: keyof typeof PAGE_UPDATED) => new Date(PAGE_UPDATED[key]);

  return [
    { url: SITE_URL, lastModified: at("home"), changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/tuitions`, lastModified: at("tuitions"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified: at("contact"), changeFrequency: "monthly", priority: 0.8 },
    // Learning Studio: every page in the registry, dated by its last real change.
    ...Object.values(STUDIO_PAGES).map((p) => ({
      url: studioUrl(p.path),
      lastModified: new Date(p.updated),
      changeFrequency: "monthly" as const,
      priority: p.path === STUDIO_PAGES.hub.path ? 0.9 : 0.7,
    })),
    ...POSTS.map((p) => ({
      url: studioUrl(postPath(p.slug)),
      lastModified: new Date(p.updated),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/about`, lastModified: at("about"), changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/os`, lastModified: at("os"), changeFrequency: "yearly", priority: 0.4 },
  ];
}
