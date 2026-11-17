'use client';
import { useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { inkOn } from '@/lib/site-accent';

/* A website made for a client (Admin > Pitch websites, "Show as a card"). Opens the live one-page site in a new tab.
   The card shows its picture (Card picture, or the screenshot saved for it). Without one it shows a light poster in the
   website's colours, and the live website loads only while someone hovers the card on a computer, so a page of cards
   never loads a dozen whole websites at once. */
export default function PitchSiteCard({ site: s }) {
  const accent = /^#[0-9a-f]{6}$/i.test(s.accent || '') ? s.accent : '#2563EB';
  const ink = inkOn(accent);
  const name = s.client || s.name;
  const [live, setLive] = useState(false);
  const timer = useRef(null);
  const enter = () => { if (s.cover || live || !window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return; timer.current = setTimeout(() => setLive(true), 350); };
  const leave = () => clearTimeout(timer.current);
  return (
    <a href={`/${s.slug}`} target="_blank" rel="noopener" onMouseEnter={enter} onMouseLeave={leave}
      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-surface transition duration-500 hover:-translate-y-1 hover:border-signal/60 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,.45)]">
      <div className="relative aspect-[3/2] overflow-hidden border-b border-line">
        {s.cover
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={s.cover} alt={`${name} website`} loading="lazy" decoding="async" width="1200" height="800" className="h-full w-full object-cover object-top transition duration-[1.2s] ease-out group-hover:scale-[1.04]" />
          : (
            <div className="relative h-full w-full" style={{ background: `radial-gradient(120% 90% at 85% 0%, ${accent}cc, transparent 60%), linear-gradient(150deg, #0b1220, #111827)` }}>
              {/* Poster: a sketch of a website in its own colours */}
              <div aria-hidden className="absolute inset-0 p-6 text-white">
                <div className="flex items-center justify-between opacity-80"><span className="h-2.5 w-16 rounded-full bg-white/70" /><span className="flex gap-1.5"><span className="h-2 w-8 rounded-full bg-white/40" /><span className="h-2 w-8 rounded-full bg-white/40" /><span className="h-4 w-14 rounded-full" style={{ background: accent }} /></span></div>
                <p className="mt-8 max-w-[80%] font-display text-2xl font-bold leading-tight">{name}</p>
                <span className="mt-3 block h-2 w-3/5 rounded-full bg-white/30" /><span className="mt-2 block h-2 w-2/5 rounded-full bg-white/20" />
                <span className="mt-5 inline-block h-7 w-28 rounded-full" style={{ background: accent }} />
              </div>
              {live && <iframe src={`/${s.slug}?card=1`} title={`${name} website preview`} tabIndex={-1} aria-hidden="true" scrolling="no" className="pp-fade pointer-events-none absolute left-0 top-0 h-[400%] w-[400%] origin-top-left scale-[.25] border-0" />}
              {!live && <span className="absolute bottom-3 right-3 hidden rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur [@media(hover:hover)]:inline">Hover to preview</span>}
            </div>
          )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {/* Category and place on a glass capsule tinted with the website's own brand colour, above the name. */}
        <p className="flex w-fit max-w-full items-center gap-2 overflow-hidden rounded-full border py-1 pl-1 pr-3 text-[11px] font-semibold uppercase tracking-[0.08em] backdrop-blur-md transition duration-500 group-hover:-translate-y-0.5"
          style={{ background: `linear-gradient(135deg, ${accent}2e, ${accent}12)`, borderColor: `${accent}66`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.12), 0 8px 24px -14px ${accent}` }}>
          <span className="shrink-0 rounded-full px-2.5 py-1" style={{ background: accent, color: ink, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.35)' }}>{s.category || 'Website'}</span>
          {s.location && <span className="truncate text-body">{s.location}</span>}
        </p>
        <h3 className="mt-4 text-xl font-semibold text-ink">{name}</h3>
        {s.summary && <p className="mt-2 line-clamp-3 text-[0.95rem] text-body">{s.summary}</p>}
        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-ink transition group-hover:text-signal">View website <ArrowUpRight size={15} /></span>
      </div>
    </a>
  );
}
