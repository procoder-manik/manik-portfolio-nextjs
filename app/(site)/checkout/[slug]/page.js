import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Check, ShieldCheck, Clock3 } from 'lucide-react';
import { getPackage, getServicesWithPackages, getSettings } from '@/lib/data';
import CheckoutForm from '@/components/site/CheckoutForm';
import { PAYMENT_METHODS } from '@/lib/options';
import { sslczEnabled } from '@/lib/payments/sslcommerz';
import { paypalEnabled } from '@/lib/payments/paypal';
import { priceLabel, money, BILLING } from '@/lib/utils';
import { getCustomer } from '@/lib/customers';
import { accountsOn } from '@/lib/features';
import { refCookieCode } from '@/lib/referrals';
import { hasChoice, priceFor, periodOf, yearlySavings } from '@/lib/plans';

export async function generateMetadata(props) {
  const params = await props.params;
  const p = await getPackage(params.slug);
  return { title: p ? `Checkout: ${p.name}` : 'Checkout', robots: { index: false } };
}

export default async function Checkout(props) {
  const params = await props.params; const sp = (await props.searchParams) || {};
  const [pkg, pay, services, site, me, refs, refCode] = await Promise.all([getPackage(params.slug), getSettings('payments'), getServicesWithPackages(), getSettings('site'), getCustomer(), getSettings('referrals'), refCookieCode()]);
  const sameCur = (pkg?.currency || 'USD') === (pay.currency || 'USD');
  const credit = me && sameCur && me.credit > 0 ? Math.round(me.credit * 100) / 100 : 0;
  const friendCoupon = refCode && refs.referral?.enabled && refs.referral.friendCoupon && (!me || me.refCode !== refCode) ? refs.referral.friendCoupon : '';
  const prefill = me ? { name: me.name, email: me.email, phone: me.phone, company: me.company, country: me.country } : null;
  if (!pkg) notFound();
  if (pkg.checkoutMode === 'quote') redirect(`/contact?service=${encodeURIComponent(pkg.name)}`);
  const svc = services.find((s) => s.slug === pkg.service);
  const period = periodOf(pkg, sp.period); const choice = hasChoice(pkg);
  const unit = priceFor(pkg, period); const sv = yearlySavings(pkg);
  const bdt = pkg.currency === 'BDT' ? unit : Math.ceil(unit * (pay.bdtRate || 120));
  const methods = PAYMENT_METHODS.filter((m) => pay[m.id]?.enabled).map((m) => ({
    ...m, note: pay[m.id]?.note, auto: (m.id === 'card' && sslczEnabled()) || (m.id === 'paypal' && paypalEnabled()),
  }));

  return (
    <section className="pb-24 pt-32 sm:pt-40">
      <div className="shell">
        <Link href="/pricing" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={15} />Back to pricing</Link>
        <h1 className="mt-6 font-display text-[clamp(2.2rem,4.5vw,3.4rem)] font-bold tracking-[-0.03em]">Checkout</h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <CheckoutForm prefill={prefill} accounts={accountsOn(site)} coupons={refs.coupons?.enabled !== false} credit={credit} friendCoupon={friendCoupon} price={unit} currency={pkg.currency || 'USD'} bdtRate={pay.bdtRate || 120} pkg={{ slug: pkg.slug, name: pkg.name, period: choice ? period : undefined }} methods={methods} amountLabel={money(unit, pkg.currency)} bdtLabel={pkg.currency === 'BDT' ? null : `৳${bdt.toLocaleString('en-US')}`} />
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card overflow-hidden">
              <div className="border-b border-line bg-gradient-to-br from-signal/15 to-transparent p-6">
                <p className="text-sm text-muted">{svc?.name}</p>
                <h2 className="mt-1 text-2xl font-semibold">{pkg.name}</h2>
                {pkg.tagline && <p className="mt-2 text-[0.95rem] text-muted">{pkg.tagline}</p>}
              </div>
              <ul className="space-y-3 p-6 text-[0.95rem]">
                {(pkg.features || []).map((f) => <li key={f} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-signal" />{f}</li>)}
                {pkg.deliveryDays ? <li className="flex gap-3 text-muted"><Clock3 size={18} className="mt-0.5 shrink-0" />Delivery in about {pkg.deliveryDays} days</li> : null}
              </ul>
              <dl className="space-y-3 border-t border-line p-6 text-[0.95rem]">
                {pkg.priceMax ? <div className="flex justify-between text-muted"><dt>Package range</dt><dd>{priceLabel(pkg)}</dd></div> : null}
                <div className="flex justify-between text-muted"><dt>Billing</dt><dd>{choice ? (period === 'yearly' ? 'per year' : 'per month') : BILLING[pkg.billing] || pkg.billing}</dd></div>
                {choice && <div className="flex justify-between gap-3 text-muted"><dt>Plan</dt><dd className="text-right"><Link href={`/checkout/${pkg.slug}?period=${period === 'yearly' ? 'monthly' : 'yearly'}`} className="text-signal hover:underline">{period === 'yearly' ? 'Switch to monthly' : `Switch to yearly${sv.amount > 0 ? ` and save ${money(sv.amount, pkg.currency)}` : ''}`}</Link></dd></div>}
                {choice && period === 'yearly' && sv.amount > 0 && <div className="flex justify-between text-good"><dt>You save</dt><dd>{money(sv.amount, pkg.currency)} ({sv.percent}%)</dd></div>}
                {['monthly', 'yearly'].includes(period) && <div className="text-xs text-muted">This is a {period} plan. It runs for one {period === 'yearly' ? 'year' : 'month'} from the day it starts. I email you before it ends so you can renew.</div>}
                <div className="flex items-end justify-between border-t border-line pt-4"><dt className="font-semibold text-ink">Due today</dt><dd className="text-right"><span className="block font-display text-3xl font-bold text-ink">{money(unit, pkg.currency)}</span>{pkg.currency !== 'BDT' && <span className="text-sm text-muted">about ৳{bdt.toLocaleString('en-US')} in taka</span>}</dd></div>
              </dl>
              {(pkg.checkoutNote || pkg.priceMax) && <p className="mx-6 mb-6 rounded-xl bg-amber/10 px-4 py-3 text-sm text-body">{pkg.checkoutNote || 'This is the starting price. If your project needs more, I send a quote for the difference before any extra work starts.'}</p>}
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted"><ShieldCheck size={16} className="text-good" />Card payments are handled by the payment provider. Card details never reach this site.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
