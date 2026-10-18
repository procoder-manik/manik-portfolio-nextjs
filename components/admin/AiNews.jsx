'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Newspaper, RefreshCw, PenLine, ExternalLink } from 'lucide-react';
import { api } from './api';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';
import { cn } from '@/lib/utils';

const ago = (d) => { if (!d) return ''; const h = Math.round((Date.now() - new Date(d)) / 36e5); return h < 1 ? 'just now' : h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`; };

/* Headlines from your AI news feeds. "Write a post" hands the headline to the AI writer as the topic. */
export default function AiNews({ onWrite, compact = false, limit = 12 }) {
  const [items, setItems] = useState(null); const [err, setErr] = useState(''); const [feeds, setFeeds] = useState(0); const [q, setQ] = useState('');
  const load = () => { setItems(null); setErr(''); api('/api/admin/ai/news').then((j) => { setItems(j.items); setFeeds(j.feeds); }).catch((e) => setErr(e.message)); };
  useEffect(load, []);
  const list = (items || []).filter((x) => !q || `${x.title} ${x.snippet}`.toLowerCase().includes(q.toLowerCase())).slice(0, limit);
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold text-ink"><Newspaper size={17} className="text-signal" />AI news<InfoTip size={14} text={SECTION_INFO['ai-news']} /></h2>
        <span className="flex items-center gap-1"><Link href="/admin/settings/aiwriter" className="text-xs text-muted hover:text-ink">Feeds</Link><button onClick={load} aria-label="Refresh" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-raised hover:text-ink"><RefreshCw size={14} /></button></span>
      </div>
      {!compact && <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter headlines" aria-label="Filter headlines" className="field mt-3 py-2 text-sm" />}
      {err && <p className="mt-3 text-sm text-bad">{err}</p>}
      {items === null && !err && <div className="grid h-24 place-items-center text-muted"><Loader2 className="animate-spin" /></div>}
      {items && !list.length && <p className="mt-4 text-sm text-muted">{feeds ? 'No headlines could be loaded right now. Check your feed addresses in AI writer settings.' : 'No feeds yet. Add some in AI writer settings.'}</p>}
      <ul className="mt-3 divide-y divide-line">
        {list.map((x) => (
          <li key={x.link} className="py-3">
            <a href={x.link} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-1.5 text-sm font-medium leading-snug text-ink hover:text-signal">{x.title}<ExternalLink size={12} className="mt-1 shrink-0 opacity-0 transition group-hover:opacity-100" /></a>
            {!compact && x.snippet && <p className="mt-1 line-clamp-2 text-xs text-muted">{x.snippet}</p>}
            <div className="mt-1.5 flex items-center justify-between gap-2"><span className="text-xs text-muted">{x.source}{x.date ? `, ${ago(x.date)}` : ''}</span>{onWrite && <button onClick={() => onWrite(x.title)} className="inline-flex items-center gap-1 text-xs font-medium text-signal hover:underline"><PenLine size={12} />Write a post</button>}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
