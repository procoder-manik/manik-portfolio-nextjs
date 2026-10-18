import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Customer } from '@/lib/models';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { mailEnabled } from '@/lib/mail';
import { sendResetEmail } from '@/lib/notifications';
import { siteUrl } from '@/lib/utils';
import { getBaseUrl } from '@/lib/base-url';
import { EMAIL_RE, normEmail, newSecret, sha } from '@/lib/customers';

export async function POST(req) {
  if (!hasDB()) return NextResponse.json({ error: 'Accounts open once the database is connected.' }, { status: 503 });
  if (!mailEnabled()) return NextResponse.json({ error: 'Password reset by email is not set up yet. Email me and I will help you get back in.' }, { status: 503 });
  if (!(await rateLimit(`cforgot:${await clientIp()}`, 5, 900))) return NextResponse.json({ error: 'Too many requests. Try again in 15 minutes.' }, { status: 429 });
  const { email: raw } = await req.json().catch(() => ({}));
  const email = normEmail(raw);
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Add a valid email.' }, { status: 400 });
  await dbConnect();
  const c = await Customer.findOne({ email });
  if (c && !c.disabled) {
    const token = newSecret();
    await Customer.updateOne({ _id: c._id }, { resetTokenHash: sha(token), resetExpires: new Date(Date.now() + 3600 * 1000) });
    await sendResetEmail(c, `${(await getBaseUrl())}/account/reset?token=${token}`);
  }
  // Same answer either way, so the form cannot be used to check who has an account.
  return NextResponse.json({ ok: true });
}
