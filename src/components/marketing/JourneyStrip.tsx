import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * JourneyStrip — a cross-sell band that introduces a secondary journey after
 * the primary (Tuitions) story is told. Server component. Used on the homepage
 * for "Looking for corporate/college learning? → Studio" and the quiet OS login.
 * Props: eyebrow, title, description, cta {label, href, external?}, tone, icon.
 * Used in: homepage.
 */
export function JourneyStrip({
  eyebrow,
  title,
  description,
  cta,
  tone = "light",
  icon,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  cta: { label: string; href: string; external?: boolean };
  tone?: "light" | "dark";
  icon?: React.ReactNode;
}) {
  return (
    <Section bg={tone === "dark" ? "dark" : "cream"} size="sm">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl">
          <div className="flex items-start gap-4 max-w-2xl">
            {icon && (
              <span className={tone === "dark" ? "text-chalk-yellow mt-1" : "text-gold mt-1"}>{icon}</span>
            )}
            <div>
              {eyebrow && (
                <span className={`block text-xs font-semibold uppercase tracking-[0.18em] mb-1.5 ${tone === "dark" ? "text-chalk-yellow" : "text-gold"}`}>
                  {eyebrow}
                </span>
              )}
              <h3 className={`font-playfair text-xl sm:text-2xl font-bold ${tone === "dark" ? "text-chalk" : "text-board dark:text-chalk"}`}>
                {title}
              </h3>
              <p className={`mt-1.5 text-sm sm:text-base leading-relaxed ${tone === "dark" ? "text-chalk/60" : "text-gray-600 dark:text-chalk/60"}`}>
                {description}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button href={cta.href} external={cta.external} variant={tone === "dark" ? "secondary" : "secondary"}>
              {cta.label} <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
