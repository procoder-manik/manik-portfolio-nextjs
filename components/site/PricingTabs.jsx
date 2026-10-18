'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Clock3, BadgePercent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, money, BILLING } from '@/lib/utils';
import { hasChoice, yearlyTotal, yearlySavings } from '@/lib/plans';
import CardLayout from './cards/CardLayout';

const autoCols = (n) => (n >= 4 ? 4 : n === 3 ? 3 : 2);

/* lay: { layout: 'grid' | 'carousel', columns, autoplay, interval } from the admin. */
export default function PricingTabs({ services = [], compact, lay = {} }) {
  const [sel, setSel] = useState(services[0]?.slug);
  const svc = services.find((s) => s.slug === sel) || services[0];
  if (!svc) return null;
  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Services">
        {services.map((s) => (
          <button key={s.slug} role="tab" aria-selected={s.slug === sel} onClick={() => setSel(s.slug)}
            className={cn('relative rounded-full border px-4 py-2.5 text-[0.95rem] font-medium transition', s.slug === sel ? 'border-transparent text-white' : 'border-line text-body hover:text-ink')}>
            {s.slug === sel && <motion.span layoutId="svc-pill" className="absolute inset-0 -z-10 rounded-full bg-signal" transition={{ type: 'spring', bounce: .2, duration: .5 }} />}
            {s.name}
          </button>
        ))}
      </div>
      {!compact && svc.summary && <p className="lede mb-8">{svc.summary}</p>}
      <AnimatePresence mode="wait">
        <motion.div key={svc.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .35, ease: [0.16, 1, 0.3, 1] }}>
          <PackageGrid packages={svc.packages} lay={lay} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* The package cards of one service: grid or carousel, with a Monthly / Yearly switch when any package offers both. */
export function PackageGrid({ packages = [], lay = {} }) {
  const [period, setPeriod] = useState('monthly');
  const choice = packages.filter(hasChoice);
  const best = Math.max(0, ...choice.map((p) => yearlySavings(p).percent));
  return (
    <div>
      {choice.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-3" role="group" aria-label="Billing period">
          <div className="inline-flex rounded-full border border-line bg-surface p-1">
            {[['monthly', 'Monthly'], ['yearly', 'Yearly']].map(([k, l]) => (
              <button key={k} type="button" aria-pressed={period === k} onClick={() => setPeriod(k)}
                className={cn('relative rounded-full px-5 py-2 text-sm font-semibold transition', period === k ? 'text-white' : 'text-body hover:text-ink')}>
                {period === k && <motion.span layoutId={`bill-${packages[0]?.slug}`} className="absolute inset-0 -z-0 rounded-full bg-signal" transition={{ type: 'spring', bounce: .2, duration: .4 }} />}
                <span className="relative">{l}</span>
              </button>
            ))}
          </div>
          {best > 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-good/15 px-3 py-1 text-sm font-medium text-good"><BadgePercent size={15} />Save up to {best}% with yearly</span>}
        </div>
      )}
      <CardLayout layout={lay.layout || 'grid'} columns={lay.columns || autoCols(packages.length)} autoplay={lay.autoplay} interval={lay.interval} label="Packages">
        {packages.map((p) => <PackageCard key={p.slug} p={p} period={period} />)}
      </CardLayout>
    </div>
  );
}

export function PackageCard({ p, period = 'monthly' }) {
  const quote = p.checkoutMode === 'quote';
  const choice = hasChoice(p); const yearly = choice && period === 'yearly';
  const sv = yearlySavings(p);
  const shown = yearly ? yearlyTotal(p) : p.price;
  const per = choice ? (yearly ? 'per year' : 'per month') : BILLING[p.billing] || p.billing;
  const href = quote ? `/contact?service=${encodeURIComponent(p.name)}` : `/checkout/${p.slug}${yearly ? '?period=yearly' : choice ? '?period=monthly' : ''}`;
  return (
    <div className={cn('relative flex h-full flex-col rounded-[22px] border p-6 transition duration-500',
      p.popular ? 'border-signal bg-gradient-to-b from-signal/[.13] to-surface shadow-[0_40px_80px_-50px_rgb(var(--signal))]' : 'border-line bg-surface hover:border-ink/25')}>
      {p.popular && <span className="absolute -top-3 left-6 rounded-full bg-signal px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
      <h3 className="text-xl font-semibold">{p.name}</h3>
      {p.tagline && <p className="mt-2 min-h-[3rem] text-[0.95rem] text-muted">{p.tagline}</p>}
      <div className="mt-6">
        {p.priceMax && !choice ? <p className="mb-1.5 text-sm text-muted">Starts at</p> : null}
        <p className="font-display text-[2.4rem] font-bold leading-none tracking-tight text-ink">{money(shown, p.currency)}</p>
        <p className="mt-2 text-sm text-muted">{p.priceMax && !choice ? `Up to ${money(p.priceMax, p.currency)}, ` : ''}{per}{p.unitNote ? `, ${p.unitNote}` : ''}</p>
        {yearly && sv.amount > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="rounded-full bg-good/15 px-2.5 py-0.5 font-semibold text-good">You save {money(sv.amount, p.currency)}{sv.percent ? ` (${sv.percent}%)` : ''}</span>
            <span className="text-muted">about {money(sv.perMonth, p.currency)} per month</span>
          </p>
        )}
        {choice && !yearly && sv.amount > 0 && <p className="mt-3 text-sm text-muted">Pay yearly and save {money(sv.amount, p.currency)}.</p>}
      </div>
      <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6 text-[0.95rem]">
        {(p.features || []).map((f) => <li key={f} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-signal" /><span>{f}</span></li>)}
        {p.deliveryDays ? <li className="flex gap-3 text-muted"><Clock3 size={18} className="mt-0.5 shrink-0" />Delivery in about {p.deliveryDays} days</li> : null}
      </ul>
      <Link href={href} className={cn('mt-7 w-full', p.popular ? 'btn-primary' : 'btn-ghost')}>
        {p.ctaLabel || (quote ? 'Request a quote' : 'Buy now')} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
