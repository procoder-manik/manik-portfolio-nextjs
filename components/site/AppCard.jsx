import { ArrowUpRight } from 'lucide-react';

const STATUS = { live: ['Live', 'bg-good/15 text-good'], beta: ['Beta', 'bg-signal/15 text-signal'], 'coming-soon': ['Coming soon', 'bg-amber/15 text-amber'] };

export default function AppCard({ app: a }) {
  const [label, tone] = STATUS[a.status] || STATUS.live;
  const Tag = a.url ? 'a' : 'div';
  return (
    <Tag {...(a.url ? { href: a.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-surface p-6 transition duration-500 hover:-translate-y-1 hover:border-signal/60 hover:shadow-[0_30px_70px_-40px_rgb(var(--signal))]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-signal/10 blur-2xl transition duration-700 group-hover:bg-signal/25" />
      <div className="relative flex items-start justify-between gap-4">
        {a.logo
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={a.logo} alt="" className="h-12 w-12 rounded-2xl border border-line object-cover" loading="lazy" />
          : <span className="grid h-12 w-12 place-items-center rounded-2xl bg-signal font-display text-lg font-bold text-white">{a.name?.[0]}</span>}
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>
      </div>
      <h3 className="relative mt-6 text-xl font-semibold">{a.name}</h3>
      {a.tagline && <p className="relative mt-2 text-[0.95rem] text-muted">{a.tagline}</p>}
      {a.description && <p className="relative mt-3 line-clamp-3 text-sm text-body">{a.description}</p>}
      <div className="relative mt-auto flex flex-wrap items-center gap-2 pt-6">
        {(a.tech || []).slice(0, 3).map((t) => <span key={t} className="chip">{t}</span>)}
        {a.url && <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-ink transition group-hover:text-signal">Open <ArrowUpRight size={15} /></span>}
      </div>
    </Tag>
  );
}
