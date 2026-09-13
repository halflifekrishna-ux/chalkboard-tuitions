"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

/**
 * TransformBoring — the section that argues by doing.
 *
 * It opens with a real piece of traditional training: a flat definition of
 * communication on slide 14 of 62. Then it takes that exact subject apart and
 * rebuilds it as five stages the visitor has to work through — scenario,
 * decision, feedback, practice, reflection.
 *
 * Each stage deliberately uses a different learning mechanic (reveal, branching
 * choice, consequence, error-spotting, self-assessment) and says so in small
 * type, because a buyer of courses is shopping for exactly that vocabulary and
 * most vendors only ever describe it.
 *
 * Everything is local state. No network, no new dependency.
 */

const BORING = `Communication is the process of exchanging information, ideas, thoughts, feelings and emotions between two or more people through speech, writing, signals or behaviour. Effective communication requires a sender, a message, a channel, a receiver and feedback.`;

const DECISIONS = [
  {
    label: "“Let’s check the thread.”",
    verdict:
      "You reached for the evidence. She hears prove it, and the room watches her get audited. You won the file and lost her.",
  },
  {
    label: "“Fair — let’s fix the handover, not the blame.”",
    best: true,
    verdict:
      "You moved the argument off her and onto the process. She can agree with that without losing the room — which is the only way she agrees at all.",
  },
  {
    label: "Say nothing. Move the meeting on.",
    verdict:
      "The meeting survives. The handover doesn’t. A third miss is now scheduled, and you’ve taught the room that this is fine.",
  },
];

/* The practice stage: one chunk of a reasonable-sounding line is doing the
   damage. Tapping the wrong chunk has to teach something too, so each carries
   its own note. */
const LINE = [
  { text: "I hear you", note: "That part is fine — it buys you the half second you need." },
  { text: "— you clearly didn’t read it —", bad: true, note: "" },
  { text: "so let’s agree where the handover lives.", note: "That part is fine — it points at the fix, not the person." },
];

const STAGES = ["Scenario", "Decision", "Feedback", "Practice", "Reflection"] as const;
const MECHANICS = ["Reveal", "Branching choice", "Consequence", "Error spotting", "Self-assessment"] as const;

const CONFIDENCE = [
  "Not a chance.",
  "Probably fumbled it.",
  "Some days.",
  "Most days.",
  "Every time.",
];

