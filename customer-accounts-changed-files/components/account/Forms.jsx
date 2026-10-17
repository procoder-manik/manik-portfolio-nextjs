'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, LogIn, UserPlus, Send, KeyRound, Save, LogOut, Eye, EyeOff, LayoutDashboard, ShoppingBag, MessageSquare, UserRound, Link2, MailCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

async function post(url, body, method = 'POST') {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Something went wrong. Try again.');
  return j;
}

const Alert = ({ tone = 'bad', children }) => children ? (
  <p role={tone === 'bad' ? 'alert' : 'status'} className={cn('rounded-xl border px-4 py-3 text-sm', tone === 'bad' ? 'border-bad/40 bg-bad/10 text-bad' : 'border-good/40 bg-good/10 text-good')}>{children}</p>
) : null;

function PasswordInput({ id, name, autoComplete, label = 'Password', hint }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input id={id} name={name} type={show ? 'text' : 'password'} required minLength={autoComplete === 'new-password' ? 8 : undefined} autoComplete={autoComplete} className="field pr-11" />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

/* Sign in, create account, forgot password, reset password */
export function AuthForm({ mode }) {
  const router = useRouter(); const sp = useSearchParams();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState('');
  const claim = sp.get('claim'); const t = sp.get('t');
  const next = sp.get('next');
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
  const qs = claim && t ? `?claim=${encodeURIComponent(claim)}&t=${encodeURIComponent(t)}` : safeNext ? `?next=${encodeURIComponent(safeNext)}` : '';

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (mode === 'login') {
        await post('/api/account/auth', { ...f, claim, t });
        router.replace(claim ? `/account/orders/${claim}` : safeNext || '/account'); router.refresh(); return;
      }
      if (mode === 'register') {
        const j = await post('/api/account/register', { ...f, claim, t });
        router.replace(claim ? `/account/orders/${claim}?welcome=1` : `${safeNext || '/account'}${safeNext ? '' : `?welcome=${j.verifySent ? 'sent' : '1'}`}`); router.refresh(); return;
      }
      if (mode === 'forgot') { await post('/api/account/forgot', f); setDone('If that email has an account, a reset link is on its way. Check your inbox and spam folder.'); }
      if (mode === 'reset') {
        if (f.password !== f.confirm) throw new Error('The two passwords do not match.');
        await post('/api/account/reset', { token: sp.get('token'), password: f.password });
        router.replace('/account'); router.refresh(); return;
      }
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }

  const T = {
    login: ['Sign in to your account', 'Track orders, project progress and files.', 'Sign in', LogIn],
    register: ['Create your account', 'Free. See every order, its progress and the files I deliver, in one place.', 'Create account', UserPlus],
    forgot: ['Reset your password', 'Enter your account email and I will send you a reset link.', 'Send reset link', Send],
    reset: ['Choose a new password', 'Use at least 8 characters.', 'Save new password', KeyRound],
  }[mode];
  const Icon = T[3];

  return (
    <form onSubmit={submit} className="w-full max-w-md rounded-[24px] border border-line bg-surface p-7 sm:p-9">
      <h1 className="font-display text-[1.75rem] font-bold tracking-[-0.02em] text-ink">{T[0]}</h1>
      <p className="mt-2 text-muted">{T[1]}</p>
      {claim && (mode === 'login' || mode === 'register') && <p className="mt-5 rounded-xl bg-signal/10 px-4 py-3 text-sm text-body">Order <strong className="text-ink">{claim}</strong> will be added to your account.</p>}
      <div className="mt-7 space-y-4">
        {mode === 'register' && <div><label className="label" htmlFor="a-name">Full name</label><input id="a-name" name="name" required autoComplete="name" defaultValue={sp.get('name') || ''} className="field" /></div>}
        {mode !== 'reset' && <div><label className="label" htmlFor="a-email">Email</label><input id="a-email" name="email" type="email" required autoComplete="email" defaultValue={sp.get('email') || ''} className="field" /></div>}
        {mode === 'register' && <div><label className="label" htmlFor="a-phone">Phone or WhatsApp <span className="text-muted">(optional)</span></label><input id="a-phone" name="phone" autoComplete="tel" className="field" /></div>}
        {(mode === 'login' || mode === 'register' || mode === 'reset') && <PasswordInput id="a-pass" name="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} label={mode === 'reset' ? 'New password' : 'Password'} hint={mode === 'login' ? undefined : 'At least 8 characters.'} />}
        {mode === 'reset' && <PasswordInput id="a-pass2" name="confirm" autoComplete="new-password" label="Type it again" />}
        {mode === 'register' && <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />}
      </div>
      {mode === 'login' && <p className="mt-3 text-right text-sm"><Link href="/account/forgot" className="text-muted hover:text-ink">Forgot your password?</Link></p>}
      <div className="mt-5 space-y-3"><Alert>{err}</Alert><Alert tone="good">{done}</Alert></div>
      {!done && <button className="btn-primary mt-6 w-full" disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}{T[2]}</button>}
      <p className="mt-6 text-center text-sm text-muted">
        {mode === 'login' && <>New here? <Link href={`/account/register${qs}`} className="font-medium text-signal hover:underline">Create an account</Link></>}
        {mode === 'register' && <>Already have an account? <Link href={`/account/login${qs}`} className="font-medium text-signal hover:underline">Sign in</Link></>}
        {(mode === 'forgot' || mode === 'reset') && <Link href="/account/login" className="font-medium text-signal hover:underline">Back to sign in</Link>}
      </p>
    </form>
  );
}

