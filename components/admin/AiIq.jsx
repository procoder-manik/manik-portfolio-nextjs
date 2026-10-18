'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Brain, Loader2, Send, Sparkles, Globe, ClipboardPaste, Check, X, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { api } from './api';
import { Notice } from './Editor';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';
import { cn } from '@/lib/utils';

const EXTRA = ['General', 'Payments and process'];

export default function AiIq() {
  const [ov, setOv] = useState(null); const [err, setErr] = useState('');
  const load = useCallback(() => api('/api/admin/ai-iq').then(setOv).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const cats = ov ? [...new Set([...ov.services, ...EXTRA, ...ov.groups.map((g) => g.name)])] : EXTRA;
  const count = (n) => ov?.groups.find((g) => g.name === n)?.n || 0;
  const max = Math.max(5, ...(ov?.groups.map((g) => g.n) || [0]));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold"><Brain size={24} className="text-signal" />AI IQ<InfoTip size={16} text={SECTION_INFO['ai-iq']} /></h1>
        <div className="flex gap-2"><Link href="/admin/knowledge" className="btn-ghost btn-sm">All taught answers</Link><a href="/faq" target="_blank" rel="noopener" className="btn-ghost btn-sm"><ExternalLink size={14} />FAQ page</a><Link href="/admin/knowledge/new" className="btn-primary btn-sm">Teach one answer</Link></div>
      </div>
      {err && <Notice bad>{err}</Notice>}
      {ov?.noDB && <Notice>Connect MongoDB to save taught answers. Until then the chat uses the starter answers built into the site.</Notice>}

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex items-baseline justify-between"><h2 className="flex items-center gap-1.5 font-semibold text-ink">What your bot knows<InfoTip size={14} text="Taught answers per service. The more specific answers a service has, the better the bot and the FAQ page serve visitors. Aim for at least 5 per service." /></h2><p className="font-display text-3xl font-bold text-ink">{ov?.total ?? '-'}</p></div>
          <div className="mt-4 space-y-3">
            {cats.map((c) => { const n = count(c); return (
              <div key={c}><div className="mb-1 flex justify-between text-sm"><span className="text-body">{c}</span><span className={cn('tabular-nums', n === 0 ? 'text-bad' : n < 5 ? 'text-amber' : 'text-good')}>{n} {n === 0 ? '(teach me)' : n < 5 ? '(add more)' : ''}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-line"><div className={cn('h-full rounded-full', n < 5 ? 'bg-amber' : 'bg-good')} style={{ width: `${Math.min(100, (n / max) * 100)}%` }} /></div></div>
            ); })}
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="flex items-center gap-1.5 font-semibold text-ink">Smart replies<InfoTip size={14} text="With an AI provider and key, the bot writes natural answers from everything you taught it. Without, it matches the closest taught answer and sends it as written, which still works well." /></h2>
          <div className="mt-3 space-y-2 text-sm">
            <p className="flex items-center gap-2">{ov?.ai.chatReady ? <Check size={15} className="text-good" /> : <AlertTriangle size={15} className="text-amber" />}<span className="text-body">Chat AI: {ov?.ai.chatProvider === 'off' ? 'off (matches taught answers)' : `${ov?.ai.chatProvider}${ov?.ai.chatReady ? ' is ready' : ` needs ${ov?.ai.key || 'an API key'}`}`}</span></p>
            <p className="flex items-center gap-2">{ov?.ai.ready ? <Check size={15} className="text-good" /> : <AlertTriangle size={15} className="text-amber" />}<span className="text-body">Writing tools: {ov?.ai.ready ? `${ov.ai.provider} is ready` : 'no AI key yet'}</span></p>
          </div>
          <p className="mt-3 text-xs text-muted">Set the provider in <Link href="/admin/settings/integrations" className="text-signal">Analytics and integrations &gt; Chat</Link> and <Link href="/admin/settings/aiwriter" className="text-signal">AI writer settings</Link>. Keys go in your environment variables.</p>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <TestBot />
        <Gaps ov={ov} cats={cats} reload={load} />
      </div>
      <Teach cats={cats} reload={load} />
    </div>
  );
}

