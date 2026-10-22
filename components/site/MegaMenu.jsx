'use client';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import Icon from './Icon';
import { cn } from '@/lib/utils';

const isExt = (h) => /^https?:/.test(h || '');
const A = ({ href, children, onGo, className, ...p }) => (isExt(href)
  ? <a href={href} target="_blank" rel="noopener noreferrer" onClick={onGo} className={className} {...p}>{children}</a>
  : <Link href={href || '#'} onClick={onGo} className={className} {...p}>{children}</Link>);

/* One entry with an icon tile, a title and a short line (the "Untitled UI" look). */
function Rich({ it, onGo }) {
  return (
    <A href={it.href} onGo={onGo} className="group/it flex items-start gap-3 rounded-2xl p-3 transition hover:bg-raised">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-signal shadow-sm transition group-hover/it:border-signal/50 group-hover/it:bg-signal/10"><Icon name={it.icon || 'Sparkles'} size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-display text-[0.97rem] font-semibold leading-tight text-ink">
          {it.label}
          {it.badge && <span className="rounded-full bg-signal/15 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-signal">{it.badge}</span>}
          <ArrowUpRight size={14} className="-translate-x-1 text-muted opacity-0 transition group-hover/it:translate-x-0 group-hover/it:opacity-100" />
        </span>
        {it.desc && <span className="mt-1 block text-[0.86rem] leading-snug text-muted">{it.desc}</span>}
      </span>
    </A>
  );
}

/* A plain link with a small line under it (used by the columns and areas designs). */
function Plain({ it, onGo }) {
  return (
    <A href={it.href} onGo={onGo} className={cn('group/pl flex items-start justify-between gap-2 rounded-xl px-3 py-2 transition hover:bg-raised', it.more && 'text-signal')}>
      <span className="min-w-0">
        <span className={cn('block text-[0.93rem] font-medium leading-tight', it.more ? 'text-signal' : 'text-ink')}>{it.label}</span>
        {it.desc && <span className="mt-0.5 block truncate text-xs text-muted">{it.desc}</span>}
      </span>
      <ArrowRight size={14} className="mt-1 shrink-0 -translate-x-1 text-signal opacity-0 transition group-hover/pl:translate-x-0 group-hover/pl:opacity-100" />
    </A>
  );
}

