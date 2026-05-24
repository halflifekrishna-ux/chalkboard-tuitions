"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const WHATSAPP = "917411446381";
const WA_URL = `https://wa.me/${WHATSAPP}?text=Hi! I'd like to know more about Chalkboard Tuitions.`;

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.126 1.527 5.858L.057 23.629a.75.75 0 0 0 .923.899l5.919-1.55A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.7-.504-5.25-1.385l-.372-.214-3.865 1.013 1.025-3.758-.234-.386A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

export function WhatsAppFab() {
  const [visible, setVisible] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
        >
          {/* Tooltip label */}
          <AnimatePresence>
            {showLabel && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                className="rounded-xl border border-green-500/30 px-4 py-2 text-sm font-semibold text-white shadow-xl whitespace-nowrap"
                style={{
                  background: "linear-gradient(110deg,#128c7e,45%,#25d366,55%,#128c7e)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer2 2s infinite linear",
                }}
              >
                Chat on WhatsApp
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAB button */}
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            onMouseEnter={() => setShowLabel(true)}
            onMouseLeave={() => setShowLabel(false)}
            className={cn(
              "relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl shadow-green-500/40",
              "animate-shimmer2 border border-green-400/40",
              "bg-[linear-gradient(110deg,#128c7e,45%,#25d366,55%,#128c7e)] bg-[length:200%_100%]",
              "hover:scale-110 hover:shadow-green-400/60 active:scale-95 transition-transform duration-200"
            )}
          >
            <WhatsAppIcon size={26} />

            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-green-400/30 pointer-events-none" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
