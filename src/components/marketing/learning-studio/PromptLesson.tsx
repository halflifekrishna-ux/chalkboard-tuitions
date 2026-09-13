"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, RotateCcw } from "lucide-react";

/**
 * PromptLesson — thirty seconds in which the visitor actually learns something.
 *
 * The argument for interactive learning cannot be made in a paragraph, so this
 * teaches a real, useful skill (writing a usable AI prompt) using three
 * different mechanics in sequence: a short teach, a discrimination task
 * (this one or that one, and why), and a production task where they write
 * something and get scaffolded on what they left out.
 *
 * The scoring in step three is deliberately generous keyword matching — it is a
 * demonstration of progressive feedback, not an assessment engine, and a
 * visitor who writes a genuinely good prompt will hit all four.
 */

type Criterion = {
  key: string;
  ask: string;
  coach: string;
  words: string[];
};

const CRITERIA: Criterion[] = [
  {
    key: "Audience",
    ask: "Who is it for?",
    coach: "“A sales email” to whom? A café owner and a CFO need different sentences.",
    words: [
      "customer", "client", "user", "subscriber", "lead", "prospect", "buyer", "parent",
      "student", "manager", "founder", "owner", "team", "marketer", "shopper", "member",
      "audience", "hr", "cto", "ceo", "startup", "enterprise", "school", "college",
      "café", "cafe", "restaurant", "retailer", "business", "company", "director", "principal",
      "recruiter", "developer", "designer", "teacher", "doctor", "agency", "smb",
    ],
  },
  {
    key: "Context",
    ask: "What does the AI need to know?",
    coach: "Give it the situation — what happened before this email, and what they already know about you.",
    words: [
      "because", "already", "trial", "signed up", "downloaded", "last week", "last month",
      "after", "since", "currently", "churn", "renewal", "visited", "weeks ago", "days ago",
      "abandoned", "bought", "price", "budget", "competitor", "free plan", "webinar", "who ",
      "haven't", "hasn't", "didn't", "never replied", "followed up", "met at", "event", "₹", "rs.",
    ],
  },
  {
    key: "Objective",
    ask: "What should happen next?",
    coach: "Name the one thing you want them to do — reply, book, upgrade, click. One, not four.",
    words: [
      "book", "sign up", "reply", "buy", "purchase", "subscribe", "upgrade", "renew", "click",
      "register", "convert", "get them to", "so that", "goal", "objective", "demo",
      "call", "meeting", "schedule", "respond", "ask them", "cta",
    ],
  },
  {
    key: "Tone",
    ask: "How should it sound?",
    coach: "Say how it should read — warm, blunt, formal, funny — and how long. Otherwise you get corporate mush.",
    words: [
      "tone", "friendly", "warm", "formal", "casual", "professional", "short", "brief",
      "concise", "playful", "direct", "confident", "polite", "punchy", "no jargon", "plain",
      "words", "sentences", "paragraph", "lines", "under", "simple", "human", "blunt", "funny",
    ],
  },
];

const MODEL_ANSWER =
  "Write a short sales email (under 120 words) to a Bengaluru café owner who downloaded our menu-costing template two weeks ago and hasn’t come back. Goal: get them to book a 15-minute demo. Warm, plain English, no jargon, one clear ask at the end.";

const OPTIONS = [
  {
    id: "a",
    text: "Tell me about marketing.",
    good: false,
    verdict:
      "Close, and it’s what most people type. But that’s a topic, not an instruction — the AI has to guess who you are, who it’s for and what you’d call useful. It guesses the average, which is why the answer reads like a textbook.",
  },
  {
    id: "b",
    text: "You are a marketing manager. Give me 5 Instagram campaign ideas for a Bengaluru café targeting college students, with a ₹10,000 budget.",
    good: true,
    verdict:
      "Exactly. The second prompt gives the AI context, role, audience and constraints — so the response can be much more useful.",
  },
];

function StepTag({ n, label, mechanic }: { n: number; label: string; mechanic: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-special-elite text-[11px] uppercase tracking-[0.22em] text-chalk-yellow/85">
        Step {n} · {label}
      </span>
      <span className="font-special-elite text-[9px] uppercase tracking-[0.18em] text-chalk/25">
        Mechanic · {mechanic}
      </span>
    </div>
  );
}

