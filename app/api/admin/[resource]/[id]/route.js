import { NextResponse } from 'next/server';
import { refreshContent } from '@/lib/revalidate';
import { sendOrderEmail } from '@/lib/notifications';
import { touchContact } from '@/lib/crm';
import { rewardOrder, unwindOrder } from '@/lib/referrals';
import { dbConnect, hasDB } from '@/lib/db';
import { MODELS, Redirect } from '@/lib/models';
import { adminRoute } from '@/lib/server-auth';
import { slugify, serialize } from '@/lib/utils';
import { RESOURCES } from '@/lib/admin-schema';
import { RESOURCE_AREA } from '@/lib/roles';
import { TRASHABLE, PUBLIC_PATH } from '@/lib/trash';
import { trashUpdate, restoreUpdate, draftUpdate } from '@/lib/trash-server';
import { cleanRedirect, normPath } from '@/lib/redirects';
import { getSettingsFresh } from '@/lib/data';
import { pingIndexNow } from '@/lib/indexnow';
import * as seed from '@/lib/seed-data';

const noDB = () => { const e = new Error('Connect MongoDB (set MONGODB_URI) to save changes.'); e.status = 503; return e; };
const area = (p) => RESOURCE_AREA[p.resource] || 'system';

export const GET = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) {
    const i = Number(params.id.replace('seed-', ''));
    return NextResponse.json({ item: { _id: params.id, ...(seed[{ 'case-studies': 'caseStudies' }[params.resource] || params.resource]?.[i] || {}) }, readOnly: true });
  }
  await dbConnect();
  const item = await M.findById(params.id).lean();
  if (!item) throw Object.assign(new Error('Not found. It may have been deleted permanently.'), { status: 404 });
  return NextResponse.json({ item: serialize(item) });
}, area);

export const PUT = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) throw noDB();
  await dbConnect();
  const body = await req.json(); delete body._id; delete body.createdAt; delete body.updatedAt; delete body.trashedAt; delete body.trashState;
  const conf = RESOURCES[params.resource];
  if (conf?.slugFrom && (body.slug !== undefined || body[conf.slugFrom] !== undefined)) body.slug = slugify(body.slug || body[conf.slugFrom]);
  if (params.resource === 'redirects') Object.assign(body, cleanRedirect(body));
  const prev = await M.findById(params.id).lean();
  if (!prev) throw Object.assign(new Error('Not found. It may have been deleted permanently.'), { status: 404 });
  if (params.resource === 'orders' && body.status && prev.status !== body.status) {
    body.history = [...(prev.history || []), { status: body.status, at: new Date(), note: 'Updated by admin' }];
    if (body.status === 'paid' && !prev.payment?.paidAt) body['payment.paidAt'] = new Date();
  }
  const item = await M.findByIdAndUpdate(params.id, body, { new: true, runValidators: true }).lean();

  // Slug changed on a published item: send the old address to the new one (Rank Math style).
  if (PUBLIC_PATH[params.resource] && prev.slug && item.slug && prev.slug !== item.slug && prev.published !== false) await autoRedirect(params.resource, prev.slug, item.slug);

  let mail = null;
  if (params.resource === 'orders' && prev.status !== item.status) {
    const key = { paid: 'paid', in_progress: 'in_progress', completed: 'completed', cancelled: 'cancelled' }[item.status];
    if (key && body.notify !== false) mail = await sendOrderEmail(item, key);
    if (item.status === 'paid') await touchContact({ email: item.customer?.email, source: 'payment', spent: item.amount, activity: `Paid ${item.number}` });
    if (['paid', 'in_progress', 'completed'].includes(item.status)) await rewardOrder(item);
    if (item.status === 'cancelled') await unwindOrder(item);
  }
  refreshContent();
  pingIndexNow(params.resource, item).catch(() => {});
  if (mail) return NextResponse.json({ item: serialize(await M.findById(params.id).lean()), mail });
  return NextResponse.json({ item: serialize(item) });
}, area);

async function autoRedirect(resource, oldSlug, newSlug) {
  try {
    const seo = await getSettingsFresh('seo');
    if (seo.redirects?.autoSlug === false) return;
    const from = PUBLIC_PATH[resource](oldSlug); const to = PUBLIC_PATH[resource](newSlug);
    // Never leave a loop: a rule that starts at the new address is removed.
    await Redirect.deleteMany({ from: { $in: [to, normPath(to)] } });
    await Redirect.updateMany({ to: from }, { to }); // chains A->B->C become A->C
    await Redirect.updateOne({ from }, { $set: { from, to, code: 301, match: 'exact', active: true, auto: true, note: 'Added automatically when the URL slug changed', trashedAt: null } }, { upsert: true });
  } catch (e) { console.error('[auto redirect]', e.message); }
}

/* PATCH { action: 'restore' | 'draft' | 'trash' } */
export const PATCH = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) throw noDB();
  await dbConnect();
  const { action } = await req.json().catch(() => ({}));
  const doc = await M.findById(params.id).lean();
  if (!doc) throw Object.assign(new Error('Not found.'), { status: 404 });
  let set = null;
  if (action === 'restore') set = restoreUpdate(params.resource, doc);
  else if (action === 'trash') { if (!TRASHABLE.includes(params.resource)) throw new Error('This section has no Trash.'); set = trashUpdate(params.resource, doc); }
  else if (action === 'draft') { set = draftUpdate(params.resource); if (!set) throw new Error('This section has no draft state.'); }
  else throw new Error('Unknown action.');
  const item = await M.findByIdAndUpdate(params.id, set, { new: true }).lean();
  refreshContent();
  return NextResponse.json({ item: serialize(item) });
}, area);

/* DELETE ?mode=trash (default for lists with a Trash) | permanent */
export const DELETE = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) throw noDB();
  await dbConnect();
  const mode = req.nextUrl.searchParams.get('mode') || (TRASHABLE.includes(params.resource) ? 'trash' : 'permanent');
  if (mode === 'trash' && TRASHABLE.includes(params.resource)) {
    const doc = await M.findById(params.id).lean();
    if (!doc) throw Object.assign(new Error('Not found.'), { status: 404 });
    await M.updateOne({ _id: params.id }, trashUpdate(params.resource, doc));
  } else {
    await M.findByIdAndDelete(params.id);
  }
  refreshContent();
  return NextResponse.json({ ok: true, mode });
}, area);
