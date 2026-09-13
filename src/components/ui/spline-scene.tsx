"use client";

import { Suspense, lazy, useState } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

function Loader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-chalk-yellow/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-chalk-yellow animate-spin" />
        </div>
        <span className="text-chalk/40 text-xs font-sans tracking-wider uppercase">
          Loading...
        </span>
      </div>
    </div>
  );
}

/**
 * Shown when the scene can't be fetched — a blocked network, an offline
 * visitor, or a Spline outage. Reads as a deliberate chalkboard panel rather
 * than a hole in the page, because the surrounding hero keeps its own chips.
 */
function SceneFallback() {
  return (
    <div
      className="w-full h-full"
      aria-hidden
      style={{
        backgroundColor: "#1e3a2f",
        backgroundImage:
          "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(244,196,48,0.16) 0%, transparent 70%), repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.035) 27px, rgba(255,255,255,0.035) 28px)",
      }}
    />
  );
}

/** A slow pulsing ring with "tap here" under it — an invitation, not a label. */
function TapHint() {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <span className="relative flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-chalk/15" style={{ animationDuration: "2.6s" }} />
        <span className="h-2 w-2 rounded-full bg-chalk/50" />
      </span>
      <span className="font-sans text-[9px] uppercase tracking-[0.16em] text-chalk/35">tap here</span>
    </span>
  );
}

/**
 * The 3D hero scene is third-party and network-dependent, so it is fenced off:
 * a failure here used to throw during render and blank the whole page.
 *
 * The "drag it" hint lives in here rather than in the hero because it must only
 * appear once the scene has actually loaded — inviting someone to drag a blank
 * panel is worse than saying nothing. It fades out on first interaction.
 */
export function SplineScene({ scene, className }: SplineSceneProps) {
  const [loaded, setLoaded] = useState(false);
  const [touched, setTouched] = useState(false);

  return (
    <ErrorBoundary label="SplineScene" fallback={<SceneFallback />}>
      <div className="relative h-full w-full" onPointerDown={() => setTouched(true)}>
        <Suspense fallback={<Loader />}>
          <Spline scene={scene} className={className} onLoad={() => setLoaded(true)} />
        </Suspense>

        {/* Two quiet prompts either side of the model, where a thumb already
            rests, plus the drag hint underneath. All three disappear the moment
            anyone touches the scene, so they nudge once and never nag. */}
        {loaded && !touched && (
          <>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 sm:left-6" aria-hidden>
              <TapHint />
            </span>
            <span className="pointer-events-none absolute right-3 top-[58%] -translate-y-1/2 sm:right-6" aria-hidden>
              <TapHint />
            </span>
            <span
              className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-chalk/10 bg-board-deep/70 px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.18em] text-chalk/40 backdrop-blur-sm"
              aria-hidden
            >
              Drag to explore
            </span>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
