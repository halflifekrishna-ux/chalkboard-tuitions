import { studioOgImage, OG_SIZE } from "@/lib/studio-og";

export const alt = "Custom courses built from your material. Chalkboard Learning Studio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return studioOgImage({
    eyebrow: "Custom e-learning development",
    title: "Your material, built into a course people practise in.",
    line: "Storyline, Rise, Captivate or your tool. SCORM and xAPI, with learner reporting.",
  });
}
