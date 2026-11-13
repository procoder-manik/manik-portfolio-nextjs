'use client';
import { useRef } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

/* Steps on a line that fills with colour as you scroll. A step with a picture shows it; a step without one gets an animated icon.
   The icon (art) is drawn on the server and handed in, so this file stays small. */
export default function StepsTimeline({ steps, label }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 65%', 'end 55%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  return (
    <ol ref={ref} className="relative mx-auto max-w-4xl list-none space-y-6 p-0">
      <span aria-hidden="true" className="absolute bottom-6 left-[19px] top-6 w-[3px] rounded-full bg-line sm:left-[23px]" />
      <motion.span aria-hidden="true" style={{ scaleY: reduce ? 1 : fill }} className="lp-line absolute bottom-6 left-[19px] top-6 w-[3px] origin-top rounded-full sm:left-[23px]" />
      {steps.map((s, i) => (
        <motion.li key={i} initial={reduce ? false : { opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-12% 0px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative pl-14 sm:pl-[4.5rem]">
          <span className="lp-btn absolute left-0 top-5 z-10 grid h-10 w-10 place-items-center rounded-full text-[15px] font-semibold ring-[6px] ring-[rgb(var(--base))] sm:h-12 sm:w-12 sm:text-base">{i + 1}</span>
          <article className="lp-spot-host flex flex-col gap-6 overflow-hidden rounded-[28px] bg-raised p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="sm:w-[44%] sm:shrink-0">
              {s.image
                ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.image} alt={s.title} loading="lazy" decoding="async" className="aspect-video w-full rounded-2xl object-cover" />
                : <div className="lp-art lp-panel relative grid aspect-video w-full place-items-center overflow-hidden rounded-2xl">
                  <span className="lp-art-ring" /><span className="lp-art-ring" style={{ animationDelay: '-1.4s' }} />
                  <span className="lp-art-icon relative grid h-16 w-16 place-items-center rounded-2xl text-white">{s.art}</span>
                </div>}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.1em] text-signal">{label} {i + 1}</p>
              <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{s.title}</h3>
              <p className="mt-2.5 leading-relaxed text-muted">{s.body}</p>
            </div>
          </article>
        </motion.li>
      ))}
    </ol>
  );
}
