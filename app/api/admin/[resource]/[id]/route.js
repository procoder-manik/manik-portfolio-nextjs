import { NextResponse } from 'next/server';
import { refreshContent } from '@/lib/revalidate';
import { sendOrderEmail } from '@/lib/notifications';
import { touchContact } from '@/lib/crm';
import { rewardOrder, unwindOrder } from '@/lib/referrals';
import { activateSubscription } from '@/lib/subscriptions';
import { dbConnect, hasDB } from '@/lib/db';
import { MODELS, Redirect } from '@/lib/models';
import { adminRoute } from '@/lib/server-auth';
import { slugify, serialize } from '@/lib/utils';
import { RESOURCES } from '@/lib/admin-schema';
import { RESOURCE_AREA } from '@/lib/roles';
import { TRASHABLE, PUBLIC_PATH, DUPLICABLE, NOINDEXABLE, STATUS } from '@/lib/trash';
import { buildCopy } from '@/lib/duplicate-server';
import { trashUpdate, restoreUpdate, draftUpdate } from '@/lib/trash-server';
import { cleanRedirect, normPath } from '@/lib/redirects';
import { getSettingsFresh } from '@/lib/data';
import { pingIndexNow } from '@/lib/indexnow';
import * as seed from '@/lib/seed-data';
import { decoratePage, prepareSave, moveMenuLinks, isSystem, systemError } from '@/lib/system-pages-server';
import { SYSTEM_BY_KEY, SYSTEM_PAGES, defaultBlocks } from '@/lib/system-pages';

const noDB = () => { const e = new Error('Connect MongoDB (set MONGODB_URI) to save changes.'); e.status = 503; return e; };
const area = (p) => RESOURCE_AREA[p.resource] || 'system';

export const GET = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) {
    if (params.resource === 'pages' && params.id.startsWith('sys-')) {
      const d = SYSTEM_BY_KEY[params.id.slice(4)]; if (!d) throw new Error('Not found.');
      return NextResponse.json({ item: { _id: params.id, title: d.title, slug: d.slug, builtin: d.key, published: true, blocks: defaultBlocks(d.key, seed.settings.home), path: d.path, menu: {} }, readOnly: true });
    }
    const i = Number(params.id.replace('seed-', ''));
    return NextResponse.json({ item: { _id: params.id, ...(seed[{ 'case-studies': 'caseStudies' }[params.resource] || params.resource]?.[i] || {}) }, readOnly: true });
  }
  await dbConnect();
  const item = await M.findById(params.id).lean();
  if (!item) throw Object.assign(new Error('Not found. It may have been deleted permanently.'), { status: 404 });
  if (params.resource === 'pages') return NextResponse.json({ item: serialize(await decoratePage(item)) });
  return NextResponse.json({ item: serialize(item) });
}, area);

