import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { StudentForm } from "@/components/admin/StudentForm";
import { createStudent } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewStudentPage({ searchParams }: { searchParams: { lead?: string } }) {
  await requireCapability("students.manage");
  const supabase = createServerSupabase();

  const [{ data: batches }, { data: lead }] = await Promise.all([
    supabase.from("batches").select("id, name, grade").eq("status", "active").is("deleted_at", null).order("name"),
    searchParams.lead
      ? supabase
          .from("crm_leads")
          .select("id, full_name, phone, email, student_grade, board, status")
          .eq("id", searchParams.lead)
          .eq("vertical", "tuitions")
          .is("deleted_at", null)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  // A converted lead becomes the student's starting point: the enquiry name and
  // number are the parent's, so they seed the parent block.
  const defaults = lead
    ? {
        full_name: lead.full_name,
        ...(lead.student_grade ? { grade: lead.student_grade } : {}),
        ...(lead.board ? { board: lead.board as "cbse" | "icse" | "state_board" } : {}),
        parent_name: lead.full_name,
        parent_phone: lead.phone,
        ...(lead.email ? { parent_email: lead.email } : {}),
      }
    : undefined;

  return (
    <div className="space-y-5 max-w-xl">
      <header>
        <Link href={lead ? `/admin/leads/${lead.id}` : "/admin/students"} className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> {lead ? "Back to lead" : "Students"}
        </Link>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
          Add Student
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          A student ID is generated automatically. The parent is matched by phone number.
        </p>
      </header>

      {lead && (
        <p className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs" style={{ background: "rgba(125,201,143,0.1)", color: "#7dc98f" }}>
          <Sparkles size={14} /> Prefilled from {lead.full_name}&apos;s enquiry. Saving marks the lead converted.
        </p>
      )}

      <StudentForm
        action={createStudent}
        submitLabel="Add Student"
        draftKey={lead ? undefined : "new-student"}
        batches={batches ?? []}
        leadId={lead?.id}
        defaultValues={defaults}
      />
    </div>
  );
}