function TestBot() {
  const [q, setQ] = useState(''); const [r, setR] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function ask(e) { e.preventDefault(); setBusy(true); setErr(''); setR(null); try { setR(await api('/api/admin/ai-iq/test', { method: 'POST', body: { question: q } })); } catch (er) { setErr(er.message); } setBusy(false); }
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="flex items-center gap-1.5 font-semibold text-ink">Test your bot<InfoTip size={14} text="Ask a question the way a visitor would. You see the answer the chat would give and which taught answers it used. If it answers badly, teach it the right answer." /></h2>
      <form onSubmit={ask} className="mt-3 flex gap-2"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="How much is an SEO audit?" className="field py-2.5 text-sm" aria-label="Question" required /><button className="btn-primary btn-sm shrink-0" disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Ask</button></form>
      {err && <p className="mt-3 text-sm text-bad">{err}</p>}
      {r && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-raised p-4 text-sm text-ink"><p className="whitespace-pre-line">{r.reply}</p><p className="mt-2 text-xs text-muted">Answered by: {r.source === 'ai' ? 'AI using your taught answers' : r.source === 'taught' ? 'a taught answer, word for word' : 'basic rules (no taught answer matched)'}</p></div>
          {r.matches?.length > 0 ? <div><p className="mb-1.5 text-xs font-medium text-muted">Closest taught answers</p><ul className="space-y-1">{r.matches.map((m) => <li key={m.question} className="flex justify-between gap-3 text-sm text-body"><span className="truncate">{m.question}</span><span className="shrink-0 text-xs text-muted">{m.category}, score {m.score}</span></li>)}</ul></div> : <p className="text-sm text-amber">No taught answer matches this question. Teach one below.</p>}
        </div>
      )}
    </section>
  );
}

