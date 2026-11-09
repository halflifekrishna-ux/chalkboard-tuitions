import { studioOgImage, OG_SIZE } from "@/lib/studio-og";

export const alt = "Corporate training for teams. Chalkboard Learning Studio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return studioOgImage({
    eyebrow: "For companies",
    title: "Corporate training for teams in India and abroad.",
    line: "AI at work, POSH, data, communication and eLearning.",
  });
}
