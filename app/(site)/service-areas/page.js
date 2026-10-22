import { seoMeta } from '@/lib/seo';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAreas, getServiceAreas, getSettings, getPageSeo, getSystemPage } from '@/lib/data';
import SystemSections from '@/components/site/SystemSections';
import { layoutOf, pageLive } from '@/lib/system-pages';
import { AreaCard } from '@/components/site/ServiceAreaViews';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs } from '@/lib/schema';
import { siteUrl } from '@/lib/utils';

export const revalidate = 600;

export async function generateMetadata() {
  const own = await getPageSeo('serviceAreas');
  return seoMeta(own, { title: 'Service areas', description: 'Websites for local businesses, by place and niche. Pick a place to see the services I offer there.', path: '/service-areas', ogKind: 'page' });
}

export default async function ServiceAreasPage() {
  const [site, areas, pages, sp] = await Promise.all([getSettings('site'), getAreas(), getServiceAreas(), getSystemPage('serviceAreas')]);
  if (!pageLive(sp)) notFound();
  const bySlug = Object.fromEntries(areas.map((a) => [a.slug, a]));
  const top = areas.filter((a) => !a.parent || !bySlug[a.parent]);
  const kids = (slug) => areas.filter((a) => a.parent === slug);
  const pagesOf = (slug) => pages.filter((p) => p.area === slug);
  // A place card lists its own pages and the pages of the places inside it.
  const allOf = (a) => [...pagesOf(a.slug), ...kids(a.slug).flatMap((k) => pagesOf(k.slug))];
  const ordered = [...top].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  return (
    <>
      <JsonLd builtin="serviceAreas" data={buildGraph(site, [crumbs([['Home', '/'], ['Service areas', '/service-areas']]), {
        '@type': 'CollectionPage', name: 'Service areas', url: `${siteUrl()}/service-areas`,
        mainEntity: { '@type': 'ItemList', itemListElement: pages.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl()}/service-areas/${c.slug}`, name: c.title })) },
      }])} />
      <SystemSections layout={layoutOf('serviceAreas', sp)} tops={['intro']} parts={{
        intro: (b) => (
          <section className="relative overflow-hidden pb-12 pt-36 sm:pt-44">
            <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_20%_0%,#000,transparent)]" />
            <div className="pointer-events-none absolute -right-40 -top-32 h-[460px] w-[460px] rounded-full bg-signal/15 blur-[120px]" />
            <div className="shell relative grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
              <h1 className="h-display max-w-[11ch]">{b.heading || 'Where I work'}</h1>
              <p className="lede lg:ml-auto lg:text-right">{b.text || 'Pick a place to see the services I offer there and the sites I have built for businesses in that area.'}</p>
            </div>
          </section>
        ),
        areas: () => (
          <section className="pb-24">
            <div className="shell">
              {ordered.length
                ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{ordered.map((a) => <AreaCard key={a.slug} area={a} pages={allOf(a)} children={kids(a.slug)} />)}</div>
                : <p className="rounded-2xl border border-dashed border-line p-12 text-center text-muted">Places are on the way.</p>}
            </div>
          </section>
        ),
        cta: (b) => (
          <section className="px-3 pb-24 sm:px-5">
            <div className="relative mx-auto max-w-shell overflow-hidden rounded-[32px] bg-signal px-6 py-14 text-white sm:px-14">
              <div className="grid-paper pointer-events-none absolute inset-0 opacity-60 [--grid:255_255_255]" />
              <div className="relative flex flex-wrap items-center justify-between gap-6">
                <h2 className="h-section max-w-[18ch] text-white">{b.heading || 'Not seeing your place or niche?'}</h2>
                <Link href={b.href || '/contact'} className="btn bg-white text-[#0C1526] hover:bg-white/90">{b.label || 'Tell me about your business'} <ArrowRight size={16} /></Link>
              </div>
            </div>
          </section>
        ),
      }} />
    </>
  );
}
