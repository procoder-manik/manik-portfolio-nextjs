import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { seoMeta } from '@/lib/seo';
import { getServicePages, getSettings } from '@/lib/data';
import { ServiceGroups } from '@/components/site/ServiceView';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs } from '@/lib/schema';
import { siteUrl } from '@/lib/utils';

export const dynamic = 'force-static';
export const revalidate = 600;

export const metadata = seoMeta({}, {
  title: 'Services: websites, maintenance, SEO and AI automation',
  description: 'Custom, business and e-commerce websites, WordPress, website maintenance, SEO, AI automation and virtual assistant support. Clear packages and prices.',
  path: '/services', ogKind: 'page',
});

/* /services: every service as a card, grouped. Each card opens its own page. */
export default async function ServicesPage() {
  const [site, services] = await Promise.all([getSettings('site'), getServicePages()]);
  return (
    <>
      <JsonLd data={buildGraph(site, [
        crumbs([['Home', '/'], ['Services', '/services']]),
        { '@type': 'ItemList', name: 'Services', itemListElement: services.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl()}/services/${s.slug}`, name: s.name })) },
      ])} />
      <header className="relative overflow-hidden pb-14 pt-32 sm:pt-40">
        <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_0%,#000,transparent)]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-signal/20 blur-[150px]" />
        <div className="shell relative max-w-4xl space-y-6">
          <p className="font-mono text-[0.74rem] uppercase tracking-[0.2em] text-signal">Services</p>
          <h1 className="font-display text-[clamp(2.6rem,6vw,5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-ink">Websites that work, and the care that keeps them working</h1>
          <p className="max-w-2xl text-lg text-muted sm:text-xl">Pick one service or hand over the whole thing. Every service has clear packages, a fixed price and a real person who answers.</p>
          <div className="flex flex-wrap gap-3"><Link href="/pricing" className="btn-primary">See all prices <ArrowRight size={16} /></Link><Link href="/contact" className="btn-ghost">Ask a question</Link></div>
        </div>
      </header>
      <section className="section border-t border-line pt-16">
        <div className="shell"><ServiceGroups services={services} /></div>
      </section>
    </>
  );
}
