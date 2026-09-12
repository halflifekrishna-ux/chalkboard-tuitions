import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { BatchForm } from "@/components/admin/BatchForm";
import { updateBatch } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditBatchPage({ params }: { params: { id: string } }) {
  await requireCapability("batches.manage");
  const supabase = createServerSupabase();

  const [{ data: batch }, { data: years }] = await Promise.all([
    supabase.from("batches").select("*").eq("id", params.id).is("deleted_at", null).maybeSingle(),
    supabase.from("academic_years").select("id, name").order("is_current", { ascending: false }).order("name", { ascending: false }),
  ]);

  if (!batch) notFound();
  const updateWithId = updateBatch.bind(null, params.id);

  return (
    <div className="space-y-5 max-w-xl">
      <header>
        <Link href={`/admin/batches/${batch.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> {batch.name}
        </Link>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Edit Batch</h1>
      </header>

      <BatchForm
        action={updateWithId}
        academicYears={years ?? []}
        submitLabel="Save Changes"
        defaults={{
          name: batch.name,
          academic_year_id: batch.academic_year_id ?? "",
          grade: batch.grade ?? 8,
          board: batch.board,
          capacity: batch.capacity,
          status: batch.status,
          notes: batch.notes,
          days: batch.days ?? [],
          start_time: batch.start_time,
          end_time: batch.end_time,
          room: batch.room,
        }}
      />
    </div>
  );
}
