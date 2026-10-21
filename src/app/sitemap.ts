import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

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
    { url: `${SITE_URL}/learning-studio`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/learning-studio/colleges`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/learning-studio/trainers`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/os`, lastModified, changeFrequency: "yearly", priority: 0.4 },
  ];
}
