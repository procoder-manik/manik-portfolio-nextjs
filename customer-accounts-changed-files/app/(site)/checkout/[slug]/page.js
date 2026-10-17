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

export async function generateMetadata(props) {
  const params = await props.params;
  const p = await getPackage(params.slug);
  return { title: p ? `Checkout: ${p.name}` : 'Checkout', robots: { index: false } };
}

export default async function Checkout(props) {
  const params = await props.params;
  const [pkg, pay, services, site, me] = await Promise.all([getPackage(params.slug), getSettings('payments'), getServicesWithPackages(), getSettings('site'), getCustomer()]);
  const prefill = me ? { name: me.name, email: me.email, phone: me.phone, company: me.company, country: me.country } : null;
  if (!pkg) notFound();
  if (pkg.checkoutMode === 'quote') redirect(`/contact?service=${encodeURIComponent(pkg.name)}`);
  const svc = services.find((s) => s.slug === pkg.service);
  const bdt = pkg.currency === 'BDT' ? pkg.price : Math.ceil(pkg.price * (pay.bdtRate || 120));
  const methods = PAYMENT_METHODS.filter((m) => pay[m.id]?.enabled).map((m) => ({
    ...m, note: pay[m.id]?.note, auto: (m.id === 'card' && sslczEnabled()) || (m.id === 'paypal' && paypalEnabled()),
  }));

  return (
    <section className="pb-24 pt-32 sm:pt-40">
      <div className="shell">
        <Link href="/pricing" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={15} />Back to pricing</Link>
        <h1 className="mt-6 font-display text-[clamp(2.2rem,4.5vw,3.4rem)] font-bold tracking-[-0.03em]">Checkout</h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <CheckoutForm prefill={prefill} accounts={accountsOn(site)} pkg={{ slug: pkg.slug, name: pkg.name }} methods={methods} amountLabel={money(pkg.price, pkg.currency)} bdtLabel={pkg.currency === 'BDT' ? null : `৳${bdt.toLocaleString('en-US')}`} />
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
                <div className="flex justify-between text-muted"><dt>Billing</dt><dd>{BILLING[pkg.billing] || pkg.billing}</dd></div>
                <div className="flex items-end justify-between border-t border-line pt-4"><dt className="font-semibold text-ink">Due today</dt><dd className="text-right"><span className="block font-display text-3xl font-bold text-ink">{money(pkg.price, pkg.currency)}</span>{pkg.currency !== 'BDT' && <span className="text-sm text-muted">about ৳{bdt.toLocaleString('en-US')} in taka</span>}</dd></div>
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
