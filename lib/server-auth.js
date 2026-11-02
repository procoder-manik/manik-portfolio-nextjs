import 'server-only';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE, verifyToken, signToken, adminCookieOpts } from './auth';
import { dbConnect, hasDB } from './db';
import { User } from './models';
import { can, roleOf, ROLES } from './roles';

/* The signed-in admin, re-checked against the database on every call so a removed,
   blocked or re-roled user loses access at once (not only when the 7-day cookie ends). */
export async function getAdmin() {
  const t = await verifyToken((await cookies()).get(COOKIE)?.value);
  if (!t) return null;
  if (!hasDB()) return { ...t, role: 'administrator' };
  try {
    await dbConnect();
    const u = await User.findOne({ email: t.email }).select('name email role disabled tokenVersion').lean();
    if (!u) return (await User.estimatedDocumentCount()) === 0 ? { ...t, role: 'administrator' } : null;
    if (u.disabled || (u.tokenVersion || 0) !== (t.v || 0)) return null; // a password change signs out old sessions
    return { ...t, id: String(u._id), name: u.name || t.name, role: roleOf(u.role) };
  } catch (e) { console.error('[admin check]', e.message); return null; } // never grant access when the role cannot be checked
}

/* The reply that signs an admin in: sets the session cookie. extra is merged into the JSON. */
export async function sessionResponse(user, extra = {}) {
  const res = NextResponse.json({ ok: true, ...extra });
  res.cookies.set(COOKIE, await signToken({ email: user.email, name: user.name || 'Admin', v: user.tokenVersion || 0 }), adminCookieOpts);
  return res;
}

/* Wrap admin route handlers: rejects unauthenticated calls, checks the role and returns JSON errors.
   area: a permission group, or a function (params, req) => group. */
export function adminRoute(handler, area) {
  return async (req, ctx) => {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
    try {
      const params = ctx?.params ? await ctx.params : {};
      const need = typeof area === 'function' ? area(params, req) : area;
      if (!can(admin.role, need)) return NextResponse.json({ error: `Your role (${ROLES[admin.role]?.label || admin.role}) cannot open this section. Ask an administrator.` }, { status: 403 });
      return await handler(req, { ...ctx, params }, admin);
    }
    catch (e) {
      console.error(e);
      const msg = e.code === 11000 ? 'That slug or address is already used (check the Trash too). Pick another one.' : e.message || 'Something went wrong.';
      return NextResponse.json({ error: msg }, { status: e.status || 400 });
    }
  };
}
