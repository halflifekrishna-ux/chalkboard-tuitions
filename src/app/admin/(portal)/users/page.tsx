import Link from "next/link";
import { UserPlus, Search, Users as UsersIcon } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { signedUrl, PHOTO_BUCKET } from "@/lib/os/storage";
import { Avatar } from "@/components/admin/Avatar";
import { ROLES, ROLE_LABELS, ROLE_BADGE, type Role } from "@/lib/os/permissions";

export const dynamic = "force-dynamic";

function relTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function UsersPage({ searchParams }: { searchParams: { q?: string; role?: string } }) {
  await requireCapability("users.manage");
  const supabase = createServerSupabase();
  const q = searchParams.q?.trim() ?? "";
  const roleFilter = (searchParams.role ?? "").trim();

  let query = supabase
    .from("admins")
    .select("id, full_name, email, phone, role, is_active, last_login_at, photo_path, branch:branches(name)")
    .is("deleted_at", null)
    .order("role")
    .order("full_name");
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  if (roleFilter && ROLES.includes(roleFilter as Role)) query = query.eq("role", roleFilter);

  const { data: users } = await query;
  const photoUrls = await Promise.all((users ?? []).map((u) => signedUrl(PHOTO_BUCKET, u.photo_path)));

  const buildHref = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (params.q ?? q) sp.set("q", params.q ?? q);
    if (params.role ?? roleFilter) sp.set("role", params.role ?? roleFilter);
    const s = sp.toString();
    return `/admin/users${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Users</h1>
        <Link href="/admin/users/new" className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm active:scale-[0.98] transition-transform" style={{ background: "#c9a227", color: "#162d24" }}>
          <UserPlus size={16} /> Add
        </Link>
      </header>

      {/* Search */}
      <form method="GET" className="relative">
        {roleFilter && <input type="hidden" name="role" value={roleFilter} />}
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(245,240,232,0.35)" }} />
        <input name="q" type="search" defaultValue={q} placeholder="Search users by name or email…" aria-label="Search users" className="w-full rounded-xl pl-11 pr-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]" style={{ background: "rgba(22,45,36,0.7)", color: "#f5f0e8", border: "1px solid rgba(201,162,39,0.15)" }} />
      </form>

      {/* Role filter chips */}
      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1" style={{ scrollbarWidth: "none" }}>
        <Link href={buildHref({ role: "" })} className="rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap" style={!roleFilter ? { background: "#c9a227", color: "#162d24" } : { background: "rgba(245,240,232,0.06)", color: "rgba(245,240,232,0.6)" }}>All</Link>
        {ROLES.map((r) => (
          <Link key={r} href={buildHref({ role: r })} className="rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap" style={roleFilter === r ? { background: "#c9a227", color: "#162d24" } : { background: "rgba(245,240,232,0.06)", color: "rgba(245,240,232,0.6)" }}>
            {ROLE_LABELS[r]}
          </Link>
        ))}
      </div>

      {/* List */}
      {!users?.length ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <UsersIcon size={32} className="mx-auto mb-3" style={{ color: "rgba(245,240,232,0.25)" }} />
          <p className="text-sm" style={{ color: "rgba(245,240,232,0.5)" }}>{q || roleFilter ? "No users match your filters." : "No users yet."}</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {users.map((u, i) => {
            const badge = ROLE_BADGE[u.role as Role] ?? ROLE_BADGE.student;
            const branch = u.branch as unknown as { name: string } | null;
            return (
              <li key={u.id}>
                <Link href={`/admin/users/${u.id}`} className="flex items-center justify-between gap-3 rounded-2xl p-4 active:scale-[0.99] transition-transform" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)", opacity: u.is_active ? 1 : 0.55 }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={u.full_name} photoUrl={photoUrls[i]} size={42} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "#f5f0e8" }}>{u.full_name}{!u.is_active && " · disabled"}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(245,240,232,0.45)" }}>
                        {u.email}{branch ? ` · ${branch.name}` : ""} · {relTime(u.last_login_at)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: badge.bg, color: badge.color }}>
                    {ROLE_LABELS[u.role as Role]}
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
