"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { FileText, Download, Plus } from "lucide-react";
import type { ActionState } from "@/app/admin/(portal)/students/actions";
import { DOCUMENT_KINDS } from "@/lib/os/types";

export interface DocEntry {
  id: string;
  file_name: string;
  kind: string;
  size_bytes: number | null;
  created_at: string;
  url: string | null;
}

const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };

function kindLabel(kind: string) {
  return DOCUMENT_KINDS.find((k) => k.value === kind)?.label ?? "Other";
}

function fmtSize(bytes: number | null) {
  if (!bytes) return "";
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl px-5 py-2.5 font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60"
      style={{ background: "#c9a227", color: "#162d24" }}
    >
      {pending ? "Uploading…" : "Upload"}
    </button>
  );
}

export function DocumentsSection({
  docs,
  action,
}: {
  docs: DocEntry[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState<ActionState, FormData>(async (prev, fd) => {
    const result = await action(prev, fd);
    if (!result.error) {
      formRef.current?.reset();
      setOpen(false);
    }
    return result;
  }, {});

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-widest font-semibold" style={{ color: "rgba(245,240,232,0.4)" }}>
          Documents
        </h2>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-1.5"
          style={{ background: "rgba(201,162,39,0.15)", color: "#f4c430" }}
        >
          <Plus size={13} /> {open ? "Cancel" : "Upload"}
        </button>
      </div>

      {open && (
        <form
          ref={formRef}
          action={formAction}
          className="rounded-2xl p-4 mb-3 space-y-3"
          style={{ background: "rgba(22,45,36,0.9)", border: "1px solid rgba(201,162,39,0.3)" }}
        >
          <select
            name="kind"
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]"
            style={inputStyle}
            defaultValue="report_card"
          >
            {DOCUMENT_KINDS.map((k) => (
              <option key={k.value} value={k.value} style={{ color: "#162d24" }}>{k.label}</option>
            ))}
          </select>
          <input
            type="file"
            name="file"
            required
            className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-xs file:font-bold"
            style={{ color: "rgba(245,240,232,0.6)" }}
          />
          {state.error && <p className="text-xs" style={{ color: "#e8a090" }}>{state.error}</p>}
          <SubmitButton />
        </form>
      )}

      <div className="rounded-2xl" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
        {!docs.length ? (
          <p className="p-5 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>
            No documents uploaded yet.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
            {docs.map((d) => (
              <li key={d.id} className="px-4 py-3 flex items-center gap-3">
                <FileText size={16} className="flex-shrink-0" style={{ color: "#c9a227" }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: "#f5f0e8" }}>{d.file_name}</p>
                  <p className="text-[11px]" style={{ color: "rgba(245,240,232,0.4)" }}>
                    {kindLabel(d.kind)} · {fmtSize(d.size_bytes)} ·{" "}
                    {new Date(d.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                {d.url && (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-2" style={{ color: "#f4c430" }}>
                    <Download size={16} />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
