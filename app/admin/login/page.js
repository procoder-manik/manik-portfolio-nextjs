'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, LogIn, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter(); const sp = useSearchParams();
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [ticket, setTicket] = useState(null); // set after the password step when two-step verification is on
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch(ticket ? '/api/admin/auth/2fa' : '/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ticket ? { ticket, code: f.code } : f) });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.needs2fa) { setTicket(j.ticket); setBusy(false); return; }
    if (r.ok) { const next = sp.get('next') || ''; router.replace(/^\/(?![/\\])/.test(next) ? next : '/admin'); return; } // only addresses on this site
    if (j.expired) setTicket(null);
    setErr(j.error || 'Sign-in failed.'); setBusy(false);
  }
  if (ticket) return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-[24px] border border-line bg-surface p-8">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-signal text-white"><ShieldCheck size={20} /></span>
      <h1 className="mt-6 text-2xl font-semibold">Two-step verification</h1>
      <p className="mt-1 text-sm text-muted">Open your authenticator app and enter the 6-digit code. Lost your phone? Enter one of your backup codes instead.</p>
      <div className="mt-8"><label className="label" htmlFor="code">Code</label><input id="code" name="code" required autoFocus autoComplete="one-time-code" inputMode="text" spellCheck={false} placeholder="123456" className="field text-center font-mono text-lg tracking-widest" /></div>
      {err && <p role="alert" className="mt-4 text-sm text-bad">{err}</p>}
      <button className="btn-primary mt-6 w-full" disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}Verify and sign in</button>
      <button type="button" onClick={() => { setTicket(null); setErr(''); }} className="mt-3 w-full text-center text-sm text-muted hover:text-ink">Back</button>
    </form>
  );
  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-[24px] border border-line bg-surface p-8">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-signal font-display font-bold text-white">MH</span>
      <h1 className="mt-6 text-2xl font-semibold">Sign in to the admin</h1>
      <p className="mt-1 text-sm text-muted">Manage projects, posts, packages and orders.</p>
      <div className="mt-8 space-y-4">
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="field" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field" /></div>
      </div>
      {err && <p role="alert" className="mt-4 text-sm text-bad">{err}</p>}
      <button className="btn-primary mt-6 w-full" disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}Sign in</button>
    </form>
  );
}

export default function Login() {
  return <main className="grid-paper grid min-h-screen place-items-center p-6"><Suspense><LoginForm /></Suspense></main>;
}
