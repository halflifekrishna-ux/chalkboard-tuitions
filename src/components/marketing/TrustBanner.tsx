import { Container } from "@/components/ui/container";
import { ShieldCheck } from "lucide-react";

/**
 * TrustBanner — the credibility strip that transfers Home Tuitions Bangalore's
 * 2018 track record onto Chalkboard. Server component. Reused on homepage,
 * tuitions and about. Props: optional `stats` to show alongside the narrative.
 * Used in: homepage, /tuitions, /about.
 */
export function TrustBanner({
  stats = [
    { value: "2018", label: "Trusted since" },
    { value: "Max 8", label: "Students per batch" },
    { value: "5 days", label: "A week" },
    { value: "1–10", label: "Grades covered" },
  ],
}: {
  stats?: { value: string; label: string }[];
}) {
  return (
    <section className="bg-cream-bg dark:bg-board-deep/40 py-10 sm:py-12 border-y border-board/5 dark:border-chalk/5">
      <Container>
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="flex items-start gap-3">
            <ShieldCheck size={22} className="text-gold flex-shrink-0 mt-1" />
            <p className="font-playfair text-lg sm:text-xl leading-relaxed text-board dark:text-chalk">
              Since 2018, <span className="font-bold">Home Tuitions Bangalore</span> has helped
              hundreds of students through personalised academic support. Today that experience
              powers <span className="text-gold font-bold">Chalkboard</span>.
            </p>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <dt className="font-playfair text-2xl font-bold text-board dark:text-chalk">{s.value}</dt>
                <dd className="text-xs uppercase tracking-wide text-gray-500 dark:text-chalk/50 mt-0.5">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
