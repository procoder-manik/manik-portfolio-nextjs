import { ArrowUpRight } from 'lucide-react';

/* A website made for a client (Admin > Pitch websites, "Show as a card"). Opens the live one-page site in a new tab. */
export default function PitchSiteCard({ site: s }) {
  const accent = /^#[0-9a-f]{3,8}$/i.test(s.accent || '') ? s.accent : '#2563EB';
  const meta = [s.business, s.location].filter(Boolean).join(' · ');
  return (
    <a href={`/${s.slug}`} target="_blank" rel="noopener" className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-surface transition duration-500 hover:-translate-y-1 hover:border-signal/60 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,.45)]">
      <div className="relative aspect-[3/2] overflow-hidden border-b border-line">
        {s.cover
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={s.cover} alt={`${s.name} website`} loading="lazy" decoding="async" className="h-full w-full object-cover object-top transition duration-[1.2s] ease-out group-hover:scale-[1.04]" />
          : (
            <div className="grid h-full w-full place-items-center p-6 text-center text-white" style={{ background: `radial-gradient(120% 90% at 85% 0%, ${accent}cc, transparent 60%), linear-gradient(150deg, #0b1220, #111827)` }}>
              <span>
                <span className="block text-2xl font-semibold tracking-[-0.02em]">{s.name}</span>
                {meta && <span className="mt-2 block text-sm text-white/70">{meta}</span>}
              </span>
            </div>
          )}
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur">One-page website</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        {meta && <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{meta}</p>}
        <h3 className="mt-2 text-xl font-semibold text-ink">{s.client || s.name}</h3>
        {s.summary && <p className="mt-2 line-clamp-3 text-[0.95rem] text-body">{s.summary}</p>}
        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-ink transition group-hover:text-signal">View website <ArrowUpRight size={15} /></span>
      </div>
    </a>
  );
}