export function PromptLesson() {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [checked, setChecked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Each step is a different height, so advancing can leave the card's top
  // above the fold. Bring it back — on a phone the step you just unlocked is
  // otherwise off-screen behind the navbar.
  useEffect(() => {
    if (step === 0) return;
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const hits = useMemo(() => {
    const t = draft.toLowerCase();
    return CRITERIA.map((c) => c.words.some((w) => t.includes(w)));
  }, [draft]);

  const score = hits.filter(Boolean).length;
  const chosen = OPTIONS.find((o) => o.id === choice);

  const reset = () => {
    setStep(0);
    setChoice(null);
    setDraft("");
    setChecked(false);
  };

  return (
    <section
      id="interactive"
      className="relative scroll-mt-20 overflow-hidden bg-white py-20 text-board sm:py-28"
    >
      <div className="mx-auto max-w-2xl px-5 sm:px-6">
        <div className="text-center">
          <span className="font-special-elite text-[11px] uppercase tracking-[0.28em] text-gold">
            Try it on yourself
          </span>
          <h2 className="mt-5 text-balance font-playfair text-[clamp(1.9rem,5.5vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-board">
            See what we mean by interactive.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-gray-600">
            For the next thirty seconds this page stops being a website and becomes a lesson. You&rsquo;ll
            leave it knowing something you can use today.
          </p>
        </div>

        {/* The lesson itself, on its own dark surface — it is a product, not page copy. */}
        <div
          ref={cardRef}
          className="mt-10 scroll-mt-24 overflow-hidden rounded-2xl bg-board-deep text-chalk shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
        >
          <div className="flex items-center gap-1.5 border-b border-chalk/10 px-5 py-3.5" aria-hidden>
            {[0, 1, 2, 3].map((n) => (
              <span
                key={n}
                className="h-1 flex-1 rounded-full transition-colors duration-500"
                style={{ background: n <= step ? "#f4c430" : "rgba(245,240,232,0.12)" }}
              />
            ))}
          </div>

          <div className="px-5 py-6 sm:px-7 sm:py-7">
            <AnimatePresence mode="wait">
              {/* ── 1 · Teach ── */}
              {step === 0 && (
                <motion.div key="t" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <StepTag n={1} label="Teach" mechanic="Micro-explanation" />
                  <h3 className="mt-4 font-playfair text-2xl font-bold sm:text-3xl">What is an AI prompt?</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-chalk/70">
                    A prompt is simply the instruction you give an AI.
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-chalk/55">
                    That&rsquo;s the whole definition. Everything interesting is in how much of your situation you
                    put into it.
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)] py-3.5 text-sm font-bold text-chalk-dark sm:w-auto sm:px-7"
                  >
                    Got it <ArrowRight size={15} />
                  </button>
                </motion.div>
              )}

              {/* ── 2 · Discriminate ── */}
              {step === 1 && (
                <motion.div key="c" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <StepTag n={2} label="Your turn" mechanic="Discrimination" />
                  <h3 className="mt-4 text-lg leading-snug text-chalk sm:text-xl">
                    Which prompt would give you a better result?
                  </h3>

                  <div className="mt-5 space-y-2.5">
                    {OPTIONS.map((o) => {
                      const picked = choice === o.id;
                      return (
                        <button
                          key={o.id}
                          onClick={() => !choice && setChoice(o.id)}
                          disabled={!!choice}
                          className="flex w-full gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] leading-snug transition-all disabled:cursor-default"
                          style={{
                            borderColor: picked
                              ? o.good
                                ? "rgba(244,196,48,0.65)"
                                : "rgba(245,240,232,0.3)"
                              : "rgba(245,240,232,0.12)",
                            background: picked ? "rgba(244,196,48,0.09)" : "rgba(245,240,232,0.03)",
                            color: choice && !picked ? "rgba(245,240,232,0.32)" : "#f5f0e8",
                          }}
                        >
                          <span className="font-special-elite text-xs text-chalk-yellow/70">
                            {o.id.toUpperCase()}
                          </span>
                          <span className="min-w-0">&ldquo;{o.text}&rdquo;</span>
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {chosen && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                        <p className="mt-5 flex gap-2.5 rounded-xl border border-chalk/10 bg-chalk/[0.04] p-4 text-sm leading-relaxed text-chalk/75">
                          {chosen.good && (
                            <Check size={17} className="mt-0.5 flex-shrink-0 text-chalk-yellow" strokeWidth={3} />
                          )}
                          <span>{chosen.verdict}</span>
                        </p>
                        <button
                          onClick={() => setStep(2)}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)] py-3.5 text-sm font-bold text-chalk-dark sm:w-auto sm:px-7"
                        >
                          Now write one <ArrowRight size={15} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ── 3 · Produce ── */}
              {step === 2 && (
                <motion.div key="p" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <StepTag n={3} label="Challenge" mechanic="Production" />
                  <h3 className="mt-4 text-lg leading-snug text-chalk sm:text-xl">
                    Improve this prompt: <span className="text-chalk-yellow">&ldquo;Create a sales email.&rdquo;</span>
                  </h3>

                  <label htmlFor="pl-draft" className="sr-only">
                    Your improved prompt
                  </label>
                  <textarea
                    id="pl-draft"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={4}
                    placeholder="Create a short sales email for…"
                    className="mt-4 w-full resize-none rounded-xl border border-chalk/15 bg-chalk/[0.04] p-4 text-[15px] leading-relaxed text-chalk placeholder:text-chalk/25 focus:border-chalk-yellow/60 focus:outline-none focus:ring-1 focus:ring-chalk-yellow/40"
                  />

                  {/* Scaffolding, live: the four things it is still missing. */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {CRITERIA.map((c, i) => (
                      <motion.span
                        key={c.key}
                        title={c.ask}
                        animate={hits[i] ? { scale: [1, 1.07, 1] } : {}}
                        transition={{ duration: 0.3 }}
                        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                        style={{
                          borderColor: hits[i] ? "rgba(244,196,48,0.5)" : "rgba(245,240,232,0.12)",
                          background: hits[i] ? "rgba(244,196,48,0.1)" : "transparent",
                          color: hits[i] ? "#f4c430" : "rgba(245,240,232,0.35)",
                        }}
                      >
                        {hits[i] ? <Check size={12} strokeWidth={3} /> : <span aria-hidden>+</span>}
                        {c.key}
                      </motion.span>
                    ))}
                  </div>

                  {!checked ? (
                    <button
                      onClick={() => setChecked(true)}
                      disabled={draft.trim().length < 8}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)] py-3.5 text-sm font-bold text-chalk-dark disabled:opacity-35 sm:w-auto sm:px-7"
                    >
                      Check mine
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                      <p className="font-playfair text-2xl font-bold">
                        {score}
                        <span className="text-chalk/30"> / 4</span>
                        <span className="ml-2 align-middle text-sm font-sans font-normal text-chalk/50">
                          {score === 4 ? "That prompt will work." : score >= 2 ? "Better already." : "Still guessing for you."}
                        </span>
                      </p>

                      <ul className="mt-4 space-y-2.5 border-t border-chalk/10 pt-4">
                        {CRITERIA.map((c, i) => (
                          <li key={c.key} className="flex gap-3 text-sm leading-relaxed">
                            <span
                              className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px]"
                              style={{
                                background: hits[i] ? "#f4c430" : "rgba(245,240,232,0.1)",
                                color: hits[i] ? "#1a1a2e" : "rgba(245,240,232,0.4)",
                              }}
                            >
                              {hits[i] ? "✓" : "+"}
                            </span>
                            <span className={hits[i] ? "text-chalk/45" : "text-chalk/80"}>
                              <strong className="font-semibold">{c.key}</strong>
                              {hits[i] ? " — got it." : ` — ${c.coach}`}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-5 rounded-xl border border-chalk/10 bg-chalk/[0.04] p-4">
                        <p className="font-special-elite text-[10px] uppercase tracking-[0.2em] text-chalk/35">
                          One version that has all four
                        </p>
                        <p className="mt-2.5 text-sm leading-relaxed text-chalk/75">{MODEL_ANSWER}</p>
                      </div>

                      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                        <button
                          onClick={() => setStep(3)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)] py-3.5 text-sm font-bold text-chalk-dark"
                        >
                          Finish <ArrowRight size={15} />
                        </button>
                        <button
                          onClick={() => setChecked(false)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-chalk/15 px-5 py-3.5 text-sm font-semibold text-chalk/70 hover:text-chalk"
                        >
                          Edit mine
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ── 4 · The punchline ── */}
              {step === 3 && (
                <motion.div key="r" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                  <span className="font-special-elite text-[11px] uppercase tracking-[0.22em] text-chalk-yellow/85">
                    That was the point
                  </span>
                  <p className="mt-4 font-playfair text-2xl leading-snug sm:text-[1.75rem]">
                    This is what an interactive course can look like.
                  </p>
                  <p className="mt-4 text-[15px] leading-relaxed text-chalk/70">
                    We don&rsquo;t just put information on a screen. We design learning experiences where people
                    learn by doing.
                  </p>
                  <p className="mt-4 text-[15px] leading-relaxed text-chalk/55">
                    Three mechanics in ninety seconds: a short teach, a choice between two near-identical
                    options, and something you had to write yourself while the screen told you what was still
                    missing. Swap the subject for onboarding, a safety drill, a product launch or a Grade 9
                    chapter — the build is the same.
                  </p>

                  <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                    <a
                      href="#enquire"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f4c430_0%,#c9a227_100%)] py-3.5 text-sm font-bold text-chalk-dark"
                    >
                      Build one from our material
                    </a>
                    <button
                      onClick={reset}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-chalk/15 px-5 py-3.5 text-sm font-semibold text-chalk/70 hover:text-chalk"
                    >
                      <RotateCcw size={14} /> Again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
