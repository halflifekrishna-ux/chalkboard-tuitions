import { ACTS, DELIVERABLES, HEADING } from "./courseBuildContent";

/**
 * The course-build section as plain server HTML: the same words as the
 * animated CourseBuild, laid out as a list. It's what search engines read and
 * what a visitor sees until CourseBuildLazy swaps the animation in.
 */
export function CourseBuildStatic() {
  return (
    <section id="course-building" className="relative scroll-mt-20 overflow-hidden bg-board-deep bg-chalk-lines py-20 text-chalk">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-chalk-yellow sm:text-[13px]">{HEADING.kicker}</span>
          <h2 className="mx-auto mt-5 max-w-3xl text-balance font-playfair text-[clamp(1.6rem,5.4vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-chalk">
            {HEADING.title}
          </h2>
        </div>
        <ol className="mt-10 space-y-3">
          {ACTS.map((act) => (
            <li key={act.kicker} className="rounded-2xl border border-chalk/10 bg-chalk/[0.03] p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-chalk-yellow">{act.kicker}</span>
              <p className="mt-2.5 text-lg leading-snug text-chalk/90">{act.line}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="mx-auto mt-14 max-w-4xl px-5 sm:px-6">
        <dl className="grid gap-px overflow-hidden rounded-2xl border border-chalk/10 bg-chalk/25 sm:grid-cols-2">
          {DELIVERABLES.map((d) => (
            <div key={d.k} className="bg-board-deep p-5 sm:p-6">
              <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-chalk-yellow">{d.k}</dt>
              <dd className="mt-2 text-[15px] leading-snug text-chalk/80">{d.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
