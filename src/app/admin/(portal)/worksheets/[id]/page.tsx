import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { signedUrl } from "@/lib/os/storage";
import {
  WORKSHEETS_BUCKET,
  WORKSHEET_STATUS_META,
  describeAnswers,
  type WorksheetStatus,
} from "@/lib/os/worksheets";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

export const dynamic = "force-dynamic";

export default async function WorksheetRequestPage({ params }: { params: { id: string } }) {
  await requireCapability("worksheets.upload");
  const supabase = createServerSupabase();

  // RLS: a teacher can only load their own request; anything else is a 404.
  const { data: req } = await supabase
    .from("worksheet_requests")
    .select("id, file_path, file_name, colour, answer_sections, status, output_paths, error_note, created_at, completed_at")
    .eq("id", params.id)
    .maybeSingle();
  if (!req) notFound();

  const status = WORKSHEET_STATUS_META[req.status as WorksheetStatus];
  const outputs = await Promise.all(
    (req.output_paths ?? []).map(async (p: string) => ({
      name: p.split("/").pop() ?? p,
      url: await signedUrl(WORKSHEETS_BUCKET, p),
    }))
  );
  const original = await signedUrl(WORKSHEETS_BUCKET, req.file_path);
  const waiting = req.status === "new" || req.status === "processing";

  return (
    <div className="space-y-6 max-w-xl">
      <AutoRefresh active={waiting} />
      <header>
        <Link href="/admin/worksheets" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Worksheets
        </Link>
        <h1 className="font-playfair text-2xl font-bold break-words" style={{ color: "#f5f0e8" }}>{req.file_name}</h1>
        <span className="inline-block mt-2 rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: status.bg, color: status.color }}>
          {status.label}
        </span>
      </header>

      <dl className="rounded-2xl divide-y" style={{ background: "rgba(245,240,232,0.04)", borderColor: "rgba(245,240,232,0.08)" }}>
        {[
          ["Print style", req.colour ? "Colour" : "Black and white"],
          ["Answers for", describeAnswers(req.answer_sections)],
          ["Sent", new Date(req.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
            <dt className="text-xs" style={{ color: "rgba(245,240,232,0.45)" }}>{k}</dt>
            <dd className="text-sm font-medium" style={{ color: "#f5f0e8" }}>{v}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="text-sm font-bold mb-3" style={{ color: "#f5f0e8" }}>Finished PDFs</h2>
        {outputs.length > 0 ? (
          <ul className="space-y-2">
            {outputs.map((o) => (
              <li key={o.name}>
                {o.url ? (
                  <a href={o.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "rgba(125,201,143,0.12)", color: "#7dc98f" }}>
                    <Download size={16} /> {o.name}
                  </a>
                ) : (
                  <span className="text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>{o.name} (link unavailable, refresh)</span>
                )}
              </li>
            ))}
          </ul>
        ) : req.status === "failed" ? (
          <p className="text-sm" style={{ color: "#e8a090" }}>
            We could not finish this one{req.error_note ? `: ${req.error_note}` : ""}. Please upload a clearer copy.
          </p>
        ) : (
          <p className="text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>
            Your PDFs will appear here when they are ready. This page updates by itself.
          </p>
        )}
      </section>

      {original && (
        <a href={original} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold" style={{ color: "rgba(245,240,232,0.5)" }}>
          <FileText size={14} /> View original upload
        </a>
      )}
    </div>
  );
}
