'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import CardLayout from './cards/CardLayout';
import PitchSiteCard from './PitchSiteCard';
import { cn } from '@/lib/utils';

/* The Pitch websites cards. The page arrives with the list it was built with, then asks for the current list,
   so a website you add or switch on shows up at once, even while the page itself is still a saved copy.
   With tabs on and two or more categories, an All tab plus one tab per category sits above the cards. */
export default function PitchCardsLive({ initial = [], all = false, limit = 6, tabs = true, layout, columns, autoplay, interval }) {
  const [sites, setSites] = useState(initial);
  const [cat, setCat] = useState('All');
  useEffect(() => {
    let on = true;
    fetch(`/api/pitch-sites/cards?limit=${encodeURIComponent(limit)}${all ? '&all=1' : ''}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (on && Array.isArray(j?.sites)) setSites(j.sites); })
      .catch(() => {});
    return () => { on = false; };
  }, [all, limit]);

  // Categories are matched without caring about capitals, and shown the way they were first written.
  const key = (s) => (s.category || '').trim().toLowerCase();
  const cats = useMemo(() => {
    const m = new Map();
    sites.forEach((s) => { const k = key(s); if (!k) return; const c = m.get(k); m.set(k, c ? { ...c, n: c.n + 1 } : { name: s.category.trim(), n: 1 }); });
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n || a[1].name.localeCompare(b[1].name));
  }, [sites]);
  const showTabs = tabs && cats.length > 1;
  const active = showTabs && cat !== 'All' && cats.some(([k]) => k === cat) ? cat : 'All';
  const list = active === 'All' ? sites : sites.filter((s) => key(s) === active);

  if (!sites.length) return null;
  return (
    <div>
      {showTabs && (
        <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Filter websites by category">
          {[['All', { name: 'All', n: sites.length }], ...cats].map(([k, c]) => (
            <button key={k} type="button" role="tab" aria-selected={active === k} onClick={() => setCat(k)}
              className={cn('relative rounded-full border px-4 py-2 text-[0.92rem] font-medium transition', active === k ? 'border-transparent text-white' : 'border-line text-body hover:text-ink')}>
              {active === k && <motion.span layoutId="ps-pill" className="absolute inset-0 -z-10 rounded-full bg-signal" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
              {c.name} <span className={active === k ? 'text-white/70' : 'text-muted'}>{c.n}</span>
            </button>
          ))}
        </div>
      )}
      <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        <CardLayout layout={layout} columns={columns || 3} autoplay={autoplay} interval={interval} label="Websites">
          {list.map((s) => <PitchSiteCard key={s.slug} site={s} />)}
        </CardLayout>
      </motion.div>
    </div>
  );
}
