import { NextResponse } from 'next/server';
import { adminRoute } from '@/lib/server-auth';
import { rateLimit } from '@/lib/ratelimit';
import { dbConnect, hasDB } from '@/lib/db';
import { MODELS, Setting, Service, Page } from '@/lib/models';
import { siteContext, seoPrompts, pagePrompts } from '@/lib/ai-assist';
import { ask, normSeo, deep, line } from '@/lib/ai-run';
import { SYSTEM_PAGES, SYSTEM_BY_KEY, pagePath, defaultBlocks } from '@/lib/system-pages';
import { ensureSystemPages, SEO_FIELDS } from '@/lib/system-pages-server';
import { getPageSeoFresh, getSettingsFresh } from '@/lib/data';
import { BLOCK_DEFAULTS } from '@/lib/blocks';
import { AI_BLOCK_TYPES } from '@/lib/ai-blocks';
import { cleanText } from '@/lib/humanize';
import { slugify } from '@/lib/utils';
import { refreshContent } from '@/lib/revalidate';
import { saveAreaPage } from '@/lib/ai-area';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const SEO_RES = { pages: '/', posts: '/blog/', projects: '/portfolio/', 'case-studies': '/case-studies/', 'service-areas': '/service-areas/', 'area-categories': '/service-areas/', apps: '/apps/', categories: '/blog/category/' };
const WRITE = ['focusKeyword', 'keywords', 'seoTitle', 'seoDescription', 'ogTitle', 'ogDescription', 'breadcrumbTitle'];
const empty = (v) => v == null || v === '' || (Array.isArray(v) && !v.length);
const pathOf = (resource, d) => (resource === 'pages' ? pagePath(d) : `${SEO_RES[resource]}${d.slug || ''}`);

/* Loads an item the way the editor does: built-in pages get their SEO from settings. */
async function load(resource, id) {
  const M = MODELS[resource]; const d = await M.findById(id).lean(); if (!d) return null;
  if (resource === 'pages' && d.builtin) { const seo = await getPageSeoFresh(d.builtin).catch(() => ({})); for (const k of SEO_FIELDS) if (seo[k] !== undefined) d[k] = seo[k]; }
  return d;
}

/* GET ?resource=posts&mode=missing|all -> the items to write SEO for. */
export const GET = adminRoute(async (req) => {
  const sp = req.nextUrl.searchParams; const resource = sp.get('resource'); const mode = sp.get('mode') || 'missing';
  if (!SEO_RES[resource] || !hasDB()) throw new Error('Not available here.');
  await dbConnect();
  if (resource === 'pages') await ensureSystemPages();
  const items = await MODELS[resource].find({ trashedAt: null }).select('title name slug builtin seoTitle seoDescription').lean();
  const out = [];
  for (const d of items) {
    let t = d.seoTitle; let de = d.seoDescription;
    if (d.builtin) { const seo = await getPageSeoFresh(d.builtin).catch(() => ({})); t = seo.seoTitle; de = seo.seoDescription; }
    if (mode === 'all' || empty(t) || empty(de)) out.push({ id: String(d._id), title: d.title || d.name || d.slug });
  }
  return NextResponse.json({ items: out });
}, 'content');

