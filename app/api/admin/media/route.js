import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
const adminRoute = (h) => guard(h, 'media');
import { dbConnect, hasDB } from '@/lib/db';
import { Media } from '@/lib/models';
import { serialize } from '@/lib/utils';

export const GET = adminRoute(async () => {
  if (!hasDB()) return NextResponse.json({ items: [] });
  await dbConnect();
  return NextResponse.json({ items: serialize(await Media.find().sort({ createdAt: -1 }).limit(300).lean()) });
});
