import Link from "next/link";
import { Plus, Users, BookOpen, Layers, Tag, Search } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { BOARD_LABELS, type Board } from "@/lib/os/types";

export const dynamic = "force-dynamic";

export default async function BatchesPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createServerSupabase();
  const q = searchParams.q?.trim() ?? "";

  let query = supabase
    .from("batches")
    .select("id, name, grade, board, capacity, status, academic_year:academic_years(name), batch_students(count), batch_subjects(count)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (q) query = query.ilike("name", `%${q}%`);

  const { data: batches } = await query;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Batches</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/subjects" className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 font-semibold text-xs" style={{ background: "rgba(245,240,232,0.06)", color: "rgba(245,240,232,0.7)" }}>
            <Tag size={14} /> Subjects
          </Link>
          <Link href="/admin/batches/new" className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm active:scale-[0.98] transition-transform" style={{ background: "#c9a227", color: "#162d24" }}>
            <Plus size={16} /> Add
          </Link>
        </div>
      </header>

      {/* Search */}
      <form method="GET" className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(245,240,232,0.35)" }} />
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search batches…"
          aria-label="Search batches"
          className="w-full rounded-xl pl-11 pr-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]"
          style={{ background: "rgba(22,45,36,0.7)", color: "#f5f0e8", border: "1px solid rgba(201,162,39,0.15)" }}
        />
      </form>

      {!batches?.length ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <Layers size={32} className="mx-auto mb-3" style={{ color: "rgba(245,240,232,0.25)" }} />
          <p className="text-sm mb-4" style={{ color: "rgba(245,240,232,0.5)" }}>
            {q ? `No batches match “${q}”.` : "No batches yet. Create your first — e.g. “Grade 8 Foundation”, then add subjects and enrol students."}
          </p>
          {!q && (
            <Link href="/admin/batches/new" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>
              <Plus size={16} /> Add Batch
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {batches.map((b) => {
            const ay = b.academic_year as unknown as { name: string } | null;
            const students = (b.batch_students as unknown as { count: number }[])?.[0]?.count ?? 0;
            const subs = (b.batch_subjects as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <li key={b.id}>
                <Link href={`/admin/batches/${b.id}`} className="block rounded-2xl p-4 active:scale-[0.99] transition-transform" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)", opacity: b.status === "active" ? 1 : 0.55 }}>
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-semibold text-base" style={{ color: "#f5f0e8" }}>{b.name}{b.status !== "active" && ` (${b.status})`}</p>
                    <span className="text-[11px]" style={{ color: "rgba(245,240,232,0.4)" }}>{ay?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs" style={{ color: "rgba(245,240,232,0.5)" }}>
                    <span>Grade {b.grade}{b.board ? ` · ${BOARD_LABELS[b.board as Board]}` : ""}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {students}/{b.capacity}</span>
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {subs} subject{subs === 1 ? "" : "s"}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
