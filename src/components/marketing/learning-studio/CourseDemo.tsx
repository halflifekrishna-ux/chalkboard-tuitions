"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import { ArrowRight, Check, GripVertical, RotateCcw, X } from "lucide-react";

/**
 * CourseDemo — a playable thirty-second course, not a description of one.
 *
 * A buyer of interactive courses should be made to experience one. So this is
 * a real module: a decision with consequences, a drag-to-order task, and a
 * scored result — the exact three things the section above claims we build.
 * Doubles as a sample of the work, which is why the content is a sales
 * scenario rather than a toy.
 *
 * Everything is local state — no network, no library beyond framer-motion,
 * which is already here. Reorder handles touch dragging on phones, where a
 * hand-rolled drag would fight the page scroll.
 */

type Choice = { label: string; points: number; verdict: string };

const CHOICES: Choice[] = [
  {
    label: "Reply with a discount",
    points: 0,
    verdict: "Discount before diagnosis. You just paid money to learn nothing.",
  },
  {
    label: "Call first thing tomorrow",
    points: 1,
    verdict: "Safe — but you've given them a night to decide without you in the room.",
  },
  {
    label: "Ask what changed",
    points: 2,
    verdict: "Right. You can't fix a reason you don't have yet.",
  },
];

const CORRECT_ORDER = [
  "Ask what changed",
  "Name the gap",
  "Confirm the timeline",
  "Agree one next step",
];

const SHUFFLED = ["Confirm the timeline", "Ask what changed", "Agree one next step", "Name the gap"];

export function CourseDemo({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<Choice | null>(null);
  const [order, setOrder] = useState(SHUFFLED);
  const [orderScore, setOrderScore] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const restart = useCallback(() => {
    setStep(0);
    setPicked(null);
    setOrder(SHUFFLED);
    setOrderScore(null);
  }, []);

  const gradeOrder = () => {
    const right = order.filter((item, i) => item === CORRECT_ORDER[i]).length;
    setOrderScore(right);
    setStep(2);
  };

  const total = (picked?.points ?? 0) + (orderScore ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(7,17,13,0.88)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Interactive course sample"
    >
      <motion.div
        initial={{ y: 40, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-chalk-yellow/20 bg-board-deep sm:rounded-3xl"
      >
        {/* progress + close */}
        <div className="flex items-center justify-between border-b border-chalk/10 px-5 py-3.5">
          <div className="flex items-center gap-1.5" aria-hidden>
            {[0, 1, 2].map((n) => (
              <span
                key={n}
                className="h-1 w-8 rounded-full transition-colors duration-300"
                style={{ background: n <= step ? "#f4c430" : "rgba(245,240,232,0.14)" }}
              />
            ))}
          </div>
          <button onClick={onClose} aria-label="Close sample" className="p-1 text-chalk/45 hover:text-chalk">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-6 sm:px-7">
          <AnimatePresence mode="wait">
            {/* ── 1. a decision with a consequence ── */}
            {step === 0 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <span className="font-special-elite text-[10px] uppercase tracking-[0.22em] text-chalk-yellow/80">
                  Scenario · Account at risk
                </span>
                <p className="mt-3 text-lg leading-snug text-chalk sm:text-xl">
                  Your biggest account emails at 5:58pm:{" "}
                  <span className="text-chalk-yellow">&ldquo;We&rsquo;re reviewing other options.&rdquo;</span>
                </p>
                <p className="mt-2 text-sm text-chalk/50">What do you do?</p>

                <div className="mt-5 space-y-2.5">
                  {CHOICES.map((c) => {
                    const chosen = picked?.label === c.label;
                    return (
                      <button
                        key={c.label}
                        onClick={() => setPicked(c)}
                        disabled={!!picked}
                        className="w-full rounded-xl border px-4 py-3.5 text-left text-[15px] transition-all disabled:cursor-default"
                        style={{
                          borderColor: chosen ? "rgba(244,196,48,0.6)" : "rgba(245,240,232,0.12)",
                          background: chosen ? "rgba(244,196,48,0.1)" : "rgba(245,240,232,0.03)",
                          color: picked && !chosen ? "rgba(245,240,232,0.35)" : "#f5f0e8",
                        }}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {picked && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                      <p className="mt-5 rounded-xl border border-chalk/10 bg-chalk/[0.04] p-4 text-sm leading-relaxed text-chalk/75">
                        {picked.verdict}
                      </p>
                      <button
                        onClick={() => setStep(1)}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)] py-3.5 text-sm font-bold text-chalk-dark"
                      >
                        Keep going <ArrowRight size={15} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── 2. move things around ── */}
            {step === 1 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <span className="font-special-elite text-[10px] uppercase tracking-[0.22em] text-chalk-yellow/80">
                  Task · Run the call
                </span>
                <p className="mt-3 text-lg leading-snug text-chalk sm:text-xl">
                  They agree to talk. Drag these into the order you&rsquo;d run them.
                </p>

                <Reorder.Group axis="y" values={order} onReorder={setOrder} className="mt-5 space-y-2.5">
                  {order.map((item, i) => (
                    <Reorder.Item
                      key={item}
                      value={item}
                      whileDrag={{ scale: 1.03, boxShadow: "0 12px 30px rgba(0,0,0,0.45)" }}
                      className="flex cursor-grab items-center gap-3 rounded-xl border border-chalk/12 bg-chalk/[0.05] px-4 py-3.5 text-[15px] text-chalk active:cursor-grabbing"
                    >
                      <span className="font-special-elite text-xs text-chalk-yellow/70">{i + 1}</span>
                      <span className="flex-1">{item}</span>
                      <GripVertical size={16} className="text-chalk/25" />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                <button
                  onClick={gradeOrder}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)] py-3.5 text-sm font-bold text-chalk-dark"
                >
                  Lock it in <Check size={15} />
                </button>
              </motion.div>
            )}

            {/* ── 3. the bit a client actually buys: what it tells you ── */}
            {step === 2 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <span className="font-special-elite text-[10px] uppercase tracking-[0.22em] text-chalk-yellow/80">
                  Result
                </span>
                <p className="mt-3 font-playfair text-3xl font-bold text-chalk">
                  {total}
                  <span className="text-chalk/30"> / 6</span>
                </p>

                <dl className="mt-5 space-y-2.5 border-t border-chalk/10 pt-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-chalk/50">Decision</dt>
                    <dd className="text-right text-chalk/85">{picked?.label ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-chalk/50">Sequence</dt>
                    <dd className="text-right text-chalk/85">{orderScore} of 4 in place</dd>
                  </div>
                </dl>

                <p className="mt-6 text-[15px] leading-relaxed text-chalk/70">
                  That is the whole idea. A decision, a task, a score — and on the other side, a
                  record of who took it, who struggled and where they gave up.
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-chalk/70">
                  Yours could be a safety drill, an onboarding week, a compliance module or a Grade 9
                  physics chapter. Same build.
                </p>

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <a
                    href="#enquire"
                    onClick={onClose}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)] py-3.5 text-sm font-bold text-chalk-dark"
                  >
                    Build mine
                  </a>
                  <button
                    onClick={restart}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-chalk/15 px-5 py-3.5 text-sm font-semibold text-chalk/70 hover:text-chalk"
                  >
                    <RotateCcw size={14} /> Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
