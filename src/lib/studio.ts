import { SITE_URL } from "@/lib/site";
import { CONTACT_EMAIL } from "@/lib/contact";

/**
 * Chalkboard Learning Studio — the one place its pages, URLs and structured
 * data come from. The sitemap, breadcrumbs, the hub's links and every page's
 * JSON-LD read this module, so adding a page here is what makes it findable.
 */

export const STUDIO_PATH = "/learning-studio";
export const STUDIO_URL = `${SITE_URL}${STUDIO_PATH}`;
export const STUDIO_NAME = "Chalkboard Learning Studio";

export type StudioPage = {
  path: string;
  /** Short name for breadcrumbs and nav. */
  name: string;
  /** Last real content change (YYYY-MM-DD). Feeds sitemap lastModified, so bump it only when the page changes. */
  updated: string;
  /** Label in the Studio nav. Pages without one are reached from the hub and footer. */
  nav?: string;
};

// Insertion order is nav order.
export const STUDIO_PAGES = {
  hub: { path: STUDIO_PATH, name: "Learning Studio", updated: "2026-10-28" },
  aiTraining: { path: `${STUDIO_PATH}/ai-training`, name: "AI training", updated: "2026-10-28", nav: "AI training" },
  colleges: { path: `${STUDIO_PATH}/colleges`, name: "Colleges & universities", updated: "2026-10-28", nav: "Colleges" },
  trainers: { path: `${STUDIO_PATH}/trainers`, name: "Trainers", updated: "2026-10-28", nav: "Trainers" },
} satisfies Record<string, StudioPage>;

/** Pages planned but not built yet. Links to them fall back to the enquiry form until they exist. */
export type PlannedPage = "customCourses" | "work" | "insights";

/**
 * Where a link to a Studio page should go. A page that isn't in the registry
 * yet sends people to the enquiry form, so no phase ever ships a broken link.
 */
export function linkTo(key: keyof typeof STUDIO_PAGES | PlannedPage): { href: string; live: boolean } {
  const page = (STUDIO_PAGES as Record<string, StudioPage>)[key];
  return page ? { href: page.path, live: true } : { href: `${STUDIO_PATH}#enquire`, live: false };
}

export const studioUrl = (path: string) => `${SITE_URL}${path}`;

/* ── Country versions (hreflang) ───────────────────────────────────────────
 * Country pages live as subfolders of the Studio: /learning-studio/us/…,
 * /learning-studio/uk/…, /learning-studio/ca/…. None exist yet. Add a market
 * here only when its pages genuinely differ (time-zone overlap, currency,
 * UK GDPR handling); a translated-by-find-and-replace copy is a doorway page.
 *
 * Each entry maps a global Studio path to its country version. Until a path
 * has at least one country version, it gets a plain canonical and no hreflang.
 */
type Market = { code: "us" | "uk" | "ca"; hreflang: "en-US" | "en-GB" | "en-CA"; paths: Record<string, string> };
export const STUDIO_MARKETS: Market[] = [];

export function studioAlternates(path: string) {
  const canonical = studioUrl(path);
  const versions = STUDIO_MARKETS.filter((m) => m.paths[path]);
  if (versions.length === 0) return { canonical };
  return {
    canonical,
    languages: {
      en: canonical,
      "x-default": canonical,
      ...Object.fromEntries(versions.map((m) => [m.hreflang, studioUrl(m.paths[path])])),
    },
  };
}

/* ── Structured data ─────────────────────────────────────────────────────── */

/** Bengaluru, stated plainly. No street address: the Studio has no public office. */
const BENGALURU = {
  "@type": "PostalAddress",
  addressLocality: "Bengaluru",
  addressRegion: "Karnataka",
  addressCountry: "IN",
};

const CHALKBOARD_ID = `${SITE_URL}/#organization`;
export const STUDIO_ID = `${STUDIO_URL}#studio`;

/**
 * Both organisation nodes go on every Studio page, so a crawler landing here
 * never meets a dangling @id. The homepage carries a fuller copy of the first.
 */
const ORG_NODES = [
  {
    "@type": "Organization",
    "@id": CHALKBOARD_ID,
    name: "Chalkboard",
    legalName: "Chalkboard Learning Services LLP",
    url: SITE_URL,
    address: BENGALURU,
  },
  {
    "@type": "Organization",
    "@id": STUDIO_ID,
    name: STUDIO_NAME,
    url: STUDIO_URL,
    logo: `${SITE_URL}/studio-emblem.png`,
    email: CONTACT_EMAIL,
    address: BENGALURU,
    parentOrganization: { "@id": CHALKBOARD_ID },
    description:
      "Custom training built around what people need to be able to do: AI at work, sales, customer support and leadership for companies; placement and industry programmes for colleges; courses built from a client's own material.",
    knowsAbout: [
      "Generative AI at work",
      "Prompt writing",
      "Sales training",
      "Customer support training",
      "Leadership development",
      "Campus recruitment training",
      "Instructional design",
      "E-learning development",
    ],
  },
];

export type ServiceInput = {
  id: string;
  name: string;
  description: string;
  path: string;
  serviceType: string;
  audience: "business" | "college";
};

export function studioService(s: ServiceInput) {
  return {
    "@type": "Service",
    "@id": `${studioUrl(s.path)}#${s.id}`,
    name: s.name,
    description: s.description,
    url: studioUrl(s.path),
    serviceType: s.serviceType,
    provider: { "@id": STUDIO_ID },
    audience:
      s.audience === "business"
        ? { "@type": "BusinessAudience", audienceType: "Companies and teams" }
        : { "@type": "EducationalAudience", educationalRole: "College and university" },
  };
}

export function breadcrumbs(trail: Pick<StudioPage, "name" | "path">[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Chalkboard", path: "" }, ...trail].map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: studioUrl(t.path),
    })),
  };
}

/** One @graph per page: the organisations, then whatever the page adds. */
export function studioGraph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": [...ORG_NODES, ...nodes] };
}
