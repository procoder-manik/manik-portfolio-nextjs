'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ListTree } from 'lucide-react';
import { cn } from '@/lib/utils';

/* Finds the heading that is currently at the top of the reading area, on every scroll.
   Nothing is active until the first heading has been reached; at the very bottom the last one is active. */
function useActive(items) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean);
    if (!els.length) return undefined;
    let raf = 0;
    const calc = () => {
      raf = 0;
      const line = Math.min(170, window.innerHeight * 0.3);
      let cur = '';
      for (const el of els) { if (el.getBoundingClientRect().top - line <= 0) cur = el.id; else break; }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = els[els.length - 1].id;
      setActive(cur);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on); window.addEventListener('hashchange', on); window.addEventListener('load', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); window.removeEventListener('hashchange', on); window.removeEventListener('load', on); };
  }, [items]);
  return active;
}

const indent = (d) => (d >= 4 ? 'pl-10' : d === 3 ? 'pl-7' : 'pl-4');

function go(e, id, after) {
  const el = document.getElementById(id); if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  try { history.replaceState(null, '', `#${id}`); } catch {}
  after?.();
}

function Item({ t, on, onGo }) {
  return (
    <li>
      <a href={`#${t.id}`} data-toc-id={t.id} onClick={(e) => go(e, t.id, onGo)} aria-current={on ? 'location' : undefined}
        className={cn('-ml-px block rounded-r-lg border-l-2 py-1.5 pr-3 leading-snug transition-colors duration-200', indent(t.depth),
          on ? 'border-signal bg-signal/10 font-semibold text-ink' : 'border-transparent text-muted hover:border-line hover:text-ink', t.depth >= 3 && !on && 'text-[0.93em]')}>
        {t.text}
      </a>
    </li>
  );
}

/* Desktop: sticky list beside the article. The list scrolls itself so the active item is always visible. */
export function DesktopToc({ items }) {
  const active = useActive(items); const box = useRef(null);
  useEffect(() => {
    const box_ = box.current; const el = box_?.querySelector(`[data-toc-id="${active}"]`); if (!box_ || !el) return;
    const top = el.offsetTop; if (top < box_.scrollTop + 20 || top > box_.scrollTop + box_.clientHeight - 60) box_.scrollTo({ top: Math.max(0, top - box_.clientHeight / 3), behavior: 'smooth' });
  }, [active]);
  if (items.length < 2) return null;
  return (
    <nav className="sticky top-28" aria-label="On this page">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink"><ListTree size={15} className="text-signal" />On this page</p>
      <div ref={box} className="no-scrollbar relative mt-4 max-h-[calc(100vh-11rem)] overflow-y-auto overscroll-contain pr-1">
        <ul className="space-y-0.5 border-l border-line text-sm">{items.map((t) => <Item key={t.id} t={t} on={active === t.id} />)}</ul>
      </div>
    </nav>
  );
}

/* Phones and tablets: a card above the article. Closed, it shows the section you are reading. */
export function MobileToc({ items }) {
  const active = useActive(items); const [open, setOpen] = useState(false);
  if (items.length < 2) return null;
  const cur = items.find((t) => t.id === active);
  return (
    <nav aria-label="On this page" className="mb-8 overflow-hidden rounded-2xl border border-line bg-surface lg:hidden">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-signal/15 text-signal"><ListTree size={17} /></span>
        <span className="min-w-0 flex-1"><span className="block text-xs text-muted">{cur ? 'Reading now' : 'In this article'}</span><span className="block truncate text-[0.95rem] font-semibold text-ink">{cur ? cur.text : `${items.length} sections`}</span></span>
        <ChevronDown size={18} className={cn('shrink-0 text-muted transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <div className={cn('grid transition-all duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden"><ul className="max-h-[55vh] space-y-0.5 overflow-y-auto border-t border-line px-3 py-3 text-[0.95rem]">{items.map((t) => <Item key={t.id} t={t} on={active === t.id} onGo={() => setOpen(false)} />)}</ul></div>
      </div>
    </nav>
  );
}
