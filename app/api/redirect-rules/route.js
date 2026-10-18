import { NextResponse } from 'next/server';
import { getRedirectRules } from '@/lib/data';
import { dbConnect, hasDB } from '@/lib/db';
import { Redirect } from '@/lib/models';
import { rateLimit, clientIp } from '@/lib/ratelimit';

/* Read by the middleware to know which addresses to redirect. Rules are not secret: visitors see them anyway. */
export async function GET() {
  return NextResponse.json({ rules: await getRedirectRules() }, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } });
}

export async function POST(req) {
  const { id } = await req.json().catch(() => ({}));
  if (!/^[a-f0-9]{24}$/.test(String(id || '')) || !hasDB()) return NextResponse.json({ ok: false });
  if (!(await rateLimit(`rd:${await clientIp()}`, 200, 600))) return NextResponse.json({ ok: false });
  await dbConnect(); await Redirect.updateOne({ _id: id }, { $inc: { hits: 1 }, lastHitAt: new Date() });
  return NextResponse.json({ ok: true });
}
