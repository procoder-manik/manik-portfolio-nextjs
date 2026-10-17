import { notFound } from 'next/navigation';
import { seoMeta, pageMeta } from '@/lib/seo';
import { getPosts, getCategories, getSettings } from '@/lib/data';
import BlogIndex from '@/components/site/BlogIndex';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs } from '@/lib/schema';

export async function generateMetadata(props) {
  const params = await props.params;
  const c = (await getCategories()).find((x) => x.slug === params.slug);
  return c ? seoMeta(c, { title: `${c.name} articles`, description: c.description, path: `/blog/category/${c.slug}` }) : {};
}

export default async function CategoryPage(props) {
  const params = await props.params;
  const [cats, posts, updates, site] = await Promise.all([getCategories(), getPosts({ category: params.slug }), getPosts({ kind: 'update', limit: 8 }), getSettings('site')]);
  const c = cats.find((x) => x.slug === params.slug);
  if (!c) notFound();
  return (
    <>
      <JsonLd data={buildGraph(site, [crumbs([['Home', '/'], ['Blog', '/blog'], [c.name, `/blog/category/${c.slug}`]])])} />
      <BlogIndex posts={posts} updates={updates} cats={cats} active={c.slug} title={c.name} intro={c.description} />
    </>
  );
}
