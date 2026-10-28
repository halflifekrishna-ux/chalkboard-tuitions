import { studioOgImage, OG_SIZE } from "@/lib/studio-og";

export const alt = "AI training where your team writes the first draft. Chalkboard Learning Studio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return studioOgImage({
    eyebrow: "AI training for teams",
    title: "Write it first. Then let AI make it better.",
    line: "Generative AI, prompt writing and AI-assisted work, taught on your team's own work.",
  });
}
