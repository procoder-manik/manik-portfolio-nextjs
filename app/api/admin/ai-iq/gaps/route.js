import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { ChatGap } from '@/lib/models';
import { adminRoute as guard } from '@/lib/server-auth';
const adminRoute = (h) => guard(h, 'content');
export const DELETE = adminRoute(async (req) => {
  await dbConnect(); const id = req.nextUrl.searchParams.get('id');
  if (id === 'all') await ChatGap.updateMany({}, { resolved: true }); else await ChatGap.updateOne({ _id: id }, { resolved: true });
  return NextResponse.json({ ok: true });
});
