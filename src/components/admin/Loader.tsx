"use client";

import { motion } from "framer-motion";

const sizes = { sm: 22, md: 34, lg: 48 } as const;

/**
 * The Chalkboard brand spinner — a gold arc chasing a soft emerald ring, with
 * a "C" chalk-mark at the centre. Used anywhere the app needs to say
 * "something is happening" without a generic grey wheel.
 */
export function BrandSpinner({ size = "md", className }: { size?: keyof typeof sizes; className?: string }) {
  const px = sizes[size];
  return (
    <span className={`relative inline-flex items-center justify-center ${className ?? ""}`} style={{ width: px, height: px }} role="status" aria-label="Loading">
      <span
        className="absolute inset-0 rounded-full"
        style={{ border: `${Math.max(2, px / 12)}px solid rgba(201,162,39,0.15)` }}
      />
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          border: `${Math.max(2, px / 12)}px solid transparent`,
          borderTopColor: "#f4c430",
          borderRightColor: "rgba(244,196,48,0.35)",
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: "linear", duration: 0.9 }}
      />
      <span className="font-playfair font-bold" style={{ fontSize: px * 0.38, color: "#f4c430" }}>C</span>
    </span>
  );
}

/** Full-width, centred loading state for a route or panel — the branded spinner plus a short label. */
export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <BrandSpinner size="lg" />
      <motion.p
        className="text-sm font-semibold"
        style={{ color: "rgba(245,240,232,0.5)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
      >
        {label}
      </motion.p>
    </div>
  );
}

/** Compact inline spinner + label, for buttons and small pending states. */
export function InlineSpinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <BrandSpinner size="sm" />
      {label && <span>{label}</span>}
    </span>
  );
}
