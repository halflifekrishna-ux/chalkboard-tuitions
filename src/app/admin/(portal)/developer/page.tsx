import { CheckCircle2, AlertTriangle, XCircle, Database, GitCommit, Package, ListChecks, HardDrive, Users as UsersIcon, LogIn, ShieldAlert, Grid3x3 } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { checkEnvironment, type HealthState } from "@/lib/os/health";
import { APP_VERSION, commitHash, deployEnv } from "@/lib/os/version";
import { FlagToggle } from "@/components/admin/FlagToggle";
import { ROLES, ROLE_LABELS, ROLE_BADGE, ALL_CAPABILITIES, can, type Role } from "@/lib/os/permissions";
import { requireSuperAdmin } from "./actions";

const CAP_SHORT: Record<string, string> = {
  "users.manage": "Users", "developer.view": "Dev", "flags.manage": "Flags", "settings.manage": "Settings",
  "analytics.view": "Analytics", "subjects.manage": "Subjects", "batches.manage": "Batches", "reports.view": "Reports",
  "communications.manage": "Comms", "students.manage": "Students±", "students.view": "Students", "parents.manage": "Parents",
  "batches.viewAssigned": "Assigned", "attendance.mark": "Attend", "homework.manage": "Homework", "fees.manage": "Fees", "documents.manage": "Docs",
};

export const dynamic = "force-dynamic";

