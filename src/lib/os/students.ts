import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudentFormValues } from "@/app/admin/(portal)/students/schema";

/** Find-or-create the parent by phone, then return its id. */
export async function upsertParent(
  supabase: SupabaseClient,
  v: StudentFormValues
): Promise<string> {
  const { data: existing } = await supabase
    .from("parents")
    .select("id")
    .eq("phone", v.parent_phone)
    .is("deleted_at", null)
    .maybeSingle();

  const parentFields = {
    full_name: v.parent_name,
    phone: v.parent_phone,
    whatsapp_number: v.parent_whatsapp || v.parent_phone,
    email: v.parent_email || null,
    relationship: v.parent_relationship,
  };

  if (existing) {
    await supabase.from("parents").update(parentFields).eq("id", existing.id);
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("parents")
    .insert(parentFields)
    .select("id")
    .single();
  if (error || !created) throw new Error(error?.message ?? "Could not save parent");
  return created.id;
}

/** Parent, student, activity log and optional enrolment: shared by the web form and the mobile API. */
export async function createStudentRecord(
  supabase: SupabaseClient,
  actorId: string,
  v: StudentFormValues,
  photoPath: string | null = null
): Promise<{ student: { id: string; student_code: string } } | { error: string }> {
  const { data: branch } = await supabase.from("branches").select("id").eq("is_active", true).limit(1).single();
  if (!branch) return { error: "No active branch found. Run the database migration first." };

  let parentId: string;
  try {
    parentId = await upsertParent(supabase, v);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { data: student, error } = await supabase
    .from("students")
    .insert({
      photo_path: photoPath,
      branch_id: branch.id,
      parent_id: parentId,
      full_name: v.full_name,
      grade: v.grade,
      board: v.board,
      status: v.status,
      school_name: v.school_name || null,
      emergency_contact: v.emergency_contact || null,
      notes: v.notes || null,
    })
    .select("id, student_code")
    .single();
  if (error || !student) return { error: error?.message ?? "Could not create student" };

  const log = (action: string, summary: string) =>
    supabase.from("activity_logs").insert({
      actor_id: actorId, student_id: student.id, entity_type: "student", entity_id: student.id, action, summary,
    });
  await log("created", `${v.full_name} joined Chalkboard (${student.student_code})`);

  if (v.batch_id) {
    await supabase.from("batch_students").upsert(
      { batch_id: v.batch_id, student_id: student.id },
      { onConflict: "batch_id,student_id", ignoreDuplicates: true }
    );
    const { data: batch } = await supabase.from("batches").select("name").eq("id", v.batch_id).single();
    await log("enrolled", `${v.full_name} enrolled in ${batch?.name ?? "batch"}`);
  }
  return { student };
}
