import { studioOgImage, OG_SIZE } from "@/lib/studio-og";

export const alt = "Chalkboard Learning Studio: placement and industry programmes for colleges";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return studioOgImage({
    eyebrow: "For colleges and universities",
    title: "Graduates who are ready on day one.",
    line: "Placement readiness and industry tracks, run as practice. Live now with 80 students and no session missed.",
  });
}