export const PUT = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) throw noDB();
  await dbConnect();
  let body = await req.json(); delete body._id; delete body.createdAt; delete body.updatedAt; delete body.trashedAt; delete body.trashState;
  const conf = RESOURCES[params.resource];
  if (conf?.slugFrom && (body.slug !== undefined || body[conf.slugFrom] !== undefined)) body.slug = slugify(body.slug || body[conf.slugFrom]);
  if (params.resource === 'redirects') Object.assign(body, cleanRedirect(body));
  const prev = await M.findById(params.id).lean();
  if (!prev) throw Object.assign(new Error('Not found. It may have been deleted permanently.'), { status: 404 });
  if (params.resource === 'pages') {
    if (!prev.builtin && SYSTEM_PAGES.some((d) => d.slug === body.slug)) throw new Error(`The address /${body.slug} belongs to a built-in page. Pick another URL slug.`);
    if (!prev.builtin && body.slug && prev.slug !== body.slug) await moveMenuLinks(`/${prev.slug}`, `/${body.slug}`);
    body = await prepareSave(body, prev);
  }
  if (params.resource === 'orders' && body.status && prev.status !== body.status) {
    body.history = [...(prev.history || []), { status: body.status, at: new Date(), note: 'Updated by admin' }];
    if (body.status === 'paid' && !prev.payment?.paidAt) body['payment.paidAt'] = new Date();
  }
  // Subscription dates typed on the order screen: { startsAt, endsAt, action: 'cancel' | 'switchOn' }
  if (params.resource === 'orders' && body.subscriptionEdit) {
    const e = body.subscriptionEdit; delete body.subscriptionEdit;
    const ps = prev.subscription || {}; const paid = ['paid', 'in_progress', 'completed'].includes(body.status || prev.status);
    if (e.startsAt !== undefined) body['subscription.startsAt'] = e.startsAt ? new Date(e.startsAt) : null;
    if (e.endsAt !== undefined) body['subscription.endsAt'] = e.endsAt ? new Date(e.endsAt) : null;
    if (!ps.period) body['subscription.period'] = prev.package?.billing === 'yearly' ? 'yearly' : 'monthly';
    if (e.endsAt !== undefined) body['subscription.reminders'] = [];
    const endsAt = e.endsAt !== undefined ? (e.endsAt ? new Date(e.endsAt) : null) : ps.endsAt ? new Date(ps.endsAt) : null;
    if (e.action === 'cancel') body['subscription.status'] = 'cancelled';
    else if (paid && endsAt) body['subscription.status'] = endsAt > new Date() ? 'active' : 'expired';
    else if (!ps.status || ps.status === 'none') body['subscription.status'] = 'pending';
  }
  let item = await M.findByIdAndUpdate(params.id, body, { new: true, runValidators: true }).lean();

  // Slug changed on a published item: send the old address to the new one (Rank Math style).
  if (PUBLIC_PATH[params.resource] && prev.slug && item.slug && prev.slug !== item.slug && prev.published !== false) await autoRedirect(params.resource, prev.slug, item.slug);

  let mail = null;
  if (params.resource === 'orders' && prev.status !== item.status) {
    const key = { paid: 'paid', in_progress: 'in_progress', completed: 'completed', cancelled: 'cancelled' }[item.status];
    if (key && body.notify !== false) mail = await sendOrderEmail(item, key);
    if (item.status === 'paid') await touchContact({ email: item.customer?.email, source: 'payment', spent: item.amount, activity: `Paid ${item.number}` });
    if (['paid', 'in_progress', 'completed'].includes(item.status)) { await activateSubscription(item); await rewardOrder(item); item = await M.findById(params.id).lean(); }
    if (item.status === 'cancelled') await unwindOrder(item);
  }
  refreshContent();
  pingIndexNow(params.resource, item).catch(() => {});
  if (params.resource === 'pages') return NextResponse.json({ item: serialize(await decoratePage(item)) });
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
  const body = await req.json().catch(() => ({}));
  const { action } = body;
  const doc = await M.findById(params.id).lean();
  if (!doc) throw Object.assign(new Error('Not found.'), { status: 404 });
  if (params.resource === 'pages' && isSystem(doc)) {
    if (action === 'duplicate') throw systemError('copied');
    if (action === 'trash') throw systemError('moved to the Trash');
    if (action === 'draft' && doc.builtin === 'home') throw new Error('The home page is always on.');
    if (action === 'quick') { delete body.slug; if (doc.builtin === 'home') delete body.live; }
  }

  /* Duplicate: a copy that starts switched off, with a new unique address. */
  if (action === 'duplicate') {
    if (!DUPLICABLE.includes(params.resource)) throw new Error('This section cannot be duplicated.');
    const copy = await buildCopy(params.resource, M, doc, RESOURCES[params.resource]);
    const created = await M.create(copy);
    refreshContent();
    return NextResponse.json({ item: serialize(created) });
  }

  /* Quick edit: title, address, live or draft, index or noindex, in one small save. */
  if (action === 'quick') {
    const conf = RESOURCES[params.resource]; const tf = conf?.slugFrom; const st = STATUS[params.resource];
    const set = {};
    if (tf && typeof body.title === 'string') { if (!body.title.trim()) throw new Error('The title cannot be empty.'); set[tf] = body.title.trim(); }
    if (M.schema.path('slug') && typeof body.slug === 'string' && body.slug.trim()) set.slug = slugify(body.slug);
    if (st && typeof body.live === 'boolean') set[st.field] = st.invert ? !body.live : body.live;
    if (NOINDEXABLE.includes(params.resource) && typeof body.noindex === 'boolean') set.seoNoindex = body.noindex;
    if (!Object.keys(set).length) throw new Error('Nothing to save.');
    const item = await M.findByIdAndUpdate(params.id, set, { new: true, runValidators: true }).lean();
    if (PUBLIC_PATH[params.resource] && doc.slug && item.slug && doc.slug !== item.slug && doc.published !== false) await autoRedirect(params.resource, doc.slug, item.slug);
    refreshContent();
    pingIndexNow(params.resource, item).catch(() => {});
    return NextResponse.json({ item: serialize(item) });
  }

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
  if (params.resource === 'pages' && isSystem(await M.findById(params.id).select('builtin').lean())) throw systemError('deleted');
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