/* POST { task: 'seo', resource, id, mode } or { task: 'servicePage', slug } */
export const POST = adminRoute(async (req, ctx, admin) => {
  if (!(await rateLimit(`ai-bulk:${admin.email}`, 400, 3600))) throw new Error('Too many AI requests this hour. Try again later.');
  if (!hasDB()) throw new Error('Connect the database first.');
  await dbConnect();
  const b = await req.json(); const site = await siteContext();

  if (b.task === 'seo') {
    if (!SEO_RES[b.resource]) throw new Error('Unknown section.');
    const d = await load(b.resource, b.id); if (!d) throw new Error('Item not found.');
    const path = pathOf(b.resource, d);
    const p = await seoPrompts({ scope: b.resource, doc: d, path, fields: WRITE, instruction: '' }, site);
    const r = await ask(p, { maxTokens: 1500 });
    const got = normSeo(r.data, site.seo, WRITE); const set = {}; const wrote = [];
    for (const [k, v] of Object.entries(got)) { if (b.mode !== 'all' && !empty(d[k])) continue; set[k] = v; wrote.push(k); }
    if (wrote.length) {
      if (d.builtin) { const cur = await getPageSeoFresh(d.builtin); await Setting.findOneAndUpdate({ key: `seo-${d.builtin}` }, { key: `seo-${d.builtin}`, data: { ...cur, ...set } }, { upsert: true }); }
      else await MODELS[b.resource].updateOne({ _id: d._id }, { $set: set });
      refreshContent();
    }
    return NextResponse.json({ wrote, seoTitle: set.seoTitle || d.seoTitle || '', via: r.via });
  }

  if (b.task === 'servicePage') {
    const svc = await Service.findOne({ slug: b.slug }).lean(); if (!svc) throw new Error('Service not found.');
    // A page with this address already exists (yours or an earlier run): leave it alone.
    if (await Page.findOne({ slug: svc.slug }).select('_id').lean()) return NextResponse.json({ skipped: true, slug: svc.slug });
    const slug = SYSTEM_PAGES.some((x) => x.slug === svc.slug) ? `${svc.slug}-service` : svc.slug;
    if (slug !== svc.slug && await Page.findOne({ slug }).select('_id').lean()) return NextResponse.json({ skipped: true, slug });
    const full = (await (await import('@/lib/data')).getServicesWithPackages()).find((s) => s.slug === svc.slug);
    const pk = (full?.packages || []).map((x) => `${x.name}${x.price ? ` $${x.price}${x.priceMax ? ` to $${x.priceMax}` : ''}` : ''}${x.deliveryDays ? `, ${x.deliveryDays} days` : ''}${x.features?.length ? `: ${x.features.slice(0, 5).join(', ')}` : ''}`).join(' | ');
    const input = { type: 'service', topic: `${svc.name}: ${svc.summary || ''}`.trim(), audience: 'Small business owners', keyword: b.keyword || '', notes: `${svc.description || ''}${pk ? `\nPackages: ${pk}` : ''}`.trim() };
    const p = pagePrompts(input, site);
    const r = await ask(p, { maxTokens: 5000, temperature: 0.7 });
    const j = r.data || {};
    const blocks = (Array.isArray(j.blocks) ? j.blocks : []).filter((x) => x && AI_BLOCK_TYPES.includes(x.type)).slice(0, 9).map((x) => {
      const c = deep(x); if (x.type === 'richText' && x.content) c.content = cleanText(x.content);
      if (x.type === 'faq') c.useSite = !(c.items || []).length;
      if (x.type === 'pricing') c.service = svc.slug; // show this service's own packages
      return { ...(BLOCK_DEFAULTS[x.type] || {}), ...c, type: x.type };
    });
    if (!blocks.length) throw Object.assign(new Error('The AI returned no sections. Try again.'), { status: 502 });
    const seo = normSeo(j.seo || {}, site.seo);
    const page = await Page.create({ title: line(j.title) || svc.name, slug, published: false, hideTitle: blocks[0]?.type === 'hero', blocks, ...seo, schemaMarkup: seo.schemaMarkup || { type: 'Service', name: svc.name, serviceType: svc.name } });
    refreshContent();
    return NextResponse.json({ created: { id: String(page._id), slug, title: page.title }, via: r.via });
  }

  if (b.task === 'areaPage') {
    const r = await saveAreaPage({ area: b.area, niche: b.niche, service: b.service, notes: b.notes }, site);
    if (r.created) refreshContent();
    return NextResponse.json(r);
  }

  if (b.task === 'targetPage') {
    const kind = b.kind === 'industry' ? 'industry' : 'location';
    const target = String(b.target || '').trim().slice(0, 60); if (target.length < 2) throw new Error('Add the place or industry.');
    const svc = b.service ? await Service.findOne({ slug: b.service }).lean() : null;
    const svcName = svc?.name || 'Website design';
    const start = slugify(b.prefix || svc?.slug || 'web-design').slice(0, 40) || 'web-design';
    let slug = slugify(kind === 'industry' ? `${start}-for-${target}` : `${start}-${target}`).slice(0, 70);
    if (SYSTEM_PAGES.some((x) => x.slug === slug)) slug += '-page';
    if (await Page.findOne({ slug }).select('_id').lean()) return NextResponse.json({ skipped: true, slug });
    const keyword = (kind === 'industry' ? `${svcName} for ${target}` : `${svcName} ${target}`).toLowerCase().slice(0, 70);
    const input = { type: kind, topic: kind === 'industry' ? `${svcName} for ${target}` : `${svcName} for clients in ${target}`, audience: b.audience || (kind === 'industry' ? target : `Business owners in ${target}`), keyword, notes: [svc?.summary, b.notes && `Facts from the owner: ${b.notes}`, svc ? `This page is about the service "${svc.name}" (page /${svc.slug}).` : ''].filter(Boolean).join('\n') };
    const p = pagePrompts(input, site);
    const r = await ask(p, { maxTokens: 5000, temperature: 0.75 });
    const j = r.data || {};
    const blocks = (Array.isArray(j.blocks) ? j.blocks : []).filter((x) => x && AI_BLOCK_TYPES.includes(x.type)).slice(0, 9).map((x) => {
      const c = deep(x); if (x.type === 'richText' && x.content) c.content = cleanText(x.content);
      if (x.type === 'faq') c.useSite = !(c.items || []).length;
      if (x.type === 'pricing' && svc) c.service = svc.slug;
      return { ...(BLOCK_DEFAULTS[x.type] || {}), ...c, type: x.type };
    });
    if (!blocks.length) throw Object.assign(new Error('The AI returned no sections. Try again.'), { status: 502 });
    const seo = normSeo(j.seo || {}, site.seo); seo.focusKeyword = keyword;
    const schemaMarkup = { type: 'Service', name: input.topic, serviceType: svcName, ...(kind === 'location' ? { areaServed: target } : {}) };
    const page = await Page.create({ title: line(j.title) || input.topic, slug, published: false, hideTitle: blocks[0]?.type === 'hero', blocks, ...seo, schemaMarkup });
    refreshContent();
    return NextResponse.json({ created: { id: String(page._id), slug, title: page.title }, via: r.via });
  }
  throw new Error('Unknown task.');
}, 'content');
