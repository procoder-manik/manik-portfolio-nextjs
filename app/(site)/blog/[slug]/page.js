import Link from 'next/link';
import { seoMeta, pageMeta } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getPost, getPosts, getCategories, getSettings } from '@/lib/data';
import { renderMarkdown } from '@/lib/markdown';
import PostCard from '@/components/site/PostCard';
import Blocks from '@/components/site/blocks/Blocks';
import ReadingProgress from '@/components/site/ReadingProgress';
import ShareLinks from '@/components/site/ShareLinks';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs, postNode } from '@/lib/schema';
import { fmtDate, readingTime, siteUrl } from '@/lib/utils';

export const revalidate = 600;
export const dynamicParams = true;
export async function generateStaticParams() { return (await getPosts()).map((x) => ({ slug: x.slug })); }

export async function generateMetadata(props) {
  const params = await props.params;
  const p = await getPost(params.slug);
  if (!p) return {};
  const m = seoMeta(p, { title: p.title, description: p.excerpt, image: p.cover, path: `/blog/${p.slug}`, type: 'article' });
  m.openGraph.publishedTime = p.publishedAt;
  return m;
}

export default async function PostPage(props) {
  const params = await props.params;
  const [p, cats, site] = await Promise.all([getPost(params.slug), getCategories(), getSettings('site')]);
  if (!p) notFound();
  const related = (await getPosts({ category: p.category, exclude: p.slug, limit: 3 }));
  const more = related.length ? related : await getPosts({ exclude: p.slug, limit: 3 });
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c]));
  const c = catMap[p.category];
  const { html, toc } = renderMarkdown(p.content);
  const url = `${siteUrl()}/blog/${p.slug}`;

  return (
    <article>
      <ReadingProgress />
      <JsonLd data={buildGraph(site, [crumbs([['Home', '/'], ['Blog', '/blog'], ...(c ? [[c.name, `/blog/category/${c.slug}`]] : []), [p.title, `/blog/${p.slug}`]]), postNode(p)])} />
      <header className="pb-10 pt-32 sm:pt-40">
        <div className="shell max-w-4xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={15} />All posts</Link>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            {c && <Link href={`/blog/category/${c.slug}`} className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-medium text-ink hover:border-signal"><span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.name}</Link>}
            {p.kind === 'update' && <span className="rounded-full bg-amber/15 px-3 py-1 font-medium text-amber">Daily update</span>}
            <time dateTime={p.publishedAt}>{fmtDate(p.publishedAt, { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            <span>{readingTime(p.content)} min read</span>
          </div>
          <h1 className="mt-6 font-display text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em]">{p.title}</h1>
          {p.excerpt && <p className="mt-6 text-xl text-muted">{p.excerpt}</p>}
          <div className="mt-8 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div><p className="font-medium text-ink">{site.name}</p><p className="text-sm text-muted">{site.role}</p></div>
          </div>
        </div>
      </header>
      {p.cover && (
        <div className="shell max-w-5xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.cover} alt="" className="aspect-[16/8] w-full rounded-[24px] border border-line object-cover" />
        </div>
      )}
      <div className="shell grid max-w-6xl gap-12 py-16 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          {toc.length > 1 && (
            <nav className="sticky top-28" aria-label="On this page">
              <p className="text-sm font-semibold text-ink">On this page</p>
              <ul className="mt-4 space-y-2 border-l border-line text-sm">
                {toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className={`-ml-px block border-l border-transparent py-0.5 text-muted hover:border-signal hover:text-ink ${t.depth === 3 ? 'pl-7' : 'pl-4'}`}>{t.text}</a></li>)}
              </ul>
            </nav>
          )}
        </aside>
        <div className="min-w-0 max-w-[70ch]">
          <div className="prose-site prose-lg" dangerouslySetInnerHTML={{ __html: html }} />
          {p.tags?.length > 0 && <div className="mt-12 flex flex-wrap gap-2">{p.tags.map((t) => <span key={t} className="chip">#{t}</span>)}</div>}
          <div className="mt-10 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-ink">Share this post</p>
            <ShareLinks url={url} title={p.title} />
          </div>
          <div className="mt-10 flex gap-5 rounded-[22px] border border-line bg-surface p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.avatar} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
            <div>
              <p className="font-display text-lg font-semibold text-ink">Written by {site.name}</p>
              <p className="mt-1 text-[0.95rem] text-muted">{site.footerNote}</p>
              <Link href="/contact" className="mt-3 inline-block text-sm font-semibold text-signal hover:underline">Work with me</Link>
            </div>
          </div>
        </div>
      </div>
      <Blocks blocks={p.blocks} />
      {more.length > 0 && (
        <section className="section border-t border-line">
          <div className="shell">
            <h2 className="h-section mb-12">Keep reading</h2>
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-3">{more.map((m) => <PostCard key={m.slug} post={m} cats={catMap} />)}</div>
          </div>
        </section>
      )}
    </article>
  );
}
