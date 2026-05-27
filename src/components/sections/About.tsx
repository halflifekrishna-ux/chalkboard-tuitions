"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Target, Heart, TrendingUp } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Intentionally Small",
    description: "We cap every batch at 8 students by design. Quality over volume — always.",
  },
  {
    icon: Heart,
    title: "Every Child Matters",
    description: "We track every student individually. No child is \"the quiet one at the back.\"",
  },
  {
    icon: TrendingUp,
    title: "Measurable Progress",
    description: "Monthly tests for all students. Printed report cards for Grades 8–10, and parent calls — you always know exactly where your child stands.",
  },
];

export function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" className="py-24 bg-cream dark:bg-chalk-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Story */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="section-label">Our Story</span>
            <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-board dark:text-chalk mb-6">
              Built by educators who{" "}
              <span className="text-chalk-orange">saw the problem</span> first-hand.
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-chalk/60 text-base leading-relaxed">
              <p>
                Every year, thousands of Bangalore students attend tuition centres
                that pack 25–30 children into a room and call it education. Doubts
                go unasked. Concepts remain unclear. Marks don&apos;t improve.
              </p>
              <p>
                Chalkboard Tuitions was founded to fix that — one small batch at a
                time. We believe that when a teacher actually knows their students by
                name, strength, and weakness, learning becomes transformational.
              </p>
              <p>
                Located in the heart of Kammanahalli and Kalyan Nagar, we serve
                Grades 1–10 across CBSE, ICSE, and Karnataka State Board. Our
                structured daily classes, branded workbooks, and rigorous parent
                communication set a new standard for what a neighbourhood tuition
                centre can be.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-6 text-sm text-gray-500 dark:text-chalk/50">
              <MapPin size={15} className="text-chalk-orange" />
              <span>Kammanahalli & Kalyan Nagar, Bangalore · Est. 2026</span>
            </div>
          </motion.div>

          {/* Right: Values */}
          <div className="space-y-5">
            {values.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: 24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: "easeOut" }}
                className="flex gap-5 p-5 bg-white dark:bg-board/30 rounded-2xl border border-gray-100 dark:border-chalk/10 shadow-sm"
              >
                <div className="w-12 h-12 bg-board/10 dark:bg-board/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-board dark:text-chalk-yellow" />
                </div>
                <div>
                  <h3 className="font-playfair text-lg font-bold text-chalk-dark dark:text-chalk mb-1">
                    {title}
                  </h3>
                  <p className="text-gray-600 dark:text-chalk/60 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Quote card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="chalk-bg rounded-2xl p-6"
            >
              <p className="font-special-elite text-chalk text-base leading-relaxed mb-3">
                &ldquo;Small batches. Real progress. Every child seen.&rdquo;
              </p>
              <p className="text-chalk-yellow text-xs font-semibold tracking-widest uppercase font-sans">
                — Chalkboard Tuitions Motto
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
