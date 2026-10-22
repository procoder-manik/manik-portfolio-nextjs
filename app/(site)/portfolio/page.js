import { getProjects, getSettings, getPageSeo, getSystemPage } from '@/lib/data';
import { notFound } from 'next/navigation';
import SystemSections from '@/components/site/SystemSections';
import { layoutOf, pageLive, fill } from '@/lib/system-pages';

import { seoMeta } from '@/lib/seo';
import PortfolioGrid from '@/components/site/PortfolioGrid';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs } from '@/lib/schema';
import { siteUrl } from '@/lib/utils';

export async function generateMetadata() {
  return seoMeta(await getPageSeo('portfolio'), { title: 'Portfolio', description: 'Websites I have designed and built on WordPress, Shopify, Webflow and custom code.', path: '/portfolio' , ogKind: 'page' });
}

export default async function PortfolioPage() {
  const [projects, site, sp] = await Promise.all([getProjects(), getSettings('site'), getSystemPage('portfolio')]);
  if (!pageLive(sp)) notFound();
  return (
    <>
      <JsonLd builtin="portfolio" data={buildGraph(site, [crumbs([['Home', '/'], ['Portfolio', '/portfolio']]), {
        '@type': 'CollectionPage', name: 'Portfolio', url: `${siteUrl()}/portfolio`,
        mainEntity: { '@type': 'ItemList', itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl()}/portfolio/${p.slug}`, name: p.title })) },
      }])} />
      <SystemSections layout={layoutOf('portfolio', sp)} tops={['intro']} parts={{
        intro: (b) => (
          <section className="relative overflow-hidden pb-10 pt-36 sm:pt-44">
            <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_20%_0%,#000,transparent)]" />
            <div className="shell relative">
              <h1 className="h-display max-w-[12ch]">{b.heading || 'Selected work'}</h1>
              <p className="lede mt-6">{fill(b.text || '{count} sites across law, healthcare, agencies, retail and more. Hover any screenshot to scroll the whole page.', { count: projects.length })}</p>
            </div>
          </section>
        ),
        grid: () => <section className="pb-28"><div className="shell"><PortfolioGrid projects={projects} /></div></section>,
      }} />
    </>
  );
}
