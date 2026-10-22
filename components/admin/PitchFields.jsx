'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, ExternalLink, Send, Loader2 } from 'lucide-react';
import Dialog from './Dialog';
import { api } from './api';
import { fmtDate } from '@/lib/utils';

export const pitchUrl = (d) => (typeof window === 'undefined' || !d?.code ? '' : `${window.location.origin}${d.customPath || (d.page ? `/service-areas/${d.page}` : '/')}?p=${d.code}`);

function CopyBtn({ text, label = 'Copy link' }) {
  const [ok, setOk] = useState(false);
  return <button type="button" disabled={!text} onClick={() => { navigator.clipboard?.writeText(text).catch(() => {}); setOk(true); setTimeout(() => setOk(false), 1600); }} className="btn-primary btn-sm shrink-0">{ok ? <Check size={14} /> : <Copy size={14} />}{ok ? 'Copied' : label}</button>;
}

/* The link to send. Shown once the pitch is saved (the code is made when it is created). */
export function PitchLink({ doc }) {
  const url = pitchUrl(doc);
  return (
    <div className="rounded-2xl border border-signal/30 bg-signal/10 p-4">
      <p className="text-sm font-semibold text-ink">The link to send</p>
      {url ? (<>
        <p className="mt-2 break-all rounded-xl border border-line bg-base/60 px-3 py-2 font-mono text-xs text-body">{url}</p>
        <div className="mt-3 flex flex-wrap gap-2"><CopyBtn text={url} /><a href={url} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm"><ExternalLink size={14} />Open as the prospect (counts as a view)</a></div>
        <p className="mt-2 text-xs text-muted">Only people who use this exact link are counted. Link previews in WhatsApp, Slack or LinkedIn are not counted as opens.</p>
      </>) : <p className="mt-1 text-sm text-muted">Save the pitch and the link appears here.</p>}
    </div>
  );
}

/* What the prospect did: opens, pages, device, and whether they wrote to you. */
export function PitchStats({ doc }) {
  const log = [...(doc.log || [])].reverse();
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {[['Opened', doc.views || 0], ['First opened', doc.firstViewAt ? fmtDate(doc.firstViewAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not yet'], ['Wrote to you', doc.enquiredAt ? fmtDate(doc.enquiredAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not yet']].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line bg-base/50 px-4 py-3"><p className="text-xs text-muted">{k}</p><p className="mt-0.5 font-display text-lg font-semibold text-ink">{v}</p></div>
        ))}
      </div>
      {log.length > 0 ? (
        <ul className="divide-y divide-line rounded-xl border border-line text-sm">
          {log.slice(0, 20).map((l, i) => <li key={i} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"><span className="font-mono text-xs text-ink">{l.path}</span><span className="text-xs text-muted">{l.device}{l.from ? ` · from ${l.from}` : ''} · {fmtDate(l.at, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span></li>)}
        </ul>
      ) : <p className="text-sm text-muted">No visits yet. When they open the link, every page they look at shows here.</p>}
    </div>
  );
}

/* Header button on a service area page: make a pitch link for one prospect in two clicks. */
export function PitchLinkButton({ slug }) {
  const [open, setOpen] = useState(false); const [name, setName] = useState(''); const [company, setCompany] = useState('');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [made, setMade] = useState(null);
  const make = async () => {
    setBusy(true); setErr('');
    try { const j = await api('/api/admin/pitches', { method: 'POST', body: { name, company, page: slug, status: 'sent' } }); setMade(j.item); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const close = () => { setOpen(false); setMade(null); setName(''); setCompany(''); setErr(''); };
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost btn-sm"><Send size={14} className="text-signal" />Pitch link</button>
      <Dialog open={open} onClose={busy ? undefined : close} title="Make a link for one prospect">
        {!made ? (
          <div className="space-y-4">
            <p className="text-sm text-muted">You get a link to this page that is only for them. You will see when they open it and what else they look at.</p>
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Who is it for? <span className="text-bad">*</span></span><input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Sarah Lee" autoFocus /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Business</span><input className="field" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Lee Family Dental" /></label>
            {err && <p className="text-sm text-bad">{err}</p>}
            <div className="flex justify-between border-t border-line pt-4"><button onClick={close} className="btn-ghost btn-sm">Cancel</button><button onClick={make} disabled={busy || name.trim().length < 2} className="btn-primary btn-sm">{busy && <Loader2 size={14} className="animate-spin" />}Make the link</button></div>
          </div>
        ) : (
          <div className="space-y-4">
            <PitchLink doc={made} />
            <div className="flex justify-between border-t border-line pt-4"><button onClick={close} className="btn-ghost btn-sm">Done</button><Link href={`/admin/pitches/${made._id}`} className="btn-ghost btn-sm">Open this pitch</Link></div>
          </div>
        )}
      </Dialog>
    </>
  );
}
