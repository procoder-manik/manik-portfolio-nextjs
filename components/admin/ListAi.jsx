'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2, CheckCircle2, X, Square } from 'lucide-react';
import Dialog from './Dialog';
import { api } from './api';
import { cn } from '@/lib/utils';

const BULK_SEO = ['pages', 'posts', 'projects', 'case-studies', 'apps', 'categories'];
export const hasListAi = (resource) => BULK_SEO.includes(resource) || resource === 'services';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Runs one call; when the free AI is busy (429) it waits and tries again, up to three times. */
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

/* Buttons above a list that run the AI over many items at once. */
export default function ListAi({ resource, onDone }) {
  const [open, setOpen] = useState(false); const [mode, setMode] = useState('missing');
  const [rows, setRows] = useState(null); const [log, setLog] = useState([]); const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(''); const [wait, setWait] = useState(0); const stop = useRef(false);
  const isSvc = resource === 'services';

  const prepare = async (m = mode) => {
    setErr(''); setRows(null); setLog([]);
    try {
      if (isSvc) { const j = await api('/api/admin/services'); setRows((j.items || []).filter((s) => s.active !== false).map((s) => ({ id: s.slug, title: s.name }))); }
      else { const j = await api(`/api/admin/ai/bulk?resource=${resource}&mode=${m}`); setRows(j.items); }
    } catch (e) { setErr(e.message); }
  };
  const openIt = () => { setOpen(true); setMode('missing'); prepare('missing'); };
  const run = async () => {
    stop.current = false; setBusy(true); setErr(''); setLog([]);
    for (const it of rows) {
      if (stop.current) break;
      try {
        const j = await call(isSvc ? { task: 'servicePage', slug: it.id } : { task: 'seo', resource, id: it.id, mode }, setWait, stop);
        if (isSvc) setLog((l) => [...l, j.skipped ? { t: it.title, s: 'skip', m: `A page at /${j.slug} already exists` } : { t: it.title, s: 'ok', m: `Draft page created at /${j.created.slug}`, href: `/admin/pages/${j.created.id}` }]);
        else setLog((l) => [...l, { t: it.title, s: j.wrote.length ? 'ok' : 'skip', m: j.wrote.length ? (j.seoTitle || 'Written') : 'Already filled' }]);
      } catch (e) { setLog((l) => [...l, { t: it.title, s: 'err', m: e.message }]); if (/Too many|Sign in/.test(e.message)) break; }
    }
    setBusy(false); setWait(0); onDone?.();
  };
  const ok = log.filter((x) => x.s === 'ok').length; const finished = !busy && log.length > 0;
  const title = isSvc ? 'Create a page for each service with AI' : 'Write SEO for many items with AI';
  return (
    <>
      <button onClick={openIt} className="btn-ghost btn-sm"><Sparkles size={14} className="text-signal" />{isSvc ? 'Service pages with AI' : 'SEO with AI'}</button>
      <Dialog open={open} onClose={busy ? undefined : () => setOpen(false)} title={title} wide>
        <div className="space-y-4">
          {isSvc ? <p className="text-sm text-muted">Writes one full page per service from its description, packages and prices: hero, what you get, how it works, pricing for that service, FAQ and call to action, plus its SEO and Service schema. Pages start as <b className="text-ink">drafts</b> at /service-name so you can read them first. A service that already has a page at that address is skipped.</p>
            : <p className="text-sm text-muted">Writes the focus keyword, meta title (with your brand), meta description, social texts and breadcrumb title for each item, from what is on it. Nothing is deleted; you can edit any of it afterwards.</p>}
          {!isSvc && !busy && !finished && (
            <div className="flex flex-wrap items-center gap-2 text-sm">{[['missing', 'Only items with no meta title or description'], ['all', 'Every item (replaces what is there)']].map(([v, l]) => <button key={v} onClick={() => { setMode(v); prepare(v); }} className={cn('rounded-full border px-3 py-1', mode === v ? 'border-signal bg-signal/15 text-ink' : 'border-line text-muted')}>{l}</button>)}</div>
          )}
          {rows === null && !err && <p className="flex items-center gap-2 text-sm text-muted"><Loader2 size={15} className="animate-spin" />Checking…</p>}
          {rows && !busy && !finished && <p className="text-sm text-ink">{rows.length ? `${rows.length} ${rows.length === 1 ? 'item' : 'items'} will be written.` : 'Nothing to do: every item already has its SEO.'}</p>}
          {log.length > 0 && (
            <ul className="max-h-72 divide-y divide-line overflow-y-auto rounded-xl border border-line text-sm">
              {log.map((x, i) => (
                <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                  {x.s === 'ok' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-good" /> : x.s === 'err' ? <X size={16} className="mt-0.5 shrink-0 text-bad" /> : <Square size={14} className="mt-1 shrink-0 text-muted" />}
                  <div className="min-w-0"><p className="font-medium text-ink">{x.t}</p><p className={cn('truncate text-xs', x.s === 'err' ? 'text-bad' : 'text-muted')}>{x.m}{x.href && <> · <Link href={x.href} className="text-signal">Open</Link></>}</p></div>
                </li>
              ))}
            </ul>
          )}
          {busy && <p className="flex items-center gap-2 text-sm text-body"><Loader2 size={15} className="animate-spin text-signal" />{wait ? `The free AI is busy. Trying again in ${wait} s…` : `Writing ${log.length + 1} of ${rows.length}…`}</p>}
          {finished && <p className="text-sm text-good">Done: {ok} written{log.length - ok ? `, ${log.length - ok} skipped or failed` : ''}. {isSvc ? 'Open each draft, check it, add images, then publish.' : 'Check a few, then you are set.'}</p>}
          {err && <p className="rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{err}</p>}
          <div className="flex justify-between gap-2 border-t border-line pt-4">
            {busy ? <button onClick={() => { stop.current = true; }} className="btn-ghost btn-sm">Stop after this one</button> : <button onClick={() => setOpen(false)} className="btn-ghost btn-sm">{finished ? 'Close' : 'Cancel'}</button>}
            {!finished && <button onClick={run} disabled={busy || !rows?.length} className="btn-primary btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{busy ? 'Working…' : isSvc ? 'Create the pages' : 'Write it'}</button>}
          </div>
        </div>
      </Dialog>
    </>
  );
}
