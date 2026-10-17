import 'server-only';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE, verifyToken } from './auth';

export async function getAdmin() {
  return verifyToken((await cookies()).get(COOKIE)?.value);
}

/* Wrap admin route handlers: rejects unauthenticated calls and returns JSON errors. */
export function adminRoute(handler) {
  return async (req, ctx) => {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
    try {
      const params = ctx?.params ? await ctx.params : {};
      return await handler(req, { ...ctx, params }, admin);
    }
    catch (e) {
      console.error(e);
      const msg = e.code === 11000 ? 'That slug is already used. Pick another one.' : e.message || 'Something went wrong.';
      return NextResponse.json({ error: msg }, { status: e.status || 400 });
    }
  };
}
