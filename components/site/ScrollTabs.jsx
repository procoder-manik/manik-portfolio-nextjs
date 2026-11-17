'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/* Filter tabs on one line. With more tabs than fit, the row slides sideways (swipe, trackpad, mouse wheel or the arrows),
   with no scrollbar and soft faded edges. The chosen tab slides into view by itself.
   items: [{ key, name, n }]. */
export default function ScrollTabs({ items, active, onChange, label = 'Filter', pillId = 'tabs-pill', className }) {
  const ref = useRef(null);
  const [edge, setEdge] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = ref.current; if (!el) return;
    setEdge({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    // A plain mouse wheel moves the row sideways while it can still move; at either end the page scrolls as usual.
    const wheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || el.scrollWidth <= el.clientWidth) return;
      const max = el.scrollWidth - el.clientWidth;
      if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return;
      e.preventDefault(); el.scrollBy({ left: e.deltaY, behavior: 'auto' });
    };
    el.addEventListener('scroll', measure, { passive: true });
    el.addEventListener('wheel', wheel, { passive: false });
    return () => { ro.disconnect(); el.removeEventListener('scroll', measure); el.removeEventListener('wheel', wheel); };
  }, [measure, items.length]);

  // Keep the chosen tab in view, without moving the page up or down.
  useEffect(() => {
    const el = ref.current; const b = el?.querySelector('[aria-selected="true"]'); if (!b) return;
    const l = b.offsetLeft; const r = l + b.offsetWidth;
    if (l < el.scrollLeft + 40 || r > el.scrollLeft + el.clientWidth - 40) el.scrollTo({ left: l - (el.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
  }, [active]);

  const nudge = (dir) => { const el = ref.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' }); };
  const fade = `linear-gradient(90deg, ${edge.left ? 'transparent 0, #000 56px' : '#000 0'}, ${edge.right ? '#000 calc(100% - 56px), transparent 100%' : '#000 100%'})`;

  return (
    <div className={cn('relative min-w-0', className)}>
      <motion.div ref={ref} layoutScroll role="tablist" aria-label={label}
        className="no-scrollbar relative flex gap-2 overflow-x-auto overscroll-x-contain scroll-smooth py-1"
        style={{ scrollbarWidth: 'none', WebkitMaskImage: fade, maskImage: fade }}>
        {items.map(({ key, name, n }) => (
          <button key={key} type="button" role="tab" aria-selected={active === key} onClick={() => onChange(key)}
            className={cn('relative isolate shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[0.92rem] font-medium transition-colors duration-300', active === key ? 'border-transparent text-white' : 'border-line text-body hover:border-ink/30 hover:text-ink')}>
            {active === key && <motion.span layoutId={pillId} className="absolute inset-0 -z-10 rounded-full bg-signal" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
            {name}{n != null && <span className={cn('ml-1.5', active === key ? 'text-white/70' : 'text-muted')}>{n}</span>}
          </button>
        ))}
      </motion.div>
      {[[-1, edge.left, 'left-0', ChevronLeft, 'Earlier filters'], [1, edge.right, 'right-0', ChevronRight, 'More filters']].map(([dir, on, pos, Icon, aria]) => (
        <button key={dir} type="button" aria-label={aria} tabIndex={-1} onClick={() => nudge(dir)}
          className={cn('absolute top-1/2 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-ink shadow-sm transition duration-300 hover:border-signal hover:text-signal sm:grid', pos, on ? 'opacity-100' : 'pointer-events-none opacity-0')}>
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
