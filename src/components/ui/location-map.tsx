"use client";

import type React from "react";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

// Kammanahalli & Kalyan Nagar, Bangalore
const MAPS_URL =
  "https://www.google.com/maps/search/Kammanahalli+Bangalore+Karnataka+India";

interface LocationMapProps {
  location?: string;
  sublocation?: string;
  coordinates?: string;
  className?: string;
}

export function LocationMap({
  location = "Kammanahalli & Kalyan Nagar",
  sublocation = "Bangalore, Karnataka",
  coordinates = "13.0275° N, 77.6477° E",
  className,
}: LocationMapProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-50, 50], [6, -6]);
  const rotateY = useTransform(mouseX, [-50, 50], [-6, 6]);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative select-none ${className ?? ""}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-chalk/10"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
          background: "rgba(22,45,36,0.85)",
          backdropFilter: "blur(12px)",
        }}
        animate={{
          width: isExpanded ? 340 : 240,
          height: isExpanded ? 260 : 120,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      >
        {/* ── Expanded map view ── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              {/* Map background */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{ background: "rgba(30,58,47,0.75)" }}
              />

              {/* Animated road grid */}
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                {/* Main roads */}
                {[["0%","35%","100%","35%",4], ["0%","65%","100%","65%",4]].map(([x1,y1,x2,y2,sw], i) => (
                  <motion.line key={`h-main-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="rgba(245,240,232,0.2)" strokeWidth={sw as number}
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }} />
                ))}
                {[["30%","0%","30%","100%",3], ["70%","0%","70%","100%",3]].map(([x1,y1,x2,y2,sw], i) => (
                  <motion.line key={`v-main-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="rgba(245,240,232,0.15)" strokeWidth={sw as number}
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.35 + i * 0.1 }} />
                ))}
                {/* Secondary streets */}
                {[18, 50, 82].map((y, i) => (
                  <motion.line key={`h-sec-${i}`} x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`}
                    stroke="rgba(245,240,232,0.07)" strokeWidth={1.5}
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.55 + i * 0.08 }} />
                ))}
                {[15, 48, 58, 85].map((x, i) => (
                  <motion.line key={`v-sec-${i}`} x1={`${x}%`} y1="0%" x2={`${x}%`} y2="100%"
                    stroke="rgba(245,240,232,0.07)" strokeWidth={1.5}
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.65 + i * 0.08 }} />
                ))}
              </svg>

              {/* Block buildings */}
              {[
                { top:"38%", left:"8%",  w:"14%", h:"20%" },
                { top:"14%", left:"33%", w:"12%", h:"14%" },
                { top:"68%", left:"74%", w:"16%", h:"18%" },
                { top:"18%", right:"8%", w:"10%", h:"24%" },
                { top:"53%", left:"4%",  w:"8%",  h:"12%" },
                { top:"6%",  left:"74%", w:"14%", h:"10%" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-sm border"
                  style={{
                    ...s,
                    background: "rgba(245,240,232,0.12)",
                    borderColor: "rgba(245,240,232,0.08)",
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.45 + i * 0.07 }}
                />
              ))}

              {/* Pin marker — centred */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0, y: -16 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.3 }}
              >
                <svg width="32" height="38" viewBox="0 0 24 30" fill="none"
                  style={{ filter: "drop-shadow(0 0 10px rgba(244,196,48,0.55))" }}>
                  <path d="M12 0C7.58 0 4 3.58 4 8c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8z" fill="#f4c430"/>
                  <circle cx="12" cy="8" r="3" fill="rgba(22,45,36,0.9)"/>
                </svg>
              </motion.div>

              {/* Bottom fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-board-deep/70 via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Grid texture (collapsed only) ── */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          animate={{ opacity: isExpanded ? 0 : 0.04 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="100%" height="100%">
            <defs>
              <pattern id="ct-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f5f0e8" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ct-grid)"/>
          </svg>
        </motion.div>

        {/* ── Card content ── */}
        <div className="relative z-10 flex h-full flex-col justify-between p-5">
          {/* Top row */}
          <div className="flex items-start justify-between">
            {/* Map icon (visible when collapsed) */}
            <motion.div animate={{ opacity: isExpanded ? 0 : 1 }} transition={{ duration: 0.25 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="text-chalk-yellow"
                style={{ filter: isHovered ? "drop-shadow(0 0 6px rgba(244,196,48,0.7))" : "drop-shadow(0 0 3px rgba(244,196,48,0.3))" }}>
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" x2="9" y1="3" y2="18"/>
                <line x1="15" x2="15" y1="6" y2="21"/>
              </svg>
            </motion.div>

            {/* Status pill */}
            <motion.div
              className="flex items-center gap-1.5 rounded-full px-2 py-1"
              style={{ background: "rgba(245,240,232,0.06)" }}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-chalk-yellow animate-pulse" />
              <span className="text-chalk/50 text-[10px] font-semibold tracking-widest uppercase">
                Open
              </span>
            </motion.div>
          </div>

          {/* Bottom text */}
          <div className="space-y-1">
            <motion.h3
              className="text-chalk text-sm font-semibold tracking-tight"
              animate={{ x: isHovered ? 3 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {location}
            </motion.h3>

            <p className="text-chalk/50 text-xs">{sublocation}</p>

            <AnimatePresence>
              {isExpanded && (
                <motion.p
                  className="font-mono text-chalk/40 text-[10px] pt-0.5"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {coordinates}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Gold underline */}
            <motion.div
              className="h-px rounded-full"
              style={{ background: "linear-gradient(to right, rgba(244,196,48,0.6), rgba(244,196,48,0.2), transparent)" }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: isHovered || isExpanded ? 1 : 0.25 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Hint labels */}
      <motion.p
        className="absolute -bottom-6 left-1/2 text-[10px] whitespace-nowrap text-chalk/30"
        style={{ x: "-50%" }}
        animate={{ opacity: isHovered && !isExpanded ? 1 : 0, y: isHovered ? 0 : 4 }}
        transition={{ duration: 0.2 }}
      >
        Click to expand map
      </motion.p>

      {/* Clickable overlay — expand/collapse + open maps */}
      <button
        className="absolute inset-0 w-full h-full rounded-2xl cursor-pointer focus:outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? "Collapse map" : "Expand map"}
      />

      {/* Open in Google Maps — only when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, delay: 0.25 }}
            className="absolute -bottom-8 left-1/2 text-[11px] font-semibold text-chalk-yellow hover:underline whitespace-nowrap z-20"
            style={{ x: "-50%", transform: "translateX(-50%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            Open in Google Maps →
          </motion.a>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
