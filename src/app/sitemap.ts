import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { STUDIO_PAGES, studioUrl } from "@/lib/studio";
import { POSTS, postPath } from "@/lib/insights";

/**
 * Public routes only. /admin is the OS and is noindex + auth-guarded, so it
 * never belongs in here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/tuitions`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
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
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/os`, lastModified, changeFrequency: "yearly", priority: 0.4 },
  ];
}
