export const dynamic = 'force-dynamic';
import { getProjects, getPosts, getCategories, getAllPages, getCaseStudies, getSettings, getPageSeo, getKnowledge, getHiddenPaths } from '@/lib/data';
import { buildHelp } from '@/lib/help';
import { BUILTIN_PAGES } from '@/lib/admin-schema';
import { caseStudiesOn } from '@/lib/features';
import { pathMatches } from '@/lib/popups';
import { siteUrl } from '@/lib/utils';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const skip = (x) => !x || x.seoNoindex || x.sitemap?.exclude || x.trashedAt;

/* Built from the database on request, so it always matches what is live. Honors every per-page setting. */
export async function GET() {
  const [seo, site] = await Promise.all([getSettings('seo'), getSettings('site')]);
  const sm = seo.sitemap || {};
  if (sm.enabled === false || seo.noindex) return new Response('Not found', { status: 404 });
  const u = siteUrl(); const now = new Date().toISOString();
  const abs = (p) => (!p ? '' : /^https?:/.test(p) ? p : `${u}${p}`);
  const out = [];
  const push = (path, item, { lastmod, priority, images = [] } = {}) => {
    if (pathMatches(sm.exclude || [], path)) return;
    out.push({ loc: `${u}${path === '/' ? '' : path}`, lastmod: new Date(lastmod || item?.updatedAt || now).toISOString(), changefreq: item?.sitemap?.changefreq || sm.changefreq || 'weekly', priority: item?.sitemap?.priority || priority, images: sm.images === false ? [] : images.filter(Boolean).map(abs) });
  };

  if (sm.builtin !== false) {
    const [items, hidden] = await Promise.all([Promise.all(BUILTIN_PAGES.map(async (b) => [b, await getPageSeo(b.key)])), getHiddenPaths()]);
    for (const [b, s] of items) {
      if (hidden.includes(b.path)) continue; // switched off in Admin > Pages
      if (b.key === 'caseStudies' && !caseStudiesOn(site)) continue;
      if (skip(s)) continue;
      push(b.path, s, { priority: b.path === '/' ? 1 : 0.8, images: b.path === '/' ? [site.ogImage] : [] });
    }
  }
  const [projects, posts, cats, pages, cases] = await Promise.all([
    sm.projects !== false ? getProjects() : [], sm.posts !== false ? getPosts() : [], sm.categories !== false ? getCategories() : [], sm.pages !== false ? getAllPages() : [],
    sm.caseStudies !== false && caseStudiesOn(site) ? getCaseStudies() : [],
  ]);
  projects.filter((x) => !skip(x)).forEach((p) => push(`/portfolio/${p.slug}`, p, { priority: 0.7, images: [p.scrollImage, p.bannerImage, p.seoImage] }));
  posts.filter((x) => !skip(x)).forEach((p) => push(`/blog/${p.slug}`, p, { lastmod: p.updatedAt || p.publishedAt, priority: 0.6, images: [p.cover, p.seoImage] }));
  cats.filter((x) => !skip(x) && !seo.defaults?.noindexCategories).forEach((c) => push(`/blog/category/${c.slug}`, c, { priority: 0.4 }));
  cases.filter((x) => !skip(x)).forEach((c) => push(`/case-studies/${c.slug}`, c, { priority: 0.7, images: [c.cover, c.scrollImage, c.seoImage] }));
  pages.filter((x) => !skip(x)).forEach((p) => push(`/${p.slug}`, p, { priority: 0.5 }));
  if (sm.builtin !== false && !skip(await getPageSeo('help')) && !(await getHiddenPaths()).includes('/help')) { const help = buildHelp(await getKnowledge()); help.topics.forEach((t) => push(`/help/topic/${t.slug}`, null, { priority: 0.5 })); help.articles.forEach((a) => push(`/help/${a.slug}`, null, { priority: 0.5 })); }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${out.map((e) => `  <url>\n    <loc>${esc(e.loc)}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${esc(e.changefreq)}</changefreq>\n${e.priority ? `    <priority>${Number(e.priority).toFixed(1)}</priority>\n` : ''}${e.images.map((i) => `    <image:image><image:loc>${esc(i)}</image:loc></image:image>\n`).join('')}  </url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=600' } });
}
