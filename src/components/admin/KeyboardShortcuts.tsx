"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Keyboard, X } from "lucide-react";

/**
 * Global admin shortcuts. Ignores keystrokes while typing in inputs.
 *   n → New Student   b → New Batch   / → focus search   ? → this help
 * Escape closing dialogs is handled by each dialog component.
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Escape" && helpOpen) { setHelpOpen(false); return; }
      if (typing) return;

      switch (e.key) {
        case "n": e.preventDefault(); router.push("/admin/students/new"); break;
        case "b": e.preventDefault(); router.push("/admin/batches/new"); break;
        case "/": {
          const search = document.querySelector<HTMLInputElement>('input[type="search"], input[name="q"], input[data-search]');
          if (search) { e.preventDefault(); search.focus(); }
          break;
        }
        case "?": e.preventDefault(); setHelpOpen((v) => !v); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, helpOpen]);

  if (!helpOpen) return null;

  const rows = [
    ["n", "New student"],
    ["b", "New batch"],
    ["/", "Focus search"],
    ["Esc", "Close dialog"],
    ["?", "Toggle this help"],
  ];

  return (
    <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.55)" }} onClick={() => setHelpOpen(false)}>
      <div className="w-full max-w-xs rounded-2xl p-5" style={{ background: "#162d24", border: "1px solid rgba(201,162,39,0.3)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-lg font-bold flex items-center gap-2" style={{ color: "#f5f0e8" }}><Keyboard size={18} /> Shortcuts</h2>
          <button onClick={() => setHelpOpen(false)} aria-label="Close"><X size={18} style={{ color: "rgba(245,240,232,0.5)" }} /></button>
        </div>
        <ul className="space-y-2">
          {rows.map(([k, label]) => (
            <li key={k} className="flex items-center justify-between text-sm">
              <span style={{ color: "rgba(245,240,232,0.7)" }}>{label}</span>
              <kbd className="rounded px-2 py-0.5 text-xs font-mono font-bold" style={{ background: "rgba(245,240,232,0.1)", color: "#f4c430" }}>{k}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
