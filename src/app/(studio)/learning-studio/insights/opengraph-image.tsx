import { studioOgImage, OG_SIZE } from "@/lib/studio-og";

export const alt = "Insights from Chalkboard Learning Studio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return studioOgImage({
    eyebrow: "Insights",
    title: "What we've learned teaching it.",
    line: "AI at work, college readiness and course design. Practical, and short.",
  });
}
