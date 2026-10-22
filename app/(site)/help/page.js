import Link from 'next/link';
import { ArrowRight, Search, Globe, Workflow, Wrench, Gauge, ShieldCheck, CreditCard, User, Server, HelpCircle } from 'lucide-react';
import { getKnowledge, getSettings, getPageSeo, getSystemPage } from '@/lib/data';
import { notFound } from 'next/navigation';
import SystemSections from '@/components/site/SystemSections';
import { layoutOf, pageLive, fill } from '@/lib/system-pages';

import { seoMeta } from '@/lib/seo';
import { buildGraph, crumbs } from '@/lib/schema';
import { buildHelp, snippet } from '@/lib/help';
import { siteUrl } from '@/lib/utils';
import JsonLd from '@/components/site/JsonLd';
import HelpSearch from '@/components/site/HelpSearch';

const ICONS = { Search, Globe, Workflow, Wrench, Gauge, ShieldCheck, CreditCard, User, Server, HelpCircle };

export async function generateMetadata() {
  return seoMeta(await getPageSeo('help'), { title: 'Help center', description: 'Search answers about web design, SEO, automation, maintenance, pricing, billing and how we work together.', path: '/help' , ogKind: 'page' });
}

/* Every answer taught in Admin > AI IQ (with "Show in the Help center" on) becomes an article here, grouped by topic. */
export default async function HelpPage() {
  const [all, site, sp] = await Promise.all([getKnowledge(), getSettings('site'), getSystemPage('help')]);
  if (!pageLive(sp)) notFound();
  const { articles, topics } = buildHelp(all);
  const index = articles.map((a) => ({ slug: a.slug, question: a.question, answer: a.answer, snippet: snippet(a.answer), topic: a.topic, keywords: a.keywords }));
  const popular = articles.filter((a) => a.order < 3).slice(0, 6);
  return (
    <>
      <JsonLd builtin="help" data={buildGraph(site, [crumbs([['Home', '/'], ['Help center', '/help']]), { '@type': 'CollectionPage', name: 'Help center', url: `${siteUrl()}/help`, about: { '@id': `${siteUrl()}/#business` } }])} />
      <SystemSections layout={layoutOf('help', sp)} tops={['search']} parts={{
        search: (b) => (
            <section className="relative overflow-hidden pb-16 pt-36 sm:pt-44">
              <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_0%,#000,transparent)]" />
              <div className="shell relative max-w-3xl text-center">
                <h1 className="h-display">{b.heading || 'How can I help?'}</h1>
                <p className="lede mx-auto mt-6 max-w-xl">{fill(b.text || 'Answers about every service, from price and timelines to billing and support. {count} answers and counting.', { count: articles.length })}</p>
                <div className="mt-10 text-left"><HelpSearch index={index} /></div>
              </div>
            </section>
        ),
        topics: () => (
            <section className="pb-20">
              <div className="shell max-w-5xl">
                <h2 className="mb-6 text-xl font-semibold text-ink">Browse by topic</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {topics.map((t) => { const Ic = ICONS[t.icon] || HelpCircle; return (
                    <Link key={t.slug} href={`/help/topic/${t.slug}`} className="group flex flex-col rounded-[22px] border border-line bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-signal hover:shadow-[0_30px_60px_-40px_rgb(var(--signal))]">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-signal/15 text-signal"><Ic size={21} /></span>
                      <h3 className="mt-5 text-lg font-semibold text-ink">{t.name}</h3>
                      <p className="mt-1.5 flex-1 text-sm text-muted">{t.articles.slice(0, 2).map((a) => a.question).join(' · ')}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-signal">{t.articles.length} article{t.articles.length === 1 ? '' : 's'}<ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
                    </Link>
                  ); })}
                </div>

                {popular.length > 0 && (<>
                  <h2 className="mb-5 mt-16 text-xl font-semibold text-ink">Popular questions</h2>
                  <ul className="divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-surface/40">
                    {popular.map((a) => <li key={a.slug}><Link href={`/help/${a.slug}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-raised/60"><span><span className="block text-xs text-signal">{a.topic}</span><span className="font-medium text-ink">{a.question}</span></span><ArrowRight size={16} className="shrink-0 text-muted" /></Link></li>)}
                  </ul>
                </>)}
              </div>
            </section>
        ),
        cta: (b) => (
          <section className="pb-20">
            <div className="shell max-w-5xl">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-line bg-surface/60 p-7">
                <div><p className="font-display text-xl font-semibold text-ink">{b.heading || 'Did not find your answer?'}</p><p className="mt-1 text-muted">Ask the chat or send a message. I reply within one working day.</p></div>
                <div className="flex flex-wrap gap-3"><Link href="/faq" className="btn-ghost">All FAQs</Link><Link href={b.href || '/contact'} className="btn-primary">{b.label || 'Ask me'} <ArrowRight size={16} /></Link></div>
              </div>
            </div>
          </section>
        ),
      }} />
    </>
  );
}
