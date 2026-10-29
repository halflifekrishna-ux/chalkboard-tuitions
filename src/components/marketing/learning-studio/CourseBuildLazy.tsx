"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * Shows the static course-build section (passed in as children, rendered on
 * the server) until the visitor scrolls near it, then swaps in the animated
 * CourseBuild. framer-motion and the scroll-scrub code stay off the critical
 * path on a phone, and the words are in the HTML either way.
 *
 * The swap happens 200px before the section reaches the screen, so the change
 * in height lands below what the visitor is reading.
 */
const CourseBuild = dynamic(() => import("./CourseBuild").then((m) => m.CourseBuild), { ssr: false });

export function CourseBuildLazy({ children }: { children: React.ReactNode }) {
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
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{near ? <CourseBuild /> : children}</div>;
}
