'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Check, Quote } from 'lucide-react';
import Icon from '../Icon';
import { cn } from '@/lib/utils';
import { SERVICE_ICONS } from '@/lib/options';

const ext = (h = '') => /^https?:/.test(h);
const MONO = 'font-mono text-[0.72rem] uppercase tracking-[0.18em]';
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const scope = (css = '') => String(css).replace(/(^|})\s*([^@{}]+)\{/g, (m, a, sel) => `${a}[data-cards] ${sel.split(',').map((x) => x.trim()).join(', [data-cards] ')}{`).replace(/<\/?style[^>]*>/gi, '');

function More({ it, label }) {
  const text = it.linkLabel === '-' ? '' : it.linkLabel || label;
  if (!text || !it.href) return null;
  return <Link href={it.href} target={ext(it.href) ? '_blank' : undefined} rel={ext(it.href) ? 'noopener noreferrer' : undefined} className={cn('group/more mt-7 inline-flex items-center gap-2 text-signal', MONO)}>{text}<ArrowRight size={14} className="transition-transform duration-300 group-hover/more:translate-x-1" /></Link>;
}

/* One card. i is the position (used for numbers and default icons). */
export function Card({ t, it, i = 0, link = 'Learn more' }) {
  const icon = it.icon || SERVICE_ICONS[i % SERVICE_ICONS.length];
  switch (t) {
    case 'numbered': return (
      <div className="card group flex h-full flex-col p-8 transition duration-500 hover:-translate-y-1 hover:border-signal/40">
        <span className="font-display text-[4.2rem] font-bold leading-none tracking-tight text-transparent [-webkit-text-stroke:1.5px_rgb(var(--signal)/.75)]" aria-hidden>{String(it.number || i + 1).padStart(2, '0')}</span>
        <h3 className="mt-8 font-display text-xl font-bold text-ink">{it.title}</h3>
        <p className="mt-3 flex-1 text-[0.97rem] leading-relaxed text-muted">{it.body}</p>
        {it.meta && <p className={cn('mt-7 text-muted/80', MONO)}>{it.meta}</p>}
      </div>);
    case 'image': return (
      <div className="card group flex h-full flex-col overflow-hidden transition duration-500 hover:-translate-y-1 hover:border-signal/40">
        {it.image && <div className="aspect-[16/10] overflow-hidden bg-raised"><img src={it.image} alt={it.imageAlt || it.title || ''} loading="lazy" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" /></div>}
        <div className="flex flex-1 flex-col p-7">
          {it.tag && <span className={cn('mb-3 w-fit rounded-full bg-signal/10 px-3 py-1 text-signal', MONO)}>{it.tag}</span>}
          <h3 className="font-display text-xl font-bold text-ink">{it.title}</h3>
          <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-muted">{it.body}</p>
          <More it={it} label={link} />
        </div>
      </div>);
    case 'stat': return (
      <div className="card flex h-full flex-col p-8 text-center transition duration-500 hover:border-signal/40">
        <span className="bg-gradient-to-br from-signal to-[#a78bfa] bg-clip-text font-display text-6xl font-bold tracking-tight text-transparent">{it.value}</span>
        <h3 className="mt-4 font-display text-lg font-bold text-ink">{it.title}</h3>
        {it.body && <p className="mt-2 text-sm text-muted">{it.body}</p>}
      </div>);
    case 'quote': return (
      <figure className="card flex h-full flex-col p-8">
        <Quote size={26} className="text-signal" />
        <blockquote className="mt-5 flex-1 text-[1.05rem] leading-relaxed text-ink">{it.body}</blockquote>
        <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
          {it.avatar && <img src={it.avatar} alt="" loading="lazy" className="h-11 w-11 rounded-full object-cover" />}
          <span><span className="block font-semibold text-ink">{it.name}</span><span className="text-sm text-muted">{it.role}</span></span>
        </figcaption>
      </figure>);
    case 'row': return (
      <div className="group flex h-full gap-4 rounded-2xl border border-line bg-surface/50 p-5 transition duration-500 hover:border-signal/40 hover:bg-surface">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-signal/12 text-signal transition group-hover:bg-signal group-hover:text-white"><Icon name={icon} size={19} /></span>
        <span><h3 className="font-display font-bold text-ink">{it.title}</h3><p className="mt-1 text-[0.92rem] leading-relaxed text-muted">{it.body}</p></span>
      </div>);
    case 'glass': return (
      <div className="group relative h-full rounded-[28px] bg-gradient-to-br from-signal/50 via-line to-[#a78bfa]/40 p-px transition duration-500 hover:-translate-y-1">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[27px] bg-base p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-signal/20 blur-3xl transition duration-700 group-hover:bg-signal/35" />
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-signal to-[#7c5cff] text-white shadow-[0_12px_30px_-10px_rgb(var(--signal))]"><Icon name={icon} size={22} /></span>
          <h3 className="relative mt-6 font-display text-xl font-bold text-ink">{it.title}</h3>
          <p className="relative mt-3 flex-1 text-[0.96rem] leading-relaxed text-muted">{it.body}</p>
          <div className="relative"><More it={it} label={link} /></div>
        </div>
      </div>);
    case 'editorial': return (
      <div className="group flex h-full flex-col border-t border-ink/25 pt-6 transition duration-500 hover:border-signal">
        <span className={cn('text-muted', MONO)}>{String(i + 1).padStart(2, '0')}</span>
        <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-ink">{it.title}</h3>
        <p className="mt-3 flex-1 text-[0.97rem] leading-relaxed text-muted">{it.body}</p>
        <More it={it} label={link} />
      </div>);
    case 'price': return (
      <div className={cn('card flex h-full flex-col p-8 transition duration-500 hover:-translate-y-1', it.tag && 'border-signal/50')}>
        {it.tag && <span className={cn('mb-4 w-fit rounded-full bg-signal px-3 py-1 text-white', MONO)}>{it.tag}</span>}
        <h3 className="font-display text-xl font-bold text-ink">{it.title}</h3>
        <p className="mt-3 flex items-baseline gap-2"><span className="font-display text-5xl font-bold tracking-tight text-ink">{it.value}</span>{it.meta && <span className="text-sm text-muted">{it.meta}</span>}</p>
        {it.body && <p className="mt-3 text-sm text-muted">{it.body}</p>}
        <ul className="mt-6 flex-1 space-y-2.5">{String(it.list || '').split('\n').map((x) => x.trim()).filter(Boolean).map((x) => <li key={x} className="flex gap-2.5 text-[0.95rem] text-body"><Check size={16} className="mt-1 shrink-0 text-good" />{x}</li>)}</ul>
        {it.href && <Link href={it.href} className="btn-primary mt-7 justify-center">{it.linkLabel || 'Choose plan'}</Link>}
      </div>);
    default: return ( // service
      <div className="card group flex h-full flex-col p-8 transition duration-500 hover:-translate-y-1 hover:border-signal/40 hover:shadow-[0_24px_60px_-30px_rgb(var(--signal)/.5)]">
        <span className="grid h-[60px] w-[60px] place-items-center rounded-2xl border border-line bg-raised text-signal transition duration-500 group-hover:border-signal/50 group-hover:bg-signal group-hover:text-white"><Icon name={icon} size={22} /></span>
        <h3 className="mt-7 font-display text-[1.35rem] font-bold leading-snug tracking-tight text-ink">{it.title}</h3>
        <p className="mt-3 flex-1 text-[1rem] leading-relaxed text-muted">{it.body}</p>
        <More it={it} label={link} />
      </div>);
  }
}

function Custom({ it, i, html, css }) {
  const out = String(html || '').replace(/\{(\w+)\}/g, (_, k) => (k === 'link' ? esc(it.href || '#') : k === 'number' ? String(i + 1).padStart(2, '0') : esc(it[k] ?? '')))
    .replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+=("[^"]*"|'[^']*')/gi, '');
  return <div data-cards="" className="h-full"><style dangerouslySetInnerHTML={{ __html: scope(css) }} /><div className="h-full" dangerouslySetInnerHTML={{ __html: out }} /></div>;
}

const COLS = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 xl:grid-cols-3', 4: 'md:grid-cols-2 xl:grid-cols-4' };

/* A set of cards as a grid or a carousel. cfg: { template, layout, columns, autoplay, items, linkLabel, html, css }. */
export default function Cards({ cfg }) {
  const items = (cfg.items || []).filter((x) => x && (x.title || x.body || x.value));
  const t = cfg.template || 'service'; const carousel = cfg.layout === 'carousel';
  const ref = useRef(null); const [page, setPage] = useState(0); const [pages, setPages] = useState(1);
  const cols = Number(cfg.columns) || 3;
  const render = (it, i) => (t === 'custom' ? <Custom key={i} it={it} i={i} html={cfg.html} css={cfg.css} /> : <Card key={i} t={t} it={it} i={i} link={cfg.linkLabel || 'Learn more'} />);

  useEffect(() => {
    if (!carousel || !ref.current) return;
    const el = ref.current;
    const calc = () => setPages(el.scrollWidth > el.clientWidth + 8 ? Math.max(2, Math.ceil(el.scrollWidth / el.clientWidth - 0.05)) : 1);
    const on = () => setPage(Math.round((el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth)) * (Math.max(2, Math.ceil(el.scrollWidth / el.clientWidth - 0.05)) - 1)));
    calc(); el.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', calc);
    let timer; if (cfg.autoplay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => { if (el.matches(':hover') || el.contains(document.activeElement)) return; const next = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 ? 0 : el.scrollLeft + el.clientWidth; el.scrollTo({ left: next, behavior: 'smooth' }); }, 5000);
    return () => { el.removeEventListener('scroll', on); window.removeEventListener('resize', calc); clearInterval(timer); };
  }, [carousel, cfg.autoplay, items.length]);
  if (!items.length) return <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">No cards yet.</p>;

  if (!carousel) return <div className={cn('grid gap-5 sm:gap-6', COLS[cols] || COLS[3])}>{items.map((it, i) => <div key={i} data-reveal className="h-full">{render(it, i)}</div>)}</div>;
  const go = (d) => { const el = ref.current; if (!el) return; const c = el.firstElementChild; el.scrollBy({ left: d * ((c?.offsetWidth || el.clientWidth) + 24), behavior: 'smooth' }); };
  // Always show a part of the next card, so it is clear the row slides, even with only 3 cards.
  const w = { 1: 'basis-full', 2: 'basis-[88%] md:basis-[calc((100%-0.75rem)/1.5)]', 3: 'basis-[86%] md:basis-[calc((100%-0.75rem)/1.5)] xl:basis-[calc((100%-2.25rem)/2.5)]', 4: 'basis-[86%] md:basis-[calc((100%-0.75rem)/1.5)] xl:basis-[calc((100%-3.75rem)/3.5)]' }[cols] || 'basis-full';
  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label="Cards">
      <div ref={ref} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-2" style={{ scrollbarWidth: 'none' }}>
        {items.map((it, i) => <div key={i} className={cn('shrink-0 snap-start', w)}>{render(it, i)}</div>)}
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
