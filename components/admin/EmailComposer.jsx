'use client';
import { useState } from 'react';
import { Send, Loader2, X } from 'lucide-react';
import { api } from './api';

/* Small composer used on orders, messages and CRM contacts. Sends a branded email. */
export default function EmailComposer({ target, defaultSubject = '', onSent, onClose, attachOptions }) {
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try { await api('/api/admin/mail', { method: 'POST', body: { kind: 'custom', ...target, ...f } }); setMsg('Sent.'); e.target.reset(); onSent?.(); }
    catch (err) { setMsg(err.message); }
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-signal/40 bg-signal/5 p-4">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold text-ink">Write an email</p>{onClose && <button type="button" onClick={onClose} aria-label="Close"><X size={16} /></button>}</div>
      <input name="subject" defaultValue={defaultSubject} required placeholder="Subject" className="field py-2.5 text-sm" />
      <textarea name="message" required rows={6} placeholder="Your message. It is sent in your branded email template with your signature." className="field text-sm" />
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
