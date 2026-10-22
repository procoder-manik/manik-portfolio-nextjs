'use client';
import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { track } from '@/lib/track';

export default function ContactForm({ services = [], defaultService = '', subject = '' }) {
  const [state, setState] = useState({ status: 'idle', error: '' });
  async function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setState({ status: 'sending', error: '' });
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { setState({ status: 'sent', error: '' }); e.target.reset(); track('generate_lead', { method: 'contact form' }); }
    else setState({ status: 'idle', error: j.error || `The message did not send (error ${r.status}). Try again or email me directly.` });
  }
  if (state.status === 'sent') return (
    <div className="card grid place-items-center p-10 text-center">
      <CheckCircle2 size={44} className="text-good" />
      <h3 className="mt-4 text-2xl font-semibold">Message sent</h3>
      <p className="mt-2 max-w-sm text-muted">Thanks. A confirmation is on its way to your inbox, and I reply within one working day.</p>
      <button className="btn-ghost btn-sm mt-6" onClick={() => setState({ status: 'idle', error: '' })}>Send another message</button>
    </div>
  );
  return (
    <form onSubmit={submit} className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {subject && <input type="hidden" name="subject" value={subject} />}
      <div><label className="label" htmlFor="c-name">Name</label><input id="c-name" name="name" required className="field" autoComplete="name" /></div>
      <div><label className="label" htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" required className="field" autoComplete="email" /></div>
      <div><label className="label" htmlFor="c-phone">Phone or WhatsApp <span className="text-muted">(optional)</span></label><input id="c-phone" name="phone" className="field" autoComplete="tel" /></div>
      <div><label className="label" htmlFor="c-budget">Budget</label>
        <select id="c-budget" name="budget" className="field"><option value="">Not sure yet</option><option>Under $300</option><option>$300 to $1,000</option><option>$1,000 to $3,000</option><option>$3,000+</option></select></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="c-service">What do you need?</label>
        <select id="c-service" name="service" defaultValue={defaultService} className="field">
          <option value="">Choose a service</option>
          {defaultService && !services.includes(defaultService) && <option>{defaultService}</option>}
          {services.map((s) => <option key={s}>{s}</option>)}<option>Something else</option>
        </select></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="c-msg">Project details</label>
        <textarea id="c-msg" name="message" rows={6} required minLength={10} className="field resize-y" placeholder="What are you building, who is it for, and when do you need it?" /></div>
      {state.error && <p role="alert" className="sm:col-span-2 rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{state.error}</p>}
      <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">Your details are only used to reply to you.</p>
        <button className="btn-primary" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'Sending…' : 'Send message'} <Send size={16} /></button>
      </div>
    </form>
  );
}
