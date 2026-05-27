"use client";
import { useRef, useState, MouseEvent } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Calendar, BookOpen, BarChart2, MessageSquare, Award, CheckCircle } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";

const features = [
  {
    icon: Users,
    title: "Max 8 Students Per Batch",
    description: "Every child gets individual attention. No one sits at the back with unasked doubts. Small is our superpower.",
    gradient: "from-board/80 to-board-deep/90",
    iconColor: "text-chalk-yellow",
    iconBg: "bg-chalk-yellow/10",
  },
  {
    icon: Calendar,
    title: "5 Days a Week",
    description: "Daily structured classes build consistency. Compound learning beats once-a-week cramming every time.",
    gradient: "from-board/80 to-board-light/50",
    iconColor: "text-chalk-yellow",
    iconBg: "bg-chalk-yellow/10",
  },
  {
    icon: BookOpen,
    title: "CBSE · ICSE · State Board",
    description: "All three major boards covered. Every lesson maps to your board's exam pattern — no guesswork.",
    gradient: "from-board-deep/90 to-board/80",
    iconColor: "text-chalk-orange",
    iconBg: "bg-chalk-orange/10",
  },
  {
    icon: Award,
    title: "Branded Workbooks",
    description: "Custom Chalkboard workbooks with curated exercises and solved examples. No loose photocopies.",
    gradient: "from-board/80 to-board-light/40",
    iconColor: "text-chalk-yellow",
    iconBg: "bg-chalk-yellow/10",
  },
  {
    icon: BarChart2,
    title: "Monthly Progress Cards (Grades 8–10)",
    description: "Formal monthly tests for all students. Printed report cards for Grades 8–10. Parents always know exactly where their child stands.",
    gradient: "from-board-deep/90 to-board/80",
    iconColor: "text-chalk-blue",
    iconBg: "bg-chalk-blue/10",
  },
  {
    icon: MessageSquare,
    title: "Weekly WhatsApp Updates",
    description: "We send weekly summaries to parents — topics covered, homework assigned, upcoming tests. Zero guessing.",
    gradient: "from-board/80 to-board-deep/90",
    iconColor: "text-green-400",
    iconBg: "bg-green-400/10",
  },
];

const differentiators = [
  "No chaotic 30-student rooms",
  "No passive attendance",
  "No skipped doubts",
  "No 'how is my child doing?' anxiety",
];

/* ── 3D tilt card ─────────────────────────────────────────────────────────── */
function TiltCard({
  feature,
  i,
  inView,
}: {
  feature: (typeof features)[0];
  i: number;
  inView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 14;
    const y = -((e.clientY - top) / height - 0.5) * 14;
    setTilt({ x, y });
  };

  return (
    <motion.div
      custom={i}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
        style={{
          transform: hovered
            ? `perspective(600px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.02)`
            : "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)",
          transition: hovered ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
        }}
        className="relative h-full rounded-2xl overflow-hidden border border-chalk/10 group cursor-default"
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(30,58,47,0.92) 0%, rgba(22,45,36,0.98) 100%)",
          }}
        />

        {/* Spotlight inside card */}
        <Spotlight size={200} />

        {/* Glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(244,196,48,0.1) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.iconBg}`}>
            <feature.icon size={22} className={feature.iconColor} />
          </div>

          <h3 className="font-playfair text-lg font-bold text-chalk mb-2">{feature.title}</h3>
          <p className="text-chalk/50 text-sm leading-relaxed">{feature.description}</p>

          {/* Bottom accent line */}
          <div className="mt-5 pt-4 border-t border-chalk/10">
            <div className="h-0.5 w-8 rounded-full bg-chalk-yellow/60 transition-all duration-300 group-hover:w-16 group-hover:bg-chalk-yellow" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-24 bg-cream-bg dark:bg-chalk-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-chalk-yellow bg-board/10 dark:bg-board/30 px-3 py-1 rounded-full mb-4">
            Why Chalkboard
          </span>
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-board dark:text-chalk mb-4">
            Not just another tuition centre.
          </h2>
          <p className="text-gray-600 dark:text-chalk/60 text-lg">
            Most centres pack 25–30 students in a room. Your child sits at the back, doubts go unasked, marks stay flat. We do the opposite.
          </p>
        </div>

        {/* What we're NOT pill strip */}
        <div className="flex flex-wrap gap-2 justify-center mb-14">
          {differentiators.map((d) => (
            <div key={d} className="flex items-center gap-1.5 bg-board/8 dark:bg-board/30 border border-board/15 dark:border-chalk/10 rounded-full px-4 py-2">
              <CheckCircle size={14} className="text-chalk-yellow flex-shrink-0" />
              <span className="text-xs font-medium text-board dark:text-chalk">{d}</span>
            </div>
          ))}
        </div>

        {/* 3D tilt feature grid */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <TiltCard key={feature.title} feature={feature} i={i} inView={inView} />
          ))}
        </div>

        {/* Board promise banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-12 relative overflow-hidden rounded-2xl border border-chalk-yellow/20 p-8 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(30,58,47,0.97) 0%, rgba(22,45,36,1) 100%)",
            backgroundImage: `linear-gradient(135deg, rgba(30,58,47,0.97) 0%, rgba(22,45,36,1) 100%), repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.025) 27px, rgba(255,255,255,0.025) 28px)`,
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-16 opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(ellipse, #f4c430, transparent 70%)" }}
          />
          <div className="relative z-10">
            <p className="font-special-elite text-chalk-yellow tracking-widest text-sm uppercase mb-3 opacity-80">
              Our promise to you
            </p>
            <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-chalk">
              &ldquo;If your child has a doubt, it gets answered before they go home.&rdquo;
            </h3>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
