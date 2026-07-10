import Link from "next/link";
import { Search, Contact, Phone, MessageCircle } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";

export const dynamic = "force-dynamic";

export default async function ParentsPage({ searchParams }: { searchParams: { q?: string } }) {
  await requireCapability("parents.manage");
  const supabase = createServerSupabase();
  const q = searchParams.q?.trim() ?? "";

  let query = supabase
    .from("parents")
    .select("id, full_name, phone, whatsapp_number, email, students(id, full_name, deleted_at)")
    .is("deleted_at", null)
    .order("full_name")
    .limit(200);
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,whatsapp_number.ilike.%${q}%`);

  const { data: parents } = await query;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Parents</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>Parents are created and edited from a student&apos;s profile.</p>
      </header>

      <form method="GET" className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(245,240,232,0.35)" }} />
        <input name="q" type="search" defaultValue={q} placeholder="Search parents by name or phone…" aria-label="Search parents" className="w-full rounded-xl pl-11 pr-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]" style={{ background: "rgba(22,45,36,0.7)", color: "#f5f0e8", border: "1px solid rgba(201,162,39,0.15)" }} />
      </form>

      {!parents?.length ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <Contact size={32} className="mx-auto mb-3" style={{ color: "rgba(245,240,232,0.25)" }} />
          <p className="text-sm" style={{ color: "rgba(245,240,232,0.5)" }}>{q ? `No parents match “${q}”.` : "No parents yet. Add a student to create their parent."}</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {parents.map((p) => {
            const kids = (p.students as unknown as { id: string; full_name: string; deleted_at: string | null }[] | null)?.filter((s) => !s.deleted_at) ?? [];
            const wa = (p.whatsapp_number || p.phone || "").replace(/[^0-9]/g, "");
            return (
              <li key={p.id} className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "#f5f0e8" }}>{p.full_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,232,0.45)" }}>
                      {p.phone}{kids.length ? ` · ${kids.length} child${kids.length === 1 ? "" : "ren"}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={`tel:${p.phone}`} aria-label="Call" className="p-2 rounded-lg" style={{ background: "rgba(245,240,232,0.06)", color: "#f5f0e8" }}><Phone size={15} /></a>
                    <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="p-2 rounded-lg" style={{ background: "rgba(18,140,126,0.9)", color: "#fff" }}><MessageCircle size={15} /></a>
                  </div>
                </div>
                {kids.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {kids.map((k) => (
                      <Link key={k.id} href={`/admin/students/${k.id}`} className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: "rgba(201,162,39,0.12)", color: "#f4c430" }}>{k.full_name}</Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
