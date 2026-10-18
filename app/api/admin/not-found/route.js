import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { NotFoundHit } from '@/lib/models';
import { adminRoute as guard } from '@/lib/server-auth';
import { serialize } from '@/lib/utils';
const adminRoute = (h) => guard(h, 'marketing');

export const GET = adminRoute(async () => {
  if (!hasDB()) return NextResponse.json({ items: [] });
  await dbConnect();
  return NextResponse.json({ items: serialize(await NotFoundHit.find().sort({ hits: -1, lastAt: -1 }).limit(300).lean()) });
});

export const DELETE = adminRoute(async (req) => {
  await dbConnect();
  const id = req.nextUrl.searchParams.get('id');
  if (id === 'all') await NotFoundHit.deleteMany({}); else await NotFoundHit.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
});
