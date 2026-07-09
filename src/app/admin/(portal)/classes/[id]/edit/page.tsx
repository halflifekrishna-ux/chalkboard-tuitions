import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { ClassForm } from "@/components/admin/ClassForm";
import { updateClass } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditClassPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const [{ data: cls }, { data: subjects }] = await Promise.all([
    supabase
      .from("classes")
      .select("*, teacher:teachers(full_name)")
      .eq("id", params.id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase.from("subjects").select("id, name").eq("is_active", true).order("name"),
  ]);

  if (!cls) notFound();
  const teacher = cls.teacher as unknown as { full_name: string } | null;
  const updateWithId = updateClass.bind(null, params.id);

  return (
    <div className="space-y-5 max-w-xl">
      <header>
        <Link href={`/admin/classes/${cls.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> {cls.name}
        </Link>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
          Edit Class
        </h1>
      </header>

      <ClassForm
        action={updateWithId}
        subjects={subjects ?? []}
        submitLabel="Save Changes"
        defaults={{
          name: cls.name,
          subject_id: cls.subject_id ?? "",
          grade: cls.grade ?? 6,
          board: cls.board,
          teacher_name: teacher?.full_name ?? "",
          start_time: cls.start_time?.slice(0, 5),
          end_time: cls.end_time?.slice(0, 5),
          days: cls.days ?? [],
          capacity: cls.capacity,
          room: cls.room,
          is_active: cls.is_active,
        }}
      />
    </div>
  );
}
