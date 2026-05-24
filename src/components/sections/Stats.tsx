"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 8, suffix: "", label: "Max students per batch", description: "Every child gets personal attention" },
  { value: 5, suffix: "×", label: "Days a week", description: "Daily structured classes" },
  { value: 3, suffix: "", label: "Boards covered", description: "CBSE · ICSE · State Board" },
  { value: 100, suffix: "%", label: "Free demo class", description: "No obligation to enroll" },
];

function AnimatedNumber({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 1800;
    const raf = requestAnimationFrame(function tick() {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  if (value === 100) return <span>Free</span>;
  return <span>{display}{suffix}</span>;
}

export function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="relative py-20 bg-board overflow-hidden">
      {/* chalk lines texture */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.03) 27px, rgba(255,255,255,0.03) 28px)",
        }}
      />

      {/* Gold glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #f4c430, transparent 70%)" }}
      />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, suffix, label, description }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.6, ease: "easeOut" }}
              className="text-center relative group"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at center, rgba(244,196,48,0.06), transparent 70%)" }} />

              <div className="font-playfair text-5xl font-black text-chalk-yellow mb-2">
                <AnimatedNumber value={value} suffix={suffix} inView={inView} />
              </div>
              <div className="font-semibold text-chalk text-sm mb-1">{label}</div>
              <div className="text-chalk/40 text-xs">{description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
