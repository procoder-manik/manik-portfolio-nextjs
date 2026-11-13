import { notFound } from 'next/navigation';
import { seoMeta, pageMeta } from '@/lib/seo';
import { getPage, getSettings, getLanding } from '@/lib/data';
import LandingPage from '@/components/site/landing/LandingPage';
import { landingMeta, landingGraph, landingKey } from '@/lib/landing';
import { renderMarkdown } from '@/lib/markdown';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs, faqNode, faqFromMarkdown } from '@/lib/schema';
import Blocks from '@/components/site/blocks/Blocks';
import { fmtDate } from '@/lib/utils';

export const dynamic = 'force-static';
export const revalidate = 600;

export async function generateMetadata(props) {
  const params = await props.params;
  const p = await getPage(params.slug);
  if (p) return seoMeta(p, { title: p.title, path: `/${p.slug}`, ogKind: 'page' });
  const l = await getLanding(landingKey(params.slug));
  return l ? landingMeta(l) : {};
}

export default async function CustomPage(props) {
  const params = await props.params;
  const [p, site] = await Promise.all([getPage(params.slug), getSettings('site')]);
  if (!p) {
    // Not a page: it may be a landing page (Admin > Landing pages), found by its address or any other address.
    const l = await getLanding(landingKey(params.slug));
    if (!l) notFound();
    return (<><JsonLd item={l} data={buildGraph(site, landingGraph(l))} /><LandingPage l={l} /></>);
  }
  const blocks = (p.blocks || []).filter((b) => b && !b.hidden);
  const heroFirst = blocks[0]?.type === 'hero';
  const showTitle = !p.hideTitle && !heroFirst;
  const faqs = [...blocks.filter((b) => b.type === 'faq' && !b.useSite).flatMap((b) => b.items || []), ...faqFromMarkdown(p.content)];
  return (
    <>
      <JsonLd item={p} data={buildGraph(site, [crumbs([['Home', '/'], [p.title, `/${p.slug}`]]), faqNode(faqs), { '@type': 'WebPage', name: p.seoTitle || p.title, description: p.seoDescription }])} />
      {(showTitle || p.content?.trim()) && (
        <article className={showTitle ? 'pb-12 pt-36 sm:pt-44' : 'py-12'}>
          <div className="shell max-w-3xl">
            {showTitle && <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-bold leading-none tracking-[-0.03em]">{p.title}</h1>}
            {showTitle && !blocks.length && p.updatedAt && <p className="mt-4 text-sm text-muted">Updated {fmtDate(p.updatedAt, { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
            {p.content?.trim() && <div className="prose-site mt-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content).html }} />}
          </div>
        </article>
      )}
      <Blocks blocks={blocks} />
      {!blocks.length && <div className="pb-16" />}
    </>
  );
}
