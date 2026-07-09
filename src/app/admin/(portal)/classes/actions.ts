"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { classSchema } from "./schema";

export interface ActionState {
  error?: string;
}

function parseForm(formData: FormData) {
  return classSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    days: formData.getAll("days"),
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
  });
}

/** Optional free-text teacher; find-or-create by name so FK integrity holds. */
async function upsertTeacher(
  supabase: ReturnType<typeof createServerSupabase>,
  branchId: string,
  name: string | undefined
): Promise<string | null> {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  const { data: existing } = await supabase
    .from("teachers")
    .select("id")
    .ilike("full_name", trimmed)
    .is("deleted_at", null)
    .maybeSingle();
  if (existing) return existing.id;
  const { data: created } = await supabase
    .from("teachers")
    .insert({ branch_id: branchId, full_name: trimmed })
    .select("id")
    .single();
  return created?.id ?? null;
}

async function classFieldsFromForm(formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
  const v = parsed.data;

  const supabase = createServerSupabase();
  const { data: branch } = await supabase.from("branches").select("id").eq("is_active", true).limit(1).single();
  if (!branch) return { error: "No active branch found." } as const;

  const teacherId = await upsertTeacher(supabase, branch.id, v.teacher_name);

  return {
    fields: {
      branch_id: branch.id,
      subject_id: v.subject_id,
      teacher_id: teacherId,
      name: v.name,
      grade: v.grade,
      board: v.board ?? null,
      start_time: v.start_time,
      end_time: v.end_time,
      days: v.days,
      capacity: v.capacity,
      room: v.room || null,
      is_active: v.is_active,
      schedule_note: `${v.days.map((d) => d[0].toUpperCase() + d.slice(1)).join(", ")} · ${v.start_time}–${v.end_time}`,
    },
  } as const;
}

export async function createClass(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const result = await classFieldsFromForm(formData);
  if ("error" in result) return { error: result.error };

  const supabase = createServerSupabase();
  const { data: cls, error } = await supabase.from("classes").insert(result.fields).select("id, name").single();
  if (error || !cls) return { error: error?.message ?? "Could not create class" };

  await supabase.from("activity_logs").insert({
    actor_id: admin.id,
    entity_type: "class",
    entity_id: cls.id,
    action: "created",
    summary: `Class "${cls.name}" was created`,
  });

  revalidatePath("/admin/classes");
  redirect(`/admin/classes/${cls.id}`);
}

export async function updateClass(classId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const result = await classFieldsFromForm(formData);
  if ("error" in result) return { error: result.error };

  const supabase = createServerSupabase();
  const { error } = await supabase.from("classes").update(result.fields).eq("id", classId);
  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    actor_id: admin.id,
    entity_type: "class",
    entity_id: classId,
    action: "updated",
    summary: `Class "${result.fields.name}" was updated`,
  });

  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${classId}`);
  return {};
}

export async function setEnrolment(classId: string, studentId: string, enrolled: boolean): Promise<void> {
  const admin = await requireAdmin();
  const supabase = createServerSupabase();

  if (enrolled) {
    await supabase.from("class_students").upsert(
      { class_id: classId, student_id: studentId },
      { onConflict: "class_id,student_id", ignoreDuplicates: true }
    );
  } else {
    await supabase.from("class_students").delete().eq("class_id", classId).eq("student_id", studentId);
  }

  const [{ data: cls }, { data: student }] = await Promise.all([
    supabase.from("classes").select("name").eq("id", classId).single(),
    supabase.from("students").select("full_name").eq("id", studentId).single(),
  ]);
  await supabase.from("activity_logs").insert({
    actor_id: admin.id,
    student_id: studentId,
    entity_type: "class",
    entity_id: classId,
    action: enrolled ? "enrolled" : "unenrolled",
    summary: `${student?.full_name ?? "Student"} ${enrolled ? "enrolled in" : "removed from"} ${cls?.name ?? "class"}`,
  });

  revalidatePath(`/admin/classes/${classId}`);
}

export async function archiveClass(classId: string): Promise<void> {
  const admin = await requireAdmin();
  const supabase = createServerSupabase();
  const { data: cls } = await supabase.from("classes").select("name").eq("id", classId).single();

  await supabase
    .from("classes")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", classId);

  await supabase.from("activity_logs").insert({
    actor_id: admin.id,
    entity_type: "class",
    entity_id: classId,
    action: "archived",
    summary: `Class "${cls?.name ?? ""}" was archived`,
  });

  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}
