import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarClock, Download, ExternalLink, FileText, Paperclip, PartyPopper, Clock3 } from 'lucide-react';
import { getCustomer, customerOrder } from '@/lib/customers';
import { PAYMENT_METHODS, ORDER_STATUS } from '@/lib/options';
import { serialize, money, fmtDate, BILLING } from '@/lib/utils';
import Status from '@/components/admin/Status';
import { Steps, ProgressBar, progressOf, needsPayment } from '@/components/account/OrderBits';
import { MessageForm } from '@/components/account/Forms';

export async function generateMetadata(props) {
  const { number } = await props.params;
  return { title: `Order ${number}` };
}

const dt = (d) => fmtDate(d, { month: 'short', day: 'numeric', year: 'numeric' });

export default async function AccountOrder(props) {
  const [{ number }, sp] = await Promise.all([props.params, props.searchParams]);
  const me = await getCustomer();
  const o = serialize(await customerOrder(me, number));
  if (!o) notFound();
  const m = PAYMENT_METHODS.find((x) => x.id === o.method);
  const updates = [...(o.updates || [])].sort((a, b) => new Date(b.at) - new Date(a.at));
  const files = (o.deliverables || []).filter((d) => d.url);
  const running = ['paid', 'in_progress', 'completed'].includes(o.status);
  const pay = needsPayment(o);

  return (
    <div>
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={15} />All orders</Link>
      {sp.welcome && <p className="mt-5 flex items-center gap-3 rounded-2xl border border-good/40 bg-good/10 px-5 py-4 text-sm text-good"><PartyPopper size={18} />Your account is ready and this order is saved in it.</p>}
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Order {o.number} · placed {dt(o.createdAt)}</p>
          <h1 className="mt-1 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-0.03em]">{o.package?.name}</h1>
        </div>
        <Status s={o.status} />
      </div>

      {o.status !== 'cancelled' && <div className="mt-8"><Steps status={o.status} /></div>}

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {pay && (
            <section className="rounded-2xl border border-amber/40 bg-amber/10 p-6">
              <h2 className="text-lg font-semibold text-ink">{o.status === 'failed' ? 'The payment did not go through' : 'Waiting for your payment'}</h2>
              <p className="mt-1 text-sm text-body">Pay {money(o.amount, o.currency)}{o.payment?.amountLocal && o.currency !== 'BDT' && m?.local ? ` (৳${o.payment.amountLocal.toLocaleString('en-US')})` : ''} by {m?.name || o.method}. Work starts once it is confirmed.</p>
              <a href={`/order/${o.number}?t=${o.token}`} className="btn-primary btn-sm mt-4">Complete payment <ArrowRight size={15} /></a>
            </section>
          )}
          {o.status === 'verifying' && <p className="rounded-2xl border border-line bg-surface p-5 text-sm text-body">Your payment{o.payment?.transactionId ? ` (transaction ${o.payment.transactionId})` : ''} is being checked. You will get an email once it is confirmed.</p>}

          {running && (
            <section className="card p-6">
              <ProgressBar value={progressOf(o)} />
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                <div><dt className="text-muted">Started</dt><dd className="mt-1 text-ink">{dt(o.history?.find((h) => h.status === 'in_progress')?.at || o.payment?.paidAt) || 'Soon'}</dd></div>
                <div><dt className="text-muted">{o.status === 'completed' ? 'Delivered' : 'Expected delivery'}</dt><dd className="mt-1 flex items-center gap-1.5 text-ink"><CalendarClock size={14} className="text-muted" />{o.status === 'completed' ? dt(o.history?.findLast?.((h) => h.status === 'completed')?.at) : o.dueDate ? dt(o.dueDate) : o.package?.deliveryDays ? `About ${o.package.deliveryDays} days` : 'Agreed with you'}</dd></div>
                <div><dt className="text-muted">Updates</dt><dd className="mt-1 text-ink">{updates.length}</dd></div>
              </dl>
            </section>
          )}

          <section className="card p-6">
            <h2 className="text-lg font-semibold">Project updates</h2>
            {updates.length ? (
              <ol className="mt-5 space-y-6 border-l border-line">
                {updates.map((u, i) => (
                  <li key={i} className="relative pl-6">
                    <span className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-signal ring-4 ring-signal/20' : 'bg-line'}`} />
                    <p className="text-xs text-muted">{fmtDate(u.at, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p className="mt-1 whitespace-pre-wrap text-body">{u.text}</p>
                    {u.link && <a href={u.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-signal hover:underline"><ExternalLink size={14} />{u.linkLabel || 'Open link'}</a>}
                  </li>
                ))}
              </ol>
            ) : <p className="mt-3 text-sm text-muted">{running ? 'Updates I post about your project appear here, newest first.' : 'Once the payment is confirmed, I post progress updates here.'}</p>}
          </section>

          <section className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Paperclip size={17} className="text-muted" />Files and links</h2>
            {files.length ? (
              <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="min-w-0"><span className="block truncate font-medium text-ink">{f.label || 'File'}</span>{f.note && <span className="block truncate text-xs text-muted">{f.note}</span>}</span>
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm shrink-0"><Download size={14} />Open</a>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-muted">Logins, design files and handover documents are shared here when they are ready.</p>}
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-semibold">Message me about this order</h2>
            <div className="mt-4"><MessageForm orderNumber={o.number} /></div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <section className="card p-6">
            <h2 className="text-lg font-semibold">Summary</h2>
            <dl className="mt-4 space-y-3 text-[0.95rem]">
              {[['Package', o.package?.name], ['Billing', BILLING[o.package?.billing] || o.package?.billing], ['Amount', money(o.amount, o.currency)], ['Payment', m?.name || o.method], ['Paid', dt(o.payment?.paidAt)], ['Invoice', o.invoiceNumber]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="text-right font-medium text-ink">{v}</dd></div>
              ))}
            </dl>
            <a href={`/invoice/${o.number}?t=${o.token}`} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm mt-6 w-full"><FileText size={14} />View invoice</a>
          </section>
          {o.requirements && <section className="card p-6"><h2 className="text-lg font-semibold">Your brief</h2><p className="mt-3 whitespace-pre-wrap text-sm text-body">{o.requirements}</p></section>}
          <section className="card p-6">
            <h2 className="text-lg font-semibold">History</h2>
            <ol className="mt-4 space-y-3 border-l border-line">
              {[...(o.history || [])].reverse().map((h, i) => (
                <li key={i} className="relative pl-4 text-sm"><span className="absolute -left-[4px] top-1.5 h-2 w-2 rounded-full bg-signal" />
                  <p className="text-ink">{ORDER_STATUS[h.status]?.label || h.status}</p>
                  <p className="flex items-center gap-1 text-xs text-muted"><Clock3 size={11} />{fmtDate(h.at, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
