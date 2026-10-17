import { getPosts, getCategories, getSettings } from '@/lib/data';
import { pageMeta } from '@/lib/seo';
import BlogIndex from '@/components/site/BlogIndex';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs } from '@/lib/schema';
import { siteUrl } from '@/lib/utils';

export async function generateMetadata() {
  return pageMeta(await getSettings('integrations'), 'blog', { title: 'Blog', description: 'Practical write-ups on WordPress, SEO, performance and e-commerce, plus daily build updates.', path: '/blog' });
}

export default async function BlogPage() {
  const [posts, updates, cats, site, home] = await Promise.all([getPosts({ kind: 'article' }), getPosts({ kind: 'update', limit: 8 }), getCategories(), getSettings('site'), getSettings('home')]);
  return (
    <>
      <JsonLd data={buildGraph(site, [crumbs([['Home', '/'], ['Blog', '/blog']]), { '@type': 'Blog', '@id': `${siteUrl()}/blog#blog`, name: `${site.name} blog`, url: `${siteUrl()}/blog`, author: { '@id': `${siteUrl()}/#person` } }])} />
      <BlogIndex posts={posts} updates={updates} cats={cats} title={home.blog?.heading || 'Blog'} intro={home.blog?.intro} />
    </>
  );
}
