"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const WHATSAPP = "917411446381";

/* ── Types ─────────────────────────────────────────────────────────────────── */
type BoardTab = "icse-cbse" | "state-board";
type Period   = "monthly" | "annual";

interface PriceCardData {
  name: string;
  grade: string;
  price: number;
  duration: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
}

/* ── ICSE / CBSE data ───────────────────────────────────────────────────────── */
const icseCbseMonthly: PriceCardData[] = [
  {
    name: "Foundation Pack",
    grade: "Grades 1–4",
    price: 3200,
    duration: "5 days/week · 1 hr",
    features: [
      "Daily structured class",
      "Workbook included",
      "Monthly test",
      "Parent WhatsApp update",
    ],
  },
  {
    name: "Growth Pack",
    grade: "Grades 5–7",
    price: 4500,
    duration: "5 days/week · 1.25 hr",
    features: [
      "Daily structured class",
      "Workbook included",
      "Monthly test & progress card",
      "Weekly parent updates",
    ],
  },
  {
    name: "Core Pack",
    grade: "Grades 8–9",
    price: 5500,
    duration: "5 days/week · 1.5 hr",
    features: [
      "Daily structured class",
      "Board-focused workbook",
      "Monthly tests + progress cards",
      "Weekly parent update",
      "Board exam pattern practice",
    ],
    badge: "Most Popular",
    highlight: true,
  },
  {
    name: "Board Prep",
    grade: "Grade 10",
    price: 6500,
    duration: "5 days/week · 1.5 hr",
    features: [
      "Daily structured classes",
      "Board-pattern weekly tests",
      "Full mock exam series",
      "Monthly parent progress call",
      "CBSE · ICSE",
    ],
    badge: "High Stakes",
  },
];

const icseCbseAnnual: PriceCardData[] = [
  {
    name: "Annual Core",
    grade: "Grade 9",
    price: 32000,
    duration: "Full academic year",
    features: [
      "Everything in Core Pack",
      "₹2,000 savings vs monthly",
      "Locked-in pricing for the year",
      "Priority seat reservation",
    ],
  },
  {
    name: "Annual Board",
    grade: "Grade 10",
    price: 42000,
    duration: "Full academic year",
    features: [
      "Everything in Board Prep",
      "₹6,000 savings vs monthly",
      "Full mock exam series",
      "Monthly parent progress call",
    ],
    badge: "Best Value",
    highlight: true,
  },
  {
    name: "ICSE Premium",
    grade: "Grades 9–10",
    price: 38000,
    duration: "Full academic year",
    features: [
      "ICSE-specific curriculum",
      "High-score prep methodology",
      "Intensive mock series",
      "Dedicated ICSE workbooks",
    ],
  },
  {
    name: "CBSE Excellence",
    grade: "Grades 9–10",
    price: 32000,
    duration: "Full academic year",
    features: [
      "NCERT mastery focus",
      "CBSE sample paper series",
      "Chapter-wise tests",
      "Board-ready by March",
    ],
  },
];

/* ── State Board data (monthly only) ────────────────────────────────────────── */
const stateBoardMonthly: PriceCardData[] = [
  {
    name: "Foundation Pack",
    grade: "Grades 1–4",
    price: 1500,
    duration: "5 days/week · 1 hr",
    features: [
      "Daily structured class",
      "State Board syllabus coverage",
      "Workbook included",
      "Monthly test",
      "Parent WhatsApp update",
    ],
  },
  {
    name: "Growth Pack",
    grade: "Grades 5–7",
    price: 2000,
    duration: "5 days/week · 1.25 hr",
    features: [
      "Daily structured class",
      "State Board syllabus coverage",
      "Workbook included",
      "Monthly test & progress card",
      "Weekly parent updates",
    ],
  },
  {
    name: "Core Pack",
    grade: "Grades 8–9",
    price: 2500,
    duration: "5 days/week · 1.5 hr",
    features: [
      "Daily structured class",
      "KSEEB-focused workbook",
      "Monthly tests + progress cards",
      "Weekly parent update",
      "Board exam pattern practice",
    ],
    badge: "Most Popular",
    highlight: true,
  },
  {
    name: "Board Prep",
    grade: "Grade 10",
    price: 3500,
    duration: "5 days/week · 1.5 hr",
    features: [
      "Daily structured classes",
      "KSEEB pattern weekly tests",
      "Full mock exam series",
      "Monthly parent progress call",
      "Karnataka State Board focused",
    ],
    badge: "High Stakes",
  },
];

