import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * WhyChooseUs — numbered value-proposition grid (01, 02, …), data-driven.
 * Server component. Props: heading fields + `items` [{ title, body }].
 * Defaults to the five reasons parents choose Chalkboard Tuitions.
 * Used in: homepage, /tuitions.
 */
export interface WhyItem {
  title: string;
  body: string;
}

const DEFAULT_ITEMS: WhyItem[] = [
  { title: "Personalised Start", body: "Every student can begin with one-to-one support before joining a batch, so no one is left behind." },
  { title: "Small Batches", body: "A maximum of eight students per batch — more attention, more questions answered, better outcomes." },
  { title: "Five Days a Week", body: "Consistent daily learning that builds momentum, not occasional weekend tuition." },
  { title: "Progress Tracking", body: "Regular assessments, printed progress cards and parent updates — you always know where your child stands." },
  { title: "Trusted Since 2018", body: "Built on the experience of Home Tuitions Bangalore — years of results, now under Chalkboard." },
];

export function WhyChooseUs({
  eyebrow = "Why Chalkboard",
  title = "Why parents choose Chalkboard",
  subtitle,
  items = DEFAULT_ITEMS,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: WhyItem[];
}) {
  return (
    <Section bg="white">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-gray-100 dark:border-chalk/10 bg-cream-bg/60 dark:bg-board/20 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <span className="font-playfair text-3xl font-black text-gold/30 group-hover:text-gold/50 transition-colors">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-playfair text-xl font-bold text-board dark:text-chalk">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-chalk/60">{item.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
