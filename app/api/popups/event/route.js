import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Popup } from '@/lib/models';
import { rateLimit, clientIp } from '@/lib/ratelimit';

/* Counts popup views, clicks and conversions. Fire and forget from the browser. */
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const field = { view: 'stats.views', click: 'stats.clicks', conversion: 'stats.conversions' }[b.type];
  if (!field || !/^[a-f0-9]{24}$/.test(String(b.id || '')) || !hasDB()) return NextResponse.json({ ok: false });
  if (!(await rateLimit(`pp:${await clientIp()}`, 120, 600))) return NextResponse.json({ ok: false });
  await dbConnect(); await Popup.updateOne({ _id: b.id }, { $inc: { [field]: 1 } });
  return NextResponse.json({ ok: true });
}
