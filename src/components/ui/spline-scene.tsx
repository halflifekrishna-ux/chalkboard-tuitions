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

        {loaded && !touched && (
          <span
            className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 animate-pulse rounded-full border border-chalk/10 bg-board-deep/70 px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.18em] text-chalk/45 backdrop-blur-sm"
            aria-hidden
          >
            Drag to explore
          </span>
        )}
      </div>
    </ErrorBoundary>
  );
}
