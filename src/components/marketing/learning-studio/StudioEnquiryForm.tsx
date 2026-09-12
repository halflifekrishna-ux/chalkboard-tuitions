"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/contact";

/**
 * StudioEnquiryForm — Learning Studio's own enquiry form, for organisations,
 * institutions and professionals. Posts to /api/studio-enquiry, which emails
 * the team. Deliberately separate from the Tuitions demo form (/api/contact),
 * which asks for a child's grade and board and replies over WhatsApp;
 * Learning Studio is email-only for now, so there is no phone field.
 *
 * Used in: (marketing)/learning-studio/page.tsx (#enquire).
 */
const AUDIENCES = ["Corporate team", "College / institution", "Individual professional"];
const AREAS = [
  "AI & Generative AI",
  "Leadership & Management",
  "Data & Analytics",
  "Communication & Collaboration",
  "Digital Transformation",
  "Technology & Engineering Skills",
  "Placement & Career Readiness",
  "Faculty Development",
  "Not sure yet",
];
const SIZES = ["Under 20 people", "20–50", "50–200", "200+", "Not sure yet"];

type State = "idle" | "submitting" | "success" | "error";

const label = "block text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk/55";
const field =
  "mt-2 block w-full rounded-md border border-chalk/15 bg-white/[0.04] px-3.5 py-3 text-[15px] text-chalk placeholder:text-chalk/30 focus:border-chalk-yellow/60 focus:outline-none focus:ring-1 focus:ring-chalk-yellow/40";

export function StudioEnquiryForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("submitting");
    setError("");
    try {
      const res = await fetch("/api/studio-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Something went wrong. Please try again.");
      form.reset();
      setState("success");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div role="status" className="rounded-lg border border-chalk-yellow/30 bg-chalk/[0.03] p-8 sm:p-10">
        <CheckCircle2 size={28} className="text-chalk-yellow" aria-hidden />
        <h3 className="mt-4 font-playfair text-2xl font-bold text-chalk">Thanks — we have your enquiry.</h3>
        <p className="mt-3 text-base leading-relaxed text-chalk/60">
          We&rsquo;ll reply by email. You can also write to us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="break-all font-semibold text-chalk underline decoration-chalk/30 underline-offset-4">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <button type="button" onClick={() => setState("idle")} className="mt-6 text-sm font-semibold text-chalk-yellow hover:underline">
          Send another enquiry →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-6 rounded-lg border border-chalk/10 bg-chalk/[0.03] p-6 sm:p-8">
      {/* Honeypot: humans never see or reach this field; bots that fill it are dropped server-side. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="se-name" className={label}>Your name *</label>
          <input id="se-name" name="name" type="text" required maxLength={120} autoComplete="name" className={field} />
        </div>
        <div className="min-w-0">
          <label htmlFor="se-email" className={label}>Work email *</label>
          <input id="se-email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder="you@company.com" className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="se-org" className={label}>Organisation or institution *</label>
        <input id="se-org" name="organisation" type="text" required maxLength={160} autoComplete="organization" className={field} />
      </div>

      <fieldset>
        <legend className={label}>Who is the learning for? *</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {AUDIENCES.map((a) => (
            <label key={a} className="cursor-pointer">
              <input type="radio" name="audience" value={a} required className="peer sr-only" />
              <span className="inline-block rounded-md border border-chalk/15 px-3.5 py-2 text-sm text-chalk/70 transition-colors peer-checked:border-chalk-yellow peer-checked:bg-chalk-yellow/10 peer-checked:text-chalk peer-focus-visible:ring-2 peer-focus-visible:ring-chalk-yellow/60">
                {a}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="se-area" className={label}>Programme area</label>
          <select id="se-area" name="area" defaultValue="" className={`${field} [color-scheme:dark]`}>
            <option value="" className="text-gray-900">Select (optional)</option>
            {AREAS.map((a) => (
              <option key={a} value={a} className="text-gray-900">{a}</option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor="se-size" className={label}>Group size</label>
          <select id="se-size" name="size" defaultValue="" className={`${field} [color-scheme:dark]`}>
            <option value="" className="text-gray-900">Select (optional)</option>
            {SIZES.map((s) => (
              <option key={s} value={s} className="text-gray-900">{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="se-message" className={label}>What&rsquo;s the learning problem? *</label>
        <textarea
          id="se-message"
          name="message"
          required
          rows={5}
          maxLength={4000}
          placeholder="E.g. Our managers need to use AI tools confidently in day-to-day work — about 40 people across two teams."
          className={`${field} resize-y`}
        />
      </div>

      {state === "error" && (
        <p role="alert" className="rounded-md border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={state === "submitting"}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)] px-6 py-3.5 text-[15px] font-semibold text-chalk-dark transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chalk-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-board-deep"
        >
          {state === "submitting" ? "Sending…" : "Send enquiry"}
          {state !== "submitting" && <ArrowRight size={16} aria-hidden />}
        </button>
        <p className="text-xs text-chalk/40">We reply by email.</p>
      </div>
    </form>
  );
}