const TABS = [['/account', 'Overview', LayoutDashboard], ['/account/orders', 'Orders', ShoppingBag], ['/account/messages', 'Messages', MessageSquare], ['/account/profile', 'Profile', UserRound]];

export function AccountNav({ name, unread = 0 }) {
  const path = usePathname();
  const on = (h) => (h === '/account' ? path === h : path.startsWith(h));
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
      <nav className="-mx-1 flex gap-1 overflow-x-auto" aria-label="Account">
        {TABS.map(([h, l, I]) => (
          <Link key={h} href={h} className={cn('flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[0.94rem] font-medium transition', on(h) ? 'bg-raised text-ink' : 'text-muted hover:text-ink')}>
            <I size={16} className={on(h) ? 'text-signal' : ''} />{l}
            {h === '/account/messages' && unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-signal px-1.5 text-[11px] font-semibold text-white">{unread}</span>}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 text-sm text-muted"><span className="hidden sm:inline">{name}</span><SignOut /></div>
    </div>
  );
}

export function SignOut({ full }) {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  const out = async () => { setBusy(true); await fetch('/api/account/auth', { method: 'DELETE' }); router.replace('/account/login'); router.refresh(); };
  return <button onClick={out} disabled={busy} className={cn('btn-ghost btn-sm', full && 'w-full')}>{busy ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}Sign out</button>;
}

export function ResendVerify() {
  const [state, setState] = useState(''); const [err, setErr] = useState('');
  const send = async () => { setState('busy'); setErr(''); try { await post('/api/account/verify', {}); setState('sent'); } catch (e) { setErr(e.message); setState(''); } };
  if (state === 'sent') return <span className="text-sm font-medium text-good">Sent. Check your inbox.</span>;
  return (
    <span className="flex flex-col items-start gap-1">
      <button onClick={send} disabled={state === 'busy'} className="btn-ghost btn-sm">{state === 'busy' ? <Loader2 size={14} className="animate-spin" /> : <MailCheck size={14} />}Send the link again</button>
      {err && <span className="text-xs text-bad">{err}</span>}
    </span>
  );
}

/* Paste an order link from an old confirmation email to add it to the account. */
export function ClaimForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState({ t: '', m: '' });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg({});
    const link = new FormData(e.currentTarget).get('link');
    try { const j = await post('/api/account/claim', { link }); setMsg({ t: 'good', m: `Order ${j.number} is now in your account.` }); e.target.reset(); router.refresh(); }
    catch (x) { setMsg({ t: 'bad', m: x.message }); }
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="label" htmlFor="claim-link">Order link from your email</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input id="claim-link" name="link" required placeholder="https://…/order/MH-…?t=…" className="field flex-1" />
        <button className="btn-ghost btn-sm shrink-0" disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}Add order</button>
      </div>
      <Alert tone={msg.t}>{msg.m}</Alert>
    </form>
  );
}

