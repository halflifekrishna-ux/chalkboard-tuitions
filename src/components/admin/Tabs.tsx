"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export interface TabDef {
  key: string;
  label: string;
  badge?: number;
  content: React.ReactNode;
}

/**
 * Client tab switcher. All panels are rendered once and hidden when inactive,
 * so enrolment/subject state and scroll position survive tab changes. The
 * active pill glides between tabs instead of hard-cutting.
 */
export function Tabs({ tabs }: { tabs: TabDef[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div
        className="sticky top-0 z-10 flex gap-1 overflow-x-auto -mx-4 px-4 py-2 mb-4"
        style={{ background: "#101d18", scrollbarWidth: "none" }}
      >
        {tabs.map((t) => {
          const on = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              aria-pressed={on}
              className="relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors"
              style={{ color: on ? "#162d24" : "rgba(245,240,232,0.6)", background: on ? "transparent" : "rgba(245,240,232,0.06)" }}
            >
              {on && (
                <motion.span
                  layoutId="tabs-active-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "#c9a227" }}
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <span className="relative">{t.label}</span>
              {t.badge != null && (
                <span className="relative text-[10px] font-bold rounded-full px-1.5" style={{ background: on ? "rgba(22,45,36,0.25)" : "rgba(201,162,39,0.2)", color: on ? "#162d24" : "#c9a227" }}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div key={t.key} hidden={t.key !== active}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
