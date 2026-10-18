export const dynamic = 'force-dynamic';
import { getPosts, getSettings } from '@/lib/data';
import { siteUrl } from '@/lib/utils';
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* RSS feed of the blog: feed readers, aggregators and some AI tools use it to find new posts. */
export async function GET() {
  const [posts, site, seo] = await Promise.all([getPosts({ kind: 'article', limit: 30 }), getSettings('site'), getSettings('seo')]);
  if (seo.noindex) return new Response('Not found', { status: 404 });
  const u = siteUrl();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>\n<title>${esc(site.name)} blog</title><link>${u}/blog</link><description>${esc(site.tagline || '')}</description><atom:link href="${u}/feed.xml" rel="self" type="application/rss+xml"/>\n${posts.map((p) => `<item><title>${esc(p.title)}</title><link>${u}/blog/${p.slug}</link><guid>${u}/blog/${p.slug}</guid><pubDate>${new Date(p.publishedAt || p.createdAt || Date.now()).toUTCString()}</pubDate><description>${esc(p.excerpt || '')}</description></item>`).join('\n')}\n</channel></rss>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=900' } });
}
