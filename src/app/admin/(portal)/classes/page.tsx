import Link from "next/link";
import { Plus, BookOpen, Clock, Users } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";

export const dynamic = "force-dynamic";

function fmtTime(t: string | null) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default async function ClassesPage() {
  const supabase = createServerSupabase();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, grade, room, start_time, end_time, days, capacity, is_active, subject:subjects(name), teacher:teachers(full_name), class_students(count)")
    .is("deleted_at", null)
    .order("start_time");

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
          Classes
        </h1>
        <Link
          href="/admin/classes/new"
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm active:scale-[0.98] transition-transform"
          style={{ background: "#c9a227", color: "#162d24" }}
        >
          <Plus size={16} /> Add
        </Link>
      </header>

      {!classes?.length ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <BookOpen size={32} className="mx-auto mb-3" style={{ color: "rgba(245,240,232,0.25)" }} />
          <p className="text-sm mb-4" style={{ color: "rgba(245,240,232,0.5)" }}>
            No classes yet. Create your first batch — e.g. “Grade 6 Mathematics · 5 PM”.
          </p>
          <Link
            href="/admin/classes/new"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm"
            style={{ background: "#c9a227", color: "#162d24" }}
          >
            <Plus size={16} /> Add Class
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {classes.map((c) => {
            const subject = c.subject as unknown as { name: string } | null;
            const teacher = c.teacher as unknown as { full_name: string } | null;
            const enrolled = (c.class_students as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <li key={c.id}>
                <Link
                  href={`/admin/classes/${c.id}`}
                  className="block rounded-2xl p-4 active:scale-[0.99] transition-transform"
                  style={{
                    background: "rgba(22,45,36,0.7)",
                    border: "1px solid rgba(201,162,39,0.15)",
                    opacity: c.is_active ? 1 : 0.55,
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-sm" style={{ color: "#f5f0e8" }}>
                      {c.name} {!c.is_active && "(inactive)"}
                    </p>
                    <span className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: "rgba(245,240,232,0.5)" }}>
                      <Users size={12} /> {enrolled}/{c.capacity}
                    </span>
                  </div>
                  <p className="text-xs mt-1 flex items-center gap-1.5 flex-wrap" style={{ color: "rgba(245,240,232,0.45)" }}>
                    {subject?.name ?? "—"} · Grade {c.grade}
                    {teacher ? ` · ${teacher.full_name}` : ""} ·{" "}
                    <Clock size={11} style={{ display: "inline" }} /> {fmtTime(c.start_time)}–{fmtTime(c.end_time)} ·{" "}
                    {(c.days as string[]).map((d) => d[0].toUpperCase() + d.slice(1)).join(" ")}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
