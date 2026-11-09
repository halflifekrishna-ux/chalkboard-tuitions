"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Upload } from "lucide-react";
import type { WorksheetActionState } from "@/app/admin/(portal)/worksheets/actions";
import { SECTION_LETTERS } from "@/lib/os/worksheets";

const inputStyle = { background: "rgba(245,240,232,0.08)", color: "#f5f0e8" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl py-3.5 px-8 font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60"
      style={{ background: "#c9a227", color: "#162d24" }}
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
      {pending ? "Sending…" : "Send worksheet"}
    </button>
  );
}

function Choice({
  name, value, label, checked, onChange,
}: { name: string; value: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label
      className="flex-1 cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-center"
      style={{
        background: checked ? "rgba(201,162,39,0.18)" : "rgba(245,240,232,0.05)",
        border: `1.5px solid ${checked ? "#c9a227" : "transparent"}`,
        color: checked ? "#f5f0e8" : "rgba(245,240,232,0.6)",
      }}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  );
}

export function WorksheetForm({
  action,
}: {
  action: (prev: WorksheetActionState, formData: FormData) => Promise<WorksheetActionState>;
}) {
  const [state, formAction] = useFormState<WorksheetActionState, FormData>(action, {});
  const [colour, setColour] = useState<"colour" | "bw">("bw");
  const [answers, setAnswers] = useState<"all" | "some">("all");

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Worksheet file</p>
        <input
          type="file"
          name="file"
          required
          accept=".pdf,.jpg,.jpeg,.png,.heic,.webp,.doc,.docx,application/pdf,image/*"
          className="w-full rounded-xl px-4 py-3 text-sm"
          style={inputStyle}
        />
        <p className="text-[11px] mt-1" style={{ color: "rgba(245,240,232,0.4)" }}>PDF, photo or Word document, up to 20 MB.</p>
      </div>

      <div>
        <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Print style</p>
        <div className="flex gap-3">
          <Choice name="colour" value="bw" label="Black and white" checked={colour === "bw"} onChange={() => setColour("bw")} />
          <Choice name="colour" value="colour" label="Colour" checked={colour === "colour"} onChange={() => setColour("colour")} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Answers for</p>
        <div className="flex gap-3">
          <Choice name="answers" value="all" label="All sections" checked={answers === "all"} onChange={() => setAnswers("all")} />
          <Choice name="answers" value="some" label="Only these sections" checked={answers === "some"} onChange={() => setAnswers("some")} />
        </div>
        {answers === "some" && (
          <div className="flex flex-wrap gap-2 mt-3">
            {SECTION_LETTERS.map((l) => (
              <label
                key={l}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer"
                style={{ background: "rgba(245,240,232,0.08)", color: "#f5f0e8" }}
              >
                <input type="checkbox" name="sections" value={l} className="accent-[#c9a227]" /> {l}
              </label>
            ))}
          </div>
        )}
      </div>

      {state.error && (
        <p role="alert" className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(232,120,100,0.14)", color: "#e8a090" }}>
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
