import { NextResponse } from 'next/server';
import { refreshContent } from '@/lib/revalidate';
import { dbConnect, hasDB } from '@/lib/db';
import { MODELS } from '@/lib/models';
import { adminRoute } from '@/lib/server-auth';
import { slugify, serialize } from '@/lib/utils';
import { RESOURCES } from '@/lib/admin-schema';
import * as seed from '@/lib/seed-data';

const noDB = () => { const e = new Error('Connect MongoDB (set MONGODB_URI) to save changes.'); e.status = 503; return e; };

export const GET = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) return NextResponse.json({ items: (seed[{ 'case-studies': 'caseStudies' }[params.resource] || params.resource] || []).map((x, i) => ({ _id: `seed-${i}`, ...x })), readOnly: true });
  await dbConnect();
  const sort = ['projects', 'services', 'packages', 'categories'].includes(params.resource) ? { order: 1, createdAt: -1 } : { createdAt: -1 };
  const items = await M.find().sort(sort).limit(500).lean();
  return NextResponse.json({ items: serialize(items) });
});

export const POST = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) throw noDB();
  await dbConnect();
  const body = await req.json(); delete body._id;
  const conf = RESOURCES[params.resource];
  if (conf?.slugFrom && !body.slug) body.slug = slugify(body[conf.slugFrom]);
  else if (body.slug) body.slug = slugify(body.slug);
  const doc = await M.create(body);
  refreshContent();
  return NextResponse.json({ item: serialize(doc) });
});
