import { NextResponse } from 'next/server';
import { COOKIE, CUSTOMER_COOKIE, verifyToken, verifyCustomerToken } from './lib/auth';
import { matchRedirect } from './lib/redirects';
import { dbConnect, hasDB } from './lib/db';
import { PitchSite } from './lib/models';

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

/* Addresses of pitch websites (Admin > Pitch websites), kept for 20 seconds. Those addresses are answered by
   /api/pitch-sites/page/<slug>, which sends the saved HTML alone, without this site's layout, styles or scripts.
   The list is read straight from the database (this middleware runs on Node.js). An earlier version asked the site's own
   /api address over the internet, which failed behind the hosting CDN, so pitch websites answered 404. */
let pitchCache = { at: 0, slugs: new Map() };
async function pitchSlugs() {
  if (Date.now() - pitchCache.at < 20000) return pitchCache.slugs;
  if (!hasDB()) return pitchCache.slugs;
  try {
    await dbConnect();
    const rows = await PitchSite.find({ published: { $ne: false }, trashedAt: null }).select('slug sandbox').lean();
    pitchCache = { at: Date.now(), slugs: new Map(rows.filter((r) => r.slug).map((r) => [r.slug, { slug: r.slug, sandbox: r.sandbox !== false }])) };
  } catch (e) { console.error('[pitch-sites] list failed:', e.message); pitchCache.at = Date.now() - 15000; }
  return pitchCache.slugs;
}

/* The page security policy for one-part addresses (/contact, /kotha, /<pitch website>). next.config.mjs sets the same value for every other address.
   A pitch website also gets the sandbox: its scripts run with a private origin, so they cannot read this site's cookies or reach the admin. */
const CSP = "frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://*.sslcommerz.com https://*.paypal.com; object-src 'none'" + ((process.env.VERCEL || process.env.FORCE_HTTPS) ? '; upgrade-insecure-requests' : '');
const SANDBOX = 'sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-presentation allow-top-navigation-by-user-activation';
const ONE_PART = /^\/[^/]+\/?$/;

export async function middleware(req, event) {
  const res = await handle(req, event);
  if (ONE_PART.test(req.nextUrl.pathname) && !res.headers.has('content-security-policy')) res.headers.set('Content-Security-Policy', CSP);
  return res;
}

async function handle(req, event) {
  const { pathname } = req.nextUrl;

  // A browser attaches the real Origin to every change it makes. A change that claims to come from another site is refused,
  // so a page on another site can never act with an admin's or customer's cookie.
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && (pathname.startsWith('/api/admin') || pathname.startsWith('/api/account'))) {
    const origin = req.headers.get('origin');
    if (origin) {
      let same = false;
      try { same = new URL(origin).host === (req.headers.get('x-forwarded-host') || req.headers.get('host')); } catch {}
      if (!same) return NextResponse.json({ error: 'Blocked: this request did not come from this site.' }, { status: 403 });
    }
  }

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
    if (pathname === '/admin/login' || pathname === '/api/admin/auth' || pathname === '/api/admin/auth/2fa') return NextResponse.next();
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
  const one = pathname.match(/^\/([^/.]+)\/?$/);
  if (one) {
    let slug = ''; try { slug = decodeURIComponent(one[1]).toLowerCase(); } catch {}
    const site = slug ? (await pitchSlugs()).get(slug) : null;
    if (site) {
      const url = req.nextUrl.clone(); url.pathname = `/api/pitch-sites/page/${encodeURIComponent(slug)}`;
      const out = NextResponse.rewrite(url);
      out.headers.set('Content-Security-Policy', site.sandbox === false ? CSP : `${CSP}; ${SANDBOX}`);
      return out;
    }
  }
  const headers = new Headers(req.headers); headers.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = { runtime: 'nodejs', matcher: ['/admin/:path*', '/api/admin/:path*', '/account', '/account/:path*', '/api/account/:path*', '/((?!api/|_next/|seed/|media/|docs/|favicon\\.ico|icon\\.svg|.*\\..*).*)'] };
