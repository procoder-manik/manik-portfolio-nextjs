'use client';
import { useMemo, useState } from 'react';
import { Search, Globe, Workflow, Wrench, Gauge, ShieldCheck, CreditCard, User, Server, HelpCircle, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { topicIcon } from '@/lib/help';

const ICONS = { Search, Globe, Workflow, Wrench, Gauge, ShieldCheck, CreditCard, User, Server, HelpCircle };

/* FAQ with a search box and a chip for each service.
   Each group has a large heading (h2) with its icon and count; each question (h3) is its own card that opens in place. */
export default function FaqExplorer({ groups = [] }) {
  const [q, setQ] = useState(''); const [cat, setCat] = useState('All'); const [open, setOpen] = useState('');
  const term = q.trim().toLowerCase();
  const shown = useMemo(() => groups.filter((g) => cat === 'All' || g.name === cat).map((g) => ({ ...g, items: g.items.filter((i) => !term || `${i.question} ${i.answer}`.toLowerCase().includes(term)) })).filter((g) => g.items.length), [groups, cat, term]);
  const total = shown.reduce((n, g) => n + g.items.length, 0);
  return (
    <div>
      <label className="relative block max-w-xl"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions, for example price, SEO, payment" aria-label="Search the FAQ" className="field py-3.5 pl-11" /></label>
      <div className="mt-5 flex flex-wrap gap-2">
        {['All', ...groups.map((g) => g.name)].map((c) => <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c} className={cn('rounded-full border px-4 py-2 text-sm font-medium transition', cat === c ? 'border-signal bg-signal text-white' : 'border-line text-body hover:border-ink/40')}>{c}</button>)}
      </div>
      {term && <p className="mt-5 text-sm text-muted" aria-live="polite">{total} {total === 1 ? 'answer' : 'answers'} found</p>}

      <div className="mt-14 space-y-16 sm:space-y-20">
        {shown.map((g) => {
          const Icon = ICONS[topicIcon(g.name)] || HelpCircle;
          return (
            <section key={g.name} aria-labelledby={`faq-${g.slug}`} id={g.slug} className="scroll-mt-28">
              <div className="mb-6 flex items-center gap-4 border-b border-line pb-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-signal/30 bg-signal/10 text-signal"><Icon size={22} /></span>
                <div className="min-w-0 flex-1">
                  <h2 id={`faq-${g.slug}`} className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.85rem]">{g.name}</h2>
                  <p className="mt-1 text-sm text-muted">{g.items.length} {g.items.length === 1 ? 'question' : 'questions'}</p>
                </div>
              </div>
              <div className="space-y-3">
                {g.items.map((i) => {
                  const id = `${g.slug}-${i.id}`; const on = open === id || Boolean(term);
                  return (
                    <div key={id} className={cn('rounded-2xl border bg-surface/50 transition', on ? 'border-signal/50 bg-surface shadow-[0_10px_40px_-20px_rgb(var(--signal)/0.6)]' : 'border-line hover:border-ink/25')}>
                      <h3 className="m-0">
                        <button type="button" aria-expanded={on} aria-controls={`a-${id}`} onClick={() => setOpen(open === id ? '' : id)} className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6">
                          <span className={cn('min-w-0 flex-1 font-display text-[1.05rem] font-semibold leading-snug transition sm:text-[1.15rem]', on ? 'text-signal' : 'text-ink')}>{i.question}</span>
                          <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full border transition', on ? 'border-signal bg-signal text-white' : 'border-line text-muted')}>{on ? <Minus size={15} /> : <Plus size={15} />}</span>
                        </button>
                      </h3>
                      <div id={`a-${id}`} hidden={!on} className="px-5 pb-6 sm:px-6">
                        <p className="max-w-3xl whitespace-pre-line border-l-2 border-signal/40 pl-4 text-[1rem] leading-relaxed text-body">{i.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
        {!shown.length && <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No question matches. Try another word, or ask me directly.</p>}
      </div>
    </div>
  );
}


