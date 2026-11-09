import Link from "next/link";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { can } from "@/lib/os/permissions";
import { WORKSHEET_STATUS_META, describeAnswers, type WorksheetStatus } from "@/lib/os/worksheets";
import { WorksheetForm } from "@/components/admin/WorksheetForm";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { createWorksheetRequest } from "./actions";

export const dynamic = "force-dynamic";

export default async function WorksheetsPage() {
  const admin = await requireCapability("worksheets.upload");
  const supabase = createServerSupabase();

  // RLS scopes teachers to their own rows; admin tier sees everyone's.
  const { data: rows } = await supabase
    .from("worksheet_requests")
    .select("id, file_name, colour, answer_sections, status, created_at, teacher:teacher_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(30);

  const showTeacher = can(admin.role, "users.manage") || admin.role === "admin";
  const pending = (rows ?? []).some((r) => r.status === "new" || r.status === "processing");

  return (
    <div className="space-y-8 max-w-2xl">
      <AutoRefresh active={pending} />
      <header>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Worksheets</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          Upload a worksheet and we will send back a finished, Chalkboard-style PDF with full solutions.
        </p>
      </header>

      <section className="rounded-2xl p-5" style={{ background: "rgba(245,240,232,0.04)" }}>
        <WorksheetForm action={createWorksheetRequest} />
      </section>

      <section>
        <h2 className="text-sm font-bold mb-3" style={{ color: "#f5f0e8" }}>Your requests</h2>
        {!rows?.length ? (
          <p className="text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>Nothing uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => {
              const meta = WORKSHEET_STATUS_META[r.status as WorksheetStatus];
              const teacher = r.teacher as unknown as { full_name: string } | null;
              return (
                <li key={r.id}>
                  <Link
                    href={`/admin/worksheets/${r.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                    style={{ background: "rgba(245,240,232,0.05)" }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#f5f0e8" }}>{r.file_name}</p>
                      <p className="text-[11px]" style={{ color: "rgba(245,240,232,0.45)" }}>
                        {r.colour ? "Colour" : "B/W"} · {describeAnswers(r.answer_sections)} ·{" "}
                        {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        {showTeacher && teacher ? ` · ${teacher.full_name}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
