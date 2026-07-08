"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { studentSchema, type StudentFormValues } from "./schema";

export interface ActionState {
  error?: string;
}

function parseForm(formData: FormData) {
  return studentSchema.safeParse(Object.fromEntries(formData.entries()));
}

/** Find-or-create the parent by phone, then return its id. */
async function upsertParent(
  supabase: ReturnType<typeof createServerSupabase>,
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

async function logActivity(
  supabase: ReturnType<typeof createServerSupabase>,
  actorId: string,
  studentId: string,
  action: string,
  summary: string
) {
  await supabase.from("activity_logs").insert({
    actor_id: actorId,
    student_id: studentId,
    entity_type: "student",
    entity_id: studentId,
    action,
    summary,
  });
}

export async function createStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = createServerSupabase();

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

  await logActivity(supabase, admin.id, student.id, "created", `${v.full_name} joined Chalkboard (${student.student_code})`);

  revalidatePath("/admin/students");
  redirect(`/admin/students/${student.id}`);
}

export async function updateStudent(studentId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const supabase = createServerSupabase();

  let parentId: string;
  try {
    parentId = await upsertParent(supabase, v);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase
    .from("students")
    .update({
      parent_id: parentId,
      full_name: v.full_name,
      grade: v.grade,
      board: v.board,
      status: v.status,
      school_name: v.school_name || null,
      emergency_contact: v.emergency_contact || null,
      notes: v.notes || null,
    })
    .eq("id", studentId);

  if (error) return { error: error.message };

  await logActivity(supabase, admin.id, studentId, "updated", `${v.full_name}'s profile was updated`);

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  redirect(`/admin/students/${studentId}`);
}

export async function archiveStudent(studentId: string): Promise<void> {
  const admin = await requireAdmin();
  const supabase = createServerSupabase();

  const { data: student } = await supabase.from("students").select("full_name").eq("id", studentId).single();

  await supabase
    .from("students")
    .update({ deleted_at: new Date().toISOString(), status: "dropped" })
    .eq("id", studentId);

  if (student) {
    await logActivity(supabase, admin.id, studentId, "archived", `${student.full_name} was archived`);
  }

  revalidatePath("/admin/students");
  redirect("/admin/students");
}
