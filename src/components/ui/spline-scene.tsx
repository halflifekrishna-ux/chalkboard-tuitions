"use client";

import { Suspense, lazy } from "react";
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
 */
export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <ErrorBoundary label="SplineScene" fallback={<SceneFallback />}>
      <Suspense fallback={<Loader />}>
        <Spline scene={scene} className={className} />
      </Suspense>
    </ErrorBoundary>
  );
}
