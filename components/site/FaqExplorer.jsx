'use client';
import { useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/* FAQ with a search box and a chip for each service. Questions open one at a time per group. */
export default function FaqExplorer({ groups = [] }) {
  const [q, setQ] = useState(''); const [cat, setCat] = useState('All'); const [open, setOpen] = useState('');
  const term = q.trim().toLowerCase();
  const shown = useMemo(() => groups.filter((g) => cat === 'All' || g.name === cat).map((g) => ({ ...g, items: g.items.filter((i) => !term || `${i.question} ${i.answer}`.toLowerCase().includes(term)) })).filter((g) => g.items.length), [groups, cat, term]);
  return (
    <div>
      <label className="relative block max-w-xl"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions, for example price, SEO, payment" aria-label="Search the FAQ" className="field py-3.5 pl-11" /></label>
      <div className="mt-5 flex flex-wrap gap-2">
        {['All', ...groups.map((g) => g.name)].map((c) => <button key={c} type="button" onClick={() => setCat(c)} className={cn('rounded-full border px-4 py-2 text-sm font-medium transition', cat === c ? 'border-signal bg-signal text-white' : 'border-line text-body hover:border-ink/40')}>{c}</button>)}
      </div>
      <div className="mt-12 space-y-14">
        {shown.map((g) => (
          <section key={g.name} aria-labelledby={`faq-${g.slug}`}>
            <h2 id={`faq-${g.slug}`} className="mb-5 font-mono text-[0.78rem] uppercase tracking-[0.2em] text-signal">{g.name}</h2>
            <div className="divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-surface/40">
              {g.items.map((i) => {
                const id = `${g.slug}-${i.id}`; const on = open === id || Boolean(term);
                return (
                  <div key={id}>
                    <h3><button type="button" aria-expanded={on} aria-controls={`a-${id}`} onClick={() => setOpen(open === id ? '' : id)} className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-display text-[1.08rem] font-semibold text-ink transition hover:text-signal">{i.question}<ChevronDown size={18} className={cn('shrink-0 text-muted transition', on && 'rotate-180')} /></button></h3>
                    <div id={`a-${id}`} hidden={!on} className="px-6 pb-6 text-[1rem] leading-relaxed text-body"><p className="whitespace-pre-line">{i.answer}</p></div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {!shown.length && <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No question matches. Try another word, or ask me directly.</p>}
      </div>
    </div>
  );
}
