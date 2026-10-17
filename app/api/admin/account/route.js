import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import { adminRoute } from '@/lib/server-auth';

export const PUT = adminRoute(async (req, _ctx, admin) => {
  const { current, next, name } = await req.json();
  await dbConnect();
  const user = await User.findOne({ email: admin.email });
  if (!user) throw new Error('Account not found. Sign out and sign in again.');
  if (!(await bcrypt.compare(current || '', user.passwordHash))) throw new Error('Current password is wrong.');
  if (next) { if (next.length < 8) throw new Error('Use at least 8 characters for the new password.'); user.passwordHash = await bcrypt.hash(next, 10); }
  if (name) user.name = name;
  await user.save();
  return NextResponse.json({ ok: true });
});
