import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, AlertTriangle, Mail } from 'lucide-react';
import { dbConnect, hasDB } from '@/lib/db';
import { Order } from '@/lib/models';
import { getAllSettings } from '@/lib/data';
import { PAYMENT_METHODS, ORDER_STATUS } from '@/lib/options';
import { serialize, money, fmtDate } from '@/lib/utils';
import PaymentProof, { CopyValue } from '@/components/site/PaymentProof';
import OrderTracker from '@/components/site/OrderTracker';
import ClaimOrder from '@/components/account/ClaimOrder';
import { getCustomer } from '@/lib/customers';
import { accountsOn } from '@/lib/features';

export const metadata = { title: 'Your order', robots: { index: false } };
export const dynamic = 'force-dynamic';

const STEPS = [['pending_payment', 'Order placed'], ['verifying', 'Payment sent'], ['paid', 'Payment confirmed'], ['in_progress', 'In progress'], ['completed', 'Delivered']];

export default async function OrderPage(props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  if (!hasDB()) notFound();
  await dbConnect();
  const o = serialize(await Order.findOne({ number: params.number, token: searchParams.t }).lean());
  if (!o) notFound();
  const [{ site, payments: pay, integrations: ig }, me] = await Promise.all([getAllSettings(), getCustomer()]);
  const accounts = accountsOn(site);
  const mine = me && String(o.customerId || '') === String(me._id);
  const claimQs = `claim=${encodeURIComponent(o.number)}&t=${encodeURIComponent(o.token)}`;
  const adsSendTo = ig.googleAds?.enabled && ig.googleAds.id && ig.googleAds.conversionLabel ? `${ig.googleAds.id}/${ig.googleAds.conversionLabel}` : null;
  const m = PAYMENT_METHODS.find((x) => x.id === o.method) || {};
  const cfg = pay[o.method] || {};
  const st = ORDER_STATUS[o.status] || { label: o.status };
  const stepIdx = Math.max(0, STEPS.findIndex(([k]) => k === o.status));
  const needsPay = ['pending_payment', 'failed'].includes(o.status);
  const local = m.local && o.currency !== 'BDT';
  const due = local ? `৳${(o.payment?.amountLocal || 0).toLocaleString('en-US')}` : money(o.amount, o.currency);

  const details = {
    bkash: [['bKash number', cfg.number], ['Account type', cfg.accountType]], nagad: [['Nagad number', cfg.number], ['Account type', cfg.accountType]],
    rocket: [['Rocket number', cfg.number], ['Account type', cfg.accountType]],
    bank: [['Bank', cfg.bankName], ['Account name', cfg.accountName], ['Account number', cfg.accountNumber], ['Branch', cfg.branch], ['Routing number', cfg.routing], ['SWIFT', cfg.swift]],
    paypal: [['PayPal email', cfg.email], ['PayPal.me', cfg.link]], payoneer: [['Payoneer email', cfg.email]], card: [],
  }[o.method]?.filter(([, v]) => v) || [];

  return (
    <section className="pb-24 pt-32 sm:pt-40">
      <OrderTracker number={o.number} value={o.amount} currency={o.currency} paid={['paid', 'in_progress', 'completed'].includes(o.status)} adsSendTo={adsSendTo} />
      <div className="shell max-w-4xl">
        {searchParams.failed && <p className="mb-6 flex items-center gap-3 rounded-2xl border border-bad/40 bg-bad/10 px-5 py-4 text-bad"><AlertTriangle size={18} />The payment did not complete. You can try again or pay another way below.</p>}
        <p className="text-sm text-muted">Order {o.number}, placed {fmtDate(o.createdAt, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-[-0.03em]">
          {o.status === 'paid' || o.status === 'in_progress' || o.status === 'completed' ? `Thanks, ${o.customer.name.split(' ')[0]}. You're all set.` : needsPay ? 'One last step: payment' : 'Payment received for checking'}
        </h1>
        <p className="mt-4 text-lg text-muted">Keep this page bookmarked. It updates as your order moves along.</p>

        <ol className="mt-10 grid grid-cols-5 gap-2">
          {STEPS.map(([k, label], i) => (
            <li key={k} className="text-center">
              <div className={`h-1.5 rounded-full ${i <= stepIdx && o.status !== 'cancelled' ? 'bg-signal' : 'bg-line'}`} />
              <p className={`mt-3 text-xs sm:text-sm ${i <= stepIdx ? 'text-ink' : 'text-muted'}`}>{label}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl font-display text-sm font-bold text-white" style={{ background: m.color }}>{m.name?.slice(0, 2)}</span>
              <div><p className="font-semibold text-ink">{m.name}</p><p className="text-sm text-muted">Status: {st.label}</p></div>
            </div>
            {needsPay ? (
              <>
                <p className="mt-6 text-body">Send <strong className="text-ink">{due}</strong>{local ? ` (${money(o.amount, o.currency)})` : ''} using the details below. Add <strong className="text-ink">{o.number}</strong> as the reference.</p>
                {details.length > 0 && <dl className="mt-5 divide-y divide-line rounded-2xl border border-line">{details.map(([k, v]) => <div key={k} className="flex items-center justify-between gap-4 px-4 py-3"><dt className="text-sm text-muted">{k}</dt><dd><CopyValue value={v} /></dd></div>)}</dl>}
                {cfg.note && <p className="mt-4 text-sm text-muted">{cfg.note}</p>}
                {o.method === 'card' && <p className="mt-4 text-sm text-muted">Online card checkout is not switched on yet. Pay by another method, or <a className="underline" href={`mailto:${site.email}?subject=Card payment for ${o.number}`}>email me</a> for a secure card link.</p>}
                {o.method !== 'card' && <PaymentProof number={o.number} token={o.token} wallet={['bkash', 'nagad', 'rocket'].includes(o.method)} />}
              </>
            ) : o.status === 'verifying' ? (
              <p className="mt-6 text-body">Transaction <strong className="text-ink">{o.payment?.transactionId}</strong> is being checked. This usually takes a few hours during working days. You will get an email once it is confirmed.</p>
            ) : o.status === 'cancelled' ? (
              <p className="mt-6 text-body">This order was cancelled. Reply to your confirmation email if that is a mistake.</p>
            ) : (
              <p className="mt-6 flex gap-3 text-body"><CheckCircle2 className="shrink-0 text-good" />Payment confirmed{o.payment?.paidAt ? ` on ${fmtDate(o.payment.paidAt, { month: 'long', day: 'numeric' })}` : ''}. I will email you within one working day to kick off the project.</p>
            )}
          </div>
          <aside className="card p-6">
            <h2 className="text-lg font-semibold">Summary</h2>
            <dl className="mt-4 space-y-3 text-[0.95rem]">
              <div className="flex justify-between gap-4"><dt className="text-muted">Package</dt><dd className="text-right font-medium text-ink">{o.package?.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">Amount</dt><dd className="font-medium text-ink">{money(o.amount, o.currency)}</dd></div>
              {local && <div className="flex justify-between gap-4"><dt className="text-muted">In taka</dt><dd className="font-medium text-ink">{due}</dd></div>}
              <div className="flex justify-between gap-4"><dt className="text-muted">Email</dt><dd className="truncate text-ink">{o.customer.email}</dd></div>
            </dl>
            <a href={`/invoice/${o.number}?t=${o.token}`} className="btn-ghost btn-sm mt-6 w-full">View invoice</a>
            {accounts && (
              <div className="mt-6 rounded-2xl border border-line bg-raised/60 p-4">
                <p className="font-medium text-ink">{mine ? 'Saved in your account' : 'Track it in your account'}</p>
                <p className="mt-1 text-sm text-muted">{mine ? 'Progress, updates and files for this order are all in one place.' : 'See every order, project updates and delivered files in one place, without digging for this link.'}</p>
                <div className="mt-4">
                  {mine ? <Link href={`/account/orders/${o.number}`} className="btn-primary btn-sm w-full">Open in my account</Link>
                    : me ? <ClaimOrder number={o.number} token={o.token} />
                      : <div className="grid gap-2">
                          <Link href={`/account/register?email=${encodeURIComponent(o.customer.email)}&name=${encodeURIComponent(o.customer.name || '')}&${claimQs}`} className="btn-primary btn-sm w-full">Create a free account</Link>
                          <Link href={`/account/login?${claimQs}`} className="btn-ghost btn-sm w-full">I already have one</Link>
                        </div>}
                </div>
              </div>
            )}
            <a href={`mailto:${site.email}?subject=Order ${o.number}`} className="btn-ghost btn-sm mt-3 w-full"><Mail size={15} />Questions? Email me</a>
            <Link href="/" className="mt-3 block text-center text-sm text-muted hover:text-ink">Back to the home page</Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
