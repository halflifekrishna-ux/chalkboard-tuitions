import { studioOgImage, OG_SIZE } from "@/lib/studio-og";

export const alt = "Train with Chalkboard Learning Studio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return studioOgImage({
    eyebrow: "For trainers and course designers",
    title: "Train with us.",
    line: "Subject experts, facilitators and course designers. Tell us what you teach.",
  });
}
