'use client';
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const words = (s) => String(s).toLowerCase().split(/[^a-z0-9\u0980-\u09ff]+/).filter((w) => w.length > 1);

/* Search across every Help center answer. Words in the question count most, then keywords, then the answer. */
export default function HelpSearch({ index = [], size = 'lg' }) {
  const [q, setQ] = useState(''); const ref = useRef(null);
  const results = useMemo(() => {
    const terms = words(q); if (!terms.length) return [];
    return index.map((a) => {
      const qs = a.question.toLowerCase(); const ks = (a.keywords || []).join(' ').toLowerCase(); const an = a.answer.toLowerCase();
      let score = 0;
      for (const t of terms) { if (qs.includes(t)) score += 5; if (ks.includes(t)) score += 3; if (an.includes(t)) score += 1; }
      if (qs.includes(q.trim().toLowerCase())) score += 6;
      return { a, score, hit: terms.filter((t) => `${qs} ${ks} ${an}`.includes(t)).length };
    }).filter((r) => r.score > 0 && r.hit >= Math.ceil(terms.length / 2)).sort((x, y) => y.score - x.score).slice(0, 8);
  }, [q, index]);
  return (
    <div className="relative">
      <label className="relative block">
        <span className="sr-only">Search the Help center</span>
        <Search size={size === 'lg' ? 20 : 17} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
        <input ref={ref} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, for example: how much does a website cost" autoComplete="off"
          className={cn('w-full rounded-full border border-line bg-surface pl-14 pr-12 text-ink shadow-[0_20px_50px_-30px_rgba(0,0,0,.5)] outline-none transition placeholder:text-muted focus:border-signal', size === 'lg' ? 'py-4 text-[1.02rem]' : 'py-3 text-sm')} />
        {q && <button type="button" aria-label="Clear search" onClick={() => { setQ(''); ref.current?.focus(); }} className="absolute right-4 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-raised hover:text-ink"><X size={16} /></button>}
      </label>
      {q.trim() && (
        <div className="mt-3 overflow-hidden rounded-[22px] border border-line bg-surface" role="region" aria-live="polite" aria-label="Search results">
          {results.length ? (
            <ul className="divide-y divide-line">
              {results.map(({ a }) => (
                <li key={a.slug}>
                  <Link href={`/help/${a.slug}`} className="group flex items-start gap-4 px-5 py-4 transition hover:bg-raised/60">
                    <span className="min-w-0 flex-1"><span className="block text-xs text-signal">{a.topic}</span><span className="mt-0.5 block font-semibold text-ink">{a.question}</span><span className="mt-1 block text-sm leading-relaxed text-muted">{a.snippet}</span></span>
                    <ArrowRight size={16} className="mt-2 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-signal" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center"><p className="font-semibold text-ink">Nothing found for &ldquo;{q.trim()}&rdquo;</p><p className="mt-1 text-sm text-muted">Try fewer or different words, or ask me directly.</p><Link href="/contact" className="btn-primary mt-4 inline-flex">Ask me <ArrowRight size={16} /></Link></div>
          )}
        </div>
      )}
    </div>
  );
}
