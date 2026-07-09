import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { SubjectsManager, type SubjectRow } from "@/components/admin/SubjectsManager";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const supabase = createServerSupabase();

  const [{ data: subjects }, { data: usage }] = await Promise.all([
    supabase.from("subjects").select("id, name, short_code, colour, is_active").order("name"),
    supabase.from("batch_subjects").select("subject_id").is("deleted_at", null),
  ]);

  const useCount = new Map<string, number>();
  for (const u of usage ?? []) useCount.set(u.subject_id, (useCount.get(u.subject_id) ?? 0) + 1);

  const rows: SubjectRow[] = (subjects ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    short_code: s.short_code,
    colour: s.colour ?? "#c9a227",
    is_active: s.is_active,
    in_use: useCount.get(s.id) ?? 0,
  }));

  return (
    <div className="space-y-5 max-w-xl">
      <header>
        <Link href="/admin/batches" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Batches
        </Link>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Subjects</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          Create, edit and archive the subjects used across batches.
        </p>
      </header>

      <SubjectsManager subjects={rows} />
    </div>
  );
}
