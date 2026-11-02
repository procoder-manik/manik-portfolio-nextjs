import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { COOKIE, signPendingToken, adminCookieOpts as cookieOpts } from '@/lib/auth';
import { dbConnect, hasDB } from '@/lib/db';
import { User } from '@/lib/models';
import { explainError } from '@/lib/explain-error';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { dummyHash, adminPasswordProblem } from '@/lib/customers';
import { sessionResponse } from '@/lib/server-auth';
import { logLogin } from '@/lib/login-log';

const TOO_MANY = 'Too many sign-in attempts. Wait 15 minutes and try again.';
const WRONG = 'That email and password do not match.';

export async function POST(req) {
  let e = ''; let ip = '';
  try {
    const { email = '', password = '' } = await req.json().catch(() => ({}));
    e = String(email).trim().toLowerCase().slice(0, 160);
    ip = await clientIp();
    const pass = String(password);
    // Limits by network and by account: the same message for both, so the answer never tells whether an email has an account.
    if (!(await rateLimit(`login:${ip}`, 10, 900)) || !(await rateLimit(`login-email:${e}`, 10, 900))) {
      if (await rateLimit(`login-log:${ip}`, 1, 900)) await logLogin({ email: e, ok: false, event: 'failed', reason: 'rate_limited', ip });
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }
    const envEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envPass = (process.env.ADMIN_PASSWORD || '').trim();
    if (!envEmail || !envPass) return NextResponse.json({ error: 'ADMIN_EMAIL or ADMIN_PASSWORD is not set on the server. Add them in Vercel > Settings > Environment Variables, then redeploy.' }, { status: 500 });

    const fail = async (reason, status = 401, error = WRONG) => {
      await logLogin({ email: e, ok: false, event: 'failed', reason, ip });
      await new Promise((r) => setTimeout(r, 400));
      return NextResponse.json({ error }, { status });
    };

    if (!hasDB()) {
      if (e !== envEmail || pass.trim() !== envPass) return fail('wrong_password');
      return sessionResponse({ email: e, name: 'Admin' });
    }

    await dbConnect();
    const user = await User.findOne({ email: e });
    if (!user) {
      // The first sign-in ever creates the account from ADMIN_EMAIL and ADMIN_PASSWORD.
      if ((await User.countDocuments()) === 0 && e === envEmail && pass.trim() === envPass) {
        const created = await User.create({ email: e, name: 'Manik Hossain', passwordHash: await bcrypt.hash(envPass, 10), lastLoginAt: new Date(), lastLoginIp: ip });
        await logLogin({ email: e, userId: created._id, ok: true, event: 'signed_in', reason: 'first_setup', ip });
        return sessionResponse(created);
      }
      await bcrypt.compare(pass, await dummyHash()); // same work as a real account, so the time taken gives nothing away
      return fail('unknown_account');
    }

    const locked = user.lockUntil && user.lockUntil > new Date();
    const match = await bcrypt.compare(pass, user.passwordHash || await dummyHash());
    if (locked) return fail('locked', 429, TOO_MANY);
    if (!match) {
      const n = (user.failedLogins || 0) + 1;
      await User.updateOne({ _id: user._id }, n >= 5 ? { $set: { failedLogins: 0, lockUntil: new Date(Date.now() + 15 * 60 * 1000) } } : { $set: { failedLogins: n } });
      return fail('wrong_password');
    }
    if (user.disabled) return fail('blocked', 403, 'This account is blocked. Ask an administrator.');

    if (user.totpEnabled) {
      // Password is right: ask for the app code. A short-lived ticket carries the proof to the next step; it is not a session.
      return NextResponse.json({ needs2fa: true, ticket: await signPendingToken(e) });
    }
    await User.updateOne({ _id: user._id }, { $set: { failedLogins: 0, lastLoginAt: new Date(), lastLoginIp: ip }, $unset: { lockUntil: 1 } });
    await logLogin({ email: e, userId: user._id, ok: true, event: 'signed_in', reason: 'password', ip });
    return sessionResponse(user);
  } catch (err) {
    console.error('[admin login]', err);
    return NextResponse.json({ error: explainError(err) }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', { ...cookieOpts, maxAge: 0 });
  return res;
}
