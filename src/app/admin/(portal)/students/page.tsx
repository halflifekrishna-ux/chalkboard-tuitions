import Link from "next/link";
import { UserPlus, Search, GraduationCap } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { BOARD_LABELS, STATUS_LABELS, type Board, type StudentStatus } from "@/lib/os/types";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<StudentStatus, string> = {
  active: "#7dc98f",
  trial: "#f4c430",
  paused: "#e8a090",
  alumni: "#9db4c9",
  dropped: "rgba(245,240,232,0.35)",
};

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createServerSupabase();
  const q = searchParams.q?.trim() ?? "";

  let query = supabase
    .from("students")
    .select("id, student_code, full_name, grade, board, status, parent:parents(full_name, phone)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) query = query.or(`full_name.ilike.%${q}%,student_code.ilike.%${q}%`);

  const { data: students } = await query;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
          Students
        </h1>
        <Link
          href="/admin/students/new"
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm active:scale-[0.98] transition-transform"
          style={{ background: "#c9a227", color: "#162d24" }}
        >
          <UserPlus size={16} /> Add
        </Link>
      </header>

      {/* Search */}
      <form method="GET" className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(245,240,232,0.35)" }} />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or student ID…"
          className="w-full rounded-xl pl-11 pr-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]"
          style={{ background: "rgba(22,45,36,0.7)", color: "#f5f0e8", border: "1px solid rgba(201,162,39,0.15)" }}
        />
      </form>

      {/* List */}
      {!students?.length ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}
        >
          <GraduationCap size={32} className="mx-auto mb-3" style={{ color: "rgba(245,240,232,0.25)" }} />
          <p className="text-sm mb-4" style={{ color: "rgba(245,240,232,0.5)" }}>
            {q ? `No students match “${q}”.` : "No students yet. Add your first student to get started."}
          </p>
          {!q && (
            <Link
              href="/admin/students/new"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm"
              style={{ background: "#c9a227", color: "#162d24" }}
            >
              <UserPlus size={16} /> Add Student
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {students.map((s) => {
            const parent = s.parent as unknown as { full_name: string; phone: string } | null;
            return (
              <li key={s.id}>
                <Link
                  href={`/admin/students/${s.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl p-4 active:scale-[0.99] transition-transform"
                  style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "#f5f0e8" }}>
                      {s.full_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,232,0.45)" }}>
                      {s.student_code} · Grade {s.grade} · {BOARD_LABELS[s.board as Board]}
                      {parent ? ` · ${parent.full_name}` : ""}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap"
                    style={{
                      color: STATUS_COLORS[s.status as StudentStatus],
                      background: "rgba(245,240,232,0.06)",
                    }}
                  >
                    {STATUS_LABELS[s.status as StudentStatus]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
