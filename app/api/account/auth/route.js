import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect, hasDB } from '@/lib/db';
import { Customer } from '@/lib/models';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { explainError } from '@/lib/explain-error';
import { CUSTOMER_COOKIE } from '@/lib/auth';
import { normEmail, sessionCookie, claimOrder, customerCookieOpts } from '@/lib/customers';

/* Customer sign in */
export async function POST(req) {
  try {
    if (!hasDB()) return NextResponse.json({ error: 'Accounts open once the database is connected.' }, { status: 503 });
    const b = await req.json().catch(() => ({}));
    const email = normEmail(b.email); const ip = await clientIp();
    if (!(await rateLimit(`clogin:${ip}`, 15, 900))) return NextResponse.json({ error: 'Too many sign-in attempts. Wait 15 minutes and try again.' }, { status: 429 });
    await dbConnect();
    const c = await Customer.findOne({ email }).select('+passwordHash');
    const fail = async () => { await new Promise((r) => setTimeout(r, 400)); return NextResponse.json({ error: 'That email and password do not match.' }, { status: 401 }); };
    if (!c || !c.passwordHash) return fail();
    if (c.disabled) return NextResponse.json({ error: 'This account is blocked. Email me if that is a mistake.' }, { status: 403 });
    if (c.lockUntil && c.lockUntil > new Date()) return NextResponse.json({ error: 'This account is locked for a few minutes after too many wrong passwords.' }, { status: 423 });
    const ok = await bcrypt.compare(String(b.password || ''), c.passwordHash);
    if (!ok) {
      const n = (c.failedLogins || 0) + 1;
      await Customer.updateOne({ _id: c._id }, n >= 5 ? { $set: { failedLogins: 0, lockUntil: new Date(Date.now() + 15 * 60 * 1000) } } : { $set: { failedLogins: n } });
      return fail();
    }
    await Customer.updateOne({ _id: c._id }, { $set: { failedLogins: 0, lastLoginAt: new Date(), lastLoginIp: ip }, $unset: { lockUntil: 1 } });
    if (b.claim && b.t) await claimOrder(c, b.claim, b.t);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(...(await sessionCookie(c)));
    return res;
  } catch (e) {
    console.error('[account login]', e);
    return NextResponse.json({ error: explainError(e) }, { status: 500 });
  }
}

/* Sign out */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE, '', { ...customerCookieOpts, maxAge: 0 });
  return res;
}
