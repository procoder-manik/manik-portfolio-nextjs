import { getPosts, getCategories, getSettings , getPageSeo } from '@/lib/data';
import { seoMeta } from '@/lib/seo';
import BlogIndex from '@/components/site/BlogIndex';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs } from '@/lib/schema';
import { siteUrl } from '@/lib/utils';

export async function generateMetadata() {
  return seoMeta(await getPageSeo('blog'), { title: 'Blog', description: 'Practical write-ups on WordPress, SEO, performance and e-commerce, plus daily build updates.', path: '/blog' });
}

export default async function BlogPage() {
  const [posts, updates, cats, site, home] = await Promise.all([getPosts({ kind: 'article' }), getPosts({ kind: 'update', limit: 8 }), getCategories(), getSettings('site'), getSettings('home')]);
  return (
    <>
      <JsonLd builtin="blog" data={buildGraph(site, [crumbs([['Home', '/'], ['Blog', '/blog']]), { '@type': 'Blog', '@id': `${siteUrl()}/blog#blog`, name: `${site.name} blog`, url: `${siteUrl()}/blog`, author: { '@id': `${siteUrl()}/#person` } }])} />
      <BlogIndex posts={posts} updates={updates} cats={cats} title={home.blog?.heading || 'Blog'} intro={home.blog?.intro} />
    </>
  );
}
