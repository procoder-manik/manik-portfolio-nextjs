import { seoMeta } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { getCaseStudies, getAllSettings, getPageSeo, getSystemPage } from '@/lib/data';
import SystemSections from '@/components/site/SystemSections';
import { layoutOf, pageLive } from '@/lib/system-pages';
import CaseStudyCard from '@/components/site/CaseStudyCard';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs } from '@/lib/schema';
import { caseStudiesOn } from '@/lib/features';
import { siteUrl } from '@/lib/utils';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export async function generateMetadata() {
  const [{ home }, own] = await Promise.all([getAllSettings(), getPageSeo('caseStudies')]);
  return seoMeta(own, { title: home.caseStudies?.heading || 'Case studies', description: home.caseStudies?.intro, path: '/case-studies' });
}

export default async function CaseStudiesPage() {
  const [{ site, home }, list, sp] = await Promise.all([getAllSettings(), getCaseStudies(), getSystemPage('caseStudies')]);
  if (!caseStudiesOn(site) || !pageLive(sp)) notFound();
  const [first, ...rest] = list;
  return (
    <>
      <JsonLd builtin="caseStudies" data={buildGraph(site, [crumbs([['Home', '/'], ['Case studies', '/case-studies']]), {
        '@type': 'CollectionPage', name: 'Case studies', url: `${siteUrl()}/case-studies`,
        mainEntity: { '@type': 'ItemList', itemListElement: list.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl()}/case-studies/${c.slug}`, name: c.title })) },
      }])} />
      <SystemSections layout={layoutOf('caseStudies', sp)} tops={['intro']} parts={{
        intro: (b) => (
          <section className="relative overflow-hidden pb-12 pt-36 sm:pt-44">
            <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_20%_0%,#000,transparent)]" />
            <div className="pointer-events-none absolute -right-40 -top-32 h-[460px] w-[460px] rounded-full bg-signal/15 blur-[120px]" />
            <div className="shell relative grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
              <h1 className="h-display max-w-[11ch]">{b.heading || home.caseStudies?.heading || 'Case studies'}</h1>
              <p className="lede lg:ml-auto lg:text-right">{b.text || home.caseStudies?.intro}</p>
            </div>
          </section>
        ),
        list: () => (
          <section className="pb-28">
            <div className="shell space-y-8">
              {first ? <CaseStudyCard c={first} variant="feature" /> : <p className="rounded-2xl border border-dashed border-line p-12 text-center text-muted">Case studies are on the way.</p>}
              {rest.length > 0 && <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{rest.map((c) => <CaseStudyCard key={c.slug} c={c} />)}</div>}
            </div>
          </section>
        ),
        cta: (b) => (
          <section className="px-3 pb-24 sm:px-5">
            <div className="relative mx-auto max-w-shell overflow-hidden rounded-[32px] bg-signal px-6 py-14 text-white sm:px-14">
              <div className="grid-paper pointer-events-none absolute inset-0 opacity-60 [--grid:255_255_255]" />
              <div className="relative flex flex-wrap items-center justify-between gap-6">
                <h2 className="h-section max-w-[18ch] text-white">{b.heading || 'Want results like these for your business?'}</h2>
                <Link href={b.href || '/contact'} className="btn bg-white text-[#0C1526] hover:bg-white/90">{b.label || 'Start a project'} <ArrowRight size={16} /></Link>
              </div>
            </div>
          </section>
        ),
      }} />
    </>
  );
}
