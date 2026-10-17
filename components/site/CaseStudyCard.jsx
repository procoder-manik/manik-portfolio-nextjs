import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Metric({ m, big, light }) {
  return (
    <div>
      <p className={cn('font-display font-bold leading-none tracking-tight', big ? 'text-[2rem] sm:text-[2.4rem]' : 'text-2xl', light ? 'text-white' : 'text-ink')}>{m.after || m.value}</p>
      {m.before && m.after && <p className={cn('mt-2 text-xs', light ? 'text-white/60' : 'text-muted')}>from <span className="line-through decoration-1">{m.before}</span></p>}
      <p className={cn('mt-1.5 text-sm leading-snug', light ? 'text-white/80' : 'text-muted')}>{m.label}</p>
    </div>
  );
}

function Cover({ c, className }) {
  return (
    <div className={cn('relative overflow-hidden bg-raised', className)}>
      {c.cover
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={c.cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.05]" />
        : <div className="grid-paper h-full w-full" />}
      <div className="absolute inset-0 opacity-70 mix-blend-multiply" style={{ background: `linear-gradient(140deg, transparent 30%, ${c.accent || '#6391FF'}66)` }} />
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 py-1.5 pl-1.5 pr-3 text-xs font-semibold text-white backdrop-blur">
        {c.clientLogo
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={c.clientLogo} alt="" className="h-6 w-6 rounded-full bg-white object-contain p-0.5" />
          : <span className="grid h-6 w-6 place-items-center rounded-full text-[11px]" style={{ background: c.accent }}>{c.client?.[0]}</span>}
        {c.client}
      </div>
    </div>
  );
}

/* variant "feature" = large horizontal card, default = grid card */
export default function CaseStudyCard({ c, variant }) {
  const metrics = (c.metrics || []).filter((m) => m.label && (m.after || m.value)).slice(0, 3);
  const href = `/case-studies/${c.slug}`;
  if (variant === 'feature') return (
    <Link href={href} className="group grid overflow-hidden rounded-[28px] border border-line bg-surface transition duration-500 hover:border-[color:var(--a)] hover:shadow-[0_50px_100px_-60px_var(--a)] lg:grid-cols-[1.1fr_1fr]" style={{ '--a': c.accent || '#6391FF' }}>
      <Cover c={c} className="aspect-[16/11] lg:aspect-auto lg:min-h-[420px]" />
      <div className="flex flex-col p-7 sm:p-10">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="chip">{c.industry}</span>
          {c.duration && <span className="chip"><Clock3 size={12} />{c.duration}</span>}
        </div>
        <h3 className="mt-5 text-[1.7rem] font-semibold leading-tight sm:text-[2rem]">{c.title}</h3>
        <p className="mt-4 text-[1rem] text-muted">{c.summary}</p>
        {metrics.length > 0 && <div className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-3">{metrics.map((m, i) => <Metric key={i} m={m} />)}</div>}
        <span className="mt-auto inline-flex items-center gap-2 pt-8 font-semibold text-ink transition group-hover:gap-3 group-hover:text-signal">Read the case study <ArrowRight size={17} /></span>
      </div>
    </Link>
  );
  return (
    <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-surface transition duration-500 hover:-translate-y-1 hover:border-[color:var(--a)]" style={{ '--a': c.accent || '#6391FF' }}>
      <Cover c={c} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm text-muted">{c.industry}{c.duration ? ` · ${c.duration}` : ''}</p>
        <h3 className="mt-2 text-xl font-semibold leading-snug">{c.title}</h3>
        {metrics[0] && <div className="mt-5 rounded-2xl bg-raised/70 p-4"><Metric m={metrics[0]} /></div>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-ink group-hover:text-signal">Read case study <ArrowUpRight size={15} /></span>
      </div>
    </Link>
  );
}
