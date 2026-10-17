'use client';
import { useEffect, useRef, useState } from 'react';

/* Proficiency bars that fill when scrolled into view. */
export default function SkillBars({ items = [], compact }) {
  const ref = useRef(null); const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: .2 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <ul ref={ref} className={compact ? 'space-y-3.5' : 'grid gap-x-10 gap-y-5 sm:grid-cols-2'}>
      {items.map((s, i) => (
        <li key={s.name || s.group}>
          <div className="mb-2 flex items-baseline justify-between gap-3 text-[0.95rem]"><span className="font-medium text-ink">{s.name || s.group}</span><span className="font-display text-sm font-semibold text-muted">{s.level}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-raised print:bg-[#E5E9F0]">
            <div className="h-full rounded-full bg-gradient-to-r from-signal to-amber transition-[width] duration-[1400ms] ease-out print:!w-[var(--w)]"
              style={{ width: on ? `${s.level}%` : '0%', transitionDelay: `${i * 70}ms`, '--w': `${s.level}%`, printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
