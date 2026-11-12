"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The sample lessons, playable inside the page. The lessons are one static
 * file (public/learning-studio/sample-lessons.html) shown in a same-origin
 * frame, so their styles and script stay separate from the site's.
 *
 * The frame is lazy-loaded by the browser, so the lessons cost nothing on
 * first paint. In `?embed=1` mode the lessons page
 * posts its height after every screen change and this component resizes the
 * frame to fit: no inner scrollbar. An outreach `?ref=` on the page URL is
 * passed through so lesson activity is tied to that link.
 */
const SRC = "/learning-studio/sample-lessons.html?embed=1";
const REF_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;

export function LessonPlayer({ fallbackHref }: { fallbackHref: string }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [height, setHeight] = useState(620);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    setSrc(ref && REF_RE.test(ref) ? `${SRC}&ref=${ref}` : SRC);
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      const d = e.data as { cbLessonHeight?: unknown; cbLessonStep?: unknown } | null;
      if (!d || typeof d !== "object") return;
      if (typeof d.cbLessonHeight === "number") setHeight(Math.min(2400, Math.max(480, Math.ceil(d.cbLessonHeight))));
      // A new screen can be much shorter than the last one: bring its top back into view.
      if (d.cbLessonStep && box.current && box.current.getBoundingClientRect().top < 0) {
        box.current.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div
      ref={box}
      className="scroll-mt-24 overflow-hidden rounded-[28px] border border-chalk/20 bg-[#0F1914] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]"
      style={{ height, transition: "height 0.45s cubic-bezier(0.22,1,0.36,1)" }}
    >
      {src ? (
        <iframe ref={frame} src={src} loading="lazy" title="Sample lessons: play them here" className="block h-full w-full border-0" />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-chalk/60">Loading the lessons</div>
      )}
      <noscript>
        <a href={fallbackHref} className="block p-6 text-chalk underline">
          Open the sample lessons
        </a>
      </noscript>
    </div>
  );
}
