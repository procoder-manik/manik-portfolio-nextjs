import { ArrowUpRight } from 'lucide-react';
import { inkOn } from '@/lib/site-accent';

/* A website made for a client (Admin > Pitch websites, "Show as a card"). Opens the live one-page site in a new tab. */
export default function PitchSiteCard({ site: s }) {
  const accent = /^#[0-9a-f]{6}$/i.test(s.accent || '') ? s.accent : '#2563EB';
  const ink = inkOn(accent);
  return (
    <a href={`/${s.slug}`} target="_blank" rel="noopener" className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-surface transition duration-500 hover:-translate-y-1 hover:border-signal/60 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,.45)]">
      <div className="relative aspect-[3/2] overflow-hidden border-b border-line">
        {s.cover
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={s.cover} alt={`${s.name} website`} loading="lazy" decoding="async" className="h-full w-full object-cover object-top transition duration-[1.2s] ease-out group-hover:scale-[1.04]" />
          : (
            <div className="h-full w-full" style={{ background: `radial-gradient(120% 90% at 85% 0%, ${accent}cc, transparent 60%), linear-gradient(150deg, #0b1220, #111827)` }}>
              <iframe src={`/${s.slug}?card=1`} title={`${s.client || s.name} website preview`} loading="lazy" tabIndex={-1} aria-hidden="true" scrolling="no"
                className="pointer-events-none h-[400%] w-[400%] origin-top-left scale-[.25] border-0 transition duration-[1.2s] ease-out group-hover:scale-[.262]" />
            </div>
          )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {/* Category and place on a glass capsule tinted with the website's own brand colour, above the name. */}
        <p className="flex w-fit max-w-full items-center gap-2 overflow-hidden rounded-full border py-1 pl-1 pr-3 text-[11px] font-semibold uppercase tracking-[0.08em] backdrop-blur-md transition duration-500 group-hover:-translate-y-0.5"
          style={{ background: `linear-gradient(135deg, ${accent}2e, ${accent}12)`, borderColor: `${accent}66`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.12), 0 8px 24px -14px ${accent}` }}>
          <span className="shrink-0 rounded-full px-2.5 py-1" style={{ background: accent, color: ink, boxShadow: `inset 0 1px 0 rgba(255,255,255,.35)` }}>{s.category || 'Website'}</span>
          {s.location && <span className="truncate text-body">{s.location}</span>}
        </p>
        <h3 className="mt-4 text-xl font-semibold text-ink">{s.client || s.name}</h3>
        {s.summary && <p className="mt-2 line-clamp-3 text-[0.95rem] text-body">{s.summary}</p>}
        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-ink transition group-hover:text-signal">View website <ArrowUpRight size={15} /></span>
      </div>
    </a>
  );
}
