import { NextResponse } from 'next/server';
import { refreshContent } from '@/lib/revalidate';
import { sendOrderEmail } from '@/lib/notifications';
import { touchContact } from '@/lib/crm';
import { rewardOrder, unwindOrder } from '@/lib/referrals';
import { dbConnect, hasDB } from '@/lib/db';
import { MODELS } from '@/lib/models';
import { adminRoute } from '@/lib/server-auth';
import { slugify, serialize } from '@/lib/utils';
import { RESOURCES } from '@/lib/admin-schema';
import * as seed from '@/lib/seed-data';

const noDB = () => { const e = new Error('Connect MongoDB (set MONGODB_URI) to save changes.'); e.status = 503; return e; };

export const GET = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) {
    const i = Number(params.id.replace('seed-', ''));
    return NextResponse.json({ item: { _id: params.id, ...(seed[{ 'case-studies': 'caseStudies' }[params.resource] || params.resource]?.[i] || {}) }, readOnly: true });
  }
  await dbConnect();
  const item = await M.findById(params.id).lean();
  if (!item) throw Object.assign(new Error('Not found.'), { status: 404 });
  return NextResponse.json({ item: serialize(item) });
});

export const PUT = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) throw noDB();
  await dbConnect();
  const body = await req.json(); delete body._id; delete body.createdAt; delete body.updatedAt;
  const conf = RESOURCES[params.resource];
  if (conf?.slugFrom && (body.slug !== undefined || body[conf.slugFrom] !== undefined)) body.slug = slugify(body.slug || body[conf.slugFrom]);
  if (params.resource === 'orders' && body.status) {
    const prev = await M.findById(params.id).lean();
    if (prev && prev.status !== body.status) {
      body.history = [...(prev.history || []), { status: body.status, at: new Date(), note: 'Updated by admin' }];
      if (body.status === 'paid' && !prev.payment?.paidAt) body['payment.paidAt'] = new Date();
    }
  }
  const before = params.resource === 'orders' ? await M.findById(params.id).select('status').lean() : null;
  const item = await M.findByIdAndUpdate(params.id, body, { new: true, runValidators: true }).lean();
  let mail = null;
  if (before && item && before.status !== item.status) {
    const key = { paid: 'paid', in_progress: 'in_progress', completed: 'completed', cancelled: 'cancelled' }[item.status];
    if (key && body.notify !== false) mail = await sendOrderEmail(item, key);
    if (item.status === 'paid') await touchContact({ email: item.customer?.email, source: 'payment', spent: item.amount, activity: `Paid ${item.number}` });
    if (['paid', 'in_progress', 'completed'].includes(item.status)) await rewardOrder(item);
    if (item.status === 'cancelled') await unwindOrder(item);
  }
  if (mail) { refreshContent(); return NextResponse.json({ item: serialize(await M.findById(params.id).lean()), mail }); }
  refreshContent();
  return NextResponse.json({ item: serialize(item) });
});

export const DELETE = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) throw noDB();
  await dbConnect();
  await M.findByIdAndDelete(params.id);
  refreshContent();
  return NextResponse.json({ ok: true });
});