export function MessageForm({ orders = [], orderNumber, compact }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState({ t: '', m: '' });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg({});
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try { await post('/api/account/messages', { ...f, orderNumber: orderNumber || f.orderNumber }); setMsg({ t: 'good', m: 'Sent. I usually reply within one working day, and the reply shows up in Messages.' }); e.target.reset(); router.refresh(); }
    catch (x) { setMsg({ t: 'bad', m: x.message }); }
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      {!orderNumber && !compact && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="m-subject">Subject</label><input id="m-subject" name="subject" className="field" placeholder="What is it about?" /></div>
          <div><label className="label" htmlFor="m-order">Related order <span className="text-muted">(optional)</span></label>
            <select id="m-order" name="orderNumber" className="field" defaultValue=""><option value="">None</option>{orders.map((o) => <option key={o.number} value={o.number}>{o.number}, {o.package?.name}</option>)}</select></div>
        </div>
      )}
      <div><label className={cn('label', compact && 'sr-only')} htmlFor="m-body">Message</label><textarea id="m-body" name="message" required rows={compact ? 3 : 5} className="field resize-y" placeholder={orderNumber ? 'A question, a change request, or files you want to share (paste a link).' : 'Write your message'} /></div>
      <Alert tone={msg.t}>{msg.m}</Alert>
      <button className="btn-primary btn-sm" disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Send message</button>
    </form>
  );
}

export function ProfileForm({ me }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState({ t: '', m: '' });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg({});
    try { const j = await post('/api/account/profile', Object.fromEntries(new FormData(e.currentTarget)), 'PUT'); setMsg({ t: 'good', m: j.message }); router.refresh(); }
    catch (x) { setMsg({ t: 'bad', m: x.message }); }
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="p-name">Full name</label><input id="p-name" name="name" required defaultValue={me.name} autoComplete="name" className="field" /></div>
        <div><label className="label" htmlFor="p-email">Email</label><input id="p-email" value={me.email} readOnly className="field opacity-70" /></div>
        <div><label className="label" htmlFor="p-phone">Phone or WhatsApp</label><input id="p-phone" name="phone" defaultValue={me.phone} autoComplete="tel" className="field" /></div>
        <div><label className="label" htmlFor="p-country">Country</label><input id="p-country" name="country" defaultValue={me.country} autoComplete="country-name" className="field" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="p-company">Business or website</label><input id="p-company" name="company" defaultValue={me.company} className="field" /></div>
      </div>
      <Alert tone={msg.t}>{msg.m}</Alert>
      <button className="btn-primary btn-sm" disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save details</button>
    </form>
  );
}

export function PasswordForm() {
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState({ t: '', m: '' });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg({});
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (f.newPassword !== f.confirm) throw new Error('The two new passwords do not match.');
      const j = await post('/api/account/profile', { currentPassword: f.currentPassword, newPassword: f.newPassword }, 'PUT');
      setMsg({ t: 'good', m: j.message }); e.target.reset();
    } catch (x) { setMsg({ t: 'bad', m: x.message }); }
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <PasswordInput id="pw-cur" name="currentPassword" autoComplete="current-password" label="Current password" />
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordInput id="pw-new" name="newPassword" autoComplete="new-password" label="New password" hint="At least 8 characters." />
        <PasswordInput id="pw-new2" name="confirm" autoComplete="new-password" label="Type it again" />
      </div>
      <Alert tone={msg.t}>{msg.m}</Alert>
      <button className="btn-ghost btn-sm" disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}Change password</button>
    </form>
  );
}
