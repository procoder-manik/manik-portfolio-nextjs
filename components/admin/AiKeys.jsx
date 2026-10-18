'use client';
import { useEffect, useState } from 'react';
import { Loader2, KeyRound, CheckCircle2, AlertTriangle, Trash2, ExternalLink } from 'lucide-react';
import { api } from './api';

const ROWS = [
  { name: 'GEMINI_API_KEY', label: 'Google Gemini', free: true, link: 'https://aistudio.google.com/apikey', hint: 'Free. Sign in with Google, press Create API key.' },
  { name: 'GROQ_API_KEY', label: 'Groq', free: true, link: 'https://console.groq.com/keys', hint: 'Free and very fast. Sign up, press Create API Key.' },
  { name: 'OPENROUTER_API_KEY', label: 'OpenRouter', free: true, link: 'https://openrouter.ai/keys', hint: 'Free models end in :free. Sign up, press Create Key.' },
  { name: 'OPENAI_API_KEY', label: 'ChatGPT (OpenAI)', free: false, link: 'https://platform.openai.com/api-keys', hint: 'Optional and paid. Needs prepaid credit.' },
  { name: 'ANTHROPIC_API_KEY', label: 'Claude (Anthropic)', free: false, link: 'https://console.anthropic.com/settings/keys', hint: 'Optional and paid.' },
  { name: 'SEMRUSH_API_KEY', label: 'Semrush', free: false, link: 'https://www.semrush.com/api-analytics/', hint: 'Optional and paid. Adds real search volume. Not needed.' },
];

/* Paste API keys here instead of in the environment. They are saved encrypted and only the last 4 characters are ever shown. */
export default function AiKeys() {
  const [st, setSt] = useState(null); const [val, setVal] = useState({}); const [busy, setBusy] = useState(''); const [msg, setMsg] = useState({}); const [err, setErr] = useState('');
  useEffect(() => { api('/api/admin/ai/keys').then((j) => setSt(j.keys)).catch((e) => setErr(e.message)); }, []);
  const say = (n, t, ok) => setMsg((m) => ({ ...m, [n]: { t, ok } }));
  const save = async (n) => {
    setBusy(`s${n}`); say(n, '');
    try { const j = await api('/api/admin/ai/keys', { method: 'PUT', body: { name: n, value: val[n] } }); setSt(j.keys); setVal((v) => ({ ...v, [n]: '' })); say(n, 'Saved. Testing...', true); await test(n, true); }
    catch (e) { say(n, e.message, false); }
    setBusy('');
  };
  const test = async (n, quiet) => {
    if (!quiet) setBusy(`t${n}`);
    try { const j = await api('/api/admin/ai/keys', { method: 'POST', body: { name: n } }); say(n, j.message, j.ok); } catch (e) { say(n, e.message, false); }
    if (!quiet) setBusy('');
  };
  const remove = async (n) => {
    if (!confirm('Remove the saved key? If the same key is also in your environment, that one is used instead.')) return;
    setBusy(`r${n}`);
    try { const j = await api('/api/admin/ai/keys', { method: 'PUT', body: { name: n, value: '' } }); setSt(j.keys); say(n, 'Removed.', true); } catch (e) { say(n, e.message, false); }
    setBusy('');
  };
  return (
    <div className="rounded-2xl border border-line bg-base/40 p-4 sm:p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink"><KeyRound size={16} className="text-signal" />API keys</p>
      <p className="mt-1 text-xs text-muted">Paste a key and press Save. It is stored encrypted in your database, never shown again in full, and works at once without a redeploy. A key saved here wins over the same key in the environment. Add two or three free ones for automatic backup.</p>
      {err && <p className="mt-3 flex items-center gap-1.5 text-sm text-bad"><AlertTriangle size={14} />{err}</p>}
      {!st && !err && <div className="mt-4 grid h-16 place-items-center text-muted"><Loader2 className="animate-spin" /></div>}
      {st && <div className="mt-4 space-y-3">
        {ROWS.map((r) => {
          const k = st[r.name] || { source: 'none' }; const m = msg[r.name];
          return (
            <div key={r.name} className="rounded-xl border border-line bg-surface p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink">{r.label} <span className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-normal ${r.free ? 'bg-good/15 text-good' : 'bg-raised text-muted'}`}>{r.free ? 'free' : 'optional paid'}</span></p>
                <span className="flex items-center gap-2 text-xs">
                  {k.source === 'admin' && <span className="flex items-center gap-1 text-good"><CheckCircle2 size={13} />Saved here (ends {k.last4})</span>}
                  {k.source === 'env' && <span className="flex items-center gap-1 text-good"><CheckCircle2 size={13} />Set in the environment</span>}
                  {k.source === 'broken' && <span className="flex items-center gap-1 text-bad"><AlertTriangle size={13} />Saved key cannot be read (JWT_SECRET changed). Paste it again.</span>}
                  {k.source === 'none' && <span className="text-muted">Not set</span>}
                  <a href={r.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-signal hover:underline">Get key<ExternalLink size={11} /></a>
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">{r.hint}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <input type="password" autoComplete="off" spellCheck={false} value={val[r.name] || ''} onChange={(e) => setVal({ ...val, [r.name]: e.target.value })} placeholder={k.source === 'admin' ? 'Paste a new key to replace it' : 'Paste the key here'} className="field min-w-[200px] flex-1 py-2 text-sm" aria-label={`${r.label} key`} />
                <button type="button" onClick={() => save(r.name)} disabled={!!busy || !(val[r.name] || '').trim()} className="btn-primary btn-sm">{busy === `s${r.name}` ? <Loader2 size={14} className="animate-spin" /> : null}Save</button>
                {k.source !== 'none' && k.source !== 'broken' && r.name !== 'SEMRUSH_API_KEY' && <button type="button" onClick={() => test(r.name)} disabled={!!busy} className="btn-ghost btn-sm">{busy === `t${r.name}` ? <Loader2 size={14} className="animate-spin" /> : null}Test</button>}
                {k.source === 'admin' && <button type="button" onClick={() => remove(r.name)} disabled={!!busy} className="btn-ghost btn-sm text-bad" aria-label="Remove saved key"><Trash2 size={14} /></button>}
              </div>
              {m?.t && <p className={`mt-2 text-xs ${m.ok ? 'text-good' : 'text-bad'}`}>{m.t}</p>}
            </div>
          );
        })}
      </div>}
    </div>
  );
}