function Gaps({ ov, cats, reload }) {
  const [open, setOpen] = useState(null); const [f, setF] = useState({ answer: '', category: 'General', keywords: '' }); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const gaps = ov?.gaps || [];
  async function save(g) {
    setBusy(true); setErr('');
    try { await api('/api/admin/ai-iq/save', { method: 'POST', body: { items: [{ question: g.question.charAt(0).toUpperCase() + g.question.slice(1), answer: f.answer, category: f.category, keywords: f.keywords.split(',').map((x) => x.trim()).filter(Boolean), source: 'learned' }], resolveGap: g._id } }); setOpen(null); setF({ answer: '', category: 'General', keywords: '' }); reload(); } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  const ignore = async (id) => { await api(`/api/admin/ai-iq/gaps?id=${id}`, { method: 'DELETE' }); reload(); };
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between"><h2 className="flex items-center gap-1.5 font-semibold text-ink">Questions it could not answer<InfoTip size={14} text="Real questions visitors asked the chat that no taught answer matched. Answer them once and the bot learns. This is how it gets smarter every week." /></h2>{gaps.length > 0 && <button onClick={() => confirm('Mark all as handled?') && api('/api/admin/ai-iq/gaps?id=all', { method: 'DELETE' }).then(reload)} className="text-xs text-muted hover:text-ink">Clear all</button>}</div>
      {!gaps.length && <p className="mt-4 text-sm text-muted">Nothing yet. When visitors ask something new, it shows up here.</p>}
      <ul className="mt-3 divide-y divide-line">
        {gaps.map((g) => (
          <li key={g._id} className="py-3">
            <div className="flex items-start justify-between gap-3"><p className="text-sm text-ink">{g.question}<span className="ml-2 text-xs text-muted">asked {g.count}x</span></p>
              <span className="flex shrink-0 gap-1"><button className="btn-ghost btn-sm" onClick={() => { setOpen(open === g._id ? null : g._id); setErr(''); }}>Teach</button><button aria-label="Ignore" onClick={() => ignore(g._id)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-raised hover:text-bad"><X size={14} /></button></span></div>
            {open === g._id && (
              <div className="mt-3 space-y-2.5">
                <textarea value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} rows={4} placeholder="Write the answer in your own words" className="field text-sm" />
                <div className="grid gap-2 sm:grid-cols-2"><select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className="field py-2.5 text-sm" aria-label="Group">{cats.map((c) => <option key={c}>{c}</option>)}</select><input value={f.keywords} onChange={(e) => setF({ ...f, keywords: e.target.value })} placeholder="Other words, comma separated" className="field py-2.5 text-sm" /></div>
                {err && <p className="text-sm text-bad">{err}</p>}
                <button className="btn-primary btn-sm" disabled={busy || f.answer.length < 5} onClick={() => save(g)}>{busy ? 'Saving' : 'Save answer'}</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Teach({ cats, reload }) {
  const [mode, setMode] = useState('ai'); const [cat, setCat] = useState(cats[0] || 'General'); const [count, setCount] = useState(8); const [url, setUrl] = useState(''); const [text, setText] = useState('');
  const [items, setItems] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState('');
  useEffect(() => { if (!cats.includes(cat)) setCat(cats[0]); }, [cats]); // eslint-disable-line react-hooks/exhaustive-deps
  async function gen() {
    setBusy(true); setErr(''); setItems(null); setDone('');
    try { const j = await api('/api/admin/ai-iq/generate', { method: 'POST', body: { mode, category: cat, count, url, text } }); setItems(j.items.map((x) => ({ ...x, keep: true }))); } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  async function save() {
    setBusy(true); setErr('');
    try { const j = await api('/api/admin/ai-iq/save', { method: 'POST', body: { items: items.filter((x) => x.keep) } }); setDone(`${j.added} answers saved. They are live in the chat and on the FAQ page.`); setItems(null); reload(); } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  const upd = (i, v) => setItems(items.map((x, k) => (k === i ? { ...x, ...v } : x)));
  const tab = (k, I, l) => <button key={k} onClick={() => setMode(k)} className={cn('inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition', mode === k ? 'bg-signal text-white' : 'text-body hover:bg-raised')}><I size={15} />{l}</button>;
  return (
    <section className="mt-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="flex items-center gap-1.5 font-semibold text-ink">Teach it faster<InfoTip size={14} text="AI drafts questions and answers from your own packages and prices. You review every one before saving. Nothing goes live until you press Save." /></h2>
      <div className="mt-3 inline-flex flex-wrap gap-1 rounded-xl border border-line bg-base/50 p-1">{tab('ai', Sparkles, 'Write with AI')}{tab('url', Globe, 'Learn from a web page')}{tab('text', ClipboardPaste, 'Paste text')}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px]">
        <div><label className="label" htmlFor="t-cat">Group (a service)</label><select id="t-cat" value={cat} onChange={(e) => setCat(e.target.value)} className="field py-2.5 text-sm">{cats.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="label" htmlFor="t-n">How many</label><input id="t-n" type="number" min={1} max={15} value={count} onChange={(e) => setCount(e.target.value)} className="field py-2.5 text-sm" /></div>
      </div>
      {mode === 'url' && <div className="mt-3"><label className="label" htmlFor="t-url">Web page address</label><input id="t-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/services" className="field py-2.5 text-sm" /><p className="mt-1.5 text-xs text-muted">Use it for ideas: a competitor, a partner or your own other site. The AI uses the page for topics only, and writes answers with your facts.</p></div>}
      {mode === 'text' && <div className="mt-3"><label className="label" htmlFor="t-text">Text</label><textarea id="t-text" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a service description, an email thread or notes" className="field text-sm" /></div>}
      <button onClick={gen} disabled={busy || (mode === 'url' && !url) || (mode === 'text' && text.length < 60)} className="btn-primary btn-sm mt-4">{busy && !items ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{busy && !items ? 'Writing' : 'Draft questions and answers'}</button>
      {err && <p className="mt-3 text-sm text-bad">{err}</p>}
      {done && <p className="mt-3 text-sm text-good">{done}</p>}
      {items && (
        <div className="mt-5 space-y-3">
          {items.map((x, i) => (
            <div key={i} className={cn('rounded-xl border p-4', x.keep ? 'border-line bg-base/40' : 'border-line/50 opacity-50')}>
              <div className="flex items-start gap-3"><input type="checkbox" checked={x.keep} onChange={(e) => upd(i, { keep: e.target.checked })} aria-label="Keep" className="mt-2 h-4 w-4 accent-[rgb(var(--signal))]" /><div className="min-w-0 flex-1 space-y-2"><input value={x.question} onChange={(e) => upd(i, { question: e.target.value })} className="field py-2 text-sm font-medium" aria-label="Question" /><textarea value={x.answer} onChange={(e) => upd(i, { answer: e.target.value })} rows={3} className="field text-sm" aria-label="Answer" /></div></div>
            </div>
          ))}
          <div className="flex gap-2"><button onClick={save} disabled={busy} className="btn-primary btn-sm">{busy ? 'Saving' : `Save ${items.filter((x) => x.keep).length} answers`}</button><button onClick={() => setItems(null)} className="btn-ghost btn-sm"><Trash2 size={14} />Discard</button></div>
        </div>
      )}
    </section>
  );
}
