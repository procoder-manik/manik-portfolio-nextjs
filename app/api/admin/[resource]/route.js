import { NextResponse } from 'next/server';
import { refreshContent } from '@/lib/revalidate';
import { dbConnect, hasDB } from '@/lib/db';
import { MODELS } from '@/lib/models';
import { adminRoute } from '@/lib/server-auth';
import { slugify, serialize } from '@/lib/utils';
import { RESOURCES } from '@/lib/admin-schema';
import { RESOURCE_AREA } from '@/lib/roles';
import { STATUS, TRASHABLE } from '@/lib/trash';
import { purgeOld } from '@/lib/trash-server';
import { pingIndexNow } from '@/lib/indexnow';
import * as seed from '@/lib/seed-data';
import { cleanRedirect } from '@/lib/redirects';
import { ensureSystemPages, prepareSave, SEO_FIELDS } from '@/lib/system-pages-server';
import { ensureStarterAnswers } from '@/lib/content-updates';
/* Built-in pages keep their SEO in settings (seo-<key>); add it so the SEO column scores the real values. */
const withSeo = async (items) => Promise.all(items.map(async (x) => { if (!x.builtin) return x; const seo = await getPageSeoFresh(x.builtin).catch(() => ({})); return { ...x, ...Object.fromEntries(SEO_FIELDS.filter((k) => seo[k] !== undefined).map((k) => [k, seo[k]])) }; }));
import { SYSTEM_PAGES, SYSTEM_BY_KEY, pagePath, pagePaths } from '@/lib/system-pages';
import { menuState } from '@/lib/menu';
import { getSettingsFresh, getPageSeoFresh } from '@/lib/data';

/* Built-in pages first (in menu order), then your own pages, newest first. */
const sysRank = (x) => (x.builtin && SYSTEM_BY_KEY[x.builtin] ? SYSTEM_PAGES.findIndex((d) => d.key === x.builtin) : 999);
const pageRows = (items, nav) => items.map((x) => { const m = nav ? menuState(nav, pagePaths(x)) : null; return { ...x, kind: x.builtin ? 'Built-in' : 'Custom', url: pagePath(x), ...(m ? { showInHeader: m.header || Boolean(!x.builtin && x.showInHeader), showInFooter: m.footer || Boolean(!x.builtin && x.showInFooter) } : {}) }; }).sort((a, b) => sysRank(a) - sysRank(b));

const noDB = () => { const e = new Error('Connect MongoDB (set MONGODB_URI) to save changes.'); e.status = 503; return e; };
const area = (p) => RESOURCE_AREA[p.resource] || 'system';

/* ?view=all (default, not trashed) | live | draft | trash. Also returns counts for the tabs. */
export const GET = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  const seedKey = { 'case-studies': 'caseStudies' }[params.resource] || params.resource;
  if (!hasDB()) {
    const items = (seed[seedKey] || []).map((x, i) => ({ _id: `seed-${i}`, ...x }));
    if (params.resource === 'pages') return NextResponse.json({ items: pageRows([...SYSTEM_PAGES.map((d) => ({ _id: `sys-${d.key}`, title: d.title, slug: d.slug, builtin: d.key, published: true })), ...items], await getSettingsFresh('navigation')), readOnly: true });
    return NextResponse.json({ items, readOnly: true });
  }
  await dbConnect();
  await ensureStarterAnswers();
  if (params.resource === 'pages') await ensureSystemPages();
  const view = req.nextUrl.searchParams.get('view') || 'all';
  const s = STATUS[params.resource];
  const canTrash = TRASHABLE.includes(params.resource);
  if (canTrash) await purgeOld(M);
  const notTrashed = canTrash ? { trashedAt: null } : {};
  const live = s ? (s.invert ? { [s.field]: { $ne: true } } : { [s.field]: { $ne: false } }) : {};
  const draft = s ? (s.invert ? { [s.field]: true } : { [s.field]: false }) : {};
  const filter = view === 'trash' ? { trashedAt: { $ne: null } } : view === 'live' ? { ...notTrashed, ...live } : view === 'draft' ? { ...notTrashed, ...draft } : notTrashed;
  const sort = ['projects', 'services', 'packages', 'categories'].includes(params.resource) ? { order: 1, createdAt: -1 } : params.resource === 'popups' ? { priority: -1, createdAt: -1 } : { createdAt: -1 };
  const [items, counts] = await Promise.all([
    M.find(filter).sort(sort).limit(1000).lean(),
    canTrash ? Promise.all([M.countDocuments(notTrashed), s ? M.countDocuments({ ...notTrashed, ...live }) : 0, s ? M.countDocuments({ ...notTrashed, ...draft }) : 0, M.countDocuments({ trashedAt: { $ne: null } })]) : null,
  ]);
  return NextResponse.json({ items: params.resource === 'pages' ? pageRows(await withSeo(serialize(items)), await getSettingsFresh('navigation')) : serialize(items), counts: counts ? { all: counts[0], live: counts[1], draft: counts[2], trash: counts[3] } : null });
}, area);

export const POST = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) throw noDB();
  await dbConnect();
  let body = await req.json(); delete body._id; delete body.trashedAt; delete body.trashState;
  const conf = RESOURCES[params.resource];
  if (conf?.slugFrom && !body.slug) body.slug = slugify(body[conf.slugFrom]);
  else if (body.slug) body.slug = slugify(body.slug);
  if (params.resource === 'pages') {
    if (SYSTEM_PAGES.some((d) => d.slug === body.slug)) throw new Error(`The address /${body.slug} belongs to a built-in page. Pick another URL slug.`);
    body = await prepareSave(body, null);
  }
  if (params.resource === 'redirects') Object.assign(body, cleanRedirect(body));
  const doc = await M.create(body);
  refreshContent();
  pingIndexNow(params.resource, doc).catch(() => {});
  return NextResponse.json({ item: serialize(doc) });
}, area);
