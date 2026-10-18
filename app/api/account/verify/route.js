import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Customer } from '@/lib/models';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { mailEnabled } from '@/lib/mail';
import { sendVerifyEmail } from '@/lib/notifications';
import { siteUrl } from '@/lib/utils';
import { getBaseUrl } from '@/lib/base-url';
import { getCustomer, sha, newSecret, linkOrdersByEmail } from '@/lib/customers';

export const dynamic = 'force-dynamic';

/* Link from the confirmation email */
export async function GET(req) {
  const base = (await getBaseUrl());
  const token = req.nextUrl.searchParams.get('token') || '';
  if (!hasDB() || !token) return NextResponse.redirect(`${base}/account?verified=0`);
  await dbConnect();
  const c = await Customer.findOne({ verifyTokenHash: sha(token), verifyExpires: { $gt: new Date() } });
  if (!c) return NextResponse.redirect(`${base}/account?verified=0`);
  await Customer.updateOne({ _id: c._id }, { $set: { emailVerified: true }, $unset: { verifyTokenHash: 1, verifyExpires: 1 } });
  c.emailVerified = true;
  await linkOrdersByEmail(c);
  return NextResponse.redirect(`${base}/account?verified=1`);
}

/* Send the confirmation email again (signed in) */
export async function POST() {
  const me = await getCustomer();
  if (!me) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (me.emailVerified) return NextResponse.json({ ok: true, already: true });
  if (!mailEnabled()) return NextResponse.json({ error: 'Email sending is not set up on this site yet. Send me a message from your account and I will confirm it for you.' }, { status: 503 });
  if (!(await rateLimit(`cverify:${me._id}`, 3, 3600))) return NextResponse.json({ error: 'Already sent a few times. Check your spam folder, or try again in an hour.' }, { status: 429 });
  const token = newSecret();
  await Customer.updateOne({ _id: me._id }, { verifyTokenHash: sha(token), verifyExpires: new Date(Date.now() + 48 * 3600 * 1000) });
  const r = await sendVerifyEmail(me, `${(await getBaseUrl())}/api/account/verify?token=${token}`);
  if (!r.ok) return NextResponse.json({ error: r.error || 'The email did not send.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
