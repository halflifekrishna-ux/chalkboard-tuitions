import { studioOgImage, OG_SIZE } from "@/lib/studio-og";
import { POSTS, getPost, clusterOf } from "@/lib/insights";

export const alt = "An insight from Chalkboard Learning Studio";
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)!;
  return studioOgImage({ eyebrow: `Insights · ${clusterOf(post).name}`, title: post.title, line: `${post.minutes} min read` });
}
