import { studioOgImage, OG_SIZE } from "@/lib/studio-og";

export const alt = "Corporate training for teams. Chalkboard Learning Studio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return studioOgImage({
    eyebrow: "For companies",
    title: "Corporate training built around the work your team does.",
    line: "AI at work, sales, customer support and leadership. Courses built from your own material.",
  });
}
