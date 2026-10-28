import { studioOgImage, OG_SIZE } from "@/lib/studio-og";

export const alt = "East Point College case study. Chalkboard Learning Studio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return studioOgImage({
    eyebrow: "Case study · East Point College of Management",
    title: "Two programs. 80 students. No session missed.",
    line: "A BCA Placement Accelerator and a B.Com Industry Accelerator, run under MOU in Bengaluru.",
  });
}