function StageShell({
  i,
  open,
  done,
  onToggle,
  children,
}: {
  i: number;
  open: boolean;
  done: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <li className="overflow-hidden rounded-2xl border border-chalk/10 bg-chalk/[0.03]">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3.5 px-4 py-4 text-left sm:px-5"
      >
        <span
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors"
          style={{
            background: done ? "#f4c430" : "rgba(245,240,232,0.08)",
            color: done ? "#1a1a2e" : "rgba(245,240,232,0.5)",
          }}
        >
          {done ? <Check size={14} strokeWidth={3} /> : i + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-chalk sm:text-base">{STAGES[i]}</span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-chalk/50">
            Mechanic · {MECHANICS[i]}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-lg leading-none text-chalk/55"
          aria-hidden
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-chalk/8 px-4 py-5 sm:px-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function TransformBoring() {
  const [transformed, setTransformed] = useState(false);
  const [open, setOpen] = useState(0);

  const [revealed, setRevealed] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  const [seenFeedback, setSeenFeedback] = useState(false);
  const [tapped, setTapped] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(2);
  const [reflected, setReflected] = useState(false);

  const done = [revealed, pick !== null, seenFeedback, tapped !== null && !!LINE[tapped].bad, reflected];
  const finished = done.filter(Boolean).length;

  const go = (i: number) => {
    if (i === 2 && pick !== null) setSeenFeedback(true);
    setOpen((cur) => (cur === i ? -1 : i));
  };

  return (
    <section id="transform" className="relative scroll-mt-20 overflow-hidden bg-board-deep py-20 text-chalk sm:py-28">
      <div aria-hidden className="grid-dots pointer-events-none" />

      <div className="relative mx-auto max-w-2xl px-5 sm:px-6">
        <div className="text-center">
          <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-chalk-yellow sm:text-[13px]">
            What we actually do
          </span>
          <h2 className="mx-auto mt-5 text-balance font-playfair text-[clamp(1.9rem,5.5vw,3.25rem)] font-bold leading-[1.1] tracking-tight">
            Turn boring content into learning.
          </h2>
        </div>

        <AnimatePresence mode="wait">
          {!transformed ? (
            <motion.div
              key="before"
              exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
              transition={{ duration: 0.4, ease: [0.4, 0, 1, 1] }}
              className="mt-12"
            >
              <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk/55">
                Traditional training
              </p>

              {/* Deliberately dull: a slide nobody finished. */}
              <div className="rounded-xl bg-[#f4f2ed] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-8">
                <div className="flex items-baseline justify-between gap-4 border-b border-black/10 pb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Module 1 · Communication Skills
                  </span>
                  <span className="text-[11px] text-gray-400">Slide 14 / 62</span>
                </div>
                <p className="mt-5 font-playfair text-[15px] leading-[1.75] text-gray-700 sm:text-base">{BORING}</p>
                <div className="mt-7 flex items-center justify-between gap-4 border-t border-black/10 pt-4">
                  <span className="text-[11px] text-gray-400">0% complete · 45 min remaining</span>
                  <span className="rounded bg-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-400">
                    Next ›
                  </span>
                </div>
              </div>

              <p className="mt-5 text-center text-sm text-chalk/60">
                Every word of that is true. Nobody has ever been better at their job for reading it.
              </p>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setTransformed(true)}
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)] px-7 py-4 text-[15px] font-bold text-chalk-dark shadow-lg shadow-chalk-yellow/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles size={17} />
                  Now watch us transform it
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="after"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12"
            >
              <p className="text-center text-[15px] leading-relaxed text-chalk/60">
                Same subject. Same forty seconds. Now you have to do something with it.
              </p>

              {/* progress across the five stages */}
              <div className="mt-6 flex items-center justify-center gap-1.5" aria-hidden>
                {STAGES.map((s, i) => (
                  <span
                    key={s}
                    className="h-1 w-10 rounded-full transition-colors duration-500"
                    style={{ background: done[i] ? "#f4c430" : "rgba(245,240,232,0.12)" }}
                  />
                ))}
              </div>

              <ol className="mt-7 space-y-2.5">
                {/* 1 — Scenario: progressive reveal */}
                <StageShell i={0} open={open === 0} done={done[0]} onToggle={() => go(0)}>
                  <p className="text-[15px] leading-relaxed text-chalk/85">
                    Your teammate has missed the same handover twice. In front of the room, she says:{" "}
                    <span className="text-chalk-yellow">&ldquo;I did send it. Someone just didn&rsquo;t read it.&rdquo;</span>
                  </p>
                  {!revealed ? (
                    <button
                      onClick={() => {
                        setRevealed(true);
                        setOpen(1);
                      }}
                      className="mt-4 w-full rounded-xl border border-dashed border-chalk-yellow/40 py-3 text-sm font-semibold text-chalk-yellow/90 transition-colors hover:bg-chalk-yellow/[0.06]"
                    >
                      Tap to hear what&rsquo;s underneath it
                    </button>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-xl border border-chalk/10 bg-chalk/[0.04] p-4 text-sm leading-relaxed text-chalk/75"
                    >
                      She isn&rsquo;t arguing about a file. She&rsquo;s protecting her standing in a room full of
                      people. Answer the file and you&rsquo;ll lose the person.
                    </motion.p>
                  )}
                </StageShell>

                {/* 2 — Decision: branching choice */}
                <StageShell i={1} open={open === 1} done={done[1]} onToggle={() => go(1)}>
                  <p className="text-[15px] text-chalk/85">You have about five seconds. What do you say?</p>
                  <div className="mt-4 space-y-2.5">
                    {DECISIONS.map((d, i) => {
                      const chosen = pick === i;
                      return (
                        <button
                          key={d.label}
                          onClick={() => {
                            if (pick === null) {
                              setPick(i);
                              setSeenFeedback(true);
                              setOpen(2);
                            }
                          }}
                          disabled={pick !== null}
                          className="w-full rounded-xl border px-4 py-3 text-left text-sm leading-snug transition-all disabled:cursor-default"
                          style={{
                            borderColor: chosen ? "rgba(244,196,48,0.6)" : "rgba(245,240,232,0.12)",
                            background: chosen ? "rgba(244,196,48,0.1)" : "rgba(245,240,232,0.03)",
                            color: pick !== null && !chosen ? "rgba(245,240,232,0.32)" : "#f5f0e8",
                          }}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </StageShell>

                {/* 3 — Feedback: the consequence of their own choice */}
                <StageShell i={2} open={open === 2} done={done[2]} onToggle={() => go(2)}>
                  {pick === null ? (
                    <p className="text-sm text-chalk/60">Make the call above first — this stage answers it.</p>
                  ) : (
                    <>
                      <p className="text-[15px] leading-relaxed text-chalk/85">{DECISIONS[pick].verdict}</p>
                      {!DECISIONS[pick].best && (
                        <p className="mt-3 rounded-xl border border-chalk/10 bg-chalk/[0.04] p-4 text-sm leading-relaxed text-chalk/60">
                          The line that works moves the argument off her and onto the process:{" "}
                          <span className="text-chalk/85">&ldquo;Fair — let&rsquo;s fix the handover, not the blame.&rdquo;</span>
                        </p>
                      )}
                      <p className="mt-4 border-t border-chalk/10 pt-4 text-sm leading-relaxed text-chalk/50">
                        The definition on that slide was correct. It just never told you what to say at five past
                        eleven on a Tuesday.
                      </p>
                      <button
                        onClick={() => setOpen(3)}
                        className="mt-4 text-sm font-semibold text-chalk-yellow/90 hover:text-chalk-yellow"
                      >
                        Now try it yourself →
                      </button>
                    </>
                  )}
                </StageShell>

                {/* 4 — Practice: find the phrase doing the damage */}
                <StageShell i={3} open={open === 3} done={done[3]} onToggle={() => go(3)}>
                  <p className="text-[15px] text-chalk/85">
                    Here&rsquo;s a reasonable-sounding reply. One part of it undoes the rest. Tap it.
                  </p>
                  <p className="mt-4 flex flex-wrap gap-x-1.5 gap-y-2 text-[15px] leading-relaxed">
                    {LINE.map((chunk, i) => {
                      const isTapped = tapped === i;
                      return (
                        <button
                          key={chunk.text}
                          onClick={() => setTapped(i)}
                          className="rounded px-1.5 py-0.5 transition-colors"
                          style={{
                            background: isTapped
                              ? chunk.bad
                                ? "rgba(244,196,48,0.18)"
                                : "rgba(245,240,232,0.07)"
                              : "transparent",
                            color: isTapped && chunk.bad ? "#f4c430" : "rgba(245,240,232,0.85)",
                            boxShadow: isTapped ? "inset 0 -1px 0 rgba(244,196,48,0.5)" : "none",
                          }}
                        >
                          {chunk.text}
                        </button>
                      );
                    })}
                  </p>
                  <AnimatePresence mode="wait">
                    {tapped !== null && (
                      <motion.div
                        key={tapped}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4"
                      >
                        {LINE[tapped].bad ? (
                          <>
                            <p className="rounded-xl border border-chalk-yellow/25 bg-chalk-yellow/[0.07] p-4 text-sm leading-relaxed text-chalk/80">
                              That&rsquo;s the one. Everything before it was repair work; that clause hands the blame
                              straight back and starts the argument again.
                            </p>
                            <button
                              onClick={() => setOpen(4)}
                              className="mt-4 text-sm font-semibold text-chalk-yellow/90 hover:text-chalk-yellow"
                            >
                              Last stage →
                            </button>
                          </>
                        ) : (
                          <p className="rounded-xl border border-chalk/10 bg-chalk/[0.04] p-4 text-sm leading-relaxed text-chalk/65">
                            {LINE[tapped].note} Keep looking.
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </StageShell>

                {/* 5 — Reflection: self-assessment, the stage most courses skip */}
                <StageShell i={4} open={open === 4} done={done[4]} onToggle={() => go(4)}>
                  <label htmlFor="tb-confidence" className="block text-[15px] text-chalk/85">
                    Honestly — on the day, in the room, would you have said the right thing?
                  </label>
                  <input
                    id="tb-confidence"
                    type="range"
                    min={0}
                    max={4}
                    step={1}
                    value={confidence}
                    onChange={(e) => {
                      setConfidence(Number(e.target.value));
                      setReflected(true);
                    }}
                    className="mt-5 w-full accent-chalk-yellow"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-chalk/60">
                    <span>Not a chance</span>
                    <span>Every time</span>
                  </div>
                  <p className="mt-4 text-[15px] text-chalk-yellow">{CONFIDENCE[confidence]}</p>
                  <p className="mt-2 text-sm leading-relaxed text-chalk/55">
                    {confidence >= 3
                      ? "Then the training isn't for you — it's for the four people on your team who wouldn't. Same gap, measured one person at a time."
                      : "That gap — between knowing the right answer and producing it under pressure — is the only thing worth training. A slide can't close it. Reps can."}
                  </p>
                </StageShell>
              </ol>

              <AnimatePresence>
                {finished === 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 rounded-2xl border border-chalk-yellow/25 bg-chalk-yellow/[0.06] p-5 sm:p-6"
                  >
                    <p className="text-[15px] leading-relaxed text-chalk/85">
                      You just used five different mechanics — a reveal, a branching choice, a consequence, an
                      error hunt and a self-assessment. Most courses use one, and it&rsquo;s usually a quiz at the
                      end.
                    </p>
                    <a
                      href="#enquire"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)] px-6 py-3 text-sm font-bold text-chalk-dark"
                    >
                      Do this to our material
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
