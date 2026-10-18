import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { getKnowledge, getSettings } from '@/lib/data';
import { seoMeta } from '@/lib/seo';
import { buildGraph, crumbs, faqNode } from '@/lib/schema';
import { buildHelp, snippet } from '@/lib/help';
import { renderMarkdown } from '@/lib/markdown';
import { siteUrl } from '@/lib/utils';
import JsonLd from '@/components/site/JsonLd';
import HelpSearch from '@/components/site/HelpSearch';

export async function generateMetadata(props) {
  const { slug } = await props.params;
  const a = buildHelp(await getKnowledge()).bySlug[slug];
  if (!a) return {};
  return seoMeta({}, { title: a.question, description: snippet(a.answer, 158), path: `/help/${slug}`, type: 'article' });
}

export default async function HelpArticle(props) {
  const { slug } = await props.params;
  const [all, site] = await Promise.all([getKnowledge(), getSettings('site')]);
  const { articles, topics, bySlug } = buildHelp(all);
  const a = bySlug[slug]; if (!a) notFound();
  const topic = topics.find((t) => t.slug === a.topicSlug);
  const related = (topic?.articles || []).filter((x) => x.slug !== a.slug).slice(0, 4);
  const index = articles.map((x) => ({ slug: x.slug, question: x.question, answer: x.answer, snippet: snippet(x.answer), topic: x.topic, keywords: x.keywords }));
  const body = a.body?.trim() ? renderMarkdown(a.body).html : '';
  return (
    <>
      <JsonLd builtin="help" data={buildGraph(site, [crumbs([['Home', '/'], ['Help center', '/help'], [a.topic, `/help/topic/${a.topicSlug}`], [a.question, `/help/${a.slug}`]]), faqNode([{ q: a.question, a: a.answer }]), { '@type': 'WebPage', name: a.question, url: `${siteUrl()}/help/${a.slug}`, inLanguage: 'en' }])} />
      <article className="pb-24 pt-36 sm:pt-44">
        <div className="shell max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted"><Link href="/help" className="hover:text-ink">Help center</Link><ChevronRight size={14} /><Link href={`/help/topic/${a.topicSlug}`} className="hover:text-ink">{a.topic}</Link></nav>
          <h1 className="h-section">{a.question}</h1>
          <div className="mt-8 rounded-[22px] border border-line bg-surface/60 p-6 sm:p-8">
            {a.answer.split(/\n{2,}/).map((p, i) => <p key={i} className="text-[1.08rem] leading-[1.75] text-body first:mt-0 [&:not(:first-child)]:mt-4">{p}</p>)}
          </div>
          {body && <div className="prose-site prose-lg mt-10" dangerouslySetInnerHTML={{ __html: body }} />}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-line bg-surface/40 p-6">
            <div><p className="font-semibold text-ink">Still not sure?</p><p className="mt-0.5 text-sm text-muted">Tell me about your project. I reply within one working day.</p></div>
            <Link href="/contact" className="btn-primary">Ask me <ArrowRight size={16} /></Link>
          </div>
          {related.length > 0 && (<>
            <h2 className="mb-4 mt-14 text-lg font-semibold text-ink">More in {a.topic}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-surface/40">{related.map((r) => <li key={r.slug}><Link href={`/help/${r.slug}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-raised/60"><span className="font-medium text-ink">{r.question}</span><ArrowRight size={15} className="shrink-0 text-muted" /></Link></li>)}</ul>
          </>)}
          <div className="mt-12"><p className="mb-3 text-sm font-medium text-ink">Search the Help center</p><HelpSearch index={index} size="sm" /></div>
        </div>
      </article>
    </>
  );
}
