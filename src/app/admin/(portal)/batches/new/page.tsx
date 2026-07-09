import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { BatchForm } from "@/components/admin/BatchForm";
import { createBatch } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewBatchPage() {
  const supabase = createServerSupabase();
  const { data: years } = await supabase
    .from("academic_years")
    .select("id, name")
    .order("is_current", { ascending: false })
    .order("name", { ascending: false });

  return (
    <div className="space-y-5 max-w-xl">
      <header>
        <Link href="/admin/batches" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Batches
        </Link>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Add Batch</h1>
      </header>

      {!years?.length ? (
        <p className="rounded-2xl p-5 text-sm" style={{ background: "rgba(220,80,60,0.12)", color: "#e8a090" }}>
          No academic year found. Run migration 0005 to seed the current academic year.
        </p>
      ) : (
        <BatchForm action={createBatch} academicYears={years} submitLabel="Create Batch" />
      )}
    </div>
  );
}
