"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { batchSchema, batchSubjectSchema } from "./schema";

export interface ActionState {
  error?: string;
}

/* ── Batch ─────────────────────────────────────────────────────────────────── */

async function branchId(supabase: ReturnType<typeof createServerSupabase>) {
  const { data } = await supabase.from("branches").select("id").eq("is_active", true).limit(1).single();
  return data?.id as string | undefined;
}

export async function createBatch(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireCapability("batches.manage");
  const parsed = batchSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    days: formData.getAll("days"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = createServerSupabase();
  const branch = await branchId(supabase);
  if (!branch) return { error: "No active branch found." };

  const { data: batch, error } = await supabase
    .from("batches")
    .insert({
      branch_id: branch,
      academic_year_id: v.academic_year_id,
      name: v.name,
      grade: v.grade,
      board: v.board ?? null,
      capacity: v.capacity,
      status: v.status,
      notes: v.notes || null,
      days: v.days,
      start_time: v.start_time,
      end_time: v.end_time,
      room: v.room || null,
    })
    .select("id, name")
    .single();
  if (error || !batch) return { error: error?.message ?? "Could not create batch" };

  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "batch", entity_id: batch.id,
    action: "created", summary: `Batch "${batch.name}" was created`,
  });

  revalidatePath("/admin/batches");
  redirect(`/admin/batches/${batch.id}`);
}

export async function updateBatch(batchId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireCapability("batches.manage");
  const parsed = batchSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    days: formData.getAll("days"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("batches")
    .update({
      academic_year_id: v.academic_year_id,
      name: v.name, grade: v.grade, board: v.board ?? null,
      capacity: v.capacity, status: v.status, notes: v.notes || null,
      days: v.days, start_time: v.start_time, end_time: v.end_time, room: v.room || null,
    })
    .eq("id", batchId);
  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "batch", entity_id: batchId,
    action: "updated", summary: `Batch "${v.name}" was updated`,
  });

  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${batchId}`);
  redirect(`/admin/batches/${batchId}`);
}

export async function archiveBatch(batchId: string): Promise<void> {
  const admin = await requireCapability("batches.manage");
  const supabase = createServerSupabase();
  const { data: batch } = await supabase.from("batches").select("name").eq("id", batchId).single();
  await supabase.from("batches").update({ deleted_at: new Date().toISOString(), status: "archived" }).eq("id", batchId);
  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "batch", entity_id: batchId,
    action: "archived", summary: `Batch "${batch?.name ?? ""}" was archived`,
  });
  revalidatePath("/admin/batches");
  redirect("/admin/batches");
}

export async function setBatchEnrolment(batchId: string, studentId: string, enrolled: boolean): Promise<void> {
  const admin = await requireCapability("batches.manage");
  const supabase = createServerSupabase();

  if (enrolled) {
    await supabase.from("batch_students").upsert(
      { batch_id: batchId, student_id: studentId },
      { onConflict: "batch_id,student_id", ignoreDuplicates: true }
    );
  } else {
    await supabase.from("batch_students").delete().eq("batch_id", batchId).eq("student_id", studentId);
  }

  const [{ data: batch }, { data: student }] = await Promise.all([
    supabase.from("batches").select("name").eq("id", batchId).single(),
    supabase.from("students").select("full_name").eq("id", studentId).single(),
  ]);
  await supabase.from("activity_logs").insert({
    actor_id: admin.id, student_id: studentId, entity_type: "batch", entity_id: batchId,
    action: enrolled ? "enrolled" : "unenrolled",
    summary: `${student?.full_name ?? "Student"} ${enrolled ? "enrolled in" : "removed from"} ${batch?.name ?? "batch"}`,
  });
  revalidatePath(`/admin/batches/${batchId}`);
}

/* ── Batch Subjects ────────────────────────────────────────────────────────── */

async function upsertTeacher(
  supabase: ReturnType<typeof createServerSupabase>,
  branch: string,
  name: string | undefined
): Promise<string | null> {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  const { data: existing } = await supabase
    .from("teachers").select("id").ilike("full_name", trimmed).is("deleted_at", null).maybeSingle();
  if (existing) return existing.id;
  const { data: created } = await supabase
    .from("teachers").insert({ branch_id: branch, full_name: trimmed }).select("id").single();
  return created?.id ?? null;
}

export async function addBatchSubject(batchId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireCapability("batches.manage");
  const parsed = batchSubjectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = createServerSupabase();
  const branch = await branchId(supabase);
  if (!branch) return { error: "No active branch found." };
  const teacherId = await upsertTeacher(supabase, branch, v.teacher_name);

  const { error } = await supabase.from("batch_subjects").insert({
    batch_id: batchId, subject_id: v.subject_id, teacher_id: teacherId,
    colour: v.colour, status: v.status,
  });
  if (error) return { error: error.message };

  const { data: subject } = await supabase.from("subjects").select("name").eq("id", v.subject_id).single();
  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "batch_subject", entity_id: batchId,
    action: "created", summary: `${subject?.name ?? "Subject"} added to batch`,
  });

  revalidatePath(`/admin/batches/${batchId}`);
  return {};
}

export async function updateBatchSubject(batchSubjectId: string, batchId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireCapability("batches.manage");
  const parsed = batchSubjectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = createServerSupabase();
  const branch = await branchId(supabase);
  const teacherId = await upsertTeacher(supabase, branch!, v.teacher_name);

  const { error } = await supabase.from("batch_subjects").update({
    subject_id: v.subject_id, teacher_id: teacherId,
    colour: v.colour, status: v.status,
  }).eq("id", batchSubjectId);
  if (error) return { error: error.message };

  void admin;
  revalidatePath(`/admin/batches/${batchId}`);
  return {};
}

export async function archiveBatchSubject(batchSubjectId: string, batchId: string): Promise<void> {
  await requireCapability("batches.manage");
  const supabase = createServerSupabase();
  await supabase.from("batch_subjects").update({ deleted_at: new Date().toISOString(), status: "archived" }).eq("id", batchSubjectId);
  revalidatePath(`/admin/batches/${batchId}`);
}
