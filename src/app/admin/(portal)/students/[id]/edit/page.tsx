import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { StudentForm } from "@/components/admin/StudentForm";
import { updateStudent } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: student } = await supabase
    .from("students")
    .select("*, parent:parents(*)")
    .eq("id", params.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!student) notFound();
  const parent = student.parent as {
    full_name: string;
    phone: string;
    whatsapp_number: string | null;
    email: string | null;
    relationship: string | null;
  } | null;

  const updateWithId = updateStudent.bind(null, student.id);

  // Legacy statuses from before the status expansion map to their nearest new value.
  const LEGACY_STATUS: Record<string, string> = { trial: "active", paused: "inactive", alumni: "graduated" };
  const status = (LEGACY_STATUS[student.status] ?? student.status) as
    "active" | "inactive" | "graduated" | "dropped" | "transferred" | "archived";

  return (
    <div className="space-y-5 max-w-xl">
      <header>
        <Link
          href={`/admin/students/${student.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3"
          style={{ color: "rgba(245,240,232,0.5)" }}
        >
          <ArrowLeft size={14} /> {student.full_name}
        </Link>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
          Edit Student
        </h1>
      </header>

      <StudentForm
        action={updateWithId}
        submitLabel="Save Changes"
        defaultValues={{
          full_name: student.full_name,
          grade: student.grade,
          board: student.board,
          status,
          school_name: student.school_name ?? "",
          emergency_contact: student.emergency_contact ?? "",
          notes: student.notes ?? "",
          parent_name: parent?.full_name ?? "",
          parent_phone: parent?.phone ?? "",
          parent_whatsapp: parent?.whatsapp_number ?? "",
          parent_email: parent?.email ?? "",
          parent_relationship: parent?.relationship ?? "parent",
        }}
      />
    </div>
  );
}
