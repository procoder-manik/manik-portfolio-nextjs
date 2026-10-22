import Link from 'next/link';
import { seoMeta } from '@/lib/seo';
import { ArrowUpRight } from 'lucide-react';
import { getServicesWithPackages, getAllSettings, getPageSeo, getSystemPage } from '@/lib/data';
import { notFound } from 'next/navigation';
import SystemSections from '@/components/site/SystemSections';
import { layoutOf, pageLive } from '@/lib/system-pages';

import { PackageGrid } from '@/components/site/PricingTabs';
import Faq from '@/components/site/Faq';
import Icon from '@/components/site/Icon';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs, catalogNode, faqNode } from '@/lib/schema';
import { PAYMENT_METHODS } from '@/lib/options';

export async function generateMetadata() {
  return seoMeta(await getPageSeo('pricing'), { title: 'Pricing and packages', description: 'Web design, SEO, automation and maintenance packages with clear starting prices. Pay by bKash, Nagad, Rocket, card, bank, PayPal or Payoneer.', path: '/pricing' , ogKind: 'page' });
}

export default async function PricingPage() {
  const [services, { site, home, payments }, sp] = await Promise.all([getServicesWithPackages(), getAllSettings(), getSystemPage('pricing')]);
  if (!pageLive(sp)) notFound();
  const methods = PAYMENT_METHODS.filter((m) => payments[m.id]?.enabled);
  return (
    <>
      <JsonLd builtin="pricing" data={buildGraph(site, [crumbs([['Home', '/'], ['Pricing', '/pricing']]), catalogNode(services), faqNode(home.faq?.items)])} />
      <SystemSections layout={layoutOf('pricing', sp)} tops={['intro']} parts={{
        intro: (b) => (
            <section className="relative overflow-hidden pb-10 pt-36 sm:pt-44">
              <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_20%_0%,#000,transparent)]" />
              <div className="shell relative grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
                <div>
                  <h1 className="h-display max-w-[13ch]">{b.heading || 'Packages and pricing'}</h1>
                  <p className="lede mt-6">{b.text || home.pricing?.intro}</p>
                </div>
                <div className="lg:text-right">
                  <p className="text-sm text-muted">Pay with</p>
                  <div className="mt-3 flex flex-wrap gap-2 lg:justify-end">
                    {methods.map((m) => <span key={m.id} className="chip"><span className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.name}</span>)}
                  </div>
                </div>
              </div>
              <nav className="shell relative mt-10 flex flex-wrap gap-2" aria-label="Jump to service">
                {services.map((s) => <a key={s.slug} href={`#${s.slug}`} className="chip px-3.5 py-2 text-sm hover:border-signal hover:text-ink">{s.name}</a>)}
              </nav>
            </section>
        ),
        packages: () => (<>
            {services.map((s) => (
              <section key={s.slug} id={s.slug} className="border-t border-line py-20">
                <div className="shell">
                  <div className="mb-10 grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
                    <div className="flex items-start gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-signal/15 text-signal"><Icon name={s.icon} size={22} /></span>
                      <h2 className="h-section text-[clamp(1.8rem,3.4vw,2.6rem)]">{s.name}</h2>
                    </div>
                    <p className="lede md:ml-auto md:text-right">{s.summary}</p>
                  </div>
                  <PackageGrid packages={s.packages} lay={home.pricing || {}} />
                </div>
              </section>
            ))}
        </>),
        help: (b) => (
            <section className="section border-t border-line">
              <div className="shell grid gap-12 lg:grid-cols-[1fr_1.6fr]">
                <div>
                  <h2 className="h-section max-w-[12ch]">{b.heading || 'Not sure which one fits?'}</h2>
                  <p className="lede mt-5">{b.text || 'Book a free 30-minute call. You get a scope and an exact number either way.'}</p>
                  <a href={site.calendly} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8">Book a free call <ArrowUpRight size={16} /></a>
                  <Link href="/contact" className="btn-ghost ml-2 mt-8">Send a message</Link>
                </div>
                <Faq items={home.faq?.items} />
              </div>
            </section>
        ),
      }} />
    </>
  );
}
