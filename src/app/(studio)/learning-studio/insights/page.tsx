import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { STUDIO_PAGES, STUDIO_ID, studioAlternates, studioGraph, studioUrl, breadcrumbs } from "@/lib/studio";
import { CLUSTERS, POSTS, postPath } from "@/lib/insights";
import { Scene, Inner, Kicker } from "@/components/marketing/learning-studio/Scene";

/*
 * /learning-studio/insights: posts grouped by topic cluster. Each cluster
 * shows its posts and links to the service page it supports. Clusters with
 * no posts yet still describe the topic and link to that page, so the index
 * never shows an empty shelf.
 */

const PAGE = STUDIO_PAGES.insights;

export const metadata: Metadata = {
  title: { absolute: "Insights on AI at Work, Training and Course Design | Chalkboard Learning Studio" },
  description:
    "Practical writing from Chalkboard Learning Studio on using AI at work, getting college students job-ready, and building courses people practise in.",
  alternates: studioAlternates(PAGE.path),
  openGraph: {
    title: "Insights from Chalkboard Learning Studio",
    description: "AI at work, college readiness and course design. Practical, and short.",
    url: studioAlternates(PAGE.path).canonical,
    type: "website",
    siteName: "Chalkboard Learning Studio",
  },
};

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const schema = studioGraph(
  {
    "@type": "Blog",
    "@id": `${studioUrl(PAGE.path)}#blog`,
    name: "Chalkboard Learning Studio Insights",
    url: studioUrl(PAGE.path),
    publisher: { "@id": STUDIO_ID },
    blogPost: POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: studioUrl(postPath(p.slug)),
      datePublished: p.published,
    })),
  },
  breadcrumbs([STUDIO_PAGES.hub, PAGE])
);

export default function InsightsIndex() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="relative overflow-hidden bg-board pb-20 pt-32 text-chalk sm:pb-24 sm:pt-40">
        <div aria-hidden className="grid-dots pointer-events-none" />
        <Inner className="relative">
          <Kicker tone="dark">Insights</Kicker>
          <h1 className="mt-7 max-w-4xl break-words font-playfair font-bold leading-[1.03] tracking-tight text-[clamp(2.6rem,9vw,6rem)]">
            What we&rsquo;ve learned <span className="font-playfair text-chalk-yellow">teaching it.</span>
          </h1>
          <span aria-hidden className="sx-hero-line mt-9 block h-px w-full max-w-md bg-gradient-to-r from-chalk-yellow/80 to-transparent" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-chalk/75 sm:text-xl">
            Short, practical writing on AI at work, getting students ready for the job, and building courses people practise
            in.
          </p>
        </Inner>
      </section>

      {CLUSTERS.map((c, i) => {
        const posts = POSTS.filter((p) => p.cluster === c.id);
        const tone = i % 2 === 0 ? "cream" : "dark";
        return (
          <Scene key={c.id} tone={tone} id={c.id} labelledBy={`${c.id}-heading`} className="py-20 sm:py-24">
            <Inner>
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-4">
                  <Kicker tone={tone}>Topic</Kicker>
                  <h2 id={`${c.id}-heading`} className="sx-focus mt-6 font-playfair text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.06] tracking-tight">
                    {c.name}
                  </h2>
                  <p className={"mt-4 text-base leading-relaxed " + (tone === "dark" ? "text-chalk/70" : "text-ink/80")}>{c.blurb}</p>
                  <Link
                    href={c.pillar.href}
                    className={
                      "mt-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 " +
                      (tone === "dark" ? "text-chalk-yellow decoration-chalk-yellow/40" : "text-board decoration-gold-deep/50")
                    }
                  >
                    {c.pillar.label} <ArrowRight size={15} aria-hidden />
                  </Link>
                </div>
                <div className="lg:col-span-8">
                  {posts.length > 0 ? (
                    <ul className={"divide-y border-y " + (tone === "dark" ? "divide-chalk/15 border-chalk/15" : "divide-board/15 border-board/15")}>
                      {posts.map((p) => (
                        <li key={p.slug} className="sx-rise">
                          <Link href={postPath(p.slug)} className="group block py-7">
                            <p className={"text-xs font-semibold uppercase tracking-[0.18em] " + (tone === "dark" ? "text-chalk-yellow" : "text-gold-ink")}>
                              {date(p.published)} · {p.minutes} min read
                            </p>
                            <h3 className="mt-3 font-playfair text-2xl font-bold leading-snug sm:text-[1.75rem]">
                              {p.title}
                              <ArrowUpRight size={20} aria-hidden className="ml-1.5 inline align-baseline transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </h3>
                            <p className={"mt-3 text-base leading-relaxed " + (tone === "dark" ? "text-chalk/70" : "text-ink/80")}>{p.description}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={"border-y py-7 text-base " + (tone === "dark" ? "border-chalk/15 text-chalk/70" : "border-board/15 text-ink/80")}>
                      The first post on this is being written. Until then, the page linked here covers how we approach it.
                    </p>
                  )}
                </div>
              </div>
            </Inner>
          </Scene>
        );
      })}
    </>
  );
}
