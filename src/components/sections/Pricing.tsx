"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

const WHATSAPP = "917411446381";

type BoardTab = "icse-cbse" | "state-board";

interface PackData {
  name: string;
  grade: string;
  duration: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
}

/* ── Data ───────────────────────────────────────────────────────────────────── */
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

/* ── Glass Pack Card ────────────────────────────────────────────────────────── */
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
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col rounded-2xl transition-all duration-300 hover:-translate-y-2"
      style={{
        background: card.highlight
          ? "rgba(28, 55, 40, 0.92)"
          : "rgba(22, 45, 36, 0.55)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: card.highlight
          ? "2px solid rgba(244, 196, 48, 0.75)"
          : "1px solid rgba(201, 162, 39, 0.22)",
        boxShadow: card.highlight
          ? "0 0 0 4px rgba(244,196,48,0.08), 0 0 60px rgba(244,196,48,0.18), 0 12px 48px rgba(0,0,0,0.5)"
          : "0 4px 24px rgba(0,0,0,0.3)",
        padding: card.highlight ? "1.75rem" : "1.5rem",
      }}
    >
      {/* Gold top accent bar on highlighted card */}
      {card.highlight && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, transparent, #f4c430, transparent)" }}
        />
      )}

      {/* Badge */}
      {card.badge && (
        <div
          className="absolute -top-3 left-5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide"
          style={{ background: "#c9a227", color: "#162d24" }}
        >
          {card.badge}
        </div>
      )}

      {/* Package name + grade */}
      <div className="mb-3 mt-1">
        <h3 className="font-playfair text-xl font-bold mb-1" style={{ color: "#f5f0e8" }}>
          {card.name}
        </h3>
        <p className="text-sm font-medium" style={{ color: "rgba(245,240,232,0.55)" }}>
          {card.grade} &nbsp;·&nbsp; {card.duration}
        </p>
      </div>

      {/* Divider */}
      <div
        className="mb-4 h-px w-full"
        style={{ background: "linear-gradient(to right, rgba(201,162,39,0.4), transparent)" }}
      />

      {/* Contact us for pricing */}
      <p className="text-sm font-medium mb-5" style={{ color: "#c9a227", letterSpacing: "0.01em" }}>
        Contact us for pricing
      </p>

      {/* Features */}
      <ul className="space-y-2.5 flex-1 mb-6">
        {card.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <span
              className="flex-shrink-0 leading-none mt-[5px] text-[8px]"
              style={{ color: "#c9a227" }}
            >
              ●
            </span>
            <span className="text-sm leading-relaxed" style={{ color: "#f5f0e8" }}>
              {f}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waMsg)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-3 px-5 rounded-full font-bold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
        style={{
          background: "#c9a227",
          color: "#162d24",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f4c430")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#c9a227")}
      >
        Book Free Demo
        <ArrowRight size={14} />
      </a>
    </motion.div>
  );
}

/* ── Main Pricing Section ───────────────────────────────────────────────────── */
export function Pricing() {
  const [boardTab, setBoardTab] = useState<BoardTab>("icse-cbse");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const isStatBoard = boardTab === "state-board";
  const cards = isStatBoard ? stateBoardPacks : icseCbsePacks;

  const buildWaMsg = (card: PackData) => {
    const boardLabel = isStatBoard ? "State Board" : "ICSE / CBSE";
    return `Hi! I'm interested in the ${card.name} (${card.grade}, ${boardLabel}). Can I book a free demo?`;
  };

  return (
    <section id="pricing">
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(22, 45, 36)"
        gradientBackgroundEnd="rgb(16, 29, 24)"
        firstColor="55, 100, 72"
        secondColor="201, 162, 39"
        thirdColor="80, 140, 100"
        fourthColor="244, 196, 48"
        fifthColor="40, 75, 55"
        pointerColor="244, 196, 48"
        size="90%"
        blendingValue="hard-light"
        interactive={true}
        containerClassName="min-h-0 h-auto w-full"
        className="relative z-10"
      >
        {/* Chalk-line texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(245,240,232,0.025) 27px, rgba(245,240,232,0.025) 28px)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6">

          {/* ── Header ── */}
          <div className="text-center mb-10 sm:mb-14">
            <span
              className="block mb-4 font-semibold uppercase tracking-[4px]"
              style={{ fontSize: "10px", color: "#f4c430" }}
            >
              Our Packages
            </span>

            <h2
              className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
              style={{ color: "#f5f0e8" }}
            >
              Great value.{" "}
              <span style={{ color: "#f4c430" }}>Contact us for fees.</span>
            </h2>

            <p
              className="text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed"
              style={{ color: "rgba(245,240,232,0.55)" }}
            >
              All packages include workbooks, weekly parent updates, and structured daily classes.
              Pick your board to explore the right package.
            </p>

            {/* Board toggle */}
            <div
              className="inline-flex rounded-2xl p-1.5 gap-1"
              style={{
                background: "rgba(22,45,36,0.55)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(201,162,39,0.2)",
              }}
            >
              {(["icse-cbse", "state-board"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBoardTab(tab)}
                  className="relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    color:
                      boardTab === tab ? "#162d24" : "rgba(245,240,232,0.5)",
                  }}
                >
                  {boardTab === tab && (
                    <motion.div
                      layoutId="board-pill-v2"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "#c9a227" }}
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
                  className="text-xs mt-2"
                  style={{ color: "rgba(245,240,232,0.35)" }}
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
              {/* Mobile: single column stacked, tablet: 2-col, desktop: 4-col */}
              <div
                ref={ref}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
              >
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
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-5 sm:mt-6 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              background: "rgba(22,45,36,0.60)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(201,162,39,0.3)",
            }}
          >
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="flex-shrink-0 mt-0.5" style={{ color: "#f4c430" }} />
              <div>
                <p className="font-semibold text-sm mb-0.5" style={{ color: "#f5f0e8" }}>
                  Save more than ₹6,000 on annual plans
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.55)" }}>
                  Annual enrolment locks in your seat for the full academic year and offers
                  significant savings over monthly billing. WhatsApp us to know more.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP}?text=Hi! I'd like to know more about the annual plan pricing at Chalkboard Tuitions.`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold hover:underline whitespace-nowrap flex-shrink-0 transition-colors"
              style={{ color: "#f4c430" }}
            >
              Ask us →
            </a>
          </motion.div>

        </div>
      </BackgroundGradientAnimation>
    </section>
  );
}
