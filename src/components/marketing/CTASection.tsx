import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

/**
 * CTASection — the closing call-to-action band that ends a page. Server
 * component. Props: eyebrow, title, subtitle, primary/secondary CTAs.
 * Used in: homepage, /tuitions, /learning-studio, /about.
 */
export function CTASection({
  eyebrow = "Ready to get started?",
  title,
  subtitle,
  primary,
  secondary,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primary: { label: string; href: string; external?: boolean };
  secondary?: { label: string; href: string; external?: boolean };
}) {
  return (
    <section className="bg-board-deep text-chalk py-16 sm:py-20">
      <Container>
        <div
          className="relative overflow-hidden rounded-3xl border border-chalk-yellow/15 px-6 py-12 sm:px-12 sm:py-16 text-center"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(244,196,48,0.14), transparent 70%), repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.025) 27px, rgba(255,255,255,0.025) 28px)",
          }}
        >
          <span className="font-special-elite text-chalk-yellow tracking-widest text-xs uppercase opacity-80">{eyebrow}</span>
          <h2 className="mt-3 font-playfair text-2xl sm:text-4xl font-bold text-chalk max-w-2xl mx-auto">{title}</h2>
          {subtitle && <p className="mt-4 text-chalk/60 text-base max-w-xl mx-auto leading-relaxed">{subtitle}</p>}
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <Button href={primary.href} external={primary.external} size="lg" variant="primary">
              {primary.label}
            </Button>
            {secondary && (
              <Button href={secondary.href} external={secondary.external} size="lg" variant="secondary">
                {secondary.label}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
