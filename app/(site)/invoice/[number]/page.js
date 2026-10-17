import { notFound } from 'next/navigation';
import { dbConnect, hasDB } from '@/lib/db';
import { Order } from '@/lib/models';
import { getAllSettings } from '@/lib/data';
import { PAYMENT_METHODS } from '@/lib/options';
import { serialize, money, fmtDate, BILLING, siteUrl } from '@/lib/utils';
import PrintButton from '@/components/site/PrintButton';

export const metadata = { title: 'Invoice', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function InvoicePage(props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  if (!hasDB()) notFound();
  await dbConnect();
  const o = serialize(await Order.findOne({ number: params.number, token: searchParams.t }).lean());
  if (!o) notFound();
  const { site, payments } = await getAllSettings();
  const paid = ['paid', 'in_progress', 'completed'].includes(o.status);
  const number = o.invoiceNumber || `INV-${o.number.replace(/^MH-/, '')}`;
  const method = PAYMENT_METHODS.find((m) => m.id === o.method)?.name;
  const local = o.payment?.amountLocal && o.currency !== 'BDT' && ['bkash', 'nagad', 'rocket', 'card'].includes(o.method);

  return (
    <section className="pb-24 pt-32 sm:pt-40 print:p-0">
      <div className="shell max-w-4xl print:max-w-none print:px-0">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">Use Print and choose &ldquo;Save as PDF&rdquo; to download.</p>
          <div className="flex gap-2"><a href={`/order/${o.number}?t=${o.token}`} className="btn-ghost btn-sm">Order page</a><PrintButton label="Download PDF" /></div>
        </div>
        <article className="overflow-hidden rounded-[24px] border border-[#DCE2EC] bg-white text-[#33405A] shadow-[0_40px_100px_-50px_rgba(0,0,0,.6)] print:rounded-none print:border-0 print:shadow-none">
          <header className="relative bg-[#0C1526] px-8 py-9 text-white sm:px-12" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)', backgroundSize: '32px 32px', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#6391FF] font-display font-bold">MH</span>
                <div><p className="font-display text-xl font-semibold">{site.name}</p><p className="text-sm text-white/60">{site.role}</p></div>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-bold tracking-tight">Invoice</p>
                <p className="mt-1 text-sm text-white/70">{number}</p>
                <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${paid ? 'bg-[#34D399] text-[#052E1F]' : o.status === 'cancelled' ? 'bg-[#F87171] text-[#450A0A]' : 'bg-[#FFB446] text-[#3B2300]'}`}>{paid ? 'PAID' : o.status === 'cancelled' ? 'CANCELLED' : 'DUE'}</span>
              </div>
            </div>
          </header>
          <div className="grid gap-8 px-8 py-9 sm:grid-cols-3 sm:px-12">
            <div><p className="text-xs font-semibold text-[#62718D]">Billed to</p><p className="mt-2 font-semibold text-[#0C1526]">{o.customer.name}</p>{o.customer.company && <p>{o.customer.company}</p>}<p>{o.customer.email}</p>{o.customer.phone && <p>{o.customer.phone}</p>}{o.customer.country && <p>{o.customer.country}</p>}</div>
            <div><p className="text-xs font-semibold text-[#62718D]">From</p><p className="mt-2 font-semibold text-[#0C1526]">{site.name}</p><p>{site.email}</p><p>{site.phone}</p><p>{siteUrl().replace(/^https?:\/\//, '')}</p></div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold text-[#62718D]">Issued</p><p className="mt-2 text-[#0C1526]">{fmtDate(o.createdAt, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p className="mt-3 text-xs font-semibold text-[#62718D]">Order</p><p className="text-[#0C1526]">{o.number}</p>
              {paid && o.payment?.paidAt && <><p className="mt-3 text-xs font-semibold text-[#62718D]">Paid on</p><p className="text-[#0C1526]">{fmtDate(o.payment.paidAt, { month: 'long', day: 'numeric', year: 'numeric' })}</p></>}
            </div>
          </div>
          <div className="px-8 sm:px-12">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-y border-[#DCE2EC] text-xs text-[#62718D]"><th className="py-3 font-semibold">Description</th><th className="py-3 font-semibold">Billing</th><th className="py-3 text-right font-semibold">Qty</th><th className="py-3 text-right font-semibold">Amount</th></tr></thead>
              <tbody>
                <tr className="border-b border-[#DCE2EC] align-top">
                  <td className="py-4 pr-4"><p className="font-semibold text-[#0C1526]">{o.package?.name}</p>{o.requirements && <p className="mt-1 line-clamp-3 text-xs text-[#62718D]">{o.requirements}</p>}</td>
                  <td className="py-4">{BILLING[o.package?.billing] || o.package?.billing}</td><td className="py-4 text-right">1</td>
                  <td className="py-4 text-right font-semibold text-[#0C1526]">{money(o.subtotal ?? o.amount, o.currency)}</td>
                </tr>
              </tbody>
            </table>
            <dl className="ml-auto mt-6 max-w-xs space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-[#62718D]">Subtotal</dt><dd>{money(o.subtotal ?? o.amount, o.currency)}</dd></div>
              {o.discount > 0 && <div className="flex justify-between"><dt className="text-[#62718D]">Coupon {o.coupon?.code}</dt><dd>-{money(o.discount, o.currency)}</dd></div>}
              {o.creditUsed > 0 && <div className="flex justify-between"><dt className="text-[#62718D]">Referral credit</dt><dd>-{money(o.creditUsed, o.currency)}</dd></div>}
              <div className="flex justify-between border-t border-[#DCE2EC] pt-3 text-[1rem]"><dt className="font-semibold text-[#0C1526]">Total</dt><dd className="font-display text-xl font-bold text-[#0C1526]">{money(o.amount, o.currency)}</dd></div>
              {local && <div className="flex justify-between text-[#62718D]"><dt>Paid in taka</dt><dd>৳{Number(o.payment.amountLocal).toLocaleString('en-US')}</dd></div>}
              <div className="flex justify-between text-[#62718D]"><dt>Amount due</dt><dd className="font-semibold text-[#0C1526]">{paid ? money(0, o.currency) : money(o.amount, o.currency)}</dd></div>
            </dl>
          </div>
          <div className="mt-10 grid gap-6 border-t border-[#DCE2EC] bg-[#F7F9FC] px-8 py-7 text-sm sm:grid-cols-2 sm:px-12" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
            <div><p className="text-xs font-semibold text-[#62718D]">Payment</p><p className="mt-1 text-[#0C1526]">{method}{o.payment?.transactionId ? `, ref ${o.payment.transactionId}` : ''}</p>{!paid && payments[o.method]?.note && <p className="mt-1 text-xs">{payments[o.method].note}</p>}</div>
            <div className="sm:text-right"><p className="text-xs font-semibold text-[#62718D]">Questions</p><p className="mt-1">Reply to your order email or write to {site.email}</p></div>
          </div>
          <p className="px-8 py-5 text-center text-xs text-[#62718D] sm:px-12">Thank you for your business.</p>
        </article>
      </div>
    </section>
  );
}
