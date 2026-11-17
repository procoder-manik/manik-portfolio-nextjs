'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import CardLayout from './cards/CardLayout';
import { Search } from 'lucide-react';
import PitchSiteCard from './PitchSiteCard';
import ScrollTabs from './ScrollTabs';

/* The Pitch websites cards. The page arrives with the list it was built with, then asks for the current list,
   so a website you add or switch on shows up at once, even while the page itself is still a saved copy.
   With tabs on and two or more categories, an All tab plus one tab per category sits above the cards. */
export default function PitchCardsLive({ initial = [], all = false, limit = 6, tabs = true, layout, columns, autoplay, interval }) {
  const [sites, setSites] = useState(initial);
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
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
  const words = q.trim().toLowerCase();
  const list = sites.filter((s) => (active === 'All' || key(s) === active) &&
    (!words || [s.client, s.name, s.category, s.business, s.location, s.summary].join(' ').toLowerCase().includes(words)));

  if (!sites.length) return null;
  return (
    <div>
      {showTabs && (
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <ScrollTabs items={[{ key: 'All', name: 'All', n: sites.length }, ...cats.map(([k, c]) => ({ key: k, ...c }))]} active={active} onChange={setCat} label="Filter websites by category" pillId="ps-pill" className="lg:flex-1" />
          <label className="relative block shrink-0">
            <span className="sr-only">Search websites</span>
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search websites" className="field w-full py-2.5 pl-10 text-sm lg:w-56" />
          </label>
        </div>
      )}
      <motion.div key={`${active}|${words}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        {list.length
          ? (
            <CardLayout layout={layout} columns={columns || 3} autoplay={autoplay} interval={interval} label="Websites">
              {list.map((s) => <PitchSiteCard key={s.slug} site={s} />)}
            </CardLayout>
          )
          : <p className="py-16 text-center text-muted">No websites match. Clear the search or pick another category.</p>}
      </motion.div>
    </div>
  );
}
