'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, TicketPercent, X, Loader2, Wallet } from 'lucide-react';
import { cn, money } from '@/lib/utils';
import { track } from '@/lib/track';
import InfoTip from '@/components/site/InfoTip';

export default function CheckoutForm({ pkg, methods, amountLabel: baseLabel, bdtLabel: baseBdt, prefill, accounts, coupons = true, credit = 0, friendCoupon = '', price = 0, currency = 'USD', bdtRate = 120 }) {
  const p = prefill || {};
  const [code, setCode] = useState(''); const [applied, setApplied] = useState(null); const [cBusy, setCBusy] = useState(false); const [cErr, setCErr] = useState('');
  const [useCredit, setUseCredit] = useState(credit > 0);
  const r2 = (n) => Math.round(n * 100) / 100;
  const discount = applied?.discount || 0;
  const creditUse = useCredit ? r2(Math.min(credit, Math.max(0, price - discount))) : 0;
  const total = r2(Math.max(0, price - discount - creditUse));
  const changed = discount > 0 || creditUse > 0;
  const amountLabel = changed ? money(total, currency) : baseLabel;
  const bdtLabel = currency === 'BDT' ? null : changed ? `৳${Math.ceil(total * bdtRate).toLocaleString('en-US')}` : baseBdt;

  async function apply(c = code) {
    if (!c.trim()) return;
    setCBusy(true); setCErr('');
    const r = await fetch('/api/coupons/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: c, package: pkg.slug, email: document.getElementById('o-email')?.value }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { setApplied(j); setCode(j.code); track('apply_coupon', { coupon: j.code }); } else { setApplied(null); setCErr(j.error || 'That code did not work.'); }
    setCBusy(false);
  }
  useEffect(() => { if (coupons && friendCoupon) { setCode(friendCoupon); apply(friendCoupon); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const router = useRouter();
  const [method, setMethod] = useState(methods[0]?.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const m = methods.find((x) => x.id === method);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      package: pkg.slug, method, requirements: f.requirements, coupon: applied?.code || undefined, useCredit: creditUse > 0, customer: { name: f.name, email: f.email, phone: f.phone, company: f.company, country: f.country },
    }) });
    const j = await r.json().catch(() => ({}));
    if (j.ok) track('begin_checkout', { item: pkg.name, method });
    if (j.redirect) { if (/^https?:/.test(j.redirect)) window.location.href = j.redirect; else router.push(j.redirect); return; }
    if (j.field === 'coupon') { setApplied(null); setCErr(j.error); }
    setError(j.error || 'The order did not go through. Try again.'); setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <fieldset className="card p-6 sm:p-8">
        <legend className="sr-only">Your details</legend>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-xl font-semibold">Your details</h2>
          {accounts && (prefill
            ? <p className="text-sm text-muted">Signed in as {p.email}. This order is saved to your account.</p>
            : <p className="text-sm text-muted">Have an account? <a href={`/account/login?next=${encodeURIComponent(`/checkout/${pkg.slug}`)}`} className="font-medium text-signal hover:underline">Sign in</a> to save this order to it.</p>)}
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div><label className="label" htmlFor="o-name">Full name</label><input id="o-name" name="name" required defaultValue={p.name} className="field" autoComplete="name" /></div>
          <div><label className="label" htmlFor="o-email">Email</label><input id="o-email" name="email" type="email" required defaultValue={p.email} readOnly={Boolean(prefill)} className="field" autoComplete="email" /></div>
          <div><label className="label" htmlFor="o-phone">Phone or WhatsApp</label><input id="o-phone" name="phone" defaultValue={p.phone} className="field" autoComplete="tel" /></div>
          <div><label className="label" htmlFor="o-country">Country</label><input id="o-country" name="country" defaultValue={p.country} className="field" autoComplete="country-name" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="o-company">Business or website <span className="text-muted">(optional)</span></label><input id="o-company" name="company" defaultValue={p.company} className="field" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="o-req">Project brief</label><textarea id="o-req" name="requirements" rows={4} className="field resize-y" placeholder="What should the site do? Any links, deadlines or examples you like?" /></div>
        </div>
      </fieldset>

      <fieldset className="card p-6 sm:p-8">
        <legend className="sr-only">Payment method</legend>
        <h2 className="text-xl font-semibold">Payment method</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup">
          {methods.map((x) => (
            <label key={x.id} className={cn('flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition', method === x.id ? 'border-signal bg-signal/10 ring-4 ring-signal/10' : 'border-line hover:border-ink/30')}>
              <input type="radio" name="method" value={x.id} checked={method === x.id} onChange={() => setMethod(x.id)} className="sr-only" />
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-white" style={{ background: x.color }}>{x.name.slice(0, 2)}</span>
              <span className="min-w-0 flex-1"><span className="block font-semibold text-ink">{x.name}</span>
                <span className="block truncate text-xs text-muted">{x.auto ? 'Instant, secure checkout' : x.local ? 'Pay in taka' : 'Manual confirmation'}</span></span>
              {x.auto && <Zap size={15} className="text-amber" />}
              <span className={cn('h-4 w-4 shrink-0 rounded-full border-2', method === x.id ? 'border-signal bg-signal shadow-[inset_0_0_0_3px_rgb(var(--surface))]' : 'border-line')} />
            </label>
          ))}
        </div>
        {m && (
          <p className="mt-5 rounded-xl bg-raised px-4 py-3 text-sm text-body">
            {m.auto ? `You will be sent to a secure ${m.id === 'paypal' ? 'PayPal' : 'card'} page to pay ${m.local && bdtLabel ? bdtLabel : amountLabel}.`
              : `After you place the order you will see the ${m.name} details. Pay ${m.local && bdtLabel ? `${bdtLabel} (${amountLabel})` : amountLabel}, then enter the transaction ID.`}
            {m.note ? ` ${m.note}` : ''}
          </p>
        )}
      </fieldset>

      {(coupons || credit > 0) && (
        <fieldset className="card p-6 sm:p-8">
          <legend className="sr-only">Discounts</legend>
          <h2 className="text-xl font-semibold">Discounts</h2>
          {coupons && (
            <div className="mt-5">
              <label className="label flex items-center gap-1.5" htmlFor="o-coupon">Coupon code<InfoTip text="Have a discount code? Type it and press Apply. The discount is shown before you place the order." /></label>
              {applied ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-good/40 bg-good/10 px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 text-ink"><TicketPercent size={16} className="text-good" /><strong>{applied.code}</strong><span className="text-muted">{applied.label}, you save {money(applied.discount, currency)}</span></span>
                  <button type="button" onClick={() => { setApplied(null); setCode(''); }} className="text-muted hover:text-ink" aria-label="Remove coupon"><X size={16} /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input id="o-coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }} placeholder="Have a code?" className="field flex-1 font-mono uppercase" autoComplete="off" />
                  <button type="button" onClick={() => apply()} disabled={cBusy || !code.trim()} className="btn-ghost shrink-0">{cBusy ? <Loader2 size={15} className="animate-spin" /> : null}Apply</button>
                </div>
              )}
              {cErr && <p role="alert" className="mt-2 text-sm text-bad">{cErr}</p>}
            </div>
          )}
          {credit > 0 && (
            <label htmlFor="o-credit" className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
              <span className="flex items-center gap-3 text-sm"><Wallet size={17} className="text-signal" /><span><span className="flex items-center gap-1.5 font-medium text-ink">Use my referral credit<InfoTip text="Credit you earned by referring friends. It is taken off this order. If the order is cancelled, the credit comes back." /></span><span className="text-muted">{money(credit, currency)} available</span></span></span>
              <input id="o-credit" type="checkbox" checked={useCredit} onChange={(e) => setUseCredit(e.target.checked)} className="h-5 w-5 accent-[rgb(var(--signal))]" />
            </label>
          )}
          {changed && (
            <dl className="mt-6 space-y-2 border-t border-line pt-5 text-[0.95rem]">
              <div className="flex justify-between text-muted"><dt>Package</dt><dd>{money(price, currency)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-good"><dt>Coupon {applied.code}</dt><dd>-{money(discount, currency)}</dd></div>}
              {creditUse > 0 && <div className="flex justify-between text-good"><dt>Referral credit</dt><dd>-{money(creditUse, currency)}</dd></div>}
              <div className="flex items-end justify-between pt-2"><dt className="font-semibold text-ink">You pay</dt><dd className="text-right"><span className="font-display text-2xl font-bold text-ink">{money(total, currency)}</span>{bdtLabel && total > 0 && <span className="block text-sm text-muted">about {bdtLabel}</span>}</dd></div>
            </dl>
          )}
        </fieldset>
      )}

      {error && <p role="alert" className="rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{error}</p>}
      <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">By placing the order you agree to the <a href="/terms-and-conditions" className="underline hover:text-ink">terms</a>.</p>
        <button className="btn-primary px-7 py-3.5" disabled={busy || !method}>{busy ? 'Placing order…' : total <= 0 && changed ? 'Place order, nothing to pay' : `Place order, ${amountLabel}`} <ArrowRight size={17} /></button>
      </div>
    </form>
  );
}
