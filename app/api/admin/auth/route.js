import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { COOKIE, signToken } from '@/lib/auth';
import { dbConnect, hasDB } from '@/lib/db';
import { User } from '@/lib/models';
import { explainError } from '@/lib/explain-error';
import { rateLimit, clientIp } from '@/lib/ratelimit';

const cookieOpts = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 };

export async function POST(req) {
  try {
    const { email = '', password = '' } = await req.json().catch(() => ({}));
    const e = String(email).trim().toLowerCase().slice(0, 160);
    const ip = await clientIp();
    if (!(await rateLimit(`login:${ip}`, 10, 900))) return NextResponse.json({ error: 'Too many sign-in attempts. Wait 15 minutes and try again.' }, { status: 429 });
    const envEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envPass = (process.env.ADMIN_PASSWORD || '').trim();
    if (!envEmail || !envPass) return NextResponse.json({ error: 'ADMIN_EMAIL or ADMIN_PASSWORD is not set on the server. Add them in Vercel > Settings > Environment Variables, then redeploy.' }, { status: 500 });

    let ok = false; let name = 'Admin';
    if (hasDB()) {
      await dbConnect();
      const user = await User.findOne({ email: e });
      if (user) {
        if (user.disabled) return NextResponse.json({ error: 'This account is blocked. Ask an administrator.' }, { status: 403 });
        if (user.lockUntil && user.lockUntil > new Date()) return NextResponse.json({ error: 'This account is locked for a few minutes after too many wrong passwords.' }, { status: 423 });
        ok = await bcrypt.compare(String(password), user.passwordHash);
        name = user.name || name;
        if (ok) { user.failedLogins = 0; user.lockUntil = undefined; user.lastLoginAt = new Date(); user.lastLoginIp = ip; }
        else { user.failedLogins = (user.failedLogins || 0) + 1; if (user.failedLogins >= 5) { user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); user.failedLogins = 0; } }
        await user.save();
      } else if ((await User.countDocuments()) === 0 && e === envEmail && password.trim() === envPass) {
        await User.create({ email: e, name: 'Manik Hossain', passwordHash: await bcrypt.hash(envPass, 10) });
        ok = true;
      }
    } else {
      ok = e === envEmail && password.trim() === envPass;
    }

    if (!ok) { await new Promise((r) => setTimeout(r, 400)); return NextResponse.json({ error: 'That email and password do not match.' }, { status: 401 }); }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, await signToken({ email: e, name }), cookieOpts);
    return res;
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
