'use client';
import { Children, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLS = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 xl:grid-cols-3', 4: 'md:grid-cols-2 xl:grid-cols-4' };
const WIDTH = {
  1: 'basis-full',
  2: 'basis-[88%] md:basis-[calc((100%-0.75rem)/1.5)]',
  3: 'basis-[86%] md:basis-[calc((100%-0.75rem)/1.5)] xl:basis-[calc((100%-2.25rem)/2.5)]',
  4: 'basis-[86%] md:basis-[calc((100%-0.75rem)/1.5)] xl:basis-[calc((100%-3.75rem)/3.5)]',
};

/* Shows any list of cards (pricing, services, reviews, projects, posts) as a grid or a sliding carousel.
   layout: 'grid' | 'carousel'. columns: 1 to 4 (cards per row on a wide screen).
   autoplay: slides by itself; interval: seconds between slides (default 5). Without autoplay the visitor uses the arrows, dots or swipes.
   Pass the cards as children. */
export default function CardLayout({ layout = 'grid', columns = 3, autoplay = false, interval = 5, label = 'Cards', children }) {
  const nodes = Children.toArray(children);
  const carousel = layout === 'carousel';
  const cols = Math.min(4, Math.max(1, Number(columns) || 3));
  const ref = useRef(null); const [page, setPage] = useState(0); const [pages, setPages] = useState(1);
  const secs = Math.min(30, Math.max(2, Number(interval) || 5));

  useEffect(() => {
    if (!carousel || !ref.current) return undefined;
    const el = ref.current;
    const count = () => Math.max(2, Math.ceil(el.scrollWidth / el.clientWidth - 0.05));
    const calc = () => setPages(el.scrollWidth > el.clientWidth + 8 ? count() : 1);
    const on = () => setPage(Math.round((el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth)) * (count() - 1)));
    calc(); el.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', calc);
    let timer;
    if (autoplay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer = setInterval(() => {
        if (el.matches(':hover') || el.contains(document.activeElement)) return;
        const next = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 ? 0 : el.scrollLeft + el.clientWidth;
        el.scrollTo({ left: next, behavior: 'smooth' });
      }, secs * 1000);
    }
    return () => { el.removeEventListener('scroll', on); window.removeEventListener('resize', calc); clearInterval(timer); };
  }, [carousel, autoplay, secs, nodes.length]);

  if (!nodes.length) return null;
  if (!carousel) return <div className={cn('grid gap-5 sm:gap-6', COLS[cols])}>{nodes.map((n, i) => <div key={i} className="h-full">{n}</div>)}</div>;

  const go = (d) => { const el = ref.current; if (!el) return; const c = el.firstElementChild; el.scrollBy({ left: d * ((c?.offsetWidth || el.clientWidth) + 24), behavior: 'smooth' }); };
  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={ref} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-2 pt-3" style={{ scrollbarWidth: 'none' }}>
        {nodes.map((n, i) => <div key={i} className={cn('shrink-0 snap-start', WIDTH[cols])}>{n}</div>)}
      </div>
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden>{Array.from({ length: pages }).map((_, i) => <span key={i} className={cn('h-1.5 rounded-full transition-all', i === page ? 'w-6 bg-signal' : 'w-1.5 bg-line')} />)}</div>
          <div className="flex gap-2">
            <button type="button" aria-label="Previous cards" onClick={() => go(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition hover:bg-raised"><ChevronLeft size={18} /></button>
            <button type="button" aria-label="Next cards" onClick={() => go(1)} className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition hover:bg-raised"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
