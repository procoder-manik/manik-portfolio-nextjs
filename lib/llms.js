import 'server-only';
import { getAllSettings, getSettings, getServicesWithPackages, getProjects, getPosts, getAllPages, getPage, getCaseStudies, getServiceAreas } from './data';
import { caseStudiesOn } from './features';
import { siteUrl, money } from './utils';

/* The text of /llms.txt (short guide) and /llms-full.txt (key pages in full) for AI assistants. */
export async function buildLlms(full = false) {
  const [{ site, home }, seo] = await Promise.all([getAllSettings(), getSettings('seo')]);
  const ai = seo.ai || {}; const inc = ai.include || {}; const biz = seo.business || {}; const u = siteUrl();
  const L = [`# ${biz.name || site.name}`, ''];
  const summary = ai.summary || biz.description || site.tagline;
  if (summary) L.push(`> ${String(summary).replace(/\n+/g, ' ')}`, '');
  const facts = [['Website', u], ['Email', biz.email || site.email], ['Phone', biz.phone || site.phoneTel], ['Location', [biz.city, biz.region, biz.country].filter(Boolean).join(', ') || site.location], ['Area served', biz.areaServed], ['Reply time', site.replyTime]].filter(([, v]) => v);
  facts.forEach(([k, v]) => L.push(`- ${k}: ${v}`)); L.push('');
  if (ai.details) L.push(String(ai.details).trim(), '');
  L.push(`## Main pages`, '', `- [Home](${u}/): ${site.tagline || 'Overview'}`, `- [Portfolio](${u}/portfolio): Websites built for clients`, `- [Pricing](${u}/pricing): Packages and prices`, `- [Blog](${u}/blog): Articles and updates`, `- [Resume](${u}/resume): Experience and skills`, `- [Contact](${u}/contact): Get in touch`, '');
  if (inc.services !== false) {
    const svc = await getServicesWithPackages();
    if (svc.length) { L.push('## Services and packages', ''); svc.forEach((s) => { L.push(`### ${s.name}`, s.summary || ''); s.packages.forEach((p) => L.push(`- [${p.name}](${u}/checkout/${p.slug}): ${p.tagline || ''} From ${money(p.price, p.currency)}${p.deliveryDays ? `, delivered in about ${p.deliveryDays} days` : ''}.`)); L.push(''); }); }
  }
  if (inc.projects !== false) { const p = await getProjects(); if (p.length) { L.push('## Portfolio', ''); p.forEach((x) => L.push(`- [${x.title}](${u}/portfolio/${x.slug}): ${x.summary || x.industry || ''}`)); L.push(''); } }
  if (inc.caseStudies !== false && caseStudiesOn(site)) { const c = await getCaseStudies(); if (c.length) { L.push('## Case studies', ''); c.forEach((x) => L.push(`- [${x.title}](${u}/case-studies/${x.slug}): ${x.summary || ''}`)); L.push(''); } }
  if (inc.serviceAreas !== false) { const s = await getServiceAreas(); if (s.length) { L.push('## Service areas', ''); s.forEach((x) => L.push(`- [${x.title}](${u}/service-areas/${x.slug}): ${x.summary || x.niche || ''}`)); L.push(''); } }
  if (inc.posts !== false) { const p = await getPosts({ kind: 'article' }); if (p.length) { L.push('## Articles', ''); p.forEach((x) => L.push(`- [${x.title}](${u}/blog/${x.slug}): ${x.excerpt || ''}`)); L.push(''); } }
  if (inc.pages !== false) { const pg = (await getAllPages()).filter((x) => !x.seoNoindex); if (pg.length) { L.push('## Other pages', ''); pg.forEach((x) => L.push(`- [${x.title}](${u}/${x.slug})`)); L.push(''); } }
  if (home.faq?.items?.length) { L.push('## Frequently asked questions', ''); home.faq.items.forEach((f) => L.push(`**${f.q}**`, f.a, '')); }

  if (full) {
    L.push('---', '', '# Full text of key pages', '');
    const posts = inc.posts !== false ? await getPosts({ kind: 'article' }) : [];
    for (const p of posts.slice(0, 40)) L.push(`## ${p.title}`, `URL: ${u}/blog/${p.slug}`, '', p.content || p.excerpt || '', '');
    const projs = inc.projects !== false ? await getProjects() : [];
    for (const p of projs.slice(0, 40)) if (p.content) L.push(`## ${p.title}`, `URL: ${u}/portfolio/${p.slug}`, '', p.content, '');
    if (inc.pages !== false) for (const s of (await getAllPages()).filter((x) => !x.seoNoindex).slice(0, 20)) { const pg = await getPage(s.slug); if (pg?.content) L.push(`## ${pg.title}`, `URL: ${u}/${pg.slug}`, '', pg.content, ''); }
  }
  return `${L.join('\n').replace(/\n{3,}/g, '\n\n').slice(0, full ? 600000 : 60000)}\n`;
}
