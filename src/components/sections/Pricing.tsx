"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";

const WHATSAPP = "917411446381";

/* ── Types ─────────────────────────────────────────────────────────────────── */
type BoardTab = "icse-cbse" | "state-board";

interface PackData {
  name: string;
  grade: string;
  duration: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
}

/* ── ICSE / CBSE packages ───────────────────────────────────────────────────── */
const icseCbsePacks: PackData[] = [
  {
    name: "Foundation Pack",
    grade: "Grades 1–4",
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
    duration: "5 days/week · 1.25 hr",
    features: [
      "Daily structured class",
      "Workbook included",
      "Monthly test",
      "Weekly parent updates",
    ],
  },
  {
    name: "Core Pack",
    grade: "Grades 8–9",
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

/* ── State Board packages ────────────────────────────────────────────────────── */
const stateBoardPacks: PackData[] = [
  {
    name: "Foundation Pack",
    grade: "Grades 1–4",
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
    duration: "5 days/week · 1.25 hr",
    features: [
      "Daily structured class",
      "State Board syllabus coverage",
      "Workbook included",
      "Monthly test",
      "Weekly parent updates",
    ],
  },
  {
    name: "Core Pack",
    grade: "Grades 8–9",
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

/* ── Pack Card ──────────────────────────────────────────────────────────────── */
function PackCard({
  card,
  i,
  inView,
  waMsg,
}: {
  card: PackData;
  i: number;
  inView: boolean;
  waMsg: string;
}) {
  return (
    <motion.div
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

      {/* Contact us for pricing */}
      <p
        className={`text-sm font-semibold mb-1 ${
          card.highlight ? "text-chalk-yellow" : "text-board dark:text-chalk-yellow"
        }`}
      >
        Contact us for pricing
      </p>
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
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const isStatBoard = boardTab === "state-board";
  const cards = isStatBoard ? stateBoardPacks : icseCbsePacks;

  const buildWaMsg = (card: PackData) => {
    const boardLabel = isStatBoard ? "State Board" : "ICSE / CBSE";
    return `Hi! I'm interested in the ${card.name} (${card.grade}, ${boardLabel}). Can I book a free demo?`;
  };

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-board/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <span className="section-label">Our Packages</span>
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-board dark:text-chalk mb-4">
            Great value. Contact us for fees.
          </h2>
          <p className="text-gray-500 dark:text-chalk/60 text-lg mb-8 max-w-lg mx-auto">
            All packages include workbooks, weekly parent updates, and structured daily classes.
            Pick your board to explore the right package.
          </p>

          {/* ── Board type toggle ── */}
          <div className="inline-flex bg-gray-100 dark:bg-board/30 rounded-2xl p-1.5 gap-1 mb-5">
            {(["icse-cbse", "state-board"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setBoardTab(tab)}
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
                Karnataka State Board (KSEEB)
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ── Cards grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={boardTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {cards.map((card, i) => (
                <PackCard
                  key={`${card.name}-${boardTab}`}
                  card={card}
                  i={i}
                  inView={inView}
                  waMsg={buildWaMsg(card)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Annual savings callout ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-6 bg-chalk-yellow/10 dark:bg-chalk-yellow/5 border border-chalk-yellow/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-chalk-yellow flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-chalk-dark dark:text-chalk text-sm">
                Save more than ₹6,000 on annual plans
              </p>
              <p className="text-gray-500 dark:text-chalk/60 text-sm">
                Annual enrolment locks in your seat for the full academic year and offers significant savings over monthly billing. WhatsApp us to know more.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP}?text=Hi! I'd like to know more about the annual plan pricing at Chalkboard Tuitions.`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-chalk-yellow text-sm font-semibold hover:underline whitespace-nowrap flex-shrink-0"
          >
            Ask us →
          </a>
        </motion.div>

      </div>
    </section>
  );
}
