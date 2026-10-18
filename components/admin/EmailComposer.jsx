'use client';
import { useState } from 'react';
import { Send, Loader2, X, Sparkles } from 'lucide-react';
import InfoTip from '@/components/site/InfoTip';
import { api } from './api';

/* Small composer used on orders, messages and CRM contacts. Sends a branded email. */
export default function EmailComposer({ target, defaultSubject = '', onSent, onClose, attachOptions, aiDraft = true }) {
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const [body, setBody] = useState(''); const [subject, setSubject] = useState(defaultSubject);
  const [ai, setAi] = useState({ busy: false, tone: 'friendly', note: '', warn: '', source: '', open: false });
  async function draft() {
    setAi((a) => ({ ...a, busy: true, warn: '' }));
    try {
      const j = await api('/api/admin/mail/draft', { method: 'POST', body: { ...target, tone: ai.tone, note: ai.note } });
      setBody(j.body || ''); setAi((a) => ({ ...a, busy: false, warn: j.warning || '', source: j.source }));
    } catch (e) { setAi((a) => ({ ...a, busy: false, warn: e.message })); }
  }
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try { await api('/api/admin/mail', { method: 'POST', body: { kind: 'custom', ...target, ...f } }); setMsg('Sent.'); setBody(''); setAi((a) => ({ ...a, source: '', warn: '', note: '' })); onSent?.(); }
    catch (err) { setMsg(err.message); }
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-signal/40 bg-signal/5 p-4">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold text-ink">Write an email</p>{onClose && <button type="button" onClick={onClose} aria-label="Close"><X size={16} /></button>}</div>
      {aiDraft && (
        <div className="rounded-xl border border-line bg-base/50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={draft} disabled={ai.busy} className="btn-primary btn-sm">{ai.busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{ai.busy ? 'Reading and writing...' : body ? 'Write again with AI' : 'Reply with AI'}</button>
            <select value={ai.tone} onChange={(e) => setAi({ ...ai, tone: e.target.value })} aria-label="Tone" className="field w-auto py-2 text-sm"><option value="friendly">Friendly</option><option value="professional">Professional</option><option value="short">Short</option><option value="detailed">Detailed</option></select>
            <button type="button" onClick={() => setAi({ ...ai, open: !ai.open })} className="text-xs text-muted underline hover:text-ink">{ai.open ? 'Hide my notes' : 'Add my notes'}</button>
            <InfoTip text="AI reads the whole message and writes a ready reply using your prices, FAQ and contact details. It fills the box below, so you can edit it and press Send. Set the AI provider and its key in Emails > AI reply." />
          </div>
          {ai.open && <input value={ai.note} onChange={(e) => setAi({ ...ai, note: e.target.value })} placeholder="What should the reply say? e.g. offer a 10% discount, ask for their logo" className="field mt-2 py-2 text-sm" />}
          {ai.warn && <p className="mt-2 text-xs text-amber">{ai.warn}</p>}
          {ai.source === 'ai' && !ai.warn && <p className="mt-2 text-xs text-good">AI draft ready. Read it, change anything, then send.</p>}
        </div>
      )}
      <input name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Subject" className="field py-2.5 text-sm" />
      <textarea name="message" value={body} onChange={(e) => setBody(e.target.value)} required rows={body ? 12 : 6} placeholder="Your message. It is sent in your branded email template with your signature." className="field text-sm" />
      {attachOptions && (
        <select name="attach" className="field py-2.5 text-sm" defaultValue="order"><option value="order">Add a button to the order page</option><option value="invoice">Add a button to the invoice</option></select>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className={`text-sm ${msg === 'Sent.' ? 'text-good' : 'text-bad'}`}>{msg}</span>
        <button className="btn-primary btn-sm" disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Send email</button>
      </div>
    </form>
  );
}
