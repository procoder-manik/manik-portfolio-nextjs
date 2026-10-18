export const dynamic = 'force-dynamic';
import { getSettings } from '@/lib/data';
import { siteUrl } from '@/lib/utils';

export async function GET() {
  const seo = await getSettings('seo'); const r = seo.robots || {};
  const u = siteUrl(); let out;
  if (seo.noindex) out = 'User-agent: *\nDisallow: /\n';
  else if (r.mode === 'custom' && String(r.custom || '').trim()) out = `${String(r.custom).trim()}\n`;
  else {
    const L = ['User-agent: *'];
    (r.allow || []).forEach((p) => L.push(`Allow: ${p}`));
    if (!(r.allow || []).includes('/')) L.push('Allow: /');
    (r.disallow || []).forEach((p) => L.push(`Disallow: ${p}`));
    for (const bot of r.blockAi || []) L.push('', `User-agent: ${bot}`, 'Disallow: /');
    if (String(r.extra || '').trim()) L.push('', String(r.extra).trim());
    if (seo.sitemap?.enabled !== false) L.push('', `Sitemap: ${u}/sitemap.xml`);
    out = `${L.join('\n')}\n`;
  }
  return new Response(out, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=600' } });
}
