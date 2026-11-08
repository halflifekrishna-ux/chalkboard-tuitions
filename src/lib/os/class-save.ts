import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { classSchema, SUBJECT_COLOURS } from "@/app/admin/(portal)/batches/schema";
import { friendlyError, fail, type MutationResult } from "./errors";

export interface ClassResult extends MutationResult {
  batchId?: string;
}

/**
 * Create or update a class in one go: the slot, who attends, and what's taught.
 * Takes a typed payload (not FormData), so what Nanditha sees selected is
 * exactly what gets saved.
 */
export async function saveClassRecord(supabase: SupabaseClient, admin: { id: string }, classId: string | null, input: unknown): Promise<ClassResult> {
  const parsed = classSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const v = parsed.data;

  const { data: branch } = await supabase
    .from("branches").select("id").eq("is_active", true).is("deleted_at", null).order("created_at").limit(1).maybeSingle();
  if (!branch) return fail("No active branch is set up yet, so a class can't be created.");

  // Double-tap protection: the same class name can't be created twice.
  if (!classId) {
    const { data: dupe } = await supabase
      .from("batches").select("id").ilike("name", v.name).is("deleted_at", null).limit(1);
    if (dupe?.length) {
      return fail(`A class called “${v.name}” already exists. Open that one to edit it, or choose a different name.`);
    }
  }

  // Individual Attention owns the whole class, so its roster IS that student.
  const isIndividual = v.category === "individual_attention";
  const studentId = isIndividual ? (v.student_id as string) : null;
  const roster = isIndividual ? [studentId as string] : v.student_ids;

  const fields = {
    name: v.name,
    grade: v.grade,
    board: v.board ?? null,
    session_category: v.category,
    student_id: studentId,
    capacity: isIndividual ? 1 : Math.max(v.capacity, v.student_ids.length || 1),
    status: v.status,
    notes: v.notes?.trim() || null,
    days: v.days,
    start_time: v.start_time,
    end_time: v.end_time,
    room: v.room?.trim() || null,
    academic_year_id: v.academic_year_id ?? null,
  };

  let id = classId;
  if (id) {
    const { error } = await supabase.from("batches").update(fields).eq("id", id);
    if (error) return fail(friendlyError(error, "Couldn't save this class. Please try again."));
  } else {
    const { data, error } = await supabase.from("batches").insert({ branch_id: branch.id, ...fields }).select("id").single();
    if (error || !data) return fail(friendlyError(error, "Couldn't create this class. Please try again."));
    id = data.id as string;
  }

  /* ── Who attends ── */
  const { data: current } = await supabase.from("batch_students").select("student_id").eq("batch_id", id);
  const currentIds = new Set((current ?? []).map((r) => r.student_id as string));
  const wanted = new Set(roster);
  const toAdd = roster.filter((sid) => !currentIds.has(sid));
  const toRemove = Array.from(currentIds).filter((sid) => !wanted.has(sid));

  if (toAdd.length) {
    const { error } = await supabase
      .from("batch_students")
      .upsert(toAdd.map((sid) => ({ batch_id: id, student_id: sid })), { onConflict: "batch_id,student_id", ignoreDuplicates: true });
    if (error) return fail(friendlyError(error, "The class was saved, but some students couldn't be added. Open the class and try again."));
  }
  if (toRemove.length) {
    const { error } = await supabase.from("batch_students").delete().eq("batch_id", id).in("student_id", toRemove);
    if (error) return fail(friendlyError(error, "The class was saved, but some students couldn't be removed. Open the class and try again."));
  }

  /* ── What's taught (no schedule of its own — any subject, any day in the slot) ── */
  const { data: existing } = await supabase
    .from("batch_subjects").select("id, subject_id, status, deleted_at").eq("batch_id", id);
  const bySubject = new Map((existing ?? []).map((r) => [r.subject_id as string, r]));

  let colourAt = (existing ?? []).filter((r) => !r.deleted_at).length;
  for (const subjectId of v.subject_ids) {
    const row = bySubject.get(subjectId);
    if (!row) {
      await supabase.from("batch_subjects").insert({
        batch_id: id, subject_id: subjectId, colour: SUBJECT_COLOURS[colourAt++ % SUBJECT_COLOURS.length], status: "active",
      });
    } else if (row.deleted_at || row.status !== "active") {
      await supabase.from("batch_subjects").update({ deleted_at: null, status: "active" }).eq("id", row.id);
    }
  }
  for (const [subjectId, row] of Array.from(bySubject.entries())) {
    if (!v.subject_ids.includes(subjectId) && !row.deleted_at) {
      await supabase.from("batch_subjects").update({ deleted_at: new Date().toISOString(), status: "archived" }).eq("id", row.id);
    }
  }

  await supabase.from("activity_logs").insert({
    actor_id: admin.id,
    entity_type: "batch",
    entity_id: id,
    action: classId ? "class_updated" : "class_created",
    summary: `Class "${v.name}" ${classId ? "updated" : "created"}: ${v.days.join(", ")} ${v.start_time}–${v.end_time}${isIndividual ? " (Individual Attention)" : ""}`,
    metadata: { days: v.days, start_time: v.start_time, end_time: v.end_time, students: roster.length, subjects: v.subject_ids.length, category: v.category, student_id: studentId },
  });

  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${id}`);
  revalidatePath("/admin/attendance");
  revalidatePath("/admin");
  return { ok: true, batchId: id, message: classId ? "✓ Class updated" : "✓ Class scheduled" };
}

/** Off the schedule and out of new attendance. Past sessions keep their history. */
export async function archiveClassRecord(supabase: SupabaseClient, admin: { id: string }, batchId: string) {
  const { data: batch } = await supabase.from("batches").select("name").eq("id", batchId).single();
  const result = await supabase.from("batches").update({ deleted_at: new Date().toISOString(), status: "archived" }).eq("id", batchId);
  await supabase.from("activity_logs").insert({
    actor_id: admin.id, entity_type: "batch", entity_id: batchId,
    action: "archived", summary: `Batch "${batch?.name ?? ""}" was archived`,
  });
  revalidatePath("/admin/batches");
  return result;
}
