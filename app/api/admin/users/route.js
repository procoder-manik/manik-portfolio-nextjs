import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect, hasDB } from '@/lib/db';
import { User } from '@/lib/models';
import { adminRoute as guard } from '@/lib/server-auth';
import { serialize } from '@/lib/utils';
import { ROLES } from '@/lib/roles';
import { passwordProblem } from '@/lib/customers';
const adminRoute = (h) => guard(h, 'system');
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const needDB = () => { if (!hasDB()) throw Object.assign(new Error('Connect MongoDB (set MONGODB_URI) to manage users.'), { status: 503 }); };

export const GET = adminRoute(async () => {
  if (!hasDB()) return NextResponse.json({ items: [], noDB: true, roles: ROLES });
  await dbConnect();
  const items = await User.find().select('-passwordHash').sort({ createdAt: 1 }).lean();
  return NextResponse.json({ items: serialize(items), roles: ROLES });
});

export const POST = adminRoute(async (req) => {
  needDB(); await dbConnect();
  const b = await req.json();
  const email = String(b.email || '').trim().toLowerCase();
  if (!EMAIL.test(email)) throw new Error('Enter a valid email.');
  if (!ROLES[b.role]) throw new Error('Pick a role.');
  const problem = passwordProblem(b.password); if (problem) throw new Error(problem);
  const user = await User.create({ email, name: String(b.name || '').slice(0, 80), role: b.role, passwordHash: await bcrypt.hash(String(b.password), 10) });
  return NextResponse.json({ item: serialize({ ...user.toObject(), passwordHash: undefined }) });
});

/* PUT { id, name?, role?, disabled?, password? }. You cannot lock yourself out or remove the last administrator. */
export const PUT = adminRoute(async (req, ctx, admin) => {
  needDB(); await dbConnect();
  const b = await req.json();
  const u = await User.findById(b.id); if (!u) throw Object.assign(new Error('User not found.'), { status: 404 });
  const admins = await User.countDocuments({ $or: [{ role: 'administrator' }, { role: { $exists: false } }], disabled: { $ne: true } });
  const wasAdmin = (u.role || 'administrator') === 'administrator' && !u.disabled;
  if (b.name !== undefined) u.name = String(b.name).slice(0, 80);
  if (b.role !== undefined) { if (!ROLES[b.role]) throw new Error('Unknown role.'); u.role = b.role; }
  if (b.disabled !== undefined) u.disabled = !!b.disabled;
  if (wasAdmin && ((u.role || 'administrator') !== 'administrator' || u.disabled) && admins <= 1) throw new Error('Keep at least one active administrator.');
  if (u.email === admin.email && u.disabled) throw new Error('You cannot block your own account.');
  if (b.password) { const problem = passwordProblem(b.password); if (problem) throw new Error(problem); u.passwordHash = await bcrypt.hash(String(b.password), 10); u.failedLogins = 0; u.lockUntil = undefined; }
  await u.save();
  return NextResponse.json({ ok: true });
});

export const DELETE = adminRoute(async (req, ctx, admin) => {
  needDB(); await dbConnect();
  const id = req.nextUrl.searchParams.get('id');
  const u = await User.findById(id); if (!u) throw Object.assign(new Error('User not found.'), { status: 404 });
  if (u.email === admin.email) throw new Error('You cannot delete your own account.');
  const admins = await User.countDocuments({ $or: [{ role: 'administrator' }, { role: { $exists: false } }], disabled: { $ne: true } });
  if ((u.role || 'administrator') === 'administrator' && !u.disabled && admins <= 1) throw new Error('Keep at least one active administrator.');
  await u.deleteOne();
  return NextResponse.json({ ok: true });
});
