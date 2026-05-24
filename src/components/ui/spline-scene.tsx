"use client";

import { Suspense, lazy } from "react";

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

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense fallback={<Loader />}>
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
