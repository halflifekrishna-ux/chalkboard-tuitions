"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  stars: number;
  highlight: string;
}

const CARD_OFFSET = 16;
const SCALE_FACTOR = 0.06;

export function StaggerTestimonials({
  testimonials,
  autoplay = true,
  autoplayInterval = 4000,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
  autoplayInterval?: number;
}) {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => setActive((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const startAutoplay = () => {
    if (!autoplay) return;
    intervalRef.current = setInterval(next, autoplayInterval);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, []);

  return (
    <div
      className="relative w-full max-w-md mx-auto"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      {/* Stack of cards */}
      <div className="relative h-[280px] sm:h-[260px]">
        <AnimatePresence>
          {testimonials.map((t, i) => {
            const isActive = i === active;
            const offset = (i - active + testimonials.length) % testimonials.length;
            const displayOffset = offset > testimonials.length / 2 ? offset - testimonials.length : offset;

            if (Math.abs(displayOffset) > 2) return null;

            return (
              <motion.div
                key={t.id}
                className={cn(
                  "absolute inset-0 rounded-2xl border p-6 flex flex-col cursor-pointer select-none",
                  isActive
                    ? "border-chalk-yellow/30 shadow-xl shadow-board/30"
                    : "border-chalk/10"
                )}
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, rgba(30,58,47,0.97) 0%, rgba(22,45,36,1) 100%)"
                    : "rgba(30,58,47,0.7)",
                  transformOrigin: "top center",
                }}
                animate={{
                  top: isActive ? 0 : displayOffset * CARD_OFFSET,
                  scale: isActive ? 1 : 1 - Math.abs(displayOffset) * SCALE_FACTOR,
                  zIndex: isActive ? 10 : 10 - Math.abs(displayOffset),
                  opacity: isActive ? 1 : Math.max(0, 1 - Math.abs(displayOffset) * 0.35),
                }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                onClick={() => !isActive && setActive(i)}
              >
                <Quote size={22} className="text-chalk-yellow/40 mb-3 flex-shrink-0" fill="currentColor" />

                <p className={cn(
                  "text-sm leading-relaxed flex-1 mb-4 italic",
                  isActive ? "text-chalk/85" : "text-chalk/50"
                )}>
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className={cn("font-semibold text-sm", isActive ? "text-chalk" : "text-chalk/60")}>
                      {t.name}
                    </p>
                    <p className={cn("text-xs mt-0.5", isActive ? "text-chalk/50" : "text-chalk/30")}>
                      {t.role}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <div className="flex gap-0.5">
                      {[...Array(t.stars)].map((_, si) => (
                        <Star key={si} size={12} className="text-chalk-yellow fill-chalk-yellow" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-chalk-yellow bg-chalk-yellow/15 border border-chalk-yellow/25 rounded-full px-2 py-0.5">
                      {t.highlight}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-between">
        {/* Dots */}
        <div className="flex gap-1.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === active
                  ? "w-5 h-1.5 bg-chalk-yellow"
                  : "w-1.5 h-1.5 bg-chalk/20 hover:bg-chalk/40"
              )}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div className="flex gap-2">
          <button
            onClick={prev}
            className="w-9 h-9 rounded-xl border border-chalk/15 flex items-center justify-center text-chalk/50 hover:border-chalk-yellow/40 hover:text-chalk-yellow transition-all duration-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            className="w-9 h-9 rounded-xl border border-chalk/15 flex items-center justify-center text-chalk/50 hover:border-chalk-yellow/40 hover:text-chalk-yellow transition-all duration-200"
            aria-label="Next testimonial"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
