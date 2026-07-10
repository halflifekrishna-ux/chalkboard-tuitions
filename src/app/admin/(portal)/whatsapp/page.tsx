import { MessageCircle, RefreshCw, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { TEMPLATES } from "@/lib/os/whatsapp";
import { retryQueue } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "#f4c430", icon: <Clock size={13} /> },
  processing: { label: "Processing", color: "#9db4c9", icon: <RefreshCw size={13} /> },
  sent: { label: "Sent", color: "#7dc98f", icon: <CheckCircle2 size={13} /> },
  failed: { label: "Failed", color: "#e8a090", icon: <AlertCircle size={13} /> },
};

export default async function WhatsAppPage() {
  await requireCapability("communications.manage");
  const supabase = createServerSupabase();

  const [{ data: rows }, counts] = await Promise.all([
    supabase
      .from("communication_queue")
      .select("id, status, template_key, to_number, retry_count, last_error, created_at, processed_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("communication_queue").select("status"),
  ]);

  const tally = (counts.data ?? []).reduce(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {} as Record<string, number>
  );
  const hasFailed = (tally.failed ?? 0) > 0;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>
          WhatsApp
        </h1>
        {hasFailed && (
          <form action={retryQueue}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm active:scale-[0.98] transition-transform"
              style={{ background: "#c9a227", color: "#162d24" }}
            >
              <RefreshCw size={15} /> Retry failed
            </button>
          </form>
        )}
      </header>

      {/* Tally */}
      <div className="grid grid-cols-4 gap-3">
        {(["pending", "processing", "sent", "failed"] as const).map((s) => (
          <div key={s} className="rounded-2xl p-3.5 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
            <p className="font-playfair text-2xl font-bold" style={{ color: STATUS_META[s].color }}>{tally[s] ?? 0}</p>
            <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: "rgba(245,240,232,0.4)" }}>{STATUS_META[s].label}</p>
          </div>
        ))}
      </div>

      {/* Config hint */}
      <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(244,196,48,0.08)", border: "1px solid rgba(244,196,48,0.25)" }}>
        <MessageCircle size={18} style={{ color: "#f4c430" }} className="flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed" style={{ color: "rgba(245,240,232,0.7)" }}>
          Messages are <strong>queued</strong> the moment attendance is saved — delivery never blocks attendance.
          To go live, set <code>WHATSAPP_ACCESS_TOKEN</code> and <code>WHATSAPP_PHONE_NUMBER_ID</code> in the environment
          and approve the {Object.keys(TEMPLATES).length} message templates in Meta Business Manager.
          Until then, rows stay pending safely.
        </div>
      </div>

      {/* Queue log */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>
          Recent Queue
        </h2>
        <div className="rounded-2xl" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          {!rows?.length ? (
            <p className="p-5 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>
              Queue is empty. Messages appear here after you finish a class.
            </p>
          ) : (
            <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
              {rows.map((r) => {
                const meta = STATUS_META[r.status] ?? STATUS_META.pending;
                return (
                  <li key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                        {r.template_key.replace(/_/g, " ")}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: meta.color }}>
                        {meta.icon} {meta.label}{r.retry_count > 0 ? ` · ${r.retry_count} retries` : ""}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(245,240,232,0.4)" }}>
                      to {r.to_number} · {new Date(r.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {r.last_error && (
                      <p className="text-[11px] mt-1" style={{ color: "#e8a090" }}>{r.last_error}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
