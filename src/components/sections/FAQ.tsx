"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What grades and boards do you cover?",
    a: "We cover Grades 1 through 10 across all three major boards — CBSE, ICSE, and Karnataka State Board (KSEEB). Every lesson is mapped to your child's specific board syllabus and exam pattern.",
  },
  {
    q: "Why only 8 students per batch?",
    a: "We believe individual attention is non-negotiable. With 8 students, every teacher knows every child's name, weaknesses, and learning style. Every doubt gets addressed before the class ends. It's the opposite of a crowded tuition room.",
  },
  {
    q: "How does the free demo class work?",
    a: "Book a slot via WhatsApp or our contact form. We'll schedule a full demo class (not a watered-down intro) where your child participates alongside the batch. You see the quality, methodology, and environment before paying anything.",
  },
  {
    q: "What subjects do you teach?",
    a: "For Grades 1–5: Maths, English, Environmental Studies, Hindi/Kannada. For Grades 6–10: Maths, Science (Physics, Chemistry, Biology), Social Studies, English, Hindi, and Kannada. We tailor the subject mix to your child's board and needs.",
  },
  {
    q: "What are the class timings?",
    a: "We run weekday batches from 4 PM to 8 PM. WhatsApp us to check current slot availability for your preferred grade.",
  },
  {
    q: "Are the workbooks included in the fee?",
    a: "Yes — branded Chalkboard Tuitions workbooks are included in all packages. These are curated workbooks with exercises, solved examples, and board-pattern questions. No extra charges for materials.",
  },
  {
    q: "How do you communicate with parents?",
    a: "Three ways: weekly WhatsApp updates covering topics taught and homework assigned; monthly printed progress cards after formal tests; and a direct WhatsApp line to reach us anytime with questions.",
  },
  {
    q: "Is there a registration or admission fee?",
    a: "There is a seasonal admission fee that varies by board and grade. We do run offers where the registration fee is fully waived — WhatsApp us to check current promotions before enrolling.",
  },
  {
    q: "Can I switch from monthly to an annual plan?",
    a: "Yes. Many parents start monthly and switch to annual in Month 2 or 3. The annual fee is prorated — we'll work out a fair transition. Annual packages save you up to ₹6,000 compared to 12 months of monthly billing.",
  },
];

function FAQItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 dark:border-chalk/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-5 flex items-start justify-between gap-4 group"
      >
        <span
          className={`font-sans font-semibold text-sm sm:text-base transition-colors duration-150 ${
            open
              ? "text-board dark:text-chalk-yellow"
              : "text-chalk-dark dark:text-chalk group-hover:text-board dark:group-hover:text-chalk-yellow"
          }`}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-0.5"
        >
          <ChevronDown
            size={18}
            className={open ? "text-board dark:text-chalk-yellow" : "text-gray-400"}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-gray-600 dark:text-chalk/60 pr-8">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" className="py-24 bg-white dark:bg-board/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="section-label">FAQ</span>
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-board dark:text-chalk mb-4">
            Questions parents ask us most.
          </h2>
          <p className="text-gray-500 dark:text-chalk/60 text-lg">
            Everything you need to know before booking your demo.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="bg-gray-50/80 dark:bg-board/20 rounded-2xl border border-gray-100 dark:border-chalk/10 px-6 sm:px-8"
        >
          {faqs.map((item, i) => (
            <FAQItem key={i} {...item} i={i} />
          ))}
        </motion.div>

        <p className="text-center text-sm text-gray-500 dark:text-chalk/50 mt-8">
          Have a question not listed here?{" "}
          <a
            href={`https://wa.me/917411446381?text=Hi! I have a question about Chalkboard Tuitions.`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-board dark:text-chalk-yellow font-semibold hover:underline"
          >
            Ask us on WhatsApp →
          </a>
        </p>
      </div>
    </section>
  );
}