/* ── Price Card ─────────────────────────────────────────────────────────────── */
function PriceCard({
  card,
  i,
  inView,
  suffix,
  waMsg,
}: {
  card: PriceCardData;
  i: number;
  inView: boolean;
  suffix: string;
  waMsg: string;
}) {
  return (
    <motion.div
      key={`${card.name}-${i}`}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
      className={`relative rounded-2xl border-2 p-6 flex flex-col transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl
        ${card.highlight
          ? "border-chalk-yellow bg-board text-chalk shadow-lg shadow-board/20"
          : "border-gray-100 dark:border-chalk/10 bg-white dark:bg-board/20"
        }`}
    >
      {card.badge && (
        <div
          className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold ${
            card.highlight
              ? "bg-chalk-yellow text-chalk-dark"
              : "bg-board text-chalk-yellow"
          }`}
        >
          {card.badge}
        </div>
      )}

      <div className="mb-4">
        <h3
          className={`font-playfair text-xl font-bold mb-1 ${
            card.highlight ? "text-chalk" : "text-chalk-dark dark:text-chalk"
          }`}
        >
          {card.name}
        </h3>
        <p
          className={`text-sm font-medium ${
            card.highlight ? "text-chalk-yellow" : "text-forest dark:text-chalk/60"
          }`}
        >
          {card.grade}
        </p>
      </div>

      <div className="mb-2 flex items-end gap-1">
        <span
          className={`font-playfair text-4xl font-black leading-none ${
            card.highlight ? "text-chalk-yellow" : "text-board dark:text-chalk"
          }`}
        >
          ₹{card.price.toLocaleString("en-IN")}
        </span>
        <span className={`text-sm mb-0.5 ${card.highlight ? "text-chalk/60" : "text-gray-400"}`}>
          /{suffix}
        </span>
      </div>
      <p className={`text-xs mb-5 ${card.highlight ? "text-chalk/50" : "text-gray-400"}`}>
        {card.duration}
      </p>

      <ul className="space-y-2.5 flex-1 mb-6">
        {card.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check
              size={15}
              className={`flex-shrink-0 mt-0.5 ${
                card.highlight ? "text-chalk-yellow" : "text-forest dark:text-chalk-yellow"
              }`}
            />
            <span
              className={`text-sm ${
                card.highlight ? "text-chalk/80" : "text-gray-600 dark:text-chalk/70"
              }`}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waMsg)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-200 ${
          card.highlight
            ? "bg-chalk-yellow text-chalk-dark hover:bg-yellow-400"
            : "bg-board/10 dark:bg-chalk/10 text-board dark:text-chalk hover:bg-board hover:text-chalk dark:hover:bg-board"
        }`}
      >
        Book Free Demo
        <ArrowRight size={14} />
      </a>
    </motion.div>
  );
}

/* ── Main Section ───────────────────────────────────────────────────────────── */
export function Pricing() {
  const [boardTab, setBoardTab] = useState<BoardTab>("icse-cbse");
  const [period, setPeriod]     = useState<Period>("monthly");
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  /* Derive cards + labels from state */
  const isStatBoard = boardTab === "state-board";

  const cards: PriceCardData[] = isStatBoard
    ? stateBoardMonthly
    : period === "monthly"
      ? icseCbseMonthly
      : icseCbseAnnual;

  const priceSuffix = isStatBoard ? "month" : period === "monthly" ? "month" : "year";

  const buildWaMsg = (card: PriceCardData) => {
    const boardLabel = isStatBoard ? "State Board" : "ICSE / CBSE";
    const periodLabel = isStatBoard || period === "monthly" ? "month" : "year";
    return `Hi! I'm interested in the ${card.name} (${card.grade}, ${boardLabel}) at ₹${card.price.toLocaleString("en-IN")}/${periodLabel}. Can I book a free demo?`;
  };

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-board/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <span className="section-label">Transparent Pricing</span>
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-board dark:text-chalk mb-4">
            Clear fees. No surprises.
          </h2>
          <p className="text-gray-500 dark:text-chalk/60 text-lg mb-8 max-w-lg mx-auto">
            All packages include workbooks, progress cards, and parent updates.
            Pick your board to see the right pricing.
          </p>

          {/* ── Level 1: Board type toggle ── */}
          <div className="inline-flex bg-gray-100 dark:bg-board/30 rounded-2xl p-1.5 gap-1 mb-5">
            {(["icse-cbse", "state-board"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setBoardTab(tab); setPeriod("monthly"); }}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  boardTab === tab
                    ? "text-chalk"
                    : "text-gray-500 dark:text-chalk/50 hover:text-gray-700 dark:hover:text-chalk"
                }`}
              >
                {boardTab === tab && (
                  <motion.div
                    layoutId="board-pill"
                    className="absolute inset-0 rounded-xl bg-board shadow-md"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative z-10">
                  {tab === "icse-cbse" ? "ICSE / CBSE" : "State Board"}
                </span>
              </button>
            ))}
          </div>

          {/* ── Level 2: Monthly / Annual (ICSE/CBSE only) ── */}
          <AnimatePresence>
            {!isStatBoard && (
              <motion.div
                key="period-toggle"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center"
              >
                <div className="inline-flex bg-gray-100 dark:bg-board/30 rounded-xl p-1 gap-1">
                  {(["monthly", "annual"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`relative px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                        period === p
                          ? "bg-white dark:bg-board/60 text-board dark:text-chalk shadow-sm"
                          : "text-gray-400 dark:text-chalk/50 hover:text-gray-600 dark:hover:text-chalk"
                      }`}
                    >
                      {p === "annual" ? (
                        <span className="flex items-center gap-1.5">
                          Annual
                          <span className="text-chalk-yellow text-[11px] font-bold">Save ₹6k</span>
                        </span>
                      ) : "Monthly"}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* State board note */}
          <AnimatePresence>
            {isStatBoard && (
              <motion.p
                key="sb-note"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-gray-400 dark:text-chalk/40 mt-1"
              >
                Karnataka State Board (KSEEB) · Monthly billing
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ── Cards grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${boardTab}-${period}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {cards.map((card, i) => (
                <PriceCard
                  key={`${card.name}-${boardTab}-${period}`}
                  card={card}
                  i={i}
                  inView={inView}
                  suffix={priceSuffix}
                  waMsg={buildWaMsg(card)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
