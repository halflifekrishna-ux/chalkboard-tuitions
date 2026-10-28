import Link from "next/link";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/marketing/Reveal";
import { CONTACT_EMAIL } from "@/lib/contact";
import { StudioEnquiryForm } from "@/components/marketing/learning-studio/StudioEnquiryForm";

/**
 * Pieces shared by the Learning Studio audience pages (/learning-studio for
 * companies, /learning-studio/colleges, /learning-studio/trainers). Each page
 * tells one story to one reader; these keep the eyebrow and the closing ask
 * identical across them so the three still read as one studio.
 */

export function Eyebrow({ label, tone = "light" }: { label: string; tone?: "light" | "dark" }) {
  return (
    <span
      className={
        "inline-flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.18em] sm:text-[13px] " +
        (tone === "dark" ? "text-chalk-yellow" : "text-gold-deep")
      }
    >
      <span className={tone === "dark" ? "h-px w-7 bg-chalk-yellow/50" : "h-px w-7 bg-gold-deep/45"} />
      {label}
    </span>
  );
}

/** The other doors, said once at the bottom of the ask — for the reader who landed on the wrong page. */
const ELSEWHERE = {
  companies: { href: "/learning-studio", label: "Training for companies" },
  colleges: { href: "/learning-studio/colleges", label: "Programs for colleges" },
  trainers: { href: "/learning-studio/trainers", label: "Train with us" },
  tuitions: { href: "/tuitions", label: "School tuitions" },
} as const;

export function StudioEnquire({
  title,
  line,
  defaultAudience,
  elsewhere,
}: {
  title: React.ReactNode;
  line: string;
  defaultAudience?: React.ComponentProps<typeof StudioEnquiryForm>["defaultAudience"];
  elsewhere: (keyof typeof ELSEWHERE)[];
}) {
  return (
    <section id="enquire" className="relative overflow-hidden bg-board-deep py-20 text-chalk sm:py-28">
      <div aria-hidden className="grid-dots pointer-events-none" />
      <Container className="relative">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="min-w-0 lg:col-span-5">
            <Eyebrow label="Start a Conversation" tone="dark" />
            <h2 className="mt-5 break-words font-playfair text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[1.08] tracking-tight">
              {title}
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-chalk/60">{line}</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-6 inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-chalk/80 hover:text-chalk-yellow"
            >
              <Mail size={15} aria-hidden className="shrink-0" /> {CONTACT_EMAIL}
            </a>
            <p className="mt-10 max-w-sm border-t border-chalk/10 pt-5 text-sm leading-relaxed text-chalk/60">
              Looking for something else?{" "}
              {elsewhere.map((k, i) => (
                <span key={k}>
                  {i > 0 && " · "}
                  <Link
                    href={ELSEWHERE[k].href}
                    className="whitespace-nowrap font-semibold text-chalk/75 underline decoration-chalk/30 underline-offset-4 hover:text-chalk-yellow"
                  >
                    {ELSEWHERE[k].label}
                  </Link>
                </span>
              ))}
            </p>
          </Reveal>
          <Reveal delay={100} className="min-w-0 lg:col-span-7">
            <StudioEnquiryForm defaultAudience={defaultAudience} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
