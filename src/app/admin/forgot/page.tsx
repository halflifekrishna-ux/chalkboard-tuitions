"use client";

import Link from "next/link";
import Image from "next/image";
import { useFormState, useFormStatus } from "react-dom";
import { Mail } from "lucide-react";
import { requestReset, type ForgotState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm disabled:opacity-60"
      style={{ background: "#c9a227", color: "#162d24" }}
    >
      <Mail size={16} /> {pending ? "Sending…" : "Send reset link"}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState<ForgotState, FormData>(requestReset, {});

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(160deg, #162d24, #101d18)" }}>
      <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.25)", backdropFilter: "blur(16px)" }}>
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo-dark.png" alt="Chalkboard Tuitions" width={56} height={56} className="rounded-xl mb-3" />
          <h1 className="font-playfair text-2xl font-bold" style={{ color: "#f5f0e8" }}>Reset password</h1>
        </div>

        {state.sent ? (
          <p className="text-sm rounded-lg px-3 py-3" style={{ background: "rgba(201,162,39,0.12)", color: "#f5f0e8" }}>
            If that email belongs to an admin account, a reset link is on its way. Open it on this device.
          </p>
        ) : (
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Email</label>
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
            {state.error && <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(220,80,60,0.15)", color: "#e8a090" }}>{state.error}</p>}
            <Submit />
          </form>
        )}

        <p className="text-center text-xs mt-6">
          <Link href="/admin/login" style={{ color: "rgba(245,240,232,0.6)" }} className="hover:underline">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