function Featured({ f, onGo }) {
  const a = f.accent || '';
  return (
    <A href={f.href} onGo={onGo} className="group/ft relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-2xl border border-line bg-raised p-4 transition hover:border-signal/50">
      <span className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl" style={{ background: a ? `${a}55` : 'rgb(var(--signal) / .28)' }} />
      {f.image
        ? <span className="relative mb-4 block aspect-[16/10] overflow-hidden rounded-xl border border-line bg-base"><img src={f.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover/ft:scale-[1.04]" /></span>
        : <span className="relative mb-4 grid aspect-[16/7] place-items-center overflow-hidden rounded-xl border border-line bg-base"><span className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 30% 30%, ${a || 'rgb(var(--signal))'}66, transparent 60%)` }} /><Icon name="Sparkles" size={26} className="relative text-signal" /></span>}
      <span className="relative flex flex-1 flex-col">
        {f.label && <span className="mb-2 inline-flex w-fit rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-signal">{f.label}</span>}
        <span className="font-display text-[1.08rem] font-semibold leading-snug text-ink">{f.title}</span>
        {f.text && <span className="mt-1.5 block text-[0.88rem] leading-snug text-muted">{f.text}</span>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-signal">{f.linkLabel}<ArrowRight size={15} className="transition group-hover/ft:translate-x-1" /></span>
      </span>
    </A>
  );
}

function Bottom({ links, onGo }) {
  if (!links?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-line bg-raised/60 px-6 py-3.5">
      {links.map((b) => (
        <A key={b.label} href={b.href} onGo={onGo} className="group/bt inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-signal">
          {b.icon && <Icon name={b.icon} size={16} className="text-signal" />}{b.label}<ArrowRight size={14} className="opacity-0 transition group-hover/bt:translate-x-0.5 group-hover/bt:opacity-100" />
        </A>
      ))}
    </div>
  );
}

const WIDTH = { icons: [680, 960], featured: [920, 920], columns: [980, 980], areas: [960, 960] };

/* The desktop panel. Four designs share one frame:
   icons    columns of icon tiles with a title and a line (like Untitled UI)
   featured the same list with a promo card on the right
   columns  headed link columns with a promo card (like Vitara)
   areas    built from your places: one column per place, with its landing pages */
export function MegaPanel({ mega, onGo }) {
  const { layout, columns, featured, bottom } = mega;
  const cols = Math.max(1, layout === 'icons' ? Math.min(columns.length, 3) : layout === 'featured' ? Math.min(columns.length, 2) : Math.min(columns.length, 4));
  const w = (layout === 'icons' ? WIDTH.icons[cols > 2 ? 1 : 0] : WIDTH[layout][0]);
  const side = layout !== 'icons' && featured;
  return (
    <div style={{ width: `min(${w}px, calc(100vw - 2.5rem))` }} className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-[0_44px_100px_-34px_rgba(0,0,0,.6)]">
      <div className={cn('grid gap-2 p-3', side ? 'grid-cols-[1fr_minmax(0,17.5rem)]' : 'grid-cols-1')}>
        <div className="grid gap-x-2 gap-y-4 p-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {columns.map((c, i) => (
            <div key={`${c.title}-${i}`} className="min-w-0">
              {c.title && (c.href
                ? <A href={c.href} onGo={onGo} className="mb-1.5 block px-3 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted transition hover:text-signal">{c.title}</A>
                : <p className="mb-1.5 px-3 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{c.title}</p>)}
              <div className="flex flex-col gap-0.5">
                {c.items.map((it) => (layout === 'icons' || layout === 'featured' ? <Rich key={it.label} it={it} onGo={onGo} /> : <Plain key={it.label} it={it} onGo={onGo} />))}
              </div>
            </div>
          ))}
        </div>
        {side && <Featured f={featured} onGo={onGo} />}
        {!columns.length && featured && !side && <Featured f={featured} onGo={onGo} />}
      </div>
      <Bottom links={bottom} onGo={onGo} />
    </div>
  );
}

/* The phone menu entry: tap the label to open its links. */
export function MegaMobile({ n, open, onToggle, onGo }) {
  const m = n.mega;
  return (
    <div className="rounded-2xl">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-display text-2xl font-semibold text-ink hover:bg-raised">
        {n.label}<ChevronDown size={20} className={cn('text-muted transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mb-2 space-y-4 px-2 pb-2 pt-1">
          {n.href && n.href !== '#' && <A href={n.href} onGo={onGo} className="block rounded-xl px-3 py-2 text-sm font-semibold text-signal">Open {n.label} →</A>}
          {m.columns.map((c, i) => (
            <div key={`${c.title}-${i}`}>
              {c.title && <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{c.title}</p>}
              {c.items.map((it) => (
                <A key={it.label} href={it.href} onGo={onGo} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-raised">
                  {it.icon && <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-surface text-signal"><Icon name={it.icon} size={15} /></span>}
                  <span className="min-w-0"><span className="block text-base font-medium text-ink">{it.label}</span>{it.desc && <span className="block text-xs text-muted">{it.desc}</span>}</span>
                </A>
              ))}
            </div>
          ))}
          {m.featured && <Featured f={m.featured} onGo={onGo} />}
          {m.bottom?.length > 0 && <div className="flex flex-wrap gap-x-5 gap-y-2 px-3">{m.bottom.map((b) => <A key={b.label} href={b.href} onGo={onGo} className="text-sm font-semibold text-signal">{b.label}</A>)}</div>}
        </div>
      )}
    </div>
  );
}
