"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, useSpring, useTransform, SpringOptions } from "framer-motion";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────────────────
   Aceternity-style SVG Spotlight  (static, CSS-animated)
   Usage: <AcernitySpotlight className="..." fill="white" />
   ────────────────────────────────────────────────────────────────────────── */
type AcernitySpotlightProps = { className?: string; fill?: string };

export const AcernitySpotlight = ({
  className,
  fill,
}: AcernitySpotlightProps) => (
  <svg
    className={cn(
      "animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0",
      className
    )}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 3787 2842"
    fill="none"
  >
    <g filter="url(#filter0_f_1065_8)">
      <ellipse
        cx="1924.71"
        cy="273.501"
        rx="1924.71"
        ry="273.501"
        transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
        fill={fill || "white"}
        fillOpacity="0.21"
      />
    </g>
    <defs>
      <filter
        id="filter0_f_1065_8"
        x="0.860352"
        y="0.838989"
        width="3785.16"
        height="2840.26"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
      </filter>
    </defs>
  </svg>
);

/* ──────────────────────────────────────────────────────────────────────────
   ibelick-style cursor-tracking Spotlight  (interactive)
   Usage: <Spotlight size={300} />  — place inside a `relative overflow-hidden` parent
   ────────────────────────────────────────────────────────────────────────── */
type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

export function Spotlight({
  className,
  size = 300,
  springOptions = { bounce: 0 },
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (parent) {
        parent.style.position = "relative";
        parent.style.overflow = "hidden";
        setParentElement(parent);
      }
    }
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    },
    [mouseX, mouseY, parentElement]
  );

  useEffect(() => {
    if (!parentElement) return;
    const onEnter = () => setIsHovered(true);
    const onLeave = () => setIsHovered(false);
    parentElement.addEventListener("mousemove", handleMouseMove);
    parentElement.addEventListener("mouseenter", onEnter);
    parentElement.addEventListener("mouseleave", onLeave);
    return () => {
      parentElement.removeEventListener("mousemove", handleMouseMove);
      parentElement.removeEventListener("mouseenter", onEnter);
      parentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [parentElement, handleMouseMove]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute rounded-full blur-2xl transition-opacity duration-500",
        isHovered ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
        background:
          "radial-gradient(circle at center, rgba(244,196,48,0.18) 0%, rgba(30,58,47,0.08) 60%, transparent 80%)",
      }}
    />
  );
}
