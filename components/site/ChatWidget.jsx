'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { track } from '@/lib/track';

/* Built-in assistant. Answers from your FAQ, packages and contact details (or the Claude API
   when ANTHROPIC_API_KEY is set) and hands over to email, WhatsApp or a call. */
export default function ChatWidget({ cfg = {}, site = {} }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [lead, setLead] = useState({ show: false, sent: false });
  const end = useRef(null);

  useEffect(() => { try { const s = sessionStorage.getItem('mh-chat'); if (s) setMsgs(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { try { sessionStorage.setItem('mh-chat', JSON.stringify(msgs.slice(-30))); } catch {} end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs, open, lead]);

  async function ask(q) {
    const t = (q ?? text).trim(); if (!t || busy) return;
    const next = [...msgs, { role: 'user', text: t }];
    setMsgs(next); setText(''); setBusy(true);
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: next }) });
      const j = await r.json();
      setMsgs((m) => [...m, { role: 'bot', text: j.reply, actions: j.actions }]);
      if (j.lead) setLead((l) => ({ ...l, show: true }));
    } catch { setMsgs((m) => [...m, { role: 'bot', text: 'Something went wrong. Email ' + site.email + ' instead.' }]); }
    setBusy(false);
  }

  async function sendLead(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const transcript = msgs.map((m) => `${m.role === 'user' ? 'Visitor' : 'Bot'}: ${m.text}`).join('\n');
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.name, email: f.email, message: `${f.note || 'Sent from the chat.'}\n\nChat transcript:\n${transcript}`.slice(0, 4900), source: 'chat', subject: 'Chat' }) });
    if (r.ok) { setLead({ show: false, sent: true }); track('generate_lead', { method: 'chat' }); }
    else { const j = await r.json().catch(() => ({})); alert(j.error || 'Could not send. Try email instead.'); }
  }

  return (
    <div className="no-print fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 16, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .97 }} transition={{ duration: .3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 flex h-[min(560px,calc(100vh-120px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-[22px] border border-line bg-surface shadow-[0_40px_90px_-30px_rgba(0,0,0,.7)]" role="dialog" aria-label={cfg.title}>
            <div className="flex items-center gap-3 border-b border-line bg-gradient-to-br from-signal/20 to-transparent px-4 py-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <span className="relative"><img src={site.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /><span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-good ring-2 ring-surface" /></span>
              <div className="min-w-0 flex-1"><p className="font-display font-semibold text-ink">{cfg.title}</p><p className="text-xs text-muted">Replies {String(site.replyTime || '').toLowerCase()}</p></div>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-raised hover:text-ink" aria-label="Close chat"><X size={17} /></button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              <Bubble role="bot" text={cfg.greeting} />
              {!msgs.length && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {(cfg.quickReplies || []).map((q) => <button key={q} onClick={() => ask(q)} className="rounded-full border border-line px-3 py-1.5 text-xs text-body transition hover:border-signal hover:text-ink">{q}</button>)}
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i}>
                  <Bubble role={m.role} text={m.text} />
                  {m.actions?.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{m.actions.map((a) => <Link key={a.href} href={a.href} target={a.href.startsWith('http') ? '_blank' : undefined} className="rounded-full bg-signal/15 px-3 py-1.5 text-xs font-medium text-signal hover:bg-signal hover:text-white">{a.label}</Link>)}</div>}
                </div>
              ))}
              {busy && <div className="flex gap-1 px-2 py-1">{[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * .15}s` }} />)}</div>}
              {lead.show && !lead.sent && (
                <form onSubmit={sendLead} className="space-y-2 rounded-2xl border border-line bg-base/60 p-3">
                  <p className="text-sm font-medium text-ink">Leave your details for Manik</p>
                  <input name="name" required placeholder="Your name" className="field py-2 text-sm" />
                  <input name="email" type="email" required placeholder="Email" className="field py-2 text-sm" />
                  <textarea name="note" rows={2} placeholder="Anything to add? (optional)" className="field py-2 text-sm" />
                  <button className="btn-primary btn-sm w-full">Send to Manik</button>
                </form>
              )}
              {lead.sent && <p className="flex items-center gap-2 rounded-2xl bg-good/10 p-3 text-sm text-good"><CheckCircle2 size={16} />Sent. Check your inbox for a confirmation.</p>}
              <div ref={end} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="flex items-center gap-2 border-t border-line p-3">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your question" className="field flex-1 rounded-full py-2.5 text-sm" maxLength={500} aria-label="Message" />
              <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-signal text-white disabled:opacity-50" disabled={busy || !text.trim()} aria-label="Send">{busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button>
            </form>
            {cfg.whatsappHandoff && site.whatsapp && <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="border-t border-line py-2 text-center text-xs text-muted hover:text-ink">Prefer WhatsApp? Chat there instead</a>}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close chat' : 'Open chat'}
        className="group ml-auto grid h-14 w-14 place-items-center rounded-full bg-signal text-white shadow-[0_18px_40px_-12px_rgb(var(--signal))] transition hover:scale-105">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? 'x' : 'm'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: .2 }}>
            {open ? <X size={22} /> : <MessageCircle size={22} />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}

function Bubble({ role, text }) {
  const me = role === 'user';
  return <div className={`flex ${me ? 'justify-end' : ''}`}><p className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${me ? 'rounded-br-md bg-signal text-white' : 'rounded-bl-md bg-raised text-ink'}`}>{text}</p></div>;
}
