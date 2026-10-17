'use client';
import { useEffect, useState } from 'react';
import { Star, Trash2, Mail, Loader2 } from 'lucide-react';
import { api } from '@/components/admin/api';
import { fmtDate } from '@/lib/utils';
import EmailComposer from '@/components/admin/EmailComposer';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';

export default function Messages() {
  const [items, setItems] = useState(null); const [sel, setSel] = useState(null);
  useEffect(() => { api('/api/admin/messages').then((j) => setItems(j.items)).catch(() => setItems([])); }, []);
  const update = async (m, patch) => { const j = await api(`/api/admin/messages/${m._id}`, { method: 'PUT', body: patch }); setItems((a) => a.map((x) => (x._id === m._id ? j.item : x))); if (sel?._id === m._id) setSel(j.item); };
  const open = (m) => { setSel(m); if (!m.read) update(m, { read: true }); };
  const del = async (m) => { if (!confirm('Delete this message?')) return; await api(`/api/admin/messages/${m._id}`, { method: 'DELETE' }); setItems((a) => a.filter((x) => x._id !== m._id)); setSel(null); };
  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold">Messages<InfoTip size={16} text={SECTION_INFO.messages} /></h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {items === null && <div className="p-10 text-center"><Loader2 className="mx-auto animate-spin text-muted" /></div>}
          {items && !items.length && <p className="p-10 text-center text-sm text-muted">No messages yet. Contact form submissions land here.</p>}
          <ul className="divide-y divide-line">
            {(items || []).map((m) => (
              <li key={m._id}><button onClick={() => open(m)} className={`block w-full px-5 py-3.5 text-left transition hover:bg-raised/50 ${sel?._id === m._id ? 'bg-raised' : ''}`}>
                <span className="flex items-center justify-between gap-3"><span className={`truncate ${m.read ? 'text-body' : 'font-semibold text-ink'}`}>{!m.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-signal" />}{m.name}</span><span className="shrink-0 text-xs text-muted">{fmtDate(m.createdAt, { month: 'short', day: 'numeric' })}</span></span>
                <span className="mt-0.5 block truncate text-sm text-muted">{m.service ? `${m.service}: ` : ''}{m.message}</span>
              </button></li>
            ))}
          </ul>
        </div>
        {sel ? (
          <article className="h-fit rounded-2xl border border-line bg-surface p-6">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-xl font-semibold">{sel.name}</h2><a href={`mailto:${sel.email}`} className="text-sm text-signal">{sel.email}</a>{sel.phone && <p className="text-sm text-muted">{sel.phone}</p>}</div>
              <div className="flex gap-1">
                <button onClick={() => update(sel, { starred: !sel.starred })} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-raised" aria-label="Star"><Star size={16} className={sel.starred ? 'fill-amber text-amber' : 'text-muted'} /></button>
                <button onClick={() => del(sel)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-raised hover:text-bad" aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
            <dl className="mt-5 flex flex-wrap gap-2 text-xs">{[sel.service, sel.budget, fmtDate(sel.createdAt, { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })].filter(Boolean).map((t) => <span key={t} className="chip">{t}</span>)}</dl>
            <p className="mt-5 whitespace-pre-wrap leading-relaxed text-ink">{sel.message}</p>
            {sel.autoReplied && <p className="mt-4 text-xs text-good">Automatic thank-you email was sent.</p>}
            {(sel.replies || []).length > 0 && (
              <div className="mt-6 space-y-3 border-t border-line pt-5">
                {sel.replies.map((r, i) => <div key={i} className="rounded-xl bg-raised p-4 text-sm"><p className="font-medium text-ink">{r.subject}</p><p className="mt-1 whitespace-pre-wrap text-body">{r.message}</p><p className="mt-2 text-xs text-muted">You replied {fmtDate(r.at, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p></div>)}
              </div>
            )}
            <div className="mt-6"><EmailComposer key={sel._id} target={{ messageId: sel._id }} defaultSubject={`Re: ${sel.service || 'your project'}`} onSent={() => api(`/api/admin/messages/${sel._id}`).then((j) => { setSel(j.item); setItems((a) => a.map((x) => (x._id === sel._id ? j.item : x))); })} /></div>
            <a href={`mailto:${sel.email}?subject=Re: your project`} className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"><Mail size={12} />Or open in your email app</a>
          </article>
        ) : <p className="hidden rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted lg:block">Pick a message to read it.</p>}
      </div>
    </div>
  );
}
