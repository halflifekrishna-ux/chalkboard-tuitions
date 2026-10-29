"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * Loads the prompt lesson (and framer-motion with it) only when the visitor
 * scrolls near it. The lesson is the heaviest thing on the AI training page,
 * and it sits below the fold, so a phone shouldn't pay for it on first paint.
 *
 * It starts loading 600px before it scrolls into view, so the swap from the
 * placeholder happens off-screen and nothing the visitor is reading moves.
 */
const PromptLessonCard = dynamic(() => import("./PromptLesson").then((m) => m.PromptLessonCard), {
  ssr: false,
  loading: () => <Placeholder />,
});

function Placeholder() {
  return <div aria-hidden className="min-h-[380px] rounded-2xl border border-chalk/15 bg-white/[0.03]" />;
}

export function PromptLessonLazy({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {near ? <PromptLessonCard className="ring-1 ring-chalk-yellow/20" /> : <Placeholder />}
    </div>
  );
}
