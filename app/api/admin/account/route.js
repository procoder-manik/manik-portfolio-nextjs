import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import { adminRoute } from '@/lib/server-auth';
import { COOKIE, signToken, adminCookieOpts } from '@/lib/auth';
import { adminPasswordProblem as passwordProblem } from '@/lib/customers';

export const PUT = adminRoute(async (req, _ctx, admin) => {
  const { current, next, name } = await req.json();
  await dbConnect();
  const user = await User.findOne({ email: admin.email });
  if (!user) throw new Error('Account not found. Sign out and sign in again.');
  if (!(await bcrypt.compare(String(current || ''), user.passwordHash))) throw new Error('Current password is wrong.');
  if (next) { const problem = passwordProblem(next); if (problem) throw new Error(problem); user.passwordHash = await bcrypt.hash(String(next), 10); user.tokenVersion = (user.tokenVersion || 0) + 1; }
  if (name) user.name = String(name).slice(0, 80);
  await user.save();
  const res = NextResponse.json({ ok: true });
  if (next) res.cookies.set(COOKIE, await signToken({ email: user.email, name: user.name, v: user.tokenVersion }), adminCookieOpts); // this device stays signed in, others are signed out
  return res;
});
