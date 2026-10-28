import { studioOgImage, OG_SIZE } from "@/lib/studio-og";

export const alt = "Our work. Chalkboard Learning Studio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return studioOgImage({
    eyebrow: "Our work",
    title: "One partner so far. Shown in full.",
    line: "Two programs at East Point College of Management, Bengaluru. 80 students, no session missed.",
  });
}
