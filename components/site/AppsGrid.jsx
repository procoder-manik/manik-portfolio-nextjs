'use client';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ScrollTabs from './ScrollTabs';

/* /apps: product cards with an All tab plus one tab per category (SaaS, Chrome extension, Desktop app...).
   cards: the rendered AppCard for each app, in the same order as apps. */
export default function AppsGrid({ apps = [], cards = [] }) {
  const [cat, setCat] = useState('All');
  const cats = useMemo(() => {
    const m = new Map();
    apps.forEach((a) => { const k = (a.category || '').trim(); if (k) m.set(k, (m.get(k) || 0) + 1); });
    return [...m.entries()];
  }, [apps]);
  const shown = apps.map((a, i) => [a, cards[i]]).filter(([a]) => cat === 'All' || (a.category || '').trim() === cat);
  return (
    <div>
      {cats.length > 1 && <ScrollTabs items={[{ key: 'All', name: 'All', n: apps.length }, ...cats.map(([k, n]) => ({ key: k, name: k, n }))]} active={cat} onChange={setCat} label="Filter products" pillId="apps-pill" className="mb-10" />}
      <motion.div key={cat} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {shown.map(([a, card]) => <div key={a.slug} className="h-full">{card}</div>)}
      </motion.div>
    </div>
  );
}
