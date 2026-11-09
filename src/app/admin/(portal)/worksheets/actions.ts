"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { uploadFile } from "@/lib/os/storage";
import {
  MAX_WORKSHEET_BYTES,
  SECTION_LETTERS,
  WORKSHEETS_BUCKET,
  WORKSHEET_EXTENSIONS,
} from "@/lib/os/worksheets";

export interface WorksheetActionState {
  error?: string;
}

/**
 * File a worksheet request: upload to the private bucket, then one row for the
 * builder to pick up. Runs as the signed-in teacher, so RLS decides.
 */
export async function createWorksheetRequest(
  _prev: WorksheetActionState,
  formData: FormData
): Promise<WorksheetActionState> {
  const admin = await requireCapability("worksheets.upload");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };
  if (file.size > MAX_WORKSHEET_BYTES) return { error: "That file is over 20 MB. Please send a smaller one." };
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!WORKSHEET_EXTENSIONS.includes(ext)) return { error: "Upload a PDF, photo (JPG, PNG, HEIC) or Word document." };

  const colour = formData.get("colour");
  if (colour !== "colour" && colour !== "bw") return { error: "Pick colour or black and white." };

  const scope = formData.get("answers");
  let sections: string[];
  if (scope === "all") {
    sections = ["all"];
  } else if (scope === "some") {
    const picked = formData.getAll("sections").map(String);
    sections = SECTION_LETTERS.filter((l) => picked.includes(l));
    if (sections.length === 0) return { error: "Tick at least one section, or choose all sections." };
  } else {
    return { error: "Pick which sections need answers." };
  }

  let path: string;
  try {
    path = await uploadFile(WORKSHEETS_BUCKET, `${admin.id}/in`, file);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }

  const supabase = createServerSupabase();
  const { data: row, error } = await supabase
    .from("worksheet_requests")
    .insert({
      teacher_id: admin.id,
      file_path: path,
      file_name: file.name.slice(0, 200),
      colour: colour === "colour",
      answer_sections: sections,
    })
    .select("id")
    .single();
  if (error || !row) return { error: error?.message ?? "Could not save the request" };

  revalidatePath("/admin/worksheets");
  redirect(`/admin/worksheets/${row.id}`);
}
