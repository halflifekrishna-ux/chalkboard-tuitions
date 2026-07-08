"use client";

import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { LogIn } from "lucide-react";
import { login, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60"
      style={{ background: "#c9a227", color: "#162d24" }}
    >
      <LogIn size={16} />
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState<LoginState, FormData>(login, {});

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #162d24, #101d18)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "rgba(22,45,36,0.7)",
          border: "1px solid rgba(201,162,39,0.25)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo-dark.png" alt="Chalkboard Tuitions" width={64} height={64} className="rounded-xl mb-4" />
          <h1 className="font-playfair text-2xl font-bold" style={{ color: "#f5f0e8" }}>
            Chalkboard OS
          </h1>
          <p className="text-xs mt-1 tracking-widest uppercase" style={{ color: "rgba(245,240,232,0.4)" }}>
            Admin Portal
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]"
              style={{ background: "rgba(245,240,232,0.08)", color: "#f5f0e8" }}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]"
              style={{ background: "rgba(245,240,232,0.08)", color: "#f5f0e8" }}
            />
          </div>

          {state.error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(220,80,60,0.15)", color: "#e8a090" }}>
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>

        <p className="text-center text-[11px] mt-6" style={{ color: "rgba(245,240,232,0.3)" }}>
          Authorized staff only
        </p>
      </div>
    </main>
  );
}
