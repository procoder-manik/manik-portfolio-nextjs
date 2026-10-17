'use client';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Share2, Loader2, Send, Save, Wallet, Camera, Trash2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import InfoTip from '@/components/site/InfoTip';

async function post(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Something went wrong. Try again.');
  return j;
}
const Alert = ({ t, children }) => children ? <p role={t === 'bad' ? 'alert' : 'status'} className={cn('rounded-xl border px-4 py-3 text-sm', t === 'bad' ? 'border-bad/40 bg-bad/10 text-bad' : 'border-good/40 bg-good/10 text-good')}>{children}</p> : null;

/* The personal link with copy and share buttons. */
export function ShareBox({ link, code, message = 'Have a look at Manik Hossain, the web designer I worked with:' }) {
  const [copied, setCopied] = useState(''); const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(Boolean(navigator.share)), []);
  const copy = async (v, k) => { try { await navigator.clipboard.writeText(v); setCopied(k); setTimeout(() => setCopied(''), 1800); } catch {} };
  const text = `${message} ${link}`;
  const share = async () => { try { await navigator.share({ title: 'Manik Hossain', text: message, url: link }); } catch {} };
  const links = [
    ['WhatsApp', `https://wa.me/?text=${encodeURIComponent(text)}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`],
    ['X', `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`],
  ];
  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="field flex min-w-0 flex-1 items-center gap-2 font-mono text-sm"><span className="truncate">{link}</span></div>
        <button type="button" onClick={() => copy(link, 'link')} className="btn-primary shrink-0">{copied === 'link' ? <Check size={16} /> : <Copy size={16} />}{copied === 'link' ? 'Copied' : 'Copy link'}</button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {links.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">{l}</a>)}
        <a href={`mailto:?subject=${encodeURIComponent('A web designer I recommend')}&body=${encodeURIComponent(text)}`} className="btn-ghost btn-sm"><Mail size={14} />Email</a>
        {canShare && <button type="button" onClick={share} className="btn-ghost btn-sm"><Share2 size={14} />More</button>}
        <button type="button" onClick={() => copy(code, 'code')} className="ml-auto text-sm text-muted hover:text-ink">Code <span className="font-mono font-semibold text-ink">{code}</span> {copied === 'code' ? <Check size={13} className="inline text-good" /> : <Copy size={13} className="inline" />}</button>
      </div>
    </div>
  );
}

export function AffiliateApply({ methods = [], terms }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState({});
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg({});
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try { await post('/api/account/affiliate', { action: 'apply', ...f, agree: f.agree === 'on' }); router.refresh(); }
    catch (x) { setMsg({ t: 'bad', m: x.message }); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label flex items-center gap-1.5" htmlFor="af-web">Website or main profile<InfoTip text="Where you will share the link, for example your blog, agency site or LinkedIn. It helps with approval." /></label><input id="af-web" name="website" placeholder="https://" className="field" /></div>
        <div><label className="label flex items-center gap-1.5" htmlFor="af-m">Get paid by<InfoTip text="How you want to receive your commission. You can change it later." /></label><select id="af-m" name="payoutMethod" className="field">{methods.map((m) => <option key={m}>{m}</option>)}</select></div>
        <div className="sm:col-span-2"><label className="label flex items-center gap-1.5" htmlFor="af-d">Payout details<InfoTip text="Your bKash or Nagad number, PayPal or Payoneer email, or bank details. Payouts are sent exactly here." /></label><input id="af-d" name="payoutDetails" placeholder="Number, email or account details" className="field" /></div>
        <div className="sm:col-span-2"><label className="label flex items-center gap-1.5" htmlFor="af-a">How will you share my work?<InfoTip text="A sentence or two about your audience. It speeds up approval." /></label><textarea id="af-a" name="about" rows={3} className="field" placeholder="For example: I run a small agency and send clients who need WordPress sites." /></div>
      </div>
      {terms && <p className="rounded-xl bg-raised/60 p-4 text-sm text-body">{terms}</p>}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="agree" required className="h-4 w-4 accent-[rgb(var(--signal))]" />I agree to the program terms</label>
      <Alert t={msg.t}>{msg.m}</Alert>
      <button className="btn-primary" disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}Apply to join</button>
    </form>
  );
}

export function PayoutDetails({ methods = [], method, details }) {
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState({});
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg({});
    try { const j = await post('/api/account/affiliate', { action: 'payout-details', ...Object.fromEntries(new FormData(e.currentTarget)) }); setMsg({ t: 'good', m: j.message }); }
    catch (x) { setMsg({ t: 'bad', m: x.message }); }
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1.6fr]">
        <select name="payoutMethod" defaultValue={method} className="field" aria-label="Payout method">{[...new Set([...(method ? [method] : []), ...methods])].map((m) => <option key={m}>{m}</option>)}</select>
        <input name="payoutDetails" defaultValue={details} placeholder="Number, email or account details" className="field" aria-label="Payout details" />
      </div>
      <Alert t={msg.t}>{msg.m}</Alert>
      <button className="btn-ghost btn-sm" disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save payout details</button>
    </form>
  );
}

export function RequestPayout({ disabled, label }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState({});
  const go = async () => { setBusy(true); setMsg({}); try { const j = await post('/api/account/affiliate', { action: 'request-payout' }); setMsg({ t: 'good', m: j.message }); router.refresh(); } catch (x) { setMsg({ t: 'bad', m: x.message }); } setBusy(false); };
  return (
    <div className="space-y-3">
      <button onClick={go} disabled={busy || disabled} className="btn-primary w-full">{busy ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}{label}</button>
      <Alert t={msg.t}>{msg.m}</Alert>
    </div>
  );
}

/* Profile photo with instant preview. */
export function AvatarUpload({ url, name }) {
  const router = useRouter(); const input = useRef(null);
  const [src, setSrc] = useState(url || ''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function pick(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setErr(''); if (file.size > 2 * 1024 * 1024) { setErr('Use a photo under 2 MB.'); return; }
    const prev = src; setSrc(URL.createObjectURL(file)); setBusy(true);
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch('/api/account/avatar', { method: 'POST', body: fd });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { setSrc(j.url); router.refresh(); } else { setSrc(prev); setErr(j.error || 'Upload failed.'); }
    setBusy(false); e.target.value = '';
  }
  async function remove() { setBusy(true); await fetch('/api/account/avatar', { method: 'DELETE' }); setSrc(''); setBusy(false); router.refresh(); }
  return (
    <div className="flex items-center gap-5">
      <button type="button" onClick={() => input.current?.click()} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-line bg-raised" aria-label="Change profile photo">
        {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center font-display text-2xl font-bold text-ink">{(name || '?')[0]?.toUpperCase()}</span>}
        <span className="absolute inset-0 grid place-items-center bg-black/45 text-white opacity-0 transition group-hover:opacity-100">{busy ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}</span>
      </button>
      <div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn-ghost btn-sm"><Camera size={14} />{src ? 'Change photo' : 'Upload photo'}</button>
          {src && <button type="button" onClick={remove} disabled={busy} className="btn-ghost btn-sm text-bad"><Trash2 size={14} />Remove</button>}
        </div>
        <p className="mt-2 text-xs text-muted">JPG, PNG or WebP, up to 2 MB.</p>
        {err && <p role="alert" className="mt-1 text-sm text-bad">{err}</p>}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="hidden" />
    </div>
  );
}
