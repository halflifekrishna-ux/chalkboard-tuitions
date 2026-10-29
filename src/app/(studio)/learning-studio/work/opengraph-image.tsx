import { studioOgImage, OG_SIZE } from "@/lib/studio-og";
import { PROGRAMS, FIRST_YEAR } from "@/lib/portfolio";

export const alt = "Our work. Chalkboard Learning Studio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return studioOgImage({
    eyebrow: "Our work",
    title: `${PROGRAMS.length} programs since ${FIRST_YEAR}. Every one measured.`,
    line: "Placement accelerators, Advanced Excel, cybersecurity and FinTech. 97% rated our Excel program 4 or 5 out of 5.",
  });
}
