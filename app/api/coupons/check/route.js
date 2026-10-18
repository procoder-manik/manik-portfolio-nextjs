import { NextResponse } from 'next/server';
import { hasDB } from '@/lib/db';
import { getPackage } from '@/lib/data';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { checkCoupon, couponLabel, round2 } from '@/lib/coupons';
import { getCustomer } from '@/lib/customers';
import { refSettings } from '@/lib/referrals';
import { money } from '@/lib/utils';
import { priceFor, periodOf } from '@/lib/plans';

/* Checkout preview: { code, package, email } -> discount. The order route checks again. */
export async function POST(req) {
  if (!hasDB()) return NextResponse.json({ error: 'Coupons work once the database is connected.' }, { status: 503 });
  if (!(await rateLimit(`coupon:${await clientIp()}`, 30, 600))) return NextResponse.json({ error: 'Too many tries. Wait a few minutes.' }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const r = await refSettings();
  if (r.coupons?.enabled === false) return NextResponse.json({ error: 'Coupons are not available right now.' }, { status: 400 });
  const pkg = await getPackage(b.package);
  if (!pkg) return NextResponse.json({ error: 'Package not found.' }, { status: 404 });
  const me = await getCustomer();
  const unit = priceFor(pkg, periodOf(pkg, b.period));
  const chk = await checkCoupon({ code: b.code, pkg: { ...pkg, price: unit }, email: me?.email || b.email, customer: me });
  if (!chk.ok) return NextResponse.json({ error: chk.error }, { status: 400 });
  return NextResponse.json({ ok: true, code: chk.coupon.code, discount: chk.discount, label: couponLabel(chk.coupon, money), total: round2(unit - chk.discount) });
}
