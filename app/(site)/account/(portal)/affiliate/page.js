import { notFound } from 'next/navigation';
import { Handshake, MousePointerClick, UserPlus, BadgeCheck, Clock3, CircleDollarSign, Hourglass, CheckCircle2, PauseCircle } from 'lucide-react';
import { dbConnect } from '@/lib/db';
import { Commission, Payout } from '@/lib/models';
import { getCustomer } from '@/lib/customers';
import { refSettings, ensureRefCode, affiliateTotals } from '@/lib/referrals';
import { serialize, money, fmtDate, siteUrl } from '@/lib/utils';
import { ShareBox, AffiliateApply, PayoutDetails, RequestPayout } from '@/components/account/Growth';
import InfoTip from '@/components/site/InfoTip';

export const metadata = { title: 'Affiliate' };
const d = (x) => fmtDate(x, { month: 'short', day: 'numeric', year: 'numeric' });

export default async function Affiliate() {
  const r = await refSettings();
  const me = await getCustomer();
  const st = me.affiliate?.status || 'none';
  if (!r.affiliate?.enabled && st !== 'approved') notFound();
  const a = r.affiliate; const rate = me.affiliate?.rate ?? a.rate;

  const Hero = ({ children }) => (
    <section className="relative overflow-hidden rounded-[28px] border border-line bg-gradient-to-br from-amber/15 via-surface to-surface p-7 sm:p-10">
      <div className="grid-paper pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,#000,transparent_70%)]" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber/15 px-3 py-1 text-sm font-medium text-amber"><Handshake size={15} />Affiliate program</span>
        <h1 className="mt-4 max-w-2xl font-display text-[clamp(1.8rem,3.8vw,2.7rem)] font-bold tracking-[-0.03em]">{a.heading}</h1>
        <p className="mt-3 max-w-2xl text-lg text-body">{a.intro}</p>
        {children}
      </div>
    </section>
  );

  if (st === 'none' || st === 'rejected') {
    return (
      <div className="space-y-8">
        <Hero>
          <dl className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            {[['Commission', `${rate}%`, `You earn this share of what each client pays. Example: a 500 order earns you ${Math.round(5 * rate)}.`], ['Paid after', `${a.holdDays} days`, 'Commission waits this long before you can withdraw it, in case an order is cancelled.'], ['Minimum payout', money(a.minPayout, r.base), 'You can request a payout once your available balance reaches this amount.']].map(([k, v, tip]) => <div key={k} className="rounded-2xl border border-line bg-base/40 p-4"><dt className="flex items-center gap-1.5 text-xs text-muted sm:text-sm">{k}<InfoTip text={tip} /></dt><dd className="mt-1 font-display text-xl font-bold text-ink sm:text-2xl">{v}</dd></div>)}
          </dl>
        </Hero>
        <section className="card max-w-3xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold">{st === 'rejected' ? 'Apply again' : 'Apply to join'}</h2>
          {st === 'rejected' && me.affiliate?.adminNote && <p className="mt-2 text-sm text-muted">Last time: {me.affiliate.adminNote}</p>}
          <div className="mt-6"><AffiliateApply methods={a.payoutMethods || []} terms={a.terms} /></div>
        </section>
      </div>
    );
  }
  if (st === 'pending') return <Hero><p className="mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-base/40 p-5 text-body"><Hourglass className="shrink-0 text-amber" />Your application is in. You will get an email as soon as it is reviewed, usually within two working days.</p></Hero>;
  if (st === 'paused') return <Hero><p className="mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-base/40 p-5 text-body"><PauseCircle className="shrink-0 text-muted" />Your affiliate account is paused. Send me a message if you have questions.</p></Hero>;

  // Approved
  const code = await ensureRefCode(me);
  await dbConnect();
  const [t, rows, payouts] = await Promise.all([
    affiliateTotals(me._id),
    Commission.find({ customerId: me._id, kind: 'affiliate' }).sort({ createdAt: -1 }).limit(100).lean().then(serialize),
    Payout.find({ customerId: me._id }).sort({ createdAt: -1 }).limit(50).lean().then(serialize),
  ]);
  const waiting = payouts.some((p) => p.status === 'requested');
  const canRequest = !waiting && t.available >= (a.minPayout || 0) && t.available > 0;
  const now = Date.now();
  const label = (c) => c.status === 'pending' ? (new Date(c.availableAt).getTime() <= now ? 'Available' : `Available ${d(c.availableAt)}`) : { requested: 'Payout requested', paid: 'Paid', void: 'Cancelled order' }[c.status] || c.status;

  return (
    <div className="space-y-8">
      <Hero>
        <p className="mt-2 text-sm text-muted">You earn <strong className="text-ink">{rate}%</strong> of every paid order that comes through your link.</p>
        <div className="mt-6"><ShareBox link={`${siteUrl()}/?ref=${code}`} code={code} message="I recommend Manik Hossain for websites, WordPress and SEO:" /></div>
      </Hero>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[[MousePointerClick, 'Link visits', me.refStats?.clicks || 0, 'People who opened your link, counted once per person per day.'], [UserPlus, 'Sign-ups', me.refStats?.signups || 0, 'People who created an account after opening your link.'], [BadgeCheck, 'Paid orders', me.refStats?.orders || 0, 'Paid orders that earned you commission.'], [CircleDollarSign, 'Total earned', money(t.holding + t.available + t.requested + t.paid, r.base), 'All commission so far: on hold, available, requested and already paid.']].map(([I, k, v, tip]) => (
          <div key={k} className="card p-5"><dt className="flex items-center gap-2 text-sm text-muted"><I size={15} />{k}<InfoTip text={tip} /></dt><dd className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">{v}</dd></div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Balance</h2>
          <dl className="mt-4 space-y-3 text-[0.95rem]">
            <div className="flex justify-between"><dt className="flex items-center gap-2 text-muted"><Clock3 size={15} />On hold ({a.holdDays} days)<InfoTip text={`New commission waits ${a.holdDays} days before it can be withdrawn, in case the order is cancelled.`} /></dt><dd className="text-ink">{money(t.holding, r.base)}</dd></div>
            <div className="flex justify-between"><dt className="flex items-center gap-2 text-muted"><Hourglass size={15} />Payout requested<InfoTip text="Money you asked to be paid that is on its way, usually within a few working days." /></dt><dd className="text-ink">{money(t.requested, r.base)}</dd></div>
            <div className="flex justify-between"><dt className="flex items-center gap-2 text-muted"><CheckCircle2 size={15} />Paid to you<InfoTip text="Everything already sent to your payout account." /></dt><dd className="text-ink">{money(t.paid, r.base)}</dd></div>
            <div className="flex items-end justify-between border-t border-line pt-4"><dt className="flex items-center gap-1.5 font-semibold text-ink">Available now<InfoTip text={`Commission past the holding period that you can withdraw. Request it once it reaches ${money(a.minPayout, r.base)}.`} /></dt><dd className="font-display text-3xl font-bold text-good">{money(t.available, r.base)}</dd></div>
          </dl>
          <div className="mt-5"><RequestPayout disabled={!canRequest} label={waiting ? 'A payout is on its way' : canRequest ? `Request ${money(t.available, r.base)}` : `Payouts start at ${money(a.minPayout, r.base)}`} /></div>
          <div className="mt-6 border-t border-line pt-5"><h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium">Send my payouts to<InfoTip text="Where your money is sent. Double-check the number or email, because payouts go exactly there." /></h3><PayoutDetails methods={a.payoutMethods || []} method={me.affiliate?.payoutMethod} details={me.affiliate?.payoutDetails} /></div>
        </section>
        <section className="card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">Commissions<InfoTip text="One line per paid order from your link: the order value and what you earned. Cancelled orders are crossed out and not paid." /></h2>
          {rows.length ? (
            <ul className="mt-4 divide-y divide-line">
              {rows.map((c) => (
                <li key={c._id} className="flex items-center justify-between gap-3 py-3">
                  <div><p className="font-medium text-ink">{c.buyerName || 'Client'}, order of {money(c.base, c.currency)}</p><p className="text-xs text-muted">{d(c.createdAt)} · {label(c)}</p></div>
                  <span className={c.status === 'void' ? 'text-muted line-through' : 'font-semibold text-good'}>+{money(c.amount, c.currency)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-muted">Commissions appear here when someone you sent pays for an order.</p>}
          {payouts.length > 0 && (
            <>
              <h3 className="mt-8 text-sm font-medium">Payouts</h3>
              <ul className="mt-2 divide-y divide-line text-sm">
                {payouts.map((p) => <li key={p._id} className="flex justify-between gap-3 py-2.5"><span className="text-muted">{d(p.createdAt)} · {p.method}{p.reference ? `, ref ${p.reference}` : ''}</span><span className="text-ink">{money(p.amount, p.currency)} <span className="text-muted">({p.status})</span></span></li>)}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
