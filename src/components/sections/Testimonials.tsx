"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";

const testimonials = [
  {
    id: 1,
    name: "Priya Krishnamurthy",
    role: "Parent — Grade 9 CBSE",
    quote:
      "My daughter's marks went from 58% to 84% in one term. The small batch makes all the difference — her teacher actually knows her name and her weaknesses.",
    stars: 5,
    highlight: "58% → 84%",
  },
  {
    id: 2,
    name: "Rajan Sharma",
    role: "Parent — Grade 10 ICSE",
    quote:
      "My son was terrified of Maths before joining Chalkboard. Three months in and he's scoring consistently above 90. The daily classes and workbooks are unlike anything we've tried.",
    stars: 5,
    highlight: "90+ in Maths",
  },
  {
    id: 3,
    name: "Anitha Reddy",
    role: "Parent — Grade 6 State Board",
    quote:
      "The WhatsApp updates are genuinely useful — I know exactly what they covered, what homework was given, and when the next test is. It feels like a real partnership.",
    stars: 5,
    highlight: "Always in the loop",
  },
  {
    id: 4,
    name: "Deepak Nair",
    role: "Parent — Grade 8 CBSE",
    quote:
      "We switched from a big coaching centre where my son was just a face in the crowd. Here the teacher calls him out by name mid-class and pushes him. That attention is priceless.",
    stars: 5,
    highlight: "Real attention",
  },
  {
    id: 5,
    name: "Suma Venkatesh",
    role: "Parent — Grade 4 KSEEB",
    quote:
      "The branded workbooks alone are worth it — structured, clean, and the teacher follows them in class so my daughter's notes actually match what's taught. No chaos.",
    stars: 5,
    highlight: "Structured learning",
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="testimonials" className="py-24 chalk-bg relative overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(244,196,48,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(232,120,77,0.06) 0%, transparent 50%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-[0.15em] uppercase text-chalk-yellow bg-chalk-yellow/10 px-3 py-1 rounded-full mb-4">
            Parent Stories
          </span>
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-chalk mb-4">
            Results that speak for themselves.
          </h2>
          <p className="text-chalk/60 text-lg max-w-xl mx-auto">
            Don&apos;t take our word for it. Here&apos;s what Kammanahalli &amp; Kalyan Nagar
            parents are saying.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid lg:grid-cols-2 gap-14 items-center"
        >
          {/* Left: summary stats */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-5">
              {[
                { value: "5★", label: "Average rating from parents", sub: "Based on parent feedback" },
                { value: "8", label: "Max students per batch", sub: "No child left behind" },
                { value: "3 boards", label: "CBSE · ICSE · State Board", sub: "Every syllabus covered" },
                { value: "5×/week", label: "Daily structured classes", sub: "Compound learning wins" },
              ].map(({ value, label, sub }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-chalk/10 p-5"
                  style={{ background: "rgba(30,58,47,0.6)" }}
                >
                  <p className="font-playfair text-2xl font-black text-chalk-yellow mb-1">{value}</p>
                  <p className="text-chalk text-xs font-semibold mb-0.5">{label}</p>
                  <p className="text-chalk/40 text-[11px]">{sub}</p>
                </div>
              ))}
            </div>

            <p className="text-chalk/40 text-sm">
              ⭐ Results are real. We&apos;ll never fabricate a testimonial — we earn them.
            </p>
          </div>

          {/* Right: stagger carousel */}
          <StaggerTestimonials testimonials={testimonials} />
        </motion.div>
      </div>
    </section>
  );
}
