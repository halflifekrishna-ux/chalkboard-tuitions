"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";

const subjectSchema = z.object({
  name: z.string().min(2, "Subject name is required"),
  short_code: z.string().max(8).optional(),
  colour: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export interface SubjectState {
  error?: string;
  created?: { id: string; name: string };
}

export async function createSubject(_prev: SubjectState, formData: FormData): Promise<SubjectState> {
  await requireAdmin();
  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    short_code: formData.get("short_code") || undefined,
    colour: formData.get("colour") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("subjects")
    .insert({ name: parsed.data.name.trim(), short_code: parsed.data.short_code?.toUpperCase() || null, colour: parsed.data.colour ?? "#c9a227" })
    .select("id, name")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "A subject with that name or code already exists." };
    return { error: error.message };
  }
  revalidatePath("/admin/subjects");
  return { created: data };
}

export async function updateSubject(id: string, _prev: SubjectState, formData: FormData): Promise<SubjectState> {
  await requireAdmin();
  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    short_code: formData.get("short_code") || undefined,
    colour: formData.get("colour") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("subjects")
    .update({ name: parsed.data.name.trim(), short_code: parsed.data.short_code?.toUpperCase() || null, ...(parsed.data.colour ? { colour: parsed.data.colour } : {}) })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/subjects");
  return {};
}

export async function toggleArchiveSubject(id: string, archive: boolean): Promise<void> {
  await requireAdmin();
  const supabase = createServerSupabase();
  await supabase.from("subjects").update({ is_active: !archive }).eq("id", id);
  revalidatePath("/admin/subjects");
}
