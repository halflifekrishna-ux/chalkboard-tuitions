"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Star } from "lucide-react";
import { AcernitySpotlight, Spotlight } from "@/components/ui/spotlight";

// Spline loads client-side only — no SSR
const SplineScene = dynamic(
  () => import("@/components/ui/spline-scene").then((m) => ({ default: m.SplineScene })),
  { ssr: false }
);

const WHATSAPP = "917411446381";

// ── Replace this URL with your own Spline scene ────────────────────────────
// Browse free scenes at: https://app.spline.design/community
// This scene is a stylised interactive 3D robot — great as a "study buddy"
const SPLINE_SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};

const badges = [
  { label: "CBSE · ICSE · State Board", color: "bg-chalk-yellow/15 text-chalk-yellow border-chalk-yellow/30" },
  { label: "Grades 1 – 10", color: "bg-chalk/10 text-chalk/70 border-chalk/20" },
  { label: "Max 8 Students", color: "bg-chalk-orange/15 text-chalk-orange border-chalk-orange/30" },
];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden bg-board-deep flex items-center"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 60% 40%, rgba(201,162,39,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 50% 70% at 10% 80%, rgba(30,58,47,0.6) 0%, transparent 60%),
          repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.025) 27px, rgba(255,255,255,0.025) 28px)
        `,
      }}
    >
      {/* Aceternity SVG spotlight — top-left glow */}
      <AcernitySpotlight
        className="-top-40 -left-20 md:left-60 md:-top-20"
        fill="rgba(201,162,39,0.7)"
      />

      {/* Cursor-tracking spotlight */}
      <Spotlight size={500} />

      {/* Floating orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-[45%] w-64 h-64 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #f4c430, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-12 w-48 h-48 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #e8784d, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-12 w-full grid lg:grid-cols-2 gap-8 items-center min-h-screen">

        {/* ── LEFT: TEXT ─────────────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col justify-center">
          {/* Eyebrow badges */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="flex flex-wrap gap-2 mb-8"
          >
            {badges.map((b) => (
              <span
                key={b.label}
                className={`inline-flex items-center text-[11px] font-semibold tracking-wider uppercase border rounded-full px-3 py-1 ${b.color}`}
              >
                {b.label}
              </span>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.div custom={1} initial="hidden" animate="show" variants={fadeUp}>
            <h1 className="font-playfair text-5xl sm:text-6xl xl:text-7xl font-black text-chalk leading-[1.04] mb-6">
              Small batches.{" "}
              <span
                className="relative inline-block"
                style={{
                  background: "linear-gradient(135deg, #f4c430 0%, #c9a227 50%, #f4c430 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundSize: "200% auto",
                }}
              >
                Real progress.
              </span>
              <br />
              Every child seen.
            </h1>
          </motion.div>

          {/* Sub */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="text-chalk/60 text-lg leading-relaxed mb-4 max-w-lg"
          >
            Daily tuitions for Grades 1–10 in Kammanahalli &amp; Kalyan Nagar.
            We cap every batch at <strong className="text-chalk/90">8 students</strong> so
            no child ever blends into the background.
          </motion.p>

          {/* Social proof micro-line */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="flex items-center gap-2 mb-10"
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-chalk-yellow fill-chalk-yellow" />
              ))}
            </div>
            <span className="text-chalk/50 text-sm">Loved by parents in Kammanahalli</span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="flex flex-wrap gap-3"
          >
            <a
              href={`https://wa.me/${WHATSAPP}?text=Hi! I'd like to book a free demo class at Chalkboard Tuitions.`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-xl font-semibold text-[15px] text-chalk-dark shadow-2xl shadow-chalk-yellow/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-chalk-yellow/50 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #f4c430 0%, #c9a227 100%)",
              }}
            >
              <MessageCircle size={18} />
              Book FREE Demo Class
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </a>

            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border border-chalk/20 text-chalk/80 font-semibold text-[15px] hover:border-chalk-yellow/40 hover:text-chalk transition-all duration-200 backdrop-blur-sm"
            >
              View Packages
            </a>
          </motion.div>

        </div>

        {/* ── RIGHT: SPLINE 3D ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center justify-center h-[320px] sm:h-[380px] lg:h-[600px] mt-6 lg:mt-0"
        >
          {/* Glow behind the 3D scene */}
          <div
            className="absolute inset-0 rounded-3xl opacity-20"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(244,196,48,0.4) 0%, transparent 70%)",
            }}
          />

          {/* Spline scene */}
          <div className="relative w-full h-full rounded-3xl overflow-hidden border border-chalk-yellow/10">
            <SplineScene
              scene={SPLINE_SCENE}
              className="w-full h-full"
            />

            {/* Floating info chip — top-right */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 right-6 backdrop-blur-md border border-chalk-yellow/30 rounded-2xl px-4 py-3 shadow-xl"
              style={{ background: "rgba(30,58,47,0.85)" }}
            >
              <p className="font-playfair font-bold text-chalk-yellow text-sm">Max 8</p>
              <p className="text-chalk/60 text-xs font-sans">students per batch</p>
            </motion.div>

            {/* Floating chip — bottom-left */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-6 left-6 backdrop-blur-md border border-chalk/10 rounded-2xl px-4 py-3 shadow-xl"
              style={{ background: "rgba(22,45,36,0.90)" }}
            >
              <p className="text-xs font-semibold text-chalk/80 font-sans">📍 Kammanahalli</p>
              <p className="text-xs text-chalk/40 font-sans">& Kalyan Nagar, Blr</p>
            </motion.div>
          </div>

          {/* Corner label */}
          <div className="absolute -bottom-6 right-0 text-[10px] font-sans text-chalk/20 tracking-wider uppercase">
            Interactive 3D · drag to explore
          </div>
        </motion.div>
      </div>

      {/* Bottom fade — matches Stats section bg (#1e3a2f) in both light and dark mode */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #1e3a2f)" }}
      />
    </section>
  );
}
