import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** Consistent empty state: icon, message, optional primary action. */
export function EmptyState({
  icon: Icon,
  message,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
      <Icon size={32} className="mx-auto mb-3" style={{ color: "rgba(245,240,232,0.25)" }} aria-hidden />
      <p className="text-sm mb-4 max-w-sm mx-auto leading-relaxed" style={{ color: "rgba(245,240,232,0.5)" }}>{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
