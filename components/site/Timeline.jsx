'use client';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/* Animated vertical timeline. A gradient line draws down as you scroll, and each node lights up and its text
   slides in when it is reached. Works for education, experience, company history or any steps in time.
   items: [{ when, title, sub, body, bullets[] }] */
export default function Timeline({ title, items = [], className }) {
  const ref = useRef(null); const fill = useRef(null);
  useEffect(() => {
    const root = ref.current; if (!root) return;
    const nodes = [...root.querySelectorAll('.tl-item')];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { nodes.forEach((n) => n.classList.add('on')); if (fill.current) fill.current.style.height = '100%'; return; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = root.getBoundingClientRect(); const mid = window.innerHeight * 0.62;
      const p = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)));
      if (fill.current) fill.current.style.height = `${p * 100}%`;
      nodes.forEach((n) => { if (n.getBoundingClientRect().top < mid) n.classList.add('on'); });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [items.length]);
  return (
    <div className={className}>
      {title && <h3 className="mb-7 font-mono text-[0.78rem] uppercase tracking-[0.2em] text-signal">{title}</h3>}
      <ol ref={ref} className="relative" data-noreveal="">
        <span className="absolute bottom-2 left-[10px] top-2 w-px bg-line" aria-hidden><span ref={fill} className="tl-line-fill block w-full" style={{ height: 0 }} /></span>
        {items.map((it, i) => (
          <li key={i} className={cn('tl-item relative pb-9 pl-12 last:pb-0')} style={{ transitionDelay: '60ms' }}>
            <span className="tl-node absolute left-0 top-1.5 grid h-[21px] w-[21px] place-items-center rounded-full border-2 border-line bg-base" aria-hidden><i className="block h-[7px] w-[7px] rounded-full" /></span>
            {it.when && <p className="font-mono text-[0.78rem] tracking-[0.14em] text-muted">{it.when}</p>}
            <p className="mt-1.5 font-display text-[1.3rem] font-bold leading-snug text-ink">{it.title}</p>
            {it.sub && <p className="mt-1 text-[0.97rem] text-body/80">{it.sub}</p>}
            {it.body && <p className="mt-2 max-w-prose text-[0.95rem] leading-relaxed text-muted">{it.body}</p>}
            {it.bullets?.length > 0 && <ul className="mt-3 space-y-2 text-[0.95rem] text-body">{it.bullets.map((b) => <li key={b} className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />{b}</li>)}</ul>}
          </li>
        ))}
      </ol>
    </div>
  );
}
