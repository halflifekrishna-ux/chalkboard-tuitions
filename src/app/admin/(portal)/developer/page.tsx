import { CheckCircle2, AlertTriangle, XCircle, Database, GitCommit, Package, ListChecks } from "lucide-react";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { checkEnvironment, type HealthState } from "@/lib/os/health";
import { APP_VERSION, commitHash, deployEnv } from "@/lib/os/version";
import { FlagToggle } from "@/components/admin/FlagToggle";
import { requireSuperAdmin } from "./actions";

export const dynamic = "force-dynamic";

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

  const [env, { data: queue }, { data: failed }, { data: migrations }, { data: flags }] = await Promise.all([
    checkEnvironment(),
    supabase.from("communication_queue").select("status"),
    supabase.from("communication_queue").select("id, template_key, to_number, last_error, retry_count, updated_at").eq("status", "failed").order("updated_at", { ascending: false }).limit(10),
    supabase.from("schema_migrations").select("version, applied_at").order("version"),
    supabase.from("feature_flags").select("key, label, enabled").order("label"),
  ]);

  const tally = (queue ?? []).reduce((a, r) => ({ ...a, [r.status]: (a[r.status] ?? 0) + 1 }), {} as Record<string, number>);

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
