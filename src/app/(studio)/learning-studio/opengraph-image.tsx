import { studioOgImage, OG_SIZE } from "@/lib/studio-og";

export const alt = "Chalkboard Learning Studio: custom training built around what your people need to be able to do";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return studioOgImage({
    eyebrow: "Training for companies and colleges",
    title: "Custom training built around what your people need to be able to do.",
    line: "AI at work, sales, support and leadership. Placement and industry programmes for colleges.",
  });
}
