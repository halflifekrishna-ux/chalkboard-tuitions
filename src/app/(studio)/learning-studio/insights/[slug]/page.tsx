import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { STUDIO_PAGES, STUDIO_ID, studioAlternates, studioGraph, studioUrl, breadcrumbs } from "@/lib/studio";
import { POSTS, getPost, clusterOf, postPath, type Block } from "@/lib/insights";
import { Inner, Kicker } from "@/components/marketing/learning-studio/Scene";
import { StudioEnquire } from "@/components/marketing/learning-studio/StudioParts";

/*
 * One insights post. Static: every slug in POSTS is built at deploy time and
 * anything else is a 404. The body is rendered from typed blocks, not
 * Markdown, so there's no parser to ship and nothing to sanitise.
 */

type Params = { params: { slug: string } };

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  const path = postPath(post.slug);
  return {
    title: { absolute: `${post.title} | Chalkboard Learning Studio` },
    description: post.description,
    alternates: studioAlternates(path),
    openGraph: {
      title: post.title,
      description: post.description,
      url: studioAlternates(path).canonical,
      type: "article",
      publishedTime: post.published,
      modifiedTime: post.updated,
      siteName: "Chalkboard Learning Studio",
    },
  };
}

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function Body({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if ("h2" in b)
          return (
            <h2 key={i} className="sx-rise mt-14 font-playfair text-[clamp(1.6rem,4.4vw,2.25rem)] font-bold leading-tight tracking-tight text-ink">
              {b.h2}
            </h2>
          );
        if ("quote" in b)
          return (
            <blockquote key={i} className="my-7 border-l-2 border-gold-deep/60 pl-5 font-playfair text-xl leading-snug text-ink sm:text-2xl">
              &ldquo;{b.quote}&rdquo;
            </blockquote>
          );
        if ("ol" in b)
          return (
            <ol key={i} className="mt-6 list-decimal space-y-3 pl-6 text-lg leading-relaxed text-ink/85 marker:font-semibold marker:text-gold-ink">
              {b.ol.map((li) => (
                <li key={li} className="pl-1">
                  {li}
                </li>
              ))}
            </ol>
          );
        if ("ul" in b)
          return (
            <ul key={i} className="mt-6 list-disc space-y-3 pl-6 text-lg leading-relaxed text-ink/85 marker:text-gold-ink">
              {b.ul.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          );
        return (
          <p key={i} className="mt-6 text-lg leading-[1.75] text-ink/85">
            {b.p}
          </p>
        );
      })}
    </>
  );
}

export default function InsightPost({ params }: Params) {
  const post = getPost(params.slug);
  if (!post) notFound();
  const cluster = clusterOf(post);
  const path = postPath(post.slug);
  const url = studioUrl(path);

  const schema = studioGraph(
    {
      "@type": "BlogPosting",
      "@id": `${url}#post`,
      headline: post.title,
      description: post.description,
      url,
      mainEntityOfPage: url,
      datePublished: post.published,
      dateModified: post.updated,
      image: `${url}/opengraph-image`,
      author: { "@id": STUDIO_ID },
      publisher: { "@id": STUDIO_ID },
      articleSection: cluster.name,
      inLanguage: "en",
    },
    breadcrumbs([STUDIO_PAGES.hub, STUDIO_PAGES.insights, { name: post.title, path }])
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="relative overflow-hidden bg-board pb-16 pt-32 text-chalk sm:pb-20 sm:pt-40">
        <div aria-hidden className="grid-dots pointer-events-none" />
        <Inner className="relative max-w-4xl">
          <nav aria-label="Breadcrumb" className="text-sm text-chalk/70">
            <Link href={STUDIO_PAGES.insights.path} className="underline decoration-chalk/30 underline-offset-4 hover:text-chalk-yellow">
              Insights
            </Link>
            <span aria-hidden> / </span>
            <Link href={`${STUDIO_PAGES.insights.path}#${cluster.id}`} className="underline decoration-chalk/30 underline-offset-4 hover:text-chalk-yellow">
              {cluster.name}
            </Link>
          </nav>
          <h1 className="mt-8 break-words font-playfair font-bold leading-[1.06] tracking-tight text-[clamp(2.1rem,6.4vw,4rem)]">{post.title}</h1>
          <p className="mt-6 text-sm text-chalk/70">
            Chalkboard Learning Studio · <time dateTime={post.published}>{date(post.published)}</time> · {post.minutes} min read
          </p>
        </Inner>
      </section>

      <article className="bg-chalk pb-20 pt-6 text-ink sm:pb-28">
        <div className="mx-auto max-w-[44rem] px-5 sm:px-8">
          <Body blocks={post.body} />

          <aside className="sx-rise mt-16 rounded-2xl border border-board/15 bg-white/70 p-7 sm:p-9">
            <Kicker tone="cream">{cluster.name}</Kicker>
            <p className="mt-4 font-playfair text-2xl font-bold leading-snug">We run this as training for teams and students.</p>
            <Link
              href={cluster.pillar.href}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-board underline decoration-gold-deep/50 underline-offset-4 hover:decoration-gold-deep"
            >
              {cluster.pillar.label} <ArrowRight size={15} aria-hidden />
            </Link>
          </aside>
        </div>
      </article>

      <StudioEnquire
        title={<>Want to try this with your team?</>}
        line="Tell us who it's for and the work they do every week. We reply by email with a proposed session and what it costs."
        defaultAudience="Corporate team"
        elsewhere={["colleges", "trainers"]}
      />
    </>
  );
}
