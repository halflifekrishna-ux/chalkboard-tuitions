import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Clock, Monitor } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { signedUrl, PHOTO_BUCKET } from "@/lib/os/storage";
import { Avatar } from "@/components/admin/Avatar";
import { UserActions } from "@/components/admin/UserActions";
import { ROLES, ROLE_LABELS, ROLE_BADGE, capabilitiesFor, canManageRole, type Role } from "@/lib/os/permissions";

export const dynamic = "force-dynamic";

const CAP_LABELS: Record<string, string> = {
  "users.manage": "Manage users", "developer.view": "Developer panel", "flags.manage": "Feature flags",
  "settings.manage": "System settings", "analytics.view": "Analytics",
  "subjects.manage": "Manage subjects", "batches.manage": "Manage batches", "reports.view": "Reports",
  "communications.manage": "Communications", "students.manage": "Manage students", "students.view": "View students",
  "parents.manage": "Manage parents", "batches.viewAssigned": "View assigned batches",
  "attendance.mark": "Mark attendance", "homework.manage": "Homework", "fees.manage": "Fees", "documents.manage": "Documents",
};

function fmtDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never";
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="flex items-center gap-2 text-xs" style={{ color: "rgba(245,240,232,0.45)" }}>{icon} {label}</span>
      <span className="text-sm font-medium text-right" style={{ color: "#f5f0e8" }}>{value}</span>
    </div>
  );
}

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const actor = await requireCapability("users.manage");
  const supabase = createServerSupabase();

  const { data: user } = await supabase
    .from("admins")
    .select("id, full_name, email, phone, role, is_active, branch_id, photo_path, last_login_at, last_seen_at, last_device, created_at, auth_user_id, branch:branches(name), creator:created_by(full_name)")
    .eq("id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!user) notFound();

  const [photoUrl, { data: activity }, { data: teacher }] = await Promise.all([
    signedUrl(PHOTO_BUCKET, user.photo_path),
    supabase.from("activity_logs").select("id, action, summary, created_at").or(`actor_id.eq.${params.id},entity_id.eq.${params.id}`).order("created_at", { ascending: false }).limit(15),
    // Best-effort: assigned batches via a teacher record matching this name.
    supabase.from("teachers").select("id").ilike("full_name", user.full_name).is("deleted_at", null).maybeSingle(),
  ]);

  let assignedBatches: { id: string; name: string; subject: string }[] = [];
  if (teacher?.id) {
    const { data: bs } = await supabase
      .from("batch_subjects")
      .select("subject:subjects(name), batch:batches(id, name)")
      .eq("teacher_id", teacher.id)
      .is("deleted_at", null);
    assignedBatches = (bs ?? []).map((b) => {
      const batch = b.batch as unknown as { id: string; name: string } | null;
      const subject = b.subject as unknown as { name: string } | null;
      return { id: batch?.id ?? "", name: batch?.name ?? "Batch", subject: subject?.name ?? "" };
    });
  }

  const role = user.role as Role;
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.student;
  const branch = user.branch as unknown as { name: string } | null;
  const creator = user.creator as unknown as { full_name: string } | null;
  const caps = capabilitiesFor(role);
  const isSelf = user.id === actor.id;
  const assignableRoles = ROLES.filter((r) => canManageRole(actor.role, r) && canManageRole(actor.role, role)) as Role[];
  const canTransfer = actor.role === "super_admin" && !isSelf && role !== "super_admin";

  return (
    <div className="space-y-5 max-w-2xl">
      <header>
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Users
        </Link>
        <div className="flex items-center gap-4">
          <Avatar name={user.full_name} photoUrl={photoUrl} size={64} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-playfair text-2xl font-bold" style={{ color: "#f5f0e8" }}>{user.full_name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full" style={{ background: badge.bg, color: badge.color }}>{ROLE_LABELS[role]}</span>
            </div>
            <p className="text-sm mt-0.5" style={{ color: "rgba(245,240,232,0.45)" }}>
              {user.is_active ? "Active" : "Disabled"}{branch ? ` · ${branch.name}` : ""}{isSelf ? " · you" : ""}
            </p>
          </div>
        </div>
      </header>

      {/* Details */}
      <section className="rounded-2xl px-4 divide-y" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
        <Row icon={<Mail size={13} />} label="Email" value={user.email} />
        <Row icon={<Phone size={13} />} label="Phone" value={user.phone ?? "—"} />
        <Row icon={<Clock size={13} />} label="Last login" value={fmtDate(user.last_login_at)} />
        <Row icon={<Clock size={13} />} label="Last seen" value={fmtDate(user.last_seen_at)} />
        <Row icon={<Monitor size={13} />} label="Device" value={user.last_device ?? "—"} />
        <Row icon={<Clock size={13} />} label="Created" value={`${fmtDate(user.created_at)}${creator ? ` · by ${creator.full_name}` : ""}`} />
      </section>

      {/* Permissions */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>Permissions</h2>
        <div className="rounded-2xl p-4 flex flex-wrap gap-2" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          {caps.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>Read-only (future portal). No management permissions.</p>
          ) : caps.map((c) => (
            <span key={c} className="text-[11px] font-semibold rounded-full px-2.5 py-1" style={{ background: "rgba(245,240,232,0.06)", color: "rgba(245,240,232,0.75)" }}>{CAP_LABELS[c] ?? c}</span>
          ))}
        </div>
      </section>

      {/* Assigned batches (teachers) */}
      {assignedBatches.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>Assigned Batches</h2>
          <div className="rounded-2xl divide-y" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
            {assignedBatches.map((b, i) => (
              <Link key={i} href={`/admin/batches/${b.id}`} className="flex items-center justify-between px-4 py-3" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
                <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>{b.name}</span>
                <span className="text-xs" style={{ color: "rgba(245,240,232,0.45)" }}>{b.subject}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Management actions */}
      <UserActions
        userId={user.id}
        fullName={user.full_name}
        role={role}
        isActive={user.is_active}
        isSelf={isSelf}
        assignableRoles={assignableRoles}
        canTransfer={canTransfer}
      />

      {/* Activity */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>Activity</h2>
        <div className="rounded-2xl" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          {!activity?.length ? (
            <p className="p-5 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>No activity yet.</p>
          ) : (
            <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
              {activity.map((a) => (
                <li key={a.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-sm" style={{ color: "rgba(245,240,232,0.8)" }}>{a.summary}</p>
                  <time className="text-[11px] whitespace-nowrap" style={{ color: "rgba(245,240,232,0.35)" }}>{fmtDate(a.created_at)}</time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
