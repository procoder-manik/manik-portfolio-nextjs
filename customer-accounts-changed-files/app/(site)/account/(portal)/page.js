import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertTriangle, MailWarning, CalendarDays, Package, MessageSquare, PartyPopper } from 'lucide-react';
import { getAllSettings } from '@/lib/data';
import { dbConnect } from '@/lib/db';
import { Message } from '@/lib/models';
import { getCustomer, customerOrders, messageFilter, ACTIVE, WAITING, DONE } from '@/lib/customers';
import { mailEnabled } from '@/lib/mail';
import { serialize, money, fmtDate } from '@/lib/utils';
import { OrderCard } from '@/components/account/OrderBits';
import { ResendVerify, ClaimForm } from '@/components/account/Forms';

export const metadata = { title: 'Overview' };

export default async function AccountHome(props) {
  const sp = await props.searchParams;
  const me = await getCustomer();
  const [orders, { site }] = await Promise.all([customerOrders(me).then(serialize), getAllSettings()]);
  await dbConnect();
  const messages = serialize(await Message.find(messageFilter(me)).sort({ updatedAt: -1 }).limit(3).lean());

  const active = orders.filter((o) => ACTIVE.includes(o.status));
  const waiting = orders.filter((o) => WAITING.includes(o.status));
  const done = orders.filter((o) => DONE.includes(o.status));
  const spentBy = {};
  orders.filter((o) => [...ACTIVE, ...DONE].includes(o.status)).forEach((o) => { spentBy[o.currency || 'USD'] = (spentBy[o.currency || 'USD'] || 0) + (o.amount || 0); });
  const spent = Object.entries(spentBy).map(([c, v]) => money(v, c)).join(' + ') || money(0, 'USD');
  const first = (me.name || '').split(' ')[0] || 'there';

  const stats = [['Active projects', active.length], ['Awaiting payment', waiting.length], ['Completed', done.length], ['Total paid', spent]];

  return (
    <div className="space-y-10">
      {sp.welcome && <Banner tone="good" icon={PartyPopper}>Welcome aboard, {first}. Your account is ready.{sp.welcome === 'sent' ? ' I sent you an email to confirm your address.' : ''}</Banner>}
      {sp.verified === '1' && <Banner tone="good" icon={CheckCircle2}>Email confirmed. Every order placed with {me.email} is now in your account.</Banner>}
      {sp.verified === '0' && <Banner tone="bad" icon={AlertTriangle}>That confirmation link has expired or was already used. Send a new one below.</Banner>}
      {!me.emailVerified && (
        <div className="flex flex-col gap-4 rounded-2xl border border-amber/40 bg-amber/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex gap-3 text-sm text-body"><MailWarning size={18} className="mt-0.5 shrink-0 text-amber" /><span><strong className="text-ink">Confirm your email</strong> to see orders you placed before you had an account. {mailEnabled() ? 'Check your inbox for the link.' : 'Send me a message and I will confirm it for you.'}</span></p>
          {mailEnabled() && <ResendVerify />}
        </div>
      )}

      <div>
        <h1 className="font-display text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-[-0.03em]">Hi, {first}</h1>
        <p className="mt-2 text-lg text-muted">{active.length ? `You have ${active.length} project${active.length > 1 ? 's' : ''} in progress.` : orders.length ? 'Here is everything you have ordered so far.' : 'Nothing ordered yet. When you buy a package it shows up here with live progress.'}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([k, v]) => <div key={k} className="card p-5"><dt className="text-sm text-muted">{k}</dt><dd className="mt-2 truncate font-display text-2xl font-bold text-ink sm:text-3xl">{v}</dd></div>)}
      </dl>

      {waiting.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Needs your attention</h2>
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
            {waiting.map((o) => (
              <li key={o.number} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-medium text-ink">{o.package?.name} <span className="text-muted">· {o.number}</span></p>
                  <p className="text-sm text-muted">{o.status === 'verifying' ? `Payment ${o.payment?.transactionId || ''} is being checked. Nothing to do.` : o.status === 'failed' ? 'The payment did not go through.' : `Placed ${fmtDate(o.createdAt, { month: 'short', day: 'numeric' })}, ${money(o.amount, o.currency)} to pay.`}</p></div>
                {o.status !== 'verifying' ? <a href={`/order/${o.number}?t=${o.token}`} className="btn-primary btn-sm shrink-0">Complete payment <ArrowRight size={15} /></a> : <Link href={`/account/orders/${o.number}`} className="btn-ghost btn-sm shrink-0">View</Link>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="flex items-end justify-between gap-4"><h2 className="text-xl font-semibold">Ongoing projects</h2>{orders.length > 0 && <Link href="/account/orders" className="text-sm font-medium text-signal hover:underline">All orders</Link>}</div>
        {active.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{active.map((o) => <OrderCard key={o.number} o={o} />)}</div>
          : <p className="mt-4 rounded-2xl border border-dashed border-line p-6 text-muted">No project is running right now.{done.length ? ' Your finished projects are under Orders.' : ''}</p>}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card p-6">
          <div className="flex items-end justify-between gap-4"><h2 className="text-lg font-semibold">Recent messages</h2><Link href="/account/messages" className="text-sm font-medium text-signal hover:underline">Open messages</Link></div>
          {messages.length ? (
            <ul className="mt-4 divide-y divide-line">
              {messages.map((m) => (
                <li key={m._id} className="py-3">
                  <p className="font-medium text-ink">{m.subject}</p>
                  <p className="text-sm text-muted">{m.replies?.length ? `${m.replies.length} repl${m.replies.length > 1 ? 'ies' : 'y'}, last ${fmtDate(m.replies[m.replies.length - 1].at, { month: 'short', day: 'numeric' })}` : `Sent ${fmtDate(m.createdAt, { month: 'short', day: 'numeric' })}, waiting for a reply`}</p>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-sm text-muted">No messages yet. Questions about an order or a new idea? Write to me from Messages.</p>}
        </section>
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Quick links</h2>
          <div className="mt-4 grid gap-2">
            <Link href="/pricing" className="btn-ghost btn-sm justify-start"><Package size={15} />Browse packages</Link>
            <Link href="/account/messages" className="btn-ghost btn-sm justify-start"><MessageSquare size={15} />Message me</Link>
            {site.calendly && <a href={site.calendly} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm justify-start"><CalendarDays size={15} />Book a call</a>}
          </div>
          <details className="mt-6 border-t border-line pt-4">
            <summary className="cursor-pointer text-sm font-medium text-ink">An order is missing?</summary>
            <p className="mb-4 mt-2 text-sm text-muted">Paste the order link from your confirmation email and it is added here.</p>
            <ClaimForm />
          </details>
        </section>
      </div>
    </div>
  );
}

function Banner({ tone, icon: I, children }) {
  return <p className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm ${tone === 'good' ? 'border-good/40 bg-good/10 text-good' : 'border-bad/40 bg-bad/10 text-bad'}`}><I size={18} className="shrink-0" />{children}</p>;
}
