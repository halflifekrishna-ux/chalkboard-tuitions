"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const WHATSAPP = "917411446381";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-board-deep/90 backdrop-blur-lg border-b border-chalk-yellow/10 shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => { e.preventDefault(); handleNav("#hero"); }}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              {/* Dark bg logo (always visible on dark nav) */}
              <Image
                src="/logo-dark.png"
                alt="Chalkboard Tuitions"
                width={40}
                height={40}
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <div className="leading-tight hidden sm:block">
              <span className="font-playfair font-black text-chalk text-base block leading-none tracking-tight">
                Chalkboard
              </span>
              <span className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-chalk-yellow block">
                Tuitions
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => handleNav(l.href)}
                className="text-sm font-medium text-chalk/60 hover:text-chalk transition-colors duration-150 tracking-wide"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Right: Theme toggle + CTA */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-chalk/50 hover:text-chalk hover:bg-chalk/10 transition-all"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            )}

            <a
              href={`https://wa.me/${WHATSAPP}?text=Hi! I'd like to book a free demo class at Chalkboard Tuitions.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-chalk-dark transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-chalk-yellow/30 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #f4c430 0%, #c9a227 100%)" }}
            >
              Book Free Demo
            </a>

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg text-chalk hover:bg-chalk/10 transition-colors"
              aria-label="Toggle menu"
            >
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
              {navLinks.map((l) => (
                <button
                  key={l.href}
                  onClick={() => handleNav(l.href)}
                  className="text-left px-4 py-3 rounded-xl font-medium text-chalk/80 hover:text-chalk hover:bg-chalk/10 transition-all"
                >
                  {l.label}
                </button>
              ))}
              <a
                href={`https://wa.me/${WHATSAPP}?text=Hi! I'd like to book a free demo class.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-chalk-dark text-sm"
                style={{ background: "linear-gradient(135deg, #f4c430 0%, #c9a227 100%)" }}
              >
                Book Free Demo Class
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
