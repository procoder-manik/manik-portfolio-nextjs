import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Customer } from '@/lib/models';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { refSettings, programsOn, REF_COOKIE } from '@/lib/referrals';

/* A visitor arrived with ?ref=CODE. Remembers the code in a cookie and counts the click. */
export async function POST(req) {
  const { code: raw } = await req.json().catch(() => ({}));
  const code = String(raw || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20);
  if (!code || !hasDB()) return NextResponse.json({ ok: false });
  const r = await refSettings();
  if (!programsOn(r)) return NextResponse.json({ ok: false });
  await dbConnect();
  const owner = await Customer.findOne({ refCode: code, disabled: { $ne: true } }).select('_id').lean();
  if (!owner) return NextResponse.json({ ok: false });
  if (await rateLimit(`refclick:${code}:${await clientIp()}`, 1, 86400)) await Customer.updateOne({ _id: owner._id }, { $inc: { 'refStats.clicks': 1 } });
  const res = NextResponse.json({ ok: true, friendCoupon: r.referral?.enabled ? r.referral.friendCoupon || null : null });
  res.cookies.set(REF_COOKIE, code, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * (r.cookieDays || 30) });
  return res;
}
