"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  GraduationCap,
  LogIn,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  School,
  Sparkles,
  UserRound,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import { CONTACT_EMAIL, CONTACT_TOPICS, type ContactTopic } from "@/lib/contact";
import { CENTRE, CENTRE_ADDRESS } from "@/lib/tuitions-location";
import { TuitionsDemoForm } from "@/components/sections/TuitionsDemoForm";
import { StudioEnquiryForm } from "@/components/marketing/learning-studio/StudioEnquiryForm";

/**
 * ContactRouter — the single front door for all of Chalkboard. A frosted
 * glass layer asks one question ("what are you contacting us about?") and
 * swaps in the right route for the answer:
 *
 *   tuitions     → the free-demo form + WhatsApp + the centre's address
 *   company      → Learning Studio enquiry, preset to a corporate team
 *   college      → Learning Studio enquiry, preset to a college
 *   professional → Learning Studio enquiry, preset to an individual
 *   trainer      → the trainer profile email (and the trainers page)
 *   family       → existing parents/students: WhatsApp + Chalkboard OS login
 *   other        → email
 *
 * Learning Studio routes are email-only by decision — no phone, no WhatsApp.
 * The choice lives in `?for=` so each route is shareable and works without
 * JavaScript (every option is a real link the server can render).
 */


const OPTIONS: { id: ContactTopic; label: string; sub: string; icon: LucideIcon; group: "Tuitions" | "Learning Studio" | "Chalkboard" }[] = [
  { id: "tuitions", label: "Tuitions for my child", sub: "Grades 1–10 · free demo class in Kammanahalli", icon: GraduationCap, group: "Tuitions" },
  { id: "family", label: "I'm already a Chalkboard parent", sub: "Timings, fees, progress, or logging in", icon: UserRound, group: "Tuitions" },
  { id: "company", label: "Training for my team", sub: "AI, sales, support, leadership, custom courses", icon: Briefcase, group: "Learning Studio" },
  { id: "college", label: "A college or university programme", sub: "Placement readiness, industry tracks, faculty", icon: School, group: "Learning Studio" },
  { id: "professional", label: "Upskilling for myself", sub: "Programmes for individual professionals", icon: Sparkles, group: "Learning Studio" },
  { id: "trainer", label: "I want to train with Chalkboard", sub: "Trainers, subject experts, facilitators", icon: Presentation, group: "Learning Studio" },
  { id: "other", label: "Something else", sub: "Partnerships, press, anything not listed", icon: Mail, group: "Chalkboard" },
];

