'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2, CheckCircle2, X, Square } from 'lucide-react';
import Dialog from './Dialog';
import { api } from './api';
import { cn, slugify } from '@/lib/utils';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function call(body, onWait, stop) {
  for (let n = 0; ; n++) {
    try { return await api('/api/admin/ai/bulk', { method: 'POST', body }); }
    catch (e) {
      if (e.status !== 429 || n >= 3) throw e;
      for (let s = 25; s > 0 && !stop.current; s--) { onWait(s); await sleep(1000); }
      onWait(0); if (stop.current) throw new Error('Stopped.');
    }
  }
}
/* "Dentists | I built a clinic site" -> { niche, notes } */
const parse = (t) => t.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 8).map((l) => { const [n, ...r] = l.split('|'); return { niche: n.trim(), notes: r.join('|').trim() }; }).filter((x) => x.niche);
const MAX = 24;

/* Makes landing pages for every combination of niche and place, as drafts: dentists x New York, dentists x Houston... */
export default function AreaPages({ onDone }) {
  const [open, setOpen] = useState(false); const [places, setPlaces] = useState([]); const [services, setServices] = useState([]);
  const [service, setService] = useState(''); const [text, setText] = useState(''); const [picked, setPicked] = useState([]);
  const [log, setLog] = useState([]); const [busy, setBusy] = useState(false); const [wait, setWait] = useState(0); const stop = useRef(false);
  useEffect(() => {
    if (!open) return;
    api('/api/admin/area-categories').then((j) => setPlaces(j.items || [])).catch(() => {});
    api('/api/admin/services').then((j) => { const s = (j.items || []).filter((x) => x.active !== false); setServices(s); if (s[0] && !service) setService(s[0].slug); }).catch(() => {});
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const niches = parse(text);
  const combos = niches.flatMap((n) => picked.map((p) => ({ ...n, area: p }))).slice(0, MAX);
  const total = niches.length * picked.length;
  const finished = !busy && log.length > 0; const ok = log.filter((x) => x.s === 'ok').length;
  const toggle = (slug) => setPicked((a) => (a.includes(slug) ? a.filter((x) => x !== slug) : [...a, slug]));
  const nameOf = (slug) => places.find((p) => p.slug === slug)?.name || slug;
  const run = async () => {
    stop.current = false; setBusy(true); setLog([]);
    for (const c of combos) {
      if (stop.current) break;
      const label = `${c.niche} in ${nameOf(c.area)}`;
      try {
        const j = await call({ task: 'areaPage', area: c.area, niche: c.niche, service, notes: c.notes }, setWait, stop);
        setLog((l) => [...l, j.skipped ? { t: label, s: 'skip', m: `A page at /service-areas/${j.slug} already exists` } : { t: label, s: 'ok', m: `Draft created: ${j.created.title}`, href: `/admin/service-areas/${j.created.id}` }]);
      } catch (e) { setLog((l) => [...l, { t: label, s: 'err', m: e.message }]); if (/Too many|Sign in/.test(e.message)) break; }
    }
    setBusy(false); setWait(0); onDone?.();
  };
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost btn-sm"><Sparkles size={14} className="text-signal" />Pages for many places</button>
      <Dialog open={open} onClose={busy ? undefined : () => setOpen(false)} title="Service area pages for many places, with AI" wide>
        <div className="space-y-4">
          <p className="text-sm text-muted">Pick one service, list the niches, tick the places. The AI writes one <b className="text-ink">draft</b> landing page for every niche in every place, for example &quot;Website design for dentists in New York&quot;. Each page is written separately for its niche and place, uses only your real services and prices, and never claims a local office or local clients. Add real facts after a <b className="text-ink">|</b> on a niche line and the AI will use them.</p>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Your service</span>
            <select className="field" value={service} onChange={(e) => setService(e.target.value)}><option value="">General website design</option>{services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Niches, one per line (up to 8)</span>
            <textarea rows={4} className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder={'Dentists\nPlumbers | I built a plumbing site in Texas\nChimney repair'} /></label>
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Places {places.length === 0 && <span className="font-normal text-muted">(add places first in Admin &gt; Area locations)</span>}</p>
            <div className="flex flex-wrap gap-2">{places.map((p) => <button key={p.slug} type="button" onClick={() => toggle(p.slug)} aria-pressed={picked.includes(p.slug)} className={cn('rounded-full border px-3.5 py-1.5 text-sm', picked.includes(p.slug) ? 'border-signal bg-signal/15 text-ink' : 'border-line text-muted hover:text-ink')}>{p.flag ? `${p.flag} ` : ''}{p.name}</button>)}</div>
          </div>
          {total > 0 && !busy && !finished && <p className="text-sm text-ink">{combos.length} {combos.length === 1 ? 'page' : 'pages'} will be written.{total > MAX && <span className="text-amber"> Only the first {MAX} run at once; run it again for the rest.</span>}</p>}
          {log.length > 0 && (
            <ul className="max-h-60 divide-y divide-line overflow-y-auto rounded-xl border border-line text-sm">
              {log.map((x, i) => (
                <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                  {x.s === 'ok' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-good" /> : x.s === 'err' ? <X size={16} className="mt-0.5 shrink-0 text-bad" /> : <Square size={14} className="mt-1 shrink-0 text-muted" />}
                  <div className="min-w-0"><p className="font-medium text-ink">{x.t}</p><p className={cn('truncate text-xs', x.s === 'err' ? 'text-bad' : 'text-muted')}>{x.m}{x.href && <> · <Link href={x.href} className="text-signal">Open</Link></>}</p></div>
                </li>
              ))}
            </ul>
          )}
          {busy && <p className="flex items-center gap-2 text-sm text-body"><Loader2 size={15} className="animate-spin text-signal" />{wait ? `The free AI is busy. Trying again in ${wait} s…` : `Writing ${log.length + 1} of ${combos.length}…`}</p>}
          {finished && <p className="text-sm text-good">Done: {ok} written{log.length - ok ? `, ${log.length - ok} skipped or failed` : ''}. Open each draft, read it, add a cover if you like, then publish. Publish a few first and watch them in Search Console.</p>}
          <div className="flex justify-between gap-2 border-t border-line pt-4">
            {busy ? <button onClick={() => { stop.current = true; }} className="btn-ghost btn-sm">Stop after this one</button> : <button onClick={() => setOpen(false)} className="btn-ghost btn-sm">{finished ? 'Close' : 'Cancel'}</button>}
            {!finished && <button onClick={run} disabled={busy || !combos.length} className="btn-primary btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{busy ? 'Working…' : `Create ${combos.length || ''} ${combos.length === 1 ? 'page' : 'pages'}`}</button>}
          </div>
        </div>
      </Dialog>
    </>
  );
}
