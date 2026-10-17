import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect, hasDB } from '@/lib/db';
import { Customer } from '@/lib/models';
import { getSettings } from '@/lib/data';
import { accountsOn } from '@/lib/features';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { explainError } from '@/lib/explain-error';
import { touchContact } from '@/lib/crm';
import { mailEnabled } from '@/lib/mail';
import { sendVerifyEmail } from '@/lib/notifications';
import { siteUrl } from '@/lib/utils';
import { EMAIL_RE, normEmail, passwordProblem, sessionCookie, claimOrder, newSecret, sha } from '@/lib/customers';

export async function POST(req) {
  try {
    if (!hasDB()) return NextResponse.json({ error: 'Accounts open once the database is connected.' }, { status: 503 });
    if (!accountsOn(await getSettings('site'))) return NextResponse.json({ error: 'Accounts are switched off.' }, { status: 403 });
    const ip = await clientIp();
    if (!(await rateLimit(`cregister:${ip}`, 6, 3600))) return NextResponse.json({ error: 'Too many sign-ups from this network. Try again later.' }, { status: 429 });
    const b = await req.json().catch(() => ({}));
    if (b.website) return NextResponse.json({ ok: true }); // honeypot
    const email = normEmail(b.email); const name = String(b.name || '').trim().slice(0, 100);
    if (!name) return NextResponse.json({ error: 'Add your name.' }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Add a valid email.' }, { status: 400 });
    const pp = passwordProblem(b.password); if (pp) return NextResponse.json({ error: pp }, { status: 400 });
    await dbConnect();
    if (await Customer.exists({ email })) return NextResponse.json({ error: 'An account with this email already exists. Sign in, or reset the password.' }, { status: 409 });

    const token = newSecret();
    const c = await Customer.create({
      email, name, phone: String(b.phone || '').slice(0, 40), passwordHash: await bcrypt.hash(String(b.password), 10),
      verifyTokenHash: sha(token), verifyExpires: new Date(Date.now() + 48 * 3600 * 1000), lastLoginAt: new Date(), lastLoginIp: ip,
    });
    if (b.claim && b.t) await claimOrder(c, b.claim, b.t);
    await touchContact({ email, name, phone: c.phone, source: 'account', activity: 'Created a customer account' });
    let mail = { ok: false };
    if (mailEnabled()) mail = await sendVerifyEmail(c, `${siteUrl()}/api/account/verify?token=${token}`);
    const res = NextResponse.json({ ok: true, verifySent: mail.ok });
    res.cookies.set(...(await sessionCookie(c)));
    return res;
  } catch (e) {
    console.error('[account register]', e);
    if (e.code === 11000) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    return NextResponse.json({ error: explainError(e) }, { status: 500 });
  }
}