const WHATSAPP = CENTRE.phone.replace(/\D/g, "");
const TRAINER_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Trainer profile — [Your name]")}&body=${encodeURIComponent(
  "Name:\nTopics / skills I train:\nFormats (workshop, bootcamp, programme):\nAudiences I've trained:\nLinkedIn / portfolio:\n\nShort proposal or session idea:\n\n(Please attach your CV.)"
)}`;

const glass =
  "rounded-3xl border border-white/[0.12] bg-white/[0.06] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl";

const goldButton =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-chalk-dark transition-transform hover:scale-[1.02] active:scale-[0.98]";
const gold = { background: "linear-gradient(135deg, #f4c430 0%, #c9a227 100%)" };

export function ContactRouter({ initial }: { initial: ContactTopic | null }) {
  const [topic, setTopic] = useState<ContactTopic | null>(initial);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  // Keep `?for=` in step with the choice — shareable, and Back/Forward work.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const url = topic ? `/contact?for=${topic}` : "/contact";
    window.history.pushState({ topic }, "", url);
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [topic]);

  useEffect(() => {
    const onPop = () => {
      const t = new URLSearchParams(window.location.search).get("for");
      first.current = true; // don't push the state we just popped to
      setTopic((CONTACT_TOPICS as readonly string[]).includes(t ?? "") ? (t as ContactTopic) : null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const choice = OPTIONS.find((o) => o.id === topic);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-board-deep pb-20 pt-28 text-chalk sm:pt-32">
      {/* The room behind the glass: slow gold and green light over chalk lines. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-dots absolute inset-0" />
        <motion.div
          className="absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(244,196,48,0.22), transparent 65%)" }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 bottom-0 h-[32rem] w-[32rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(45,106,79,0.45), transparent 65%)" }}
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-chalk-yellow sm:text-[13px]">
            Contact Chalkboard
          </span>
          <h1 className="mt-4 font-playfair text-[clamp(2.1rem,6vw,3.5rem)] font-black leading-[1.06] tracking-tight">
            {choice ? "Let’s get you to the right people." : "What are you contacting us about?"}
          </h1>
          {!choice && (
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-chalk/65">
              Tuitions, training for teams, college programmes — pick one and we&rsquo;ll show you exactly how to
              reach the right team.
            </p>
          )}
        </div>

        <div className={`${glass} mt-10 p-3 sm:p-4`}>
          <AnimatePresence mode="wait" initial={false}>
            {!choice ? (
              <motion.ul
                key="choose"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                aria-label="What are you contacting us about?"
              >
                {OPTIONS.map((o, i) => (
                  <motion.li
                    key={o.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3 }}
                    className={o.id === "other" ? "sm:col-span-2" : ""}
                  >
                    {/* A real link (works without JS, crawlable); JS intercepts it for the in-place swap. */}
                    <a
                      href={`/contact?for=${o.id}`}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                        e.preventDefault();
                        setTopic(o.id);
                      }}
                      className="group flex min-h-[76px] items-center gap-4 rounded-2xl border border-transparent px-4 py-3.5 transition-colors hover:border-chalk-yellow/30 hover:bg-white/[0.06] focus-visible:border-chalk-yellow/60 focus-visible:outline-none"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-chalk-yellow/10 text-chalk-yellow ring-1 ring-chalk-yellow/20 transition-colors group-hover:bg-chalk-yellow/20">
                        <o.icon size={19} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold leading-snug text-chalk">{o.label}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-chalk/55">{o.sub}</span>
                      </span>
                      <ArrowRight size={16} aria-hidden className="shrink-0 text-chalk/35 transition-transform group-hover:translate-x-1 group-hover:text-chalk-yellow" />
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <motion.div
                key={choice.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="p-3 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <a
                    href="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      setTopic(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-chalk/70 hover:text-chalk"
                  >
                    <ArrowLeft size={13} aria-hidden /> Change
                  </a>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-chalk-yellow/80">{choice.group}</span>
                </div>
                <h2 ref={headingRef} tabIndex={-1} className="mt-5 font-playfair text-2xl font-bold outline-none sm:text-3xl">
                  {choice.label}
                </h2>
                <div className="mt-6">
                  <Route topic={choice.id} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center text-xs text-chalk/45">
          Or email us any time at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-chalk/70 underline decoration-chalk/25 underline-offset-4 hover:text-chalk-yellow">
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </section>
  );
}

function Route({ topic }: { topic: ContactTopic }) {
  switch (topic) {
    case "tuitions":
      return (
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-chalk/65">
            Tell us your child&rsquo;s grade and board. We&rsquo;ll WhatsApp you within 30 minutes to fix a free demo
            class — a real class, alongside the batch, with no obligation.
          </p>
          <TuitionsDemoForm />
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi! I'd like to book a free demo class at Chalkboard Tuitions.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:border-chalk-yellow/30"
            >
              <MessageCircle size={18} className="shrink-0 text-chalk-yellow" aria-hidden />
              <span className="text-sm">
                <span className="block font-semibold">Prefer WhatsApp?</span>
                <span className="text-chalk/60">{CENTRE.phoneDisplay}</span>
              </span>
            </a>
            <a href={CENTRE.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:border-chalk-yellow/30">
              <MapPin size={18} className="shrink-0 text-chalk-yellow" aria-hidden />
              <span className="text-sm">
                <span className="block font-semibold">Visit the centre</span>
                <span className="text-chalk/60">{CENTRE_ADDRESS}</span>
              </span>
            </a>
          </div>
          <p className="flex items-center gap-2 text-xs text-chalk/50">
            <Clock size={13} aria-hidden /> Classes {CENTRE.hours.display}
          </p>
        </div>
      );

    case "family":
      return (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-chalk/65">
            For timings, fees, homework or how your child is doing, WhatsApp the centre — that line reaches the
            teachers directly.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className={goldButton} style={gold}>
              <MessageCircle size={16} aria-hidden /> WhatsApp {CENTRE.phoneDisplay}
            </a>
            <Link href="/admin/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-chalk/80 hover:text-chalk">
              <LogIn size={16} aria-hidden /> Log in to Chalkboard OS
            </Link>
          </div>
        </div>
      );

    case "company":
    case "college":
    case "professional":
      return (
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-chalk/65">
            {topic === "company"
              ? "Tell us who the training is for and what needs to change. We reply by email with a proposed shape, timeline and cost."
              : topic === "college"
              ? "Tell us about your students, your timeline and the outcome you need. We reply by email with a proposed programme and cost."
              : "Tell us what you want to get better at. We reply by email with the programmes that fit."}{" "}
            <Link
              href={topic === "college" ? "/learning-studio/colleges" : "/learning-studio"}
              className="whitespace-nowrap font-semibold text-chalk/80 underline decoration-chalk/25 underline-offset-4 hover:text-chalk-yellow"
            >
              See what we run →
            </Link>
          </p>
          <StudioEnquiryForm
            defaultAudience={topic === "company" ? "Corporate team" : topic === "college" ? "College / institution" : "Individual professional"}
          />
        </div>
      );

    case "trainer":
      return (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-chalk/65">
            Send one email with the topics you train, who you&rsquo;ve trained, a short session idea, and your CV and
            LinkedIn. The button below opens it pre-filled.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={TRAINER_MAILTO} className={goldButton} style={gold}>
              <Mail size={16} aria-hidden /> Email your profile
            </a>
            <Link href="/learning-studio/trainers" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-chalk/80 hover:text-chalk">
              Who we work with <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </div>
      );

    case "other":
      return (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-chalk/65">
            Partnerships, press, or anything else — one inbox reaches the whole Chalkboard team.
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className={goldButton} style={gold}>
            <Mail size={16} aria-hidden /> {CONTACT_EMAIL}
          </a>
        </div>
      );
  }
}
