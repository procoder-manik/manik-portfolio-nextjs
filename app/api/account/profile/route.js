import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import { Customer } from '@/lib/models';
import { rateLimit } from '@/lib/ratelimit';
import { touchContact } from '@/lib/crm';
import { getCustomer, passwordProblem, sessionCookie } from '@/lib/customers';

const clip = (v, n) => String(v || '').trim().slice(0, n);

/* Update profile details, or change the password ({ currentPassword, newPassword }). */
export async function PUT(req) {
  const me = await getCustomer();
  if (!me) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  await dbConnect();

  if (b.newPassword !== undefined) {
    if (!(await rateLimit(`cpass:${me._id}`, 8, 900))) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
    const c = await Customer.findById(me._id).select('+passwordHash');
    if (!(await bcrypt.compare(String(b.currentPassword || ''), c.passwordHash || ''))) return NextResponse.json({ error: 'Your current password is not right.' }, { status: 400 });
    const pp = passwordProblem(b.newPassword); if (pp) return NextResponse.json({ error: pp }, { status: 400 });
    c.tokenVersion = (c.tokenVersion || 0) + 1; // other devices are signed out
    await Customer.updateOne({ _id: c._id }, { $set: { passwordHash: await bcrypt.hash(String(b.newPassword), 10), tokenVersion: c.tokenVersion } });
    const res = NextResponse.json({ ok: true, message: 'Password changed. Other devices were signed out.' });
    res.cookies.set(...(await sessionCookie(c)));
    return res;
  }

  const name = clip(b.name, 100);
  if (!name) return NextResponse.json({ error: 'Add your name.' }, { status: 400 });
  const set = { name, phone: clip(b.phone, 40), company: clip(b.company, 120), country: clip(b.country, 60) };
  await Customer.updateOne({ _id: me._id }, { $set: set });
  await touchContact({ email: me.email, ...set, source: 'account' });
  return NextResponse.json({ ok: true, message: 'Saved.' });
}
