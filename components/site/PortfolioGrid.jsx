'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { cn } from '@/lib/utils';

const label = (p) => (p.platformType === 'custom' ? 'Custom code' : p.cms || 'Other');

export default function PortfolioGrid({ projects }) {
  const [f, setF] = useState('All');
  const [tech, setTech] = useState('');
  const [q, setQ] = useState('');
  const filters = useMemo(() => {
    const counts = {}; projects.forEach((p) => { counts[label(p)] = (counts[label(p)] || 0) + 1; });
    return [['All', projects.length], ...Object.entries(counts).sort((a, b) => b[1] - a[1])];
  }, [projects]);
  const techs = useMemo(() => [...new Set(projects.flatMap((p) => p.technologies || []))].sort(), [projects]);
  const list = projects.filter((p) => (f === 'All' || label(p) === f) && (!tech || (p.technologies || []).includes(tech)) &&
    (!q || `${p.title} ${p.industry} ${p.summary} ${(p.services || []).join(' ')}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by platform">
          {filters.map(([name, n]) => (
            <button key={name} role="tab" aria-selected={f === name} onClick={() => setF(name)}
              className={cn('relative rounded-full border px-4 py-2 text-[0.92rem] font-medium transition', f === name ? 'border-transparent text-white' : 'border-line text-body hover:text-ink')}>
              {f === name && <motion.span layoutId="pf-pill" className="absolute inset-0 -z-10 rounded-full bg-signal" transition={{ type: 'spring', bounce: .2, duration: .5 }} />}
              {name} <span className={f === name ? 'text-white/70' : 'text-muted'}>{n}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {techs.length > 0 && (
            <select value={tech} onChange={(e) => setTech(e.target.value)} className="field w-auto py-2.5 text-sm" aria-label="Filter by technology">
              <option value="">Any technology</option>{techs.map((t) => <option key={t}>{t}</option>)}
            </select>
          )}
          <label className="relative block">
            <span className="sr-only">Search projects</span>
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects" className="field w-full py-2.5 pl-10 text-sm sm:w-56" />
          </label>
        </div>
      </div>
      <motion.div layout className="grid gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.div key={p.slug} layout initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .4, ease: [0.16, 1, 0.3, 1] }}>
              <ProjectCard project={p} priority={i < 3} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {!list.length && <p className="py-20 text-center text-muted">No projects match. Clear the search or pick another filter.</p>}
    </div>
  );
}
