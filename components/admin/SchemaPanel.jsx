'use client';
import { useContext, useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw, Copy, Check, ChevronDown, ExternalLink, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { api } from './api';
import { InfoScope } from './Fields';
import { cn } from '@/lib/utils';

const DOT = { good: 'text-good', warn: 'text-amber', bad: 'text-bad', info: 'text-signal' };
const ICON = { good: CheckCircle2, warn: AlertTriangle, bad: AlertTriangle, info: Info };

/* Shows the schema this page prints for Google, built from the form as it is now. It updates itself while you edit.
   Rebuild schema recalculates it from the content and refreshes the live page. */
export default function SchemaPanel({ doc }) {
  const resource = useContext(InfoScope);
  const [res, setRes] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [open, setOpen] = useState(false); const [copied, setCopied] = useState(false); const [done, setDone] = useState(false);
  const t = useRef(0); const first = useRef(true);
  const ok = ['posts', 'projects', 'case-studies', 'pages', 'categories'].includes(resource);

  const run = async (rebuild) => {
    setBusy(true); setErr('');
    try { const j = await api('/api/admin/schema-preview', { method: 'POST', body: { resource, doc, rebuild } }); setRes(j); if (rebuild) { setDone(true); setTimeout(() => setDone(false), 3000); } }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  useEffect(() => { if (!ok) return undefined; clearTimeout(t.current); t.current = setTimeout(() => run(false), first.current ? 50 : 900); first.current = false; return () => clearTimeout(t.current); }, [JSON.stringify([doc?.title, doc?.name, doc?.slug, doc?.content, doc?.excerpt, doc?.summary, doc?.cover, doc?.seoTitle, doc?.seoDescription, doc?.focusKeyword, doc?.keywords, doc?.schemaMarkup, doc?.category, doc?.blocks])]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ok) return null;
  const json = res?.graph ? JSON.stringify(res.graph, null, 2) : '';
  const own = (res?.parts || []).filter((p) => !['Person', 'ProfessionalService', 'WebSite'].includes(p.type));
  const shared = (res?.parts || []).filter((p) => ['Person', 'ProfessionalService', 'WebSite'].includes(p.type));
  return (
    <div className="rounded-2xl border border-line bg-base/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Schema on this page <span className="ml-1 rounded-full bg-good/15 px-2 py-0.5 text-[11px] font-normal text-good">automatic</span></p>
          <p className="mt-0.5 text-xs text-muted">Built from the page content when it is shown, so it stays up to date by itself. This is exactly what Google will read.</p>
        </div>
        <button type="button" onClick={() => run(true)} disabled={busy} className="btn-ghost btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : done ? <Check size={14} /> : <RefreshCw size={14} />}{done ? 'Rebuilt' : 'Rebuild schema'}</button>
      </div>
      {err && <p className="mt-3 text-sm text-bad">{err}</p>}
      {!res && !err && <div className="mt-4 grid h-16 place-items-center text-muted"><Loader2 className="animate-spin" /></div>}
      {res && (<>
        <ul className="mt-4 space-y-2">
          {own.map((p, i) => <li key={`${p.type}-${i}`} className="rounded-xl border border-line bg-surface/60 px-3.5 py-2.5 text-sm"><span className="font-medium text-ink">{p.type}{p.count ? ` (${p.count} questions)` : ''}</span><span className="block text-xs leading-relaxed text-muted">{p.explain}</span></li>)}
          {shared.length > 0 && <li className="px-1 text-xs text-muted">Also on every page: {shared.map((p) => p.type).join(', ')}. They describe you, your business and the site.</li>}
        </ul>
        <ul className="mt-4 space-y-1.5">
          {res.checks.map((c, i) => { const I = ICON[c.level] || Info; return <li key={i} className="flex items-start gap-2 text-[0.84rem] text-body"><I size={15} className={cn('mt-0.5 shrink-0', DOT[c.level])} />{c.text}</li>; })}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <button type="button" onClick={() => setOpen(!open)} className="inline-flex items-center gap-1.5 text-signal hover:underline"><ChevronDown size={14} className={cn('transition', open ? '' : '-rotate-90')} />{open ? 'Hide' : 'Show'} the JSON-LD code</button>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 1800); }} className="inline-flex items-center gap-1.5 text-signal hover:underline">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button>
          <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-signal hover:underline">Test in Google<ExternalLink size={12} /></a>
        </div>
        {open && <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-base/70 p-4 text-xs leading-relaxed text-body">{json}</pre>}
        <p className="mt-3 text-xs text-muted">Unsaved changes are included. Save and publish to put them on the live page.</p>
      </>)}
    </div>
  );
}
