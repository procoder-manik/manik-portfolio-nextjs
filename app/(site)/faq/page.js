import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getKnowledge, getSettings, getPageSeo, getSystemPage } from '@/lib/data';
import { notFound } from 'next/navigation';
import SystemSections from '@/components/site/SystemSections';
import { layoutOf, pageLive } from '@/lib/system-pages';

import { seoMeta } from '@/lib/seo';
import { buildGraph, crumbs, faqNode } from '@/lib/schema';
import { slugify } from '@/lib/utils';
import JsonLd from '@/components/site/JsonLd';
import FaqExplorer from '@/components/site/FaqExplorer';

export async function generateMetadata() {
  return seoMeta(await getPageSeo('faq'), { title: 'Frequently asked questions', description: 'Answers about web design, SEO, automation, maintenance, pricing, timelines and payment.', path: '/faq' , ogKind: 'page' });
}

/* Every answer you teach the chatbot in Admin > AI IQ (with "Show on the FAQ page" on) appears here, grouped by service. */
export default async function FaqPage() {
  const [all, site, sp] = await Promise.all([getKnowledge(), getSettings('site'), getSystemPage('faq')]);
  if (!pageLive(sp)) notFound();
  const items = all.filter((x) => x.showOnFaq !== false);
  const groups = []; const idx = {};
  items.forEach((x, n) => { const name = x.category || 'General'; if (!(name in idx)) { idx[name] = groups.length; groups.push({ name, slug: slugify(name), items: [] }); } groups[idx[name]].items.push({ id: x._id || n, question: x.question, answer: x.answer }); });
  return (
    <>
      <JsonLd builtin="faq" data={buildGraph(site, [crumbs([['Home', '/'], ['FAQ', '/faq']]), faqNode(items.slice(0, 60).map((x) => ({ q: x.question, a: x.answer })))])} />
      <SystemSections layout={layoutOf('faq', sp)} tops={['main']} parts={{
        main: (b) => (
          <section className="relative overflow-hidden pb-16 pt-36 sm:pt-44">
            <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_20%_0%,#000,transparent)]" />
            <div className="shell relative max-w-4xl">
              <h1 className="h-display">{b.heading || 'Frequently asked questions'}</h1>
              <p className="lede mt-6">{b.text || 'Straight answers about every service, from price and timelines to payment and support. Cannot find yours? Ask the chat or send a message.'}</p>
              <div className="mt-12"><FaqExplorer groups={groups} /></div>
            </div>
          </section>
        ),
        cta: (b) => (
          <section className="pb-24">
            <div className="shell max-w-4xl">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-line bg-surface/60 p-7">
                <div><p className="font-display text-xl font-semibold text-ink">{b.heading || 'Still have a question?'}</p><p className="mt-1 text-muted">I reply within one working day.</p></div>
                <div className="flex flex-wrap gap-3"><Link href="/help" className="btn-ghost">Help center</Link><Link href={b.href || '/contact'} className="btn-primary">{b.label || 'Ask me'} <ArrowRight size={16} /></Link></div>
              </div>
            </div>
          </section>
        ),
      }} />
    </>
  );
}
