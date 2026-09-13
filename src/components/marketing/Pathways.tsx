import Link from "next/link";
import { type LucideIcon, ArrowRight, GraduationCap, Briefcase, LogIn } from "lucide-react";

/**
 * Pathways — the homepage "choose your path" area. Composition encodes the
 * hierarchy: Tuitions (primary, widest) and Learning Studio (secondary) sit
 * side-by-side on desktop and stack on mobile; Chalkboard OS is a compact
 * full-width utility strip below. Each destination is one semantic link
 * (one-tap). All information is always visible (no hover-only); hover/focus
 * only adds emphasis. Server component — zero client JS. Entrance uses CSS
 * `animate-fade-up`, which the global reduced-motion guard neutralises.
 * Used in: (marketing)/page.tsx.
 */

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chalk-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-board-deep";

function Tag({ children }: { children: React.ReactNode }) {
  return <li className="rounded-full border border-chalk/15 bg-chalk/5 px-3 py-1 text-xs font-medium text-chalk/80">{children}</li>;
}

function PathwayCard({
  href,
  eyebrow,
  title,
  description,
  tags,
  cta,
  icon: Icon,
  primary,
  delay,
  className,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  tags: string[];
  cta: string;
  icon: LucideIcon;
  primary?: boolean;
  delay: number;
  className?: string;
}) {
  return (
    <Link
      href={href}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-3xl opacity-0 animate-fade-up transition-transform duration-300 hover:-translate-y-1 ${focusRing} ${primary ? "p-6 sm:p-9" : "p-6 sm:p-8"} ${className ?? ""}`}
    >
      {/* background + border via inline style to keep exact brand tokens */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-3xl"
        style={
          primary
            ? {
                border: "1px solid rgba(244,196,48,0.45)",
                background: "linear-gradient(140deg, rgba(244,196,48,0.13) 0%, rgba(45,106,79,0.20) 34%, rgba(7,17,13,0.92) 72%)",
                boxShadow: "0 0 0 1px rgba(244,196,48,0.06), 0 24px 60px -20px rgba(0,0,0,0.8)",
                backdropFilter: "blur(6px)",
              }
            : {
                border: "1px solid rgba(245,240,232,0.11)",
                background: "rgba(245,240,232,0.035)",
                boxShadow: "0 20px 50px -24px rgba(0,0,0,0.7)",
                backdropFilter: "blur(6px)",
              }
        }
      />
      {primary && (
        <span aria-hidden className="pointer-events-none absolute -top-20 -right-14 h-56 w-56 rounded-full opacity-45 blur-3xl transition-opacity duration-500 group-hover:opacity-75" style={{ background: "radial-gradient(circle, #f4c430, transparent 70%)" }} />
      )}

      <div className="relative z-10 flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-yellow break-words">{eyebrow}</span>
        <span className={`flex-shrink-0 flex items-center justify-center rounded-full ${primary ? "h-11 w-11" : "h-10 w-10"}`} style={{ background: primary ? "rgba(244,196,48,0.15)" : "rgba(245,240,232,0.08)" }} aria-hidden>
          <Icon size={primary ? 20 : 18} className="text-chalk-yellow" />
        </span>
      </div>

      <h2 className={`relative z-10 mt-3 font-playfair font-bold tracking-tight text-chalk break-words ${primary ? "text-[1.9rem] sm:text-4xl" : "text-2xl sm:text-[1.75rem]"}`}>
        {title}
      </h2>

      <p className={`relative z-10 mt-2.5 text-chalk/65 leading-relaxed ${primary ? "text-base" : "text-sm"}`}>{description}</p>

      <ul className="relative z-10 mt-4 flex flex-wrap gap-2">
        {tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </ul>

      <span className={`relative z-10 mt-auto pt-5 inline-flex items-center gap-2 font-semibold ${primary ? "text-chalk-yellow text-base" : "text-chalk/85 text-sm"}`}>
        {cta}
        <ArrowRight size={primary ? 18 : 16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
      </span>
    </Link>
  );
}

export function Pathways() {
  return (
    <div>
      {/* Primary + secondary — side by side on desktop, stacked on mobile */}
      <div className="grid gap-4 lg:grid-cols-5">
        <PathwayCard
          className="lg:col-span-3"
          href="/tuitions"
          eyebrow="For parents & students"
          title="Chalkboard Tuitions"
          description="Small-batch, personalised academic learning that helps your child make real progress."
          tags={["Grades 1–10", "CBSE · ICSE · State Board"]}
          cta="Explore Tuitions"
          icon={GraduationCap}
          primary
          delay={120}
        />
        <PathwayCard
          className="lg:col-span-2"
          href="/learning-studio"
          eyebrow="For colleges, organisations & professionals"
          title="Chalkboard Learning Studio"
          description="Learning solutions for institutions and organisations."
          tags={["Corporate", "College", "E-learning", "Professional Development"]}
          cta="Explore Learning Studio"
          icon={Briefcase}
          delay={230}
        />
      </div>

      {/* Quiet OS utility strip — full width */}
      <Link
        href="/admin/login"
        style={{ animationDelay: "340ms" }}
        className={`group mt-4 flex items-center justify-between gap-4 rounded-2xl border border-chalk/10 bg-chalk/[0.02] px-5 py-4 opacity-0 animate-fade-up transition-colors hover:bg-chalk/5 ${focusRing}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-chalk/5" aria-hidden>
            <LogIn size={16} className="text-chalk/60" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk/40">Already part of Chalkboard?</p>
            <p className="text-sm font-semibold text-chalk/85 truncate">
              Chalkboard OS <span className="font-normal text-chalk/45">· Students · Parents · Teachers · Admin</span>
            </p>
          </div>
        </div>
        <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-chalk/60 group-hover:text-chalk">
          Login
          <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    </div>
  );
}
