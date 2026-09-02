import Link from "next/link";
import { type LucideIcon, ArrowRight, GraduationCap, Briefcase, LogIn } from "lucide-react";

/**
 * Pathways — the homepage "choose your path" experience. Three weighted
 * destination panels whose SIZE encodes the brand hierarchy:
 *   Tuitions (primary, large) · Learning Studio (secondary, medium) · OS (quiet utility).
 * Each panel is one semantic link (one-tap). Supporting detail is always visible
 * on mobile and reveals on hover/focus on desktop via CSS (no hover-only logic).
 * Server component — zero client JS. Entrance uses the CSS `animate-fade-up`
 * (staggered), which the global prefers-reduced-motion guard neutralises.
 * Used in: (marketing)/page.tsx.
 */

interface Pathway {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  tags?: string[];
  cta: string;
  icon: LucideIcon;
}

const PATHWAYS: Pathway[] = [
  {
    href: "/tuitions",
    eyebrow: "For parents & students",
    title: "Chalkboard Tuitions",
    description: "Small-batch, personalised academic learning for Grades LKG–10 — CBSE, ICSE & State Board.",
    tags: ["LKG–10", "CBSE · ICSE · State"],
    cta: "Explore Tuitions",
    icon: GraduationCap,
  },
  {
    href: "/learning-studio",
    eyebrow: "For colleges, organisations & professionals",
    title: "Chalkboard Learning Studio",
    description: "Corporate learning, college programs, e-learning and professional development.",
    tags: ["Corporate", "College", "E-learning", "Professional"],
    cta: "Explore Learning Studio",
    icon: Briefcase,
  },
];

const OS = {
  href: "/admin/login",
  eyebrow: "Already part of Chalkboard?",
  title: "Chalkboard OS",
  description: "Students · Parents · Teachers · Admin",
  cta: "Login",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chalk-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-board-deep";

export function Pathways() {
  return (
    <div className="flex flex-col gap-4">
      {PATHWAYS.map((p, i) => {
        const primary = i === 0;
        const Icon = p.icon;
        return (
          <Link
            key={p.href}
            href={p.href}
            style={{ animationDelay: `${150 + i * 110}ms` }}
            className={`group relative block overflow-hidden rounded-3xl border opacity-0 animate-fade-up transition-all duration-300 hover:-translate-y-1 ${focusRing}`}
          >
            {/* backgrounds via data-driven inline style to keep brand tokens */}
            <span
              aria-hidden
              className="absolute inset-0 -z-10"
              style={
                primary
                  ? { border: "1px solid rgba(244,196,48,0.4)", borderRadius: "1.5rem", background: "linear-gradient(135deg, rgba(42,80,64,0.9) 0%, rgba(22,45,36,0.95) 100%)" }
                  : { border: "1px solid rgba(245,240,232,0.14)", borderRadius: "1.5rem", background: "rgba(245,240,232,0.04)" }
              }
            />
            {primary && (
              <span aria-hidden className="pointer-events-none absolute -top-16 -right-10 h-52 w-52 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70" style={{ background: "radial-gradient(circle, #f4c430, transparent 70%)" }} />
            )}

            <div className={`relative z-10 ${primary ? "p-7 sm:p-9" : "p-6 sm:p-7"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-chalk-yellow">{p.eyebrow}</span>
                  <h2 className={`mt-2 font-playfair font-bold tracking-tight text-chalk ${primary ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>{p.title}</h2>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full flex items-center justify-center ${primary ? "h-12 w-12" : "h-10 w-10"}`}
                  style={{ background: primary ? "rgba(244,196,48,0.15)" : "rgba(245,240,232,0.08)" }}
                  aria-hidden
                >
                  <Icon size={primary ? 22 : 18} className="text-chalk-yellow" />
                </span>
              </div>

              {/* Always visible on mobile; reveals on hover/focus on desktop */}
              <div className="overflow-hidden transition-all duration-300 ease-out max-h-40 opacity-100 lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-40 lg:group-hover:opacity-100 lg:group-focus-within:max-h-40 lg:group-focus-within:opacity-100">
                <p className={`text-chalk/65 leading-relaxed pt-3 ${primary ? "text-base max-w-xl" : "text-sm max-w-lg"}`}>{p.description}</p>
                {p.tags && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <li key={t} className="rounded-full border border-chalk/15 bg-chalk/5 px-3 py-1 text-xs font-medium text-chalk/80">{t}</li>
                    ))}
                  </ul>
                )}
              </div>

              <span className={`mt-4 inline-flex items-center gap-2 font-semibold ${primary ? "text-chalk-yellow text-base" : "text-chalk/85 text-sm"}`}>
                {p.cta}
                <ArrowRight size={primary ? 18 : 16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </span>
            </div>
          </Link>
        );
      })}

      {/* Quiet OS utility bar */}
      <Link
        href={OS.href}
        style={{ animationDelay: "370ms" }}
        className={`group flex items-center justify-between gap-4 rounded-2xl border border-chalk/10 bg-transparent px-5 py-4 opacity-0 animate-fade-up transition-colors hover:bg-chalk/5 ${focusRing}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-chalk/5" aria-hidden>
            <LogIn size={16} className="text-chalk/60" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk/40">{OS.eyebrow}</p>
            <p className="text-sm font-semibold text-chalk/85 truncate">
              {OS.title} <span className="font-normal text-chalk/45">· {OS.description}</span>
            </p>
          </div>
        </div>
        <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-chalk/60 group-hover:text-chalk">
          {OS.cta}
          <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    </div>
  );
}
