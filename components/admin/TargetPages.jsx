'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2, CheckCircle2, X, Square } from 'lucide-react';
import Dialog from './Dialog';
import { api } from './api';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/utils';

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
/* "Canada | I have worked with 3 clinics here" -> { target, notes } */
const parse = (text) => text.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 12).map((l) => { const [t, ...n] = l.split('|'); return { target: t.trim(), notes: n.join('|').trim() }; }).filter((x) => x.target);

/* Writes many location pages or industry pages at once, as drafts. */
export default function TargetPages({ onDone }) {
  const [open, setOpen] = useState(false); const [kind, setKind] = useState('location'); const [services, setServices] = useState([]);
  const [service, setService] = useState(''); const [prefix, setPrefix] = useState(''); const [text, setText] = useState('');
  const [log, setLog] = useState([]); const [busy, setBusy] = useState(false); const [wait, setWait] = useState(0); const [err, setErr] = useState(''); const stop = useRef(false);
  useEffect(() => { if (open) api('/api/admin/services').then((j) => { const s = (j.items || []).filter((x) => x.active !== false); setServices(s); if (s[0] && !service) { setService(s[0].slug); setPrefix(s[0].slug); } }).catch(() => {}); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows = parse(text); const finished = !busy && log.length > 0; const ok = log.filter((x) => x.s === 'ok').length;
  const slugFor = (t) => slugify(kind === 'industry' ? `${prefix}-for-${t}` : `${prefix}-${t}`).slice(0, 70);
  const run = async () => {
    stop.current = false; setBusy(true); setErr(''); setLog([]);
    for (const r of rows) {
      if (stop.current) break;
      try {
        const j = await call({ task: 'targetPage', kind, service, prefix, target: r.target, notes: r.notes }, setWait, stop);
        setLog((l) => [...l, j.skipped ? { t: r.target, s: 'skip', m: `A page at /${j.slug} already exists` } : { t: r.target, s: 'ok', m: `Draft created at /${j.created.slug}`, href: `/admin/pages/${j.created.id}` }]);
      } catch (e) { setLog((l) => [...l, { t: r.target, s: 'err', m: e.message }]); if (/Too many|Sign in/.test(e.message)) break; }
    }
    setBusy(false); setWait(0); onDone?.();
  };
  const sample = kind === 'location' ? 'Canada\nAustralia\nUnited Kingdom\nToronto | I built the JS Law site for a firm here' : 'Law firms\nDentists\nReal estate agents\nOnline stores';
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost btn-sm"><Sparkles size={14} className="text-signal" />Location and industry pages</button>
      <Dialog open={open} onClose={busy ? undefined : () => setOpen(false)} title="Location and industry pages with AI" wide>
        <div className="space-y-4">
          <p className="text-sm text-muted">Writes one draft page for each place or industry, for example &quot;WordPress web design for law firms&quot; or &quot;Website design for clients in Canada&quot;. Each page gets its own text, SEO, Service schema and the service&apos;s pricing. Pages start as <b className="text-ink">drafts</b>. Location pages never claim a local office or local clients; add real facts after a <b className="text-ink">|</b> on a line and the AI will use them.</p>
          <div className="flex flex-wrap gap-2">{[['location', 'Places (countries, cities)'], ['industry', 'Industries (who you work for)']].map(([v, l]) => <button key={v} onClick={() => !busy && setKind(v)} className={cn('rounded-full border px-3.5 py-1.5 text-sm', kind === v ? 'border-signal bg-signal/15 text-ink' : 'border-line text-muted')}>{l}</button>)}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Service</span>
              <select className="field" value={service} onChange={(e) => { setService(e.target.value); setPrefix(e.target.value || 'web-design'); }}><option value="">General website design</option>{services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Start of the URL</span><input className="field font-mono text-sm" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="web-design" /></label>
          </div>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">{kind === 'location' ? 'Places' : 'Industries'}, one per line (up to 12)</span>
            <textarea rows={5} className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder={sample} /></label>
          {rows.length > 0 && !busy && !finished && <p className="text-xs text-muted">Addresses: {rows.slice(0, 4).map((r) => `/${slugFor(r.target)}`).join(', ')}{rows.length > 4 ? ` and ${rows.length - 4} more` : ''}</p>}
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
          {busy && <p className="flex items-center gap-2 text-sm text-body"><Loader2 size={15} className="animate-spin text-signal" />{wait ? `The free AI is busy. Trying again in ${wait} s…` : `Writing ${log.length + 1} of ${rows.length}…`}</p>}
          {finished && <p className="text-sm text-good">Done: {ok} written{log.length - ok ? `, ${log.length - ok} skipped or failed` : ''}. Open each draft, read it, add an image, then publish. Publish a few at first and watch them in Search Console.</p>}
          {err && <p className="text-sm text-bad">{err}</p>}
          <div className="flex justify-between gap-2 border-t border-line pt-4">
            {busy ? <button onClick={() => { stop.current = true; }} className="btn-ghost btn-sm">Stop after this one</button> : <button onClick={() => setOpen(false)} className="btn-ghost btn-sm">{finished ? 'Close' : 'Cancel'}</button>}
            {!finished && <button onClick={run} disabled={busy || !rows.length} className="btn-primary btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{busy ? 'Working…' : `Create ${rows.length || ''} ${rows.length === 1 ? 'page' : 'pages'}`}</button>}
          </div>
        </div>
      </Dialog>
    </>
  );
}
