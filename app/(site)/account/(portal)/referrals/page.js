import { notFound } from 'next/navigation';
import { Gift, UserPlus, BadgeCheck, MousePointerClick, Wallet, Ticket } from 'lucide-react';
import { dbConnect } from '@/lib/db';
import { Commission, Coupon } from '@/lib/models';
import { getCustomer } from '@/lib/customers';
import { refSettings, ensureRefCode } from '@/lib/referrals';
import { couponLabel } from '@/lib/coupons';
import { serialize, money, fmtDate, siteUrl } from '@/lib/utils';
import { ShareBox } from '@/components/account/Growth';
import InfoTip from '@/components/site/InfoTip';

export const metadata = { title: 'Refer a friend' };

export default async function Referrals() {
  const r = await refSettings();
  if (!r.referral?.enabled) notFound();
  const me = await getCustomer();
  const code = await ensureRefCode(me);
  await dbConnect();
  const [rewards, template] = await Promise.all([
    Commission.find({ customerId: me._id, kind: 'referral' }).sort({ createdAt: -1 }).limit(100).lean().then(serialize),
    r.referral.rewardMode === 'coupon' && r.referral.rewardCoupon ? Coupon.findOne({ code: String(r.referral.rewardCoupon).toUpperCase() }).lean() : null,
  ]);
  const codes = rewards.map((x) => x.couponCode).filter(Boolean);
  const coupons = Object.fromEntries((await Coupon.find({ code: { $in: codes } }).lean()).map((c) => [c.code, c]));
  const ref = r.referral;
  const reward = ref.rewardMode === 'coupon'
    ? (template ? `a ${couponLabel(template, money)} coupon` : 'a discount coupon')
    : `${ref.rate}% of what they pay as credit${ref.maxReward ? ` (up to ${money(ref.maxReward, r.base)})` : ''}`;
  const link = `${siteUrl()}/?ref=${code}`;
  const isAffiliate = r.affiliate?.enabled && me.affiliate?.status === 'approved';
  const steps = [[UserPlus, 'Share your link', 'Send it to a friend who needs a website, SEO or automation.'], [BadgeCheck, 'They order and pay', ref.firstOrderOnly ? 'Their first paid order counts.' : 'Every paid order counts.'], [Gift, 'You get a reward', `You get ${reward} for your next order.`]];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-line bg-gradient-to-br from-signal/20 via-surface to-surface p-7 sm:p-10">
        <div className="grid-paper pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,#000,transparent_70%)]" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-signal/15 px-3 py-1 text-sm font-medium text-signal"><Gift size={15} />Refer a friend</span>
          <h1 className="mt-4 font-display text-[clamp(1.8rem,3.8vw,2.7rem)] font-bold tracking-[-0.03em]">{ref.heading}</h1>
          <p className="mt-3 text-lg text-body">{ref.intro}</p>
        </div>
        <p className="relative mt-8 flex items-center gap-1.5 text-sm font-medium text-ink">Your personal link<InfoTip text="Anyone who opens this link is remembered for a while. If they order and pay in that time, the reward is yours. You can also share just the code." /></p>
        <div className="relative mt-3"><ShareBox link={link} code={code} /></div>
        {isAffiliate && <p className="relative mt-5 text-sm text-muted">You are an approved affiliate, so orders through this link earn affiliate commission instead. See the Affiliate tab.</p>}
      </section>

      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map(([I, t, b], i) => (
          <li key={t} className="card p-6" data-reveal>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-signal/15 text-signal"><I size={20} /></span>
            <p className="mt-4 text-sm text-muted">Step {i + 1}</p>
            <h2 className="mt-1 text-lg font-semibold">{t}</h2>
            <p className="mt-2 text-sm text-body">{b}</p>
          </li>
        ))}
      </ol>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[[MousePointerClick, 'Link visits', me.refStats?.clicks || 0, 'How many people opened your link, counted once per person per day.'], [UserPlus, 'Friends signed up', me.refStats?.signups || 0, 'Friends who created an account after opening your link.'], [BadgeCheck, 'Paid orders', me.refStats?.orders || 0, 'Orders from your friends that were paid and earned you a reward.'], [Wallet, 'Your credit', money(me.credit || 0, r.base), 'Money off your next order, earned from referrals. It is offered at checkout automatically. If a friend\'s order is cancelled, that reward is removed.']].map(([I, k, v, tip]) => (
          <div key={k} className="card p-5"><dt className="flex items-center gap-2 text-sm text-muted"><I size={15} />{k}<InfoTip text={tip} /></dt><dd className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">{v}</dd></div>
        ))}
      </dl>
      {(me.credit || 0) > 0 && <p className="rounded-2xl border border-good/40 bg-good/10 px-5 py-4 text-sm text-good">Your {money(me.credit, r.base)} credit is offered automatically at checkout on your next order.</p>}

      <section className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">Your rewards<InfoTip text="Every reward you earned. Credit is added to your balance. A coupon code works once, only when you are signed in, until it expires." /></h2>
        {rewards.length ? (
          <ul className="mt-4 divide-y divide-line">
            {rewards.map((x) => {
              const c = x.couponCode && coupons[x.couponCode];
              const used = c && (c.usesCount || 0) >= (c.maxUses || 1);
              const expired = c?.expiresAt && new Date(c.expiresAt) < new Date();
              return (
                <li key={x._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div><p className="font-medium text-ink">{x.buyerName || 'A friend'} ordered</p><p className="text-sm text-muted">{fmtDate(x.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
                  {x.status === 'void' ? <span className="text-sm text-muted line-through">{x.couponCode || money(x.amount, x.currency)}</span>
                    : x.couponCode ? <span className="flex items-center gap-2 text-sm"><Ticket size={15} className="text-signal" /><span className="font-mono font-semibold text-ink">{x.couponCode}</span><span className="text-muted">{used ? 'used' : expired ? 'expired' : c ? couponLabel(c, money) : ''}</span></span>
                      : <span className="font-semibold text-good">+{money(x.amount, x.currency)} credit</span>}
                </li>
              );
            })}
          </ul>
        ) : <p className="mt-3 text-sm text-muted">No rewards yet. They appear here as soon as a friend’s order is paid.</p>}
      </section>
    </div>
  );
}
