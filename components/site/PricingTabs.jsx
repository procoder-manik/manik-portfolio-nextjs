'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Clock3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, money, BILLING } from '@/lib/utils';

export default function PricingTabs({ services = [], compact }) {
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
        <motion.div key={svc.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .35, ease: [0.16, 1, 0.3, 1] }}
          className={cn('grid gap-5', svc.packages.length >= 4 ? 'md:grid-cols-2 xl:grid-cols-4' : svc.packages.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
          {svc.packages.map((p) => <PackageCard key={p.slug} p={p} />)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function PackageCard({ p }) {
  const quote = p.checkoutMode === 'quote';
  return (
    <div className={cn('relative flex flex-col rounded-[22px] border p-6 transition duration-500',
      p.popular ? 'border-signal bg-gradient-to-b from-signal/[.13] to-surface shadow-[0_40px_80px_-50px_rgb(var(--signal))]' : 'border-line bg-surface hover:border-ink/25')}>
      {p.popular && <span className="absolute -top-3 left-6 rounded-full bg-signal px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
      <h3 className="text-xl font-semibold">{p.name}</h3>
      {p.tagline && <p className="mt-2 min-h-[3rem] text-[0.95rem] text-muted">{p.tagline}</p>}
      <div className="mt-6">
        {p.priceMax ? <p className="mb-1.5 text-sm text-muted">Starts at</p> : null}
        <p className="font-display text-[2.4rem] font-bold leading-none tracking-tight text-ink">{money(p.price, p.currency)}</p>
        <p className="mt-2 text-sm text-muted">{p.priceMax ? `Up to ${money(p.priceMax, p.currency)}, ` : ''}{BILLING[p.billing] || p.billing}{p.unitNote ? `, ${p.unitNote}` : ''}</p>
      </div>
      <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6 text-[0.95rem]">
        {(p.features || []).map((f) => <li key={f} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-signal" /><span>{f}</span></li>)}
        {p.deliveryDays ? <li className="flex gap-3 text-muted"><Clock3 size={18} className="mt-0.5 shrink-0" />Delivery in about {p.deliveryDays} days</li> : null}
      </ul>
      <Link href={quote ? `/contact?service=${encodeURIComponent(p.name)}` : `/checkout/${p.slug}`} className={cn('mt-7 w-full', p.popular ? 'btn-primary' : 'btn-ghost')}>
        {p.ctaLabel || (quote ? 'Request a quote' : 'Buy now')} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
