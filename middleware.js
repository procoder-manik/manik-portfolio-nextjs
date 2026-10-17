import { NextResponse } from 'next/server';
import { COOKIE, CUSTOMER_COOKIE, verifyToken, verifyCustomerToken } from './lib/auth';

const ACCOUNT_OPEN = ['/account/login', '/account/register', '/account/forgot', '/account/reset'];
const ACCOUNT_API_OPEN = ['/api/account/auth', '/api/account/register', '/api/account/forgot', '/api/account/reset', '/api/account/verify'];

export async function middleware(req) {
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
  const open = pathname === '/admin/login' || pathname === '/api/admin/auth';
  if (open) return NextResponse.next();
  const ok = await verifyToken(req.cookies.get(COOKIE)?.value);
  if (ok) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const url = req.nextUrl.clone(); url.pathname = '/admin/login'; url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*', '/account', '/account/:path*', '/api/account/:path*'] };
