import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { getKnowledge, getSettings } from '@/lib/data';
import { seoMeta } from '@/lib/seo';
import { buildGraph, crumbs } from '@/lib/schema';
import { buildHelp, snippet } from '@/lib/help';
import { siteUrl } from '@/lib/utils';
import JsonLd from '@/components/site/JsonLd';
import HelpSearch from '@/components/site/HelpSearch';

export async function generateMetadata(props) {
  const { slug } = await props.params;
  const t = buildHelp(await getKnowledge()).topics.find((x) => x.slug === slug);
  if (!t) return {};
  return seoMeta({}, { title: `${t.name}: Help center`, description: `Answers about ${t.name.toLowerCase()}. ${t.articles.slice(0, 3).map((a) => a.question).join(' ')}`, path: `/help/topic/${slug}` , ogKind: 'page' });
}

export default async function HelpTopic(props) {
  const { slug } = await props.params;
  const [all, site] = await Promise.all([getKnowledge(), getSettings('site')]);
  const { topics, articles } = buildHelp(all);
  const t = topics.find((x) => x.slug === slug); if (!t) notFound();
  const index = articles.map((a) => ({ slug: a.slug, question: a.question, answer: a.answer, snippet: snippet(a.answer), topic: a.topic, keywords: a.keywords }));
  return (
    <>
      <JsonLd builtin="help" data={buildGraph(site, [crumbs([['Home', '/'], ['Help center', '/help'], [t.name, `/help/topic/${t.slug}`]]), { '@type': 'CollectionPage', name: `${t.name}: Help center`, url: `${siteUrl()}/help/topic/${t.slug}` }])} />
      <section className="pb-24 pt-36 sm:pt-44">
        <div className="shell max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted"><Link href="/help" className="hover:text-ink">Help center</Link><ChevronRight size={14} /><span className="text-ink">{t.name}</span></nav>
          <h1 className="h-section">{t.name}</h1>
          <p className="lede mt-4">{t.articles.length} answer{t.articles.length === 1 ? '' : 's'} in this topic.</p>
          <div className="mt-8"><HelpSearch index={index} size="sm" /></div>
          <ul className="mt-10 divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-surface/40">
            {t.articles.map((a) => (
              <li key={a.slug}><Link href={`/help/${a.slug}`} className="group flex items-start gap-4 px-6 py-5 transition hover:bg-raised/60"><span className="min-w-0 flex-1"><span className="block font-semibold text-ink">{a.question}</span><span className="mt-1 block text-sm leading-relaxed text-muted">{snippet(a.answer, 170)}</span></span><ArrowRight size={16} className="mt-1.5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-signal" /></Link></li>
            ))}
          </ul>
          <div className="mt-12 text-center"><Link href="/help" className="text-sm font-medium text-signal hover:underline">Back to all topics</Link></div>
        </div>
      </section>
    </>
  );
}
