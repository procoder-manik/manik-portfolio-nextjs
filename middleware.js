import { NextResponse } from 'next/server';
import { COOKIE, CUSTOMER_COOKIE, verifyToken, verifyCustomerToken } from './lib/auth';
import { matchRedirect } from './lib/redirects';

const ACCOUNT_OPEN = ['/account/login', '/account/register', '/account/forgot', '/account/reset'];
const ACCOUNT_API_OPEN = ['/api/account/auth', '/api/account/register', '/api/account/forgot', '/api/account/reset', '/api/account/verify'];

/* Redirect rules are loaded from /api/redirect-rules and kept in memory for 60 seconds on each server instance. */
let cache = { at: 0, rules: [] };
async function rules(origin) {
  if (Date.now() - cache.at < 60000) return cache.rules;
  try {
    const r = await fetch(`${origin}/api/redirect-rules`, { headers: { 'x-mw': '1' }, signal: AbortSignal.timeout(1500) });
    if (r.ok) cache = { at: Date.now(), rules: (await r.json()).rules || [] };
    else cache.at = Date.now() - 45000;
  } catch { cache.at = Date.now() - 45000; }
  return cache.rules;
}

export async function middleware(req, event) {
  const { pathname } = req.nextUrl;

  // Customer portal
  if (pathname === '/account' || pathname.startsWith('/account/') || pathname.startsWith('/api/account')) {
    if (ACCOUNT_OPEN.includes(pathname) || ACCOUNT_API_OPEN.includes(pathname)) return NextResponse.next();
    const ok = await verifyCustomerToken(req.cookies.get(CUSTOMER_COOKIE)?.value);
    if (ok) return NextResponse.next();
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Sign in to your account to continue.' }, { status: 401 });
    const url = req.nextUrl.clone(); url.pathname = '/account/login'; url.search = ''; url.searchParams.set('next', pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (pathname === '/admin/login' || pathname === '/api/admin/auth') return NextResponse.next();
    const ok = await verifyToken(req.cookies.get(COOKIE)?.value);
    if (ok) return NextResponse.next();
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
    const url = req.nextUrl.clone(); url.pathname = '/admin/login'; url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Public pages: redirects, and the address for the 404 log
  if (pathname.startsWith('/api/') || req.headers.get('x-mw')) return NextResponse.next();
  const hit = matchRedirect(await rules(req.nextUrl.origin), pathname);
  if (hit) {
    if (event?.waitUntil && hit.id) event.waitUntil(fetch(`${req.nextUrl.origin}/api/redirect-rules`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-mw': '1' }, body: JSON.stringify({ id: hit.id }) }).catch(() => {}));
    if (hit.code === 410 || hit.code === 451) return new NextResponse(hit.code === 410 ? 'This page was removed.' : 'Unavailable for legal reasons.', { status: hit.code, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
    let dest;
    try { dest = new URL(hit.to, req.nextUrl.origin); } catch { return NextResponse.next(); }
    if (hit.q !== false && !dest.search) dest.search = req.nextUrl.search;
    if (dest.href === req.nextUrl.href) return NextResponse.next();
    return NextResponse.redirect(dest, hit.code || 301);
  }
  const headers = new Headers(req.headers); headers.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*', '/account', '/account/:path*', '/api/account/:path*', '/((?!api/|_next/|seed/|media/|docs/|favicon\\.ico|icon\\.svg|.*\\..*).*)'] };
