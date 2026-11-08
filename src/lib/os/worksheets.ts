export const WORKSHEETS_BUCKET = "worksheets";
export const SECTION_LETTERS = ["A", "B", "C", "D", "E", "F"] as const;
export const MAX_WORKSHEET_BYTES = 20 * 1024 * 1024;
export const WORKSHEET_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "heic", "webp", "doc", "docx"];

export type WorksheetStatus = "new" | "processing" | "done" | "failed";

export const WORKSHEET_STATUS_META: Record<WorksheetStatus, { label: string; bg: string; color: string }> = {
  new: { label: "Received", bg: "rgba(244,196,48,0.16)", color: "#f4c430" },
  processing: { label: "Being prepared", bg: "rgba(74,158,202,0.18)", color: "#7fc3e8" },
  done: { label: "Ready", bg: "rgba(125,201,143,0.16)", color: "#7dc98f" },
  failed: { label: "Needs attention", bg: "rgba(232,120,100,0.16)", color: "#e8a090" },
};

export function describeAnswers(sections: string[] | null): string {
  if (!sections?.length || sections.includes("all")) return "All sections";
  return `Sections ${sections.join(", ")}`;
}
