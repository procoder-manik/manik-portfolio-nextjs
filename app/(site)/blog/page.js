import { getPosts, getCategories, getSettings, getPageSeo, getSystemPage } from '@/lib/data';
import { notFound } from 'next/navigation';
import SystemSections from '@/components/site/SystemSections';
import { layoutOf, pageLive } from '@/lib/system-pages';
import { seoMeta } from '@/lib/seo';
import BlogIndex from '@/components/site/BlogIndex';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs } from '@/lib/schema';
import { siteUrl } from '@/lib/utils';

export async function generateMetadata() {
  return seoMeta(await getPageSeo('blog'), { title: 'Blog', description: 'Practical write-ups on WordPress, SEO, performance and e-commerce, plus daily build updates.', path: '/blog' , ogKind: 'post' });
}

export default async function BlogPage() {
  const [posts, updates, cats, site, home, sp] = await Promise.all([getPosts({ kind: 'article' }), getPosts({ kind: 'update', limit: 8 }), getCategories(), getSettings('site'), getSettings('home'), getSystemPage('blog')]);
  if (!pageLive(sp)) notFound();
  return (
    <>
      <JsonLd builtin="blog" data={buildGraph(site, [crumbs([['Home', '/'], ['Blog', '/blog']]), { '@type': 'Blog', '@id': `${siteUrl()}/blog#blog`, name: `${site.name} blog`, url: `${siteUrl()}/blog`, author: { '@id': `${siteUrl()}/#person` } }])} />
      <SystemSections layout={layoutOf('blog', sp)} tops={['intro']} parts={{
        intro: (b) => <BlogIndex part="intro" posts={posts} updates={updates} cats={cats} title={b.heading || home.blog?.heading || 'Blog'} intro={b.text || home.blog?.intro} />,
        posts: () => <BlogIndex part="posts" posts={posts} updates={updates} cats={cats} />,
      }} />
    </>
  );
}
