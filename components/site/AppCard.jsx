import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

const STATUS = { live: ['Live', 'bg-good/15 text-good'], beta: ['Beta', 'bg-signal/15 text-signal'], 'coming-soon': ['Coming soon', 'bg-amber/15 text-amber'] };

/* One of your own products. With a landing page it opens that page on your site; otherwise the app link in a new tab. */
export default function AppCard({ app: a }) {
  const [label, tone] = STATUS[a.status] || STATUS.live;
  const accent = /^#[0-9a-f]{6}$/i.test(a.accent || '') ? a.accent : null;
  const inside = a.landing ? `/${a.landing}` : '';
  const href = inside || a.url || '';
  const cls = 'group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-surface transition duration-500 hover:-translate-y-1 hover:border-[color:var(--ac,rgb(var(--signal)))] hover:shadow-[0_34px_70px_-40px_var(--ac,rgb(var(--signal)))]';
  const style = accent ? { '--ac': accent } : undefined;
  const body = (
    <>
      {a.image && (
        <div className="relative aspect-[16/10] overflow-hidden border-b border-line" style={{ background: accent ? `radial-gradient(120% 90% at 80% 0%, ${accent}55, transparent 60%)` : undefined }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.image} alt={`${a.name} screenshot`} loading="lazy" decoding="async" className="h-full w-full object-cover object-top transition duration-[1.2s] ease-out group-hover:scale-[1.04]" />
        </div>
      )}
      <div className="relative flex flex-1 flex-col p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-2xl transition duration-700 group-hover:opacity-60" style={{ background: accent || 'rgb(var(--signal) / .4)' }} />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {a.logo
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={a.logo} alt="" className="h-12 w-12 rounded-2xl border border-line object-cover" loading="lazy" />
              : <span className="grid h-12 w-12 place-items-center rounded-2xl font-display text-lg font-bold text-white" style={{ background: accent || 'rgb(var(--signal))' }}>{a.name?.[0]}</span>}
            {a.category && <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{a.category}</span>}
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>
        </div>
        <h3 className="relative mt-5 font-display text-[1.45rem] font-bold leading-tight text-ink">{a.name}</h3>
        {a.tagline && <p className="relative mt-2 text-[0.97rem] text-muted">{a.tagline}</p>}
        {a.description && <p className="relative mt-3 line-clamp-3 text-sm text-body">{a.description}</p>}
        <div className="relative mt-auto flex flex-wrap items-center gap-2 pt-6">
          {(a.tech || []).slice(0, 3).map((t) => <span key={t} className="chip">{t}</span>)}
          {href && <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-ink transition group-hover:text-[color:var(--ac,rgb(var(--signal)))]">{inside ? <>Learn more <ArrowRight size={15} /></> : <>Open <ArrowUpRight size={15} /></>}</span>}
        </div>
      </div>
    </>
  );
  if (inside) return <Link href={inside} className={cls} style={style}>{body}</Link>;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>{body}</a>;
  return <div className={cls} style={style}>{body}</div>;
}
