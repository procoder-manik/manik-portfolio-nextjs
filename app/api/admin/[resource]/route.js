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

const noDB = () => { const e = new Error('Connect MongoDB (set MONGODB_URI) to save changes.'); e.status = 503; return e; };
const area = (p) => RESOURCE_AREA[p.resource] || 'system';

/* ?view=all (default, not trashed) | live | draft | trash. Also returns counts for the tabs. */
export const GET = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  const seedKey = { 'case-studies': 'caseStudies' }[params.resource] || params.resource;
  if (!hasDB()) return NextResponse.json({ items: (seed[seedKey] || []).map((x, i) => ({ _id: `seed-${i}`, ...x })), readOnly: true });
  await dbConnect();
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
  return NextResponse.json({ items: serialize(items), counts: counts ? { all: counts[0], live: counts[1], draft: counts[2], trash: counts[3] } : null });
}, area);

export const POST = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) throw noDB();
  await dbConnect();
  const body = await req.json(); delete body._id; delete body.trashedAt; delete body.trashState;
  const conf = RESOURCES[params.resource];
  if (conf?.slugFrom && !body.slug) body.slug = slugify(body[conf.slugFrom]);
  else if (body.slug) body.slug = slugify(body.slug);
  if (params.resource === 'redirects') Object.assign(body, cleanRedirect(body));
  const doc = await M.create(body);
  refreshContent();
  pingIndexNow(params.resource, doc).catch(() => {});
  return NextResponse.json({ item: serialize(doc) });
}, area);
