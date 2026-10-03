import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { ClassScheduler } from "@/components/admin/ClassScheduler";

export const dynamic = "force-dynamic";

export default async function EditClassPage({ params }: { params: { id: string } }) {
  await requireCapability("batches.manage");
  const supabase = createServerSupabase();

  const { data: batch } = await supabase
    .from("batches").select("*").eq("id", params.id).is("deleted_at", null).maybeSingle();
  if (!batch) notFound();

  const [{ data: years }, { data: students }, { data: subjects }, { data: enrolled }, { data: taught }] = await Promise.all([
    supabase.from("academic_years").select("id, name").order("is_current", { ascending: false }).order("name", { ascending: false }),
    supabase.from("students").select("id, full_name, admission_number, grade").is("deleted_at", null).in("status", ["active", "trial", "paused"]).order("full_name"),
    supabase.from("subjects").select("id, name").eq("is_active", true).order("name"),
    supabase.from("batch_students").select("student_id").eq("batch_id", params.id),
    supabase.from("batch_subjects").select("subject_id").eq("batch_id", params.id).is("deleted_at", null),
  ]);

  return (
    <div className="space-y-4 max-w-2xl">
      <header>
        <Link href={`/admin/batches/${params.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3 min-h-[32px]" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> {batch.name}
        </Link>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Edit class</h1>
      </header>

      <ClassScheduler
        students={students ?? []}
        subjects={subjects ?? []}
        academicYearId={years?.[0]?.id ?? null}
        defaults={{
          id: batch.id,
          name: batch.name,
          grade: batch.grade ?? 8,
          board: batch.board,
          days: batch.days ?? [],
          start_time: batch.start_time,
          end_time: batch.end_time,
          room: batch.room,
          notes: batch.notes,
          status: batch.status,
          capacity: batch.capacity,
          academic_year_id: batch.academic_year_id,
          student_ids: (enrolled ?? []).map((e) => e.student_id as string),
          subject_ids: (taught ?? []).map((t) => t.subject_id as string),
        }}
      />
    </div>
  );
}
