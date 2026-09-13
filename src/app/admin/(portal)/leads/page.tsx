import Link from "next/link";
import { Plus, Search, Inbox, Phone, Clock, ShieldCheck } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { can } from "@/lib/os/permissions";
import { LEAD_STATUS_META, VERTICAL_META, OPEN_STATUSES, type LeadStatus, type LeadVertical } from "@/lib/os/leads";

export const dynamic = "force-dynamic";

type Filter = "open" | "approval" | "mine" | "tuitions" | "studio" | "converted" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "approval", label: "Awaiting approval" },
  { key: "mine", label: "Mine" },
  { key: "tuitions", label: "Tuitions" },
  { key: "studio", label: "Studio" },
  { key: "converted", label: "Converted" },
  { key: "all", label: "All" },
];

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function LeadsPage({ searchParams }: { searchParams: { q?: string; filter?: string } }) {
  const admin = await requireCapability("leads.view");
  const supabase = createServerSupabase();
  const q = searchParams.q?.trim() ?? "";
  const filter = (FILTERS.find((f) => f.key === searchParams.filter)?.key ?? "open") as Filter;
  const canApprove = can(admin.role, "leads.approve");
  const readOnly = !can(admin.role, "leads.manage");

  let query = supabase
    .from("crm_leads")
    .select("id, full_name, phone, vertical, status, next_action, next_action_at, created_at, owner:assigned_to(full_name)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);

  if (filter === "open") query = query.in("status", OPEN_STATUSES);
  if (filter === "approval") query = query.eq("status", "pending_approval");
  if (filter === "mine") query = query.eq("assigned_to", admin.id);
  if (filter === "tuitions") query = query.eq("vertical", "tuitions");
  if (filter === "studio") query = query.eq("vertical", "studio");
  if (filter === "converted") query = query.eq("status", "converted");
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);

  const [{ data: leads }, { count: awaiting }] = await Promise.all([
    query,
    supabase.from("crm_leads").select("id", { count: "exact", head: true }).eq("status", "pending_approval").is("deleted_at", null),
  ]);

  const href = (f: Filter) => `/admin/leads${f === "open" && !q ? "" : `?${new URLSearchParams({ ...(q ? { q } : {}), filter: f })}`}`;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Leads</h1>
          {readOnly && (
            <p className="text-xs mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
              Add leads and follow where they get to.
            </p>
          )}
        </div>
        {can(admin.role, "leads.create") && (
          <Link href="/admin/leads/new" className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm active:scale-[0.98] transition-transform" style={{ background: "#c9a227", color: "#162d24" }}>
            <Plus size={16} /> Add
          </Link>
        )}
      </header>

      {canApprove && (awaiting ?? 0) > 0 && filter !== "approval" && (
        <Link href={href("approval")} className="flex items-center gap-3 rounded-2xl p-4" style={{ background: "rgba(244,196,48,0.08)", border: "1px solid rgba(244,196,48,0.3)" }}>
          <ShieldCheck size={18} style={{ color: "#f4c430" }} />
          <p className="flex-1 text-sm" style={{ color: "#f5f0e8" }}>
            {awaiting} studio lead{awaiting === 1 ? "" : "s"} waiting on your approval
          </p>
          <span className="text-xs font-semibold" style={{ color: "#f4c430" }}>Review →</span>
        </Link>
      )}

      <form method="GET" className="relative">
        <input type="hidden" name="filter" value={filter} />
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(245,240,232,0.35)" }} />
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search by name, phone or email…"
          aria-label="Search leads"
          className="w-full rounded-xl pl-11 pr-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]"
          style={{ background: "rgba(22,45,36,0.7)", color: "#f5f0e8", border: "1px solid rgba(201,162,39,0.15)" }}
        />
      </form>

      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1" style={{ scrollbarWidth: "none" }}>
        {FILTERS.filter((f) => f.key !== "mine" || !readOnly).map((f) => {
          const on = f.key === filter;
          return (
            <Link
              key={f.key}
              href={href(f.key)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors"
              style={on ? { background: "#c9a227", color: "#162d24" } : { background: "rgba(245,240,232,0.06)", color: "rgba(245,240,232,0.6)" }}
            >
              {f.label}
              {f.key === "approval" && (awaiting ?? 0) > 0 && !on && ` · ${awaiting}`}
            </Link>
          );
        })}
      </div>

      {!leads?.length ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <Inbox size={32} className="mx-auto mb-3" style={{ color: "rgba(245,240,232,0.25)" }} />
          <p className="text-sm mb-4" style={{ color: "rgba(245,240,232,0.5)" }}>
            {q ? `Nothing matches “${q}”.` : "No leads here yet."}
          </p>
          {can(admin.role, "leads.create") && !q && (
            <Link href="/admin/leads/new" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>
              <Plus size={16} /> Add the first lead
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {leads.map((l) => {
            const status = LEAD_STATUS_META[l.status as LeadStatus];
            const vertical = VERTICAL_META[l.vertical as LeadVertical];
            const owner = l.owner as unknown as { full_name: string } | null;
            const due = fmtDate(l.next_action_at);
            return (
              <li key={l.id}>
                <Link href={`/admin/leads/${l.id}`} className="block rounded-2xl p-4 active:scale-[0.99] transition-transform" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-base truncate" style={{ color: "#f5f0e8" }}>{l.full_name}</p>
                      <p className="text-xs mt-1 flex items-center gap-2 flex-wrap" style={{ color: "rgba(245,240,232,0.5)" }}>
                        <span className="flex items-center gap-1"><Phone size={11} /> {l.phone}</span>
                        {owner && <span>· {owner.full_name}</span>}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: vertical.bg, color: vertical.color }}>
                        {vertical.label}
                      </span>
                    </div>
                  </div>
                  {l.next_action && (
                    <p className="text-[11px] mt-2 flex items-center gap-1.5" style={{ color: "rgba(245,240,232,0.45)" }}>
                      <Clock size={11} /> {l.next_action}{due ? ` · ${due}` : ""}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
