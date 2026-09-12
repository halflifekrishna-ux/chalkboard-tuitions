"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * EcosystemNavbar — route-based top navigation for all marketing pages.
 * Marketing links (Tuitions, Learning Studio, About, Contact) are grouped;
 * the OS "Login" is a quiet, visually-separated utility; "Book Free Demo"
 * is the single primary CTA. Used in: (marketing)/layout.tsx.
 */
const WHATSAPP = "917411446381";

const LINKS = [
  { label: "Tuitions", href: "/tuitions" },
  { label: "Learning Studio", href: "/learning-studio" },
  { label: "About", href: "/about" },
];

export function EcosystemNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  // The homepage is a quiet "front door" — no Book Demo CTA competing with the pathways.
  const isHome = pathname === "/";
  // Learning Studio is email-only: no Tuitions WhatsApp / demo CTA there —
  // its primary action is its own enquiry form.
  const isStudio = pathname === "/learning-studio" || pathname.startsWith("/learning-studio/");

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-board-deep/90 backdrop-blur-lg border-b border-chalk-yellow/10 shadow-lg shadow-black/20"
            : "bg-board-deep/80 backdrop-blur-md md:bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Wordmark → home */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Chalkboard home">
            <Image src="/logo-dark.png" alt="" width={38} height={38} className="object-contain rounded-lg transition-transform duration-300 group-hover:scale-105" priority />
            <span className="font-playfair font-black text-chalk text-lg tracking-tight">Chalkboard</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium tracking-wide transition-colors duration-150 ${
                  isActive(l.href) ? "text-chalk-yellow" : "text-chalk/60 hover:text-chalk"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right: theme · Login (quiet) · Book Demo (primary) */}
          <div className="flex items-center gap-1.5">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-chalk/50 hover:text-chalk hover:bg-chalk/10 transition-all"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            )}

            <Link
              href="/admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-chalk/55 hover:text-chalk hover:bg-chalk/10 transition-all"
            >
              <LogIn size={15} /> Login
            </Link>

            {isStudio && (
              <Link
                href="/learning-studio#enquire"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-chalk-dark transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-chalk-yellow/30 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #f4c430 0%, #c9a227 100%)" }}
              >
                Enquire
              </Link>
            )}
            {!isHome && !isStudio && (
              <a
                href={`https://wa.me/${WHATSAPP}?text=Hi! I'd like to book a free demo class at Chalkboard Tuitions.`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-chalk-dark transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-chalk-yellow/30 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #f4c430 0%, #c9a227 100%)" }}
              >
                Book Free Demo
              </a>
            )}

            <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-chalk hover:bg-chalk/10 transition-colors" aria-label="Toggle menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-board-deep/95 backdrop-blur-lg border-b border-chalk-yellow/10 shadow-2xl md:hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive(l.href) ? "text-chalk-yellow bg-chalk/5" : "text-chalk/80 hover:text-chalk hover:bg-chalk/10"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/admin/login" className="px-4 py-3 rounded-xl font-medium text-chalk/70 hover:text-chalk hover:bg-chalk/10 flex items-center gap-2">
                <LogIn size={16} /> Login to Chalkboard OS
              </Link>
              {isStudio && (
                <Link
                  href="/learning-studio#enquire"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-chalk-dark text-sm"
                  style={{ background: "linear-gradient(135deg, #f4c430 0%, #c9a227 100%)" }}
                >
                  Enquire with Learning Studio
                </Link>
              )}
              {!isHome && !isStudio && (
                <a
                  href={`https://wa.me/${WHATSAPP}?text=Hi! I'd like to book a free demo class.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-chalk-dark text-sm"
                  style={{ background: "linear-gradient(135deg, #f4c430 0%, #c9a227 100%)" }}
                >
                  Book Free Demo Class
                </a>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
