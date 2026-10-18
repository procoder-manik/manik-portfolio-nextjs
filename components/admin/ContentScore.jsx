'use client';
import { useState } from 'react';
import { ChevronDown, Loader2, Wand2, Sparkles } from 'lucide-react';
import InfoTip from '@/components/site/InfoTip';
import { cn } from '@/lib/utils';

const dot = { good: 'bg-good', ok: 'bg-amber', bad: 'bg-bad' };
const txt = { good: 'text-good', ok: 'text-amber', bad: 'text-bad' };

/* NeuronWriter style score: ring, six groups with points, flagged AI phrases and one-click fixes. */
export default function ContentScore({ r, busy, onHumanize, onFixSeo, canFix }) {
  const [open, setOpen] = useState({});
  const circ = 2 * Math.PI * 34;
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center gap-4">
        <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0 -rotate-90" aria-hidden>
          <circle cx="42" cy="42" r="34" fill="none" strokeWidth="8" className="stroke-line" />
          <circle cx="42" cy="42" r="34" fill="none" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(r.score / 100) * circ} ${circ}`} className={cn('transition-all duration-700', r.tone === 'good' ? 'stroke-good' : r.tone === 'ok' ? 'stroke-amber' : 'stroke-bad')} />
        </svg>
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">Content score<InfoTip text="A 0 to 100 grade of this post: keyword targeting, depth, structure, readability, media and links, and human voice. 80 and above is strong. It is a guide: a clear, useful post for people always comes first." /></p>
          <p className={cn('font-display text-4xl font-bold leading-none tabular-nums', txt[r.tone])}>{r.score}<span className="text-base font-normal text-muted"> / 100</span></p>
          <p className="mt-1 text-xs text-muted">{r.words} words, {r.headings.h2} sections</p>
        </div>
      </div>
      {canFix && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onHumanize} disabled={busy} className="btn-ghost btn-sm">{busy === 'humanize' ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}Make it more human</button>
          <button onClick={onFixSeo} disabled={busy} className="btn-ghost btn-sm">{busy === 'seo' ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}Add missing keywords</button>
        </div>
      )}
      <div className="mt-4 space-y-2">
        {r.groups.map((g) => {
          const pct = g.got / g.max; const tone = pct >= 0.85 ? 'good' : pct >= 0.55 ? 'ok' : 'bad'; const isOpen = open[g.name] ?? tone !== 'good';
          return (
            <div key={g.name} className="rounded-xl border border-line bg-base/40">
              <button type="button" onClick={() => setOpen({ ...open, [g.name]: !isOpen })} className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm font-medium text-ink"><span>{g.name}</span><span className="flex items-center gap-2 text-xs"><span className={cn('tabular-nums', txt[tone])}>{Math.round(g.got)} / {g.max}</span><ChevronDown size={14} className={cn('text-muted transition', isOpen ? '' : '-rotate-90')} /></span></button>
              {isOpen && <ul className="space-y-1.5 border-t border-line px-3.5 py-3">{g.rows.map((x, i) => <li key={i} className="flex items-start gap-2.5 text-[0.84rem] text-body"><span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', dot[x.status])} /><span>{x.label}{x.status !== 'good' && <InfoTip className="ml-1 align-middle" size={12} text={x.tip} />}</span></li>)}</ul>}
            </div>
          );
        })}
      </div>
      {r.ai.hits.length > 0 && (
        <div className="mt-4"><p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">Words and phrases that sound like AI<InfoTip size={12} text="Stock phrases that readers and search quality systems associate with unedited AI text. Rewrite them in your own words or press Make it more human." /></p>
          <div className="flex flex-wrap gap-1.5">{r.ai.hits.slice(0, 16).map((h) => <span key={h.phrase} className="rounded-full bg-bad/10 px-2.5 py-1 text-xs text-bad">{h.phrase}{h.count > 1 ? ` x${h.count}` : ''}</span>)}</div></div>
      )}
      {(r.missingSecondary.length > 0 || r.missingTerms.length > 0) && (
        <div className="mt-4"><p className="mb-1.5 text-xs font-medium text-muted">Not used yet</p>
          <div className="flex flex-wrap gap-1.5">{[...r.missingSecondary.map((k) => [k, true]), ...r.missingTerms.slice(0, 12).map((k) => [k, false])].map(([k, s]) => <span key={k} className={cn('rounded-full px-2.5 py-1 text-xs', s ? 'bg-amber/15 text-amber' : 'bg-raised text-body')}>{k}</span>)}</div></div>
      )}
    </div>
  );
}