function fmtBytes(n: number) {
  if (!n) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  return `${(n / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

const STATE_ICON: Record<HealthState, React.ReactNode> = {
  ok: <CheckCircle2 size={16} style={{ color: "#7dc98f" }} />,
  warn: <AlertTriangle size={16} style={{ color: "#f4c430" }} />,
  down: <XCircle size={16} style={{ color: "#e8a090" }} />,
};

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-widest font-semibold mb-3 flex items-center gap-2" style={{ color: "rgba(245,240,232,0.4)" }}>
        {icon} {title}
      </h2>
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
        {children}
      </div>
    </section>
  );
}

export default async function DeveloperPage() {
  await requireSuperAdmin();
  const supabase = createServerSupabase();

  const sinceLogins = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const seenCutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const [env, { data: queue }, { data: failed }, { data: migrations }, { data: flags }, statsRes,
    { data: users }, { data: recentLogins }, { data: failedLogins }, { count: onlineCount }] = await Promise.all([
    checkEnvironment(),
    supabase.from("communication_queue").select("status"),
    supabase.from("communication_queue").select("id, template_key, to_number, last_error, retry_count, updated_at").eq("status", "failed").order("updated_at", { ascending: false }).limit(10),
    supabase.from("schema_migrations").select("version, applied_at").order("version"),
    supabase.from("feature_flags").select("key, label, enabled").order("label"),
    supabase.rpc("get_system_stats"),
    supabase.from("admins").select("full_name, role, last_login_at, last_seen_at").is("deleted_at", null).eq("is_active", true),
    supabase.from("activity_logs").select("summary, created_at").eq("action", "login").order("created_at", { ascending: false }).limit(8),
    supabase.from("activity_logs").select("summary, created_at, metadata").in("action", ["login_failed", "login_denied"]).gte("created_at", sinceLogins).order("created_at", { ascending: false }).limit(8),
    supabase.from("admins").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("is_active", true).gte("last_seen_at", seenCutoff),
  ]);

  const tally = (queue ?? []).reduce((a, r) => ({ ...a, [r.status]: (a[r.status] ?? 0) + 1 }), {} as Record<string, number>);
  const stats = (statsRes.data ?? {}) as Record<string, number>;
  const latestMigration = migrations?.length ? migrations[migrations.length - 1].version : "—";
  const roleDist = (users ?? []).reduce((a, u) => ({ ...a, [u.role]: (a[u.role] ?? 0) + 1 }), {} as Record<string, number>);
  const onlineNow = (users ?? []).filter((u) => u.last_seen_at && new Date(u.last_seen_at).getTime() > Date.now() - 15 * 60 * 1000);

  function loginTime(iso: string) { return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }

  return (
    <div className="space-y-6 pb-6">
      <header>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Developer</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          System health & operations · Super Admin only
        </p>
      </header>

      {/* Version */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(244,196,48,0.4)" }}>
          <Package size={15} style={{ color: "#c9a227" }} />
          <p className="text-[10px] uppercase tracking-wide mt-1.5" style={{ color: "rgba(245,240,232,0.4)" }}>Version</p>
          <p className="font-playfair text-lg font-bold" style={{ color: "#f4c430" }}>v{APP_VERSION}</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <GitCommit size={15} style={{ color: "#c9a227" }} />
          <p className="text-[10px] uppercase tracking-wide mt-1.5" style={{ color: "rgba(245,240,232,0.4)" }}>Commit</p>
          <p className="font-mono text-sm font-bold" style={{ color: "#f5f0e8" }}>{commitHash()}</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <Database size={15} style={{ color: "#c9a227" }} />
          <p className="text-[10px] uppercase tracking-wide mt-1.5" style={{ color: "rgba(245,240,232,0.4)" }}>Env</p>
          <p className="text-sm font-bold capitalize" style={{ color: "#f5f0e8" }}>{deployEnv()}</p>
        </div>
      </div>

      {/* System stats */}
      <Card title="System" icon={<HardDrive size={13} />}>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
          {[
            ["Database", stats.db_size_bytes != null ? fmtBytes(stats.db_size_bytes) : "—"],
            ["Storage", stats.storage_bytes != null ? fmtBytes(stats.storage_bytes) : "—"],
            ["Queue size", String(stats.queue_total ?? tally.pending ?? 0)],
            ["Files", String(stats.storage_objects ?? 0)],
            ["Students", String(stats.students ?? 0)],
            ["Batches", String(stats.batches ?? 0)],
            ["Sessions", String(stats.sessions ?? 0)],
            ["Attendance", String(stats.attendance_rows ?? 0)],
          ].map(([label, value]) => (
            <div key={label} className="p-3">
              <p className="text-[10px] uppercase tracking-wide" style={{ color: "rgba(245,240,232,0.4)" }}>{label}</p>
              <p className="font-playfair text-lg font-bold" style={{ color: "#f5f0e8" }}>{value}</p>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(201,162,39,0.1)" }}>
          <span className="text-xs" style={{ color: "rgba(245,240,232,0.45)" }}>Latest migration</span>
          <span className="text-xs font-mono" style={{ color: "#f5f0e8" }}>{latestMigration}</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(201,162,39,0.1)" }}>
          <span className="text-xs" style={{ color: "rgba(245,240,232,0.45)" }}>Latest deployment</span>
          <span className="text-xs font-mono" style={{ color: "#f5f0e8" }}>{commitHash()} · {deployEnv()}</span>
        </div>
        {statsRes.error && (
          <p className="px-4 py-2 text-[11px]" style={{ color: "#f4c430" }}>
            Live DB/storage sizes need migration 0007 (get_system_stats). Counts shown are best-effort.
          </p>
        )}
      </Card>

      {/* Environment status */}
      <Card title="Environment" icon={<Database size={13} />}>
        <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
          {env.map((svc) => (
            <li key={svc.name} className="flex items-center gap-3 px-4 py-3">
              {STATE_ICON[svc.state]}
              <span className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>{svc.name}</span>
              <span className="text-xs ml-auto text-right" style={{ color: "rgba(245,240,232,0.5)" }}>{svc.detail}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Queue health */}
      <Card title="Queue Health" icon={<ListChecks size={13} />}>
        <div className="grid grid-cols-4 divide-x" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
          {(["pending", "processing", "sent", "failed"] as const).map((s) => (
            <div key={s} className="p-3 text-center">
              <p className="font-playfair text-xl font-bold" style={{ color: s === "failed" && (tally[s] ?? 0) > 0 ? "#e8a090" : "#f5f0e8" }}>{tally[s] ?? 0}</p>
              <p className="text-[10px] uppercase tracking-wide capitalize" style={{ color: "rgba(245,240,232,0.4)" }}>{s}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Failed jobs */}
      <Card title="Failed Jobs" icon={<XCircle size={13} />}>
        {!failed?.length ? (
          <p className="px-4 py-4 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>No failed jobs. 🎉</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
            {failed.map((j) => (
              <li key={j.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>{j.template_key.replace(/_/g, " ")}</span>
                  <span className="text-[11px]" style={{ color: "rgba(245,240,232,0.4)" }}>{j.retry_count} retries · {j.to_number}</span>
                </div>
                {j.last_error && <p className="text-[11px] mt-0.5" style={{ color: "#e8a090" }}>{j.last_error}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Migrations */}
      <Card title="Database Migrations" icon={<Database size={13} />}>
        {!migrations?.length ? (
          <p className="px-4 py-4 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>
            No migrations registry found. Run migration 0006 to enable tracking.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
            {migrations.map((m) => (
              <li key={m.version} className="flex items-center gap-3 px-4 py-2.5">
                <CheckCircle2 size={14} style={{ color: "#7dc98f" }} />
                <span className="text-sm font-mono" style={{ color: "#f5f0e8" }}>{m.version}</span>
                <span className="text-[11px] ml-auto" style={{ color: "rgba(245,240,232,0.35)" }}>
                  {new Date(m.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Access — online now + role distribution */}
      <Card title="Access" icon={<UsersIcon size={13} />}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(201,162,39,0.1)" }}>
          <span className="text-sm" style={{ color: "rgba(245,240,232,0.6)" }}>Logged-in now (last 15 min)</span>
          <span className="font-playfair text-lg font-bold" style={{ color: "#7dc98f" }}>{onlineCount ?? 0}</span>
        </div>
        {onlineNow.length > 0 && (
          <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
            {onlineNow.map((u) => (
              <li key={u.full_name} className="flex items-center gap-2 px-4 py-2.5">
                <span className="h-2 w-2 rounded-full" style={{ background: "#7dc98f" }} />
                <span className="text-sm" style={{ color: "#f5f0e8" }}>{u.full_name}</span>
                <span className="text-[11px] ml-auto" style={{ color: ROLE_BADGE[u.role as Role]?.color ?? "#f5f0e8" }}>{ROLE_LABELS[u.role as Role] ?? u.role}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="px-4 py-3 flex flex-wrap gap-2" style={{ borderTop: "1px solid rgba(201,162,39,0.1)" }}>
          {ROLES.map((r) => (
            <span key={r} className="text-[11px] font-semibold rounded-full px-2.5 py-1" style={{ background: ROLE_BADGE[r].bg, color: ROLE_BADGE[r].color }}>
              {ROLE_LABELS[r]} · {roleDist[r] ?? 0}
            </span>
          ))}
        </div>
      </Card>

      {/* Recent logins */}
      <Card title="Recent Logins" icon={<LogIn size={13} />}>
        {!recentLogins?.length ? (
          <p className="px-4 py-4 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>No logins recorded yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
            {recentLogins.map((l, i) => (
              <li key={i} className="px-4 py-2.5 flex items-center justify-between gap-3">
                <span className="text-sm" style={{ color: "rgba(245,240,232,0.8)" }}>{l.summary}</span>
                <time className="text-[11px] whitespace-nowrap" style={{ color: "rgba(245,240,232,0.35)" }}>{loginTime(l.created_at)}</time>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Failed logins */}
      <Card title="Failed Logins (7d)" icon={<ShieldAlert size={13} />}>
        {!failedLogins?.length ? (
          <p className="px-4 py-4 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>No failed sign-in attempts. 🎉</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
            {failedLogins.map((l, i) => (
              <li key={i} className="px-4 py-2.5 flex items-center justify-between gap-3">
                <span className="text-sm" style={{ color: "#e8a090" }}>{l.summary}</span>
                <time className="text-[11px] whitespace-nowrap" style={{ color: "rgba(245,240,232,0.35)" }}>{loginTime(l.created_at)}</time>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Permission matrix */}
      <Card title="Permission Matrix" icon={<Grid3x3 size={13} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: 520 }}>
            <thead>
              <tr>
                <th className="sticky left-0 px-3 py-2 text-[10px] uppercase tracking-wide font-semibold" style={{ color: "rgba(245,240,232,0.4)", background: "rgba(22,45,36,0.95)" }}>Capability</th>
                {ROLES.map((r) => (
                  <th key={r} className="px-2 py-2 text-center text-[10px] font-bold" style={{ color: ROLE_BADGE[r].color }}>{ROLE_LABELS[r].split(" ")[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_CAPABILITIES.map((cap) => (
                <tr key={cap} style={{ borderTop: "1px solid rgba(201,162,39,0.08)" }}>
                  <td className="sticky left-0 px-3 py-1.5 text-xs whitespace-nowrap" style={{ color: "rgba(245,240,232,0.75)", background: "rgba(22,45,36,0.95)" }}>{CAP_SHORT[cap] ?? cap}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-2 py-1.5 text-center">
                      {can(r, cap) ? <CheckCircle2 size={13} style={{ color: "#7dc98f", display: "inline" }} /> : <span style={{ color: "rgba(245,240,232,0.15)" }}>·</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Feature flags */}
      <Card title="Feature Flags" icon={<ListChecks size={13} />}>
        <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
          {(flags ?? []).map((f) => (
            <li key={f.key}>
              <FlagToggle flagKey={f.key} label={f.label} enabled={f.enabled} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
