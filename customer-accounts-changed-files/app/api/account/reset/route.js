import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect, hasDB } from '@/lib/db';
import { Customer } from '@/lib/models';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { passwordProblem, sha, sessionCookie, linkOrdersByEmail } from '@/lib/customers';

export async function POST(req) {
  if (!hasDB()) return NextResponse.json({ error: 'Accounts open once the database is connected.' }, { status: 503 });
  if (!(await rateLimit(`creset:${await clientIp()}`, 10, 900))) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  const { token, password } = await req.json().catch(() => ({}));
  const pp = passwordProblem(password); if (pp) return NextResponse.json({ error: pp }, { status: 400 });
  await dbConnect();
  const c = await Customer.findOne({ resetTokenHash: sha(token || ''), resetExpires: { $gt: new Date() } });
  if (!c) return NextResponse.json({ error: 'This reset link has expired or was already used. Ask for a new one.' }, { status: 400 });
  c.tokenVersion = (c.tokenVersion || 0) + 1; // signs out every other device
  c.emailVerified = true; // the link reached their inbox
  await Customer.updateOne({ _id: c._id }, {
    $set: { passwordHash: await bcrypt.hash(String(password), 10), failedLogins: 0, emailVerified: true, tokenVersion: c.tokenVersion },
    $unset: { resetTokenHash: 1, resetExpires: 1, lockUntil: 1 },
  });
  await linkOrdersByEmail(c);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(...(await sessionCookie(c)));
  return res;
}
