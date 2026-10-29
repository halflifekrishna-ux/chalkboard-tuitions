import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/contact";
import { STUDIO_PAGES, type StudioPage } from "@/lib/studio";

/**
 * StudioFooter — the footer on Learning Studio pages, in place of the
 * site-wide EcosystemFooter (which leads with the tuition centre's WhatsApp
 * line and street address, both wrong for a company or college buyer). One
 * contact: the shared inbox. Bengaluru is stated in the legal line, plainly.
 * Used in: (studio)/layout.tsx.
 */
const columns = {
  // Every Studio page, from the registry, so a new page is never an orphan.
  "Learning Studio": [
    ...Object.values(STUDIO_PAGES as Record<string, StudioPage>).map((p) => ({
      label: p.path === STUDIO_PAGES.hub.path ? "Overview" : p.name,
      href: p.path,
    })),
    { label: "Start a conversation", href: `${STUDIO_PAGES.hub.path}#enquire` },
  ],
  Chalkboard: [
    { label: "About Chalkboard", href: "/about" },
    { label: "Chalkboard Tuitions", href: "/tuitions" },
    { label: "Contact", href: "/contact?for=company" },
  ],
};

export function StudioFooter() {
  return (
    <footer className="bg-board-deep text-chalk">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6">
        <div className="mb-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href={STUDIO_PAGES.hub.path} className="inline-flex items-center gap-3">
              <Image src="/studio-emblem.png" alt="" width={44} height={44} />
              <span className="leading-tight">
                <span className="block font-playfair text-lg font-black text-chalk">Chalkboard</span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-chalk-yellow">Learning Studio</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-chalk/70">
              Custom training built around what your people need to be able to do. For companies, colleges and the
              trainers who teach with us.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-5 inline-flex items-center gap-2.5 text-sm text-chalk/80 transition-colors hover:text-chalk-yellow"
            >
              <Mail size={14} className="shrink-0 text-chalk-yellow" aria-hidden />
              {CONTACT_EMAIL}
            </a>
          </div>

          {Object.entries(columns).map(([heading, links]) => (
            <div key={heading}>
              <h2 className="mb-4 text-sm font-semibold tracking-wide text-chalk">{heading}</h2>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-chalk/70 transition-colors duration-150 hover:text-chalk">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-chalk/10 pt-6 text-xs text-chalk/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Chalkboard Learning Services LLP · Bengaluru, India</p>
          <p>Chalkboard Learning Studio is part of Chalkboard.</p>
        </div>
      </div>
    </footer>
  );
}
