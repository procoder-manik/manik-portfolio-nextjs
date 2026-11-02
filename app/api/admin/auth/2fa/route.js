import { NextResponse } from 'next/server';
import { verifyPendingToken } from '@/lib/auth';
import { dbConnect, hasDB } from '@/lib/db';
import { User } from '@/lib/models';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { explainError } from '@/lib/explain-error';
import { sessionResponse } from '@/lib/server-auth';
import { checkSecondFactor } from '@/lib/two-factor';
import { logLogin } from '@/lib/login-log';

/* Second sign-in step: { ticket, code }. The code is from the authenticator app, or one backup code. */
export async function POST(req) {
  let email = ''; let ip = '';
  try {
    const { ticket, code } = await req.json().catch(() => ({}));
    ip = await clientIp();
    if (!hasDB()) return NextResponse.json({ error: 'Two-step sign-in needs the database.' }, { status: 503 });
    const t = await verifyPendingToken(String(ticket || ''));
    if (!t?.email) return NextResponse.json({ error: 'That sign-in took too long. Enter your password again.', expired: true }, { status: 401 });
    email = t.email;
    if (!(await rateLimit(`login2fa:${ip}`, 10, 900)) || !(await rateLimit(`login2fa-email:${email}`, 8, 900))) {
      if (await rateLimit(`login-log:${ip}`, 1, 900)) await logLogin({ email, ok: false, event: 'failed', reason: 'rate_limited', ip });
      return NextResponse.json({ error: 'Too many wrong codes. Wait 15 minutes and try again.' }, { status: 429 });
    }
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user || user.disabled || !user.totpEnabled) return NextResponse.json({ error: 'Enter your password again.', expired: true }, { status: 401 });
    if (user.lockUntil && user.lockUntil > new Date()) return NextResponse.json({ error: 'Too many wrong codes. Wait 15 minutes and try again.' }, { status: 429 });

    const r = await checkSecondFactor(user._id, code);
    if (!r.ok) {
      const n = (user.failedLogins || 0) + 1;
      await User.updateOne({ _id: user._id }, n >= 5 ? { $set: { failedLogins: 0, lockUntil: new Date(Date.now() + 15 * 60 * 1000) } } : { $set: { failedLogins: n } });
      await logLogin({ email, userId: user._id, ok: false, event: 'failed', reason: 'wrong_code', ip });
      await new Promise((x) => setTimeout(x, 400));
      return NextResponse.json({ error: 'That code is not right. Check the app and try again.' }, { status: 401 });
    }
    await User.updateOne({ _id: user._id }, { $set: { failedLogins: 0, lastLoginAt: new Date(), lastLoginIp: ip }, $unset: { lockUntil: 1 } });
    await logLogin({ email, userId: user._id, ok: true, event: 'signed_in', reason: r.via === 'backup' ? 'password+backup_code' : 'password+app', ip });
    return sessionResponse(user, r.via === 'backup' ? { backupLeft: r.remaining } : {});
  } catch (err) {
    console.error('[admin 2fa]', err);
    return NextResponse.json({ error: explainError(err) }, { status: 500 });
  }
}
