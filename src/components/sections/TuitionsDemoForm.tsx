"use client";
import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";

const grades = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"];
const boards = ["CBSE","ICSE","Karnataka State Board (KSEEB)","Not sure yet"];

type FormState = "idle" | "submitting" | "success" | "error";

/**
 * The Tuitions free-demo form (posts to /api/contact, which is Tuitions-only).
 * Shared by the /tuitions contact section and the Tuitions route on /contact.
 */
export function TuitionsDemoForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setError("");
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      child_grade: (form.elements.namedItem("child_grade") as HTMLSelectElement).value,
      board: (form.elements.namedItem("board") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Something went wrong");
      }
      setState("success");
    } catch (err: unknown) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const inputClass =
    "w-full bg-white/5 border border-chalk/15 rounded-xl px-4 py-3 text-chalk placeholder-chalk/30 text-sm focus:outline-none focus:border-chalk-yellow/50 focus:ring-1 focus:ring-chalk-yellow/20 transition-all";

  return (
    <>
      {state === "success" ? (
        <div
          className="border border-green-400/20 rounded-2xl p-10 text-center"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <div className="w-14 h-14 bg-green-400/15 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={28} className="text-green-400" />
          </div>
          <h3 className="font-playfair text-2xl font-bold text-chalk mb-3">
            Request received!
          </h3>
          <p className="text-chalk/60 text-sm leading-relaxed max-w-sm mx-auto mb-6">
            We&apos;ll WhatsApp you on the number you gave within 30 minutes to
        confirm your free demo slot. Check your email too!
          </p>
          <button
            onClick={() => setState("idle")}
            className="text-chalk-yellow text-sm font-semibold hover:underline"
          >
            Submit another request →
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="relative border border-chalk/10 rounded-2xl p-6 sm:p-8 space-y-5"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          {/* Cursor spotlight inside form */}
          <Spotlight size={300} />

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-chalk/50 uppercase tracking-wider mb-2">
                Parent Name *
              </label>
              <input name="name" type="text" required placeholder="Your name" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-chalk/50 uppercase tracking-wider mb-2">
                Phone / WhatsApp *
              </label>
              <input name="phone" type="tel" required placeholder="+91 XXXXX XXXXX" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-chalk/50 uppercase tracking-wider mb-2">
              Email Address *
            </label>
            <input name="email" type="email" required placeholder="your@email.com" className={inputClass} />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-chalk/50 uppercase tracking-wider mb-2">
                Child&apos;s Grade *
              </label>
              <select name="child_grade" required defaultValue="" className={inputClass}>
                <option value="" disabled className="text-gray-900">Select grade</option>
                {grades.map((g) => (
                  <option key={g} value={g} className="text-gray-900">{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-chalk/50 uppercase tracking-wider mb-2">
                Board *
              </label>
              <select name="board" required defaultValue="" className={inputClass}>
                <option value="" disabled className="text-gray-900">Select board</option>
                {boards.map((b) => (
                  <option key={b} value={b} className="text-gray-900">{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-chalk/50 uppercase tracking-wider mb-2">
              Anything to share? (optional)
            </label>
            <textarea
              name="message"
              rows={3}
              placeholder="E.g. My child struggles with Maths and Science..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {state === "error" && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={state === "submitting"}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-chalk-dark text-[15px] shadow-xl shadow-chalk-yellow/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #f4c430 0%, #c9a227 100%)" }}
          >
            {state === "submitting" ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-chalk-dark/30 border-t-chalk-dark rounded-full"
                />
                Sending...
              </>
            ) : (
              <>
                Book Free Demo Class
                <Send size={16} />
              </>
            )}
          </button>

          <p className="text-center text-xs text-chalk/55">
            We&apos;ll WhatsApp you within 30 minutes. No spam, ever.
          </p>
        </form>
      )}
    </>
  );
}
