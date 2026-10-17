import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Order } from '@/lib/models';
import { getPackage, getSettings } from '@/lib/data';
import { newOrderNumber, newToken } from '@/lib/orders';
import { PAYMENT_METHODS } from '@/lib/options';
import { sslczEnabled, sslczInit } from '@/lib/payments/sslcommerz';
import { paypalEnabled, paypalCreate } from '@/lib/payments/paypal';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { touchContact } from '@/lib/crm';
import { sendOrderEmail, alertNewOrder } from '@/lib/notifications';
import { siteUrl } from '@/lib/utils';
import { explainError } from '@/lib/explain-error';
import { getCustomer } from '@/lib/customers';
import { Customer } from '@/lib/models';
import { checkCoupon, redeemCoupon, releaseCoupon, round2 } from '@/lib/coupons';
import { attribute, refSettings } from '@/lib/referrals';
import { markPaid } from '@/lib/orders';

export async function POST(req) {
  try { return await create(req); }
  catch (e) { console.error('[orders]', e); return NextResponse.json({ error: explainError(e) }, { status: 500 }); }
}

async function create(req) {
  if (!(await rateLimit(`order:${await clientIp()}`, 10, 3600))) return NextResponse.json({ error: 'Too many orders from this network. Try again later or email me.' }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const c = b.customer || {};
  if (!c.name?.trim() || !/^\S+@\S+\.\S+$/.test(c.email || '')) return NextResponse.json({ error: 'Add your name and a valid email.' }, { status: 400 });
  const pkg = await getPackage(b.package);
  if (!pkg || pkg.checkoutMode === 'quote') return NextResponse.json({ error: 'This package is not available for checkout.' }, { status: 400 });
  const pay = await getSettings('payments');
  const method = PAYMENT_METHODS.find((m) => m.id === b.method);
  if (!method || !pay[method.id]?.enabled) return NextResponse.json({ error: 'Pick a payment method.' }, { status: 400 });
  if (!hasDB()) return NextResponse.json({ error: 'Checkout opens once the database is connected. Email me to order in the meantime.' }, { status: 503 });

  await dbConnect();
  const me = await getCustomer();
  const email = (me?.email || c.email.trim()).slice(0, 160);
  const r = await refSettings();

  // Coupon (validated again here; the price always comes from the package)
  const price = round2(pkg.price);
  let discount = 0; let coupon = null;
  if (b.coupon && r.coupons?.enabled !== false) {
    const chk = await checkCoupon({ code: b.coupon, pkg, email, customer: me });
    if (!chk.ok) return NextResponse.json({ error: chk.error, field: 'coupon' }, { status: 400 });
    if (!(await redeemCoupon(chk.coupon.code))) return NextResponse.json({ error: 'That coupon was just used up. Remove it and try again.', field: 'coupon' }, { status: 400 });
    coupon = { code: chk.coupon.code, type: chk.coupon.type, value: chk.coupon.value }; discount = chk.discount;
  }
  // Store credit from referrals (signed-in buyers, same currency as the store)
  let creditUsed = 0;
  if (b.useCredit && me && (pkg.currency || 'USD') === r.base) {
    const want = round2(Math.min(me.credit || 0, price - discount));
    if (want > 0) {
      const u = await Customer.updateOne({ _id: me._id, credit: { $gte: want } }, { $inc: { credit: -want } });
      if (u.modifiedCount) creditUsed = want;
    }
  }
  const amount = round2(Math.max(0, price - discount - creditUsed));
  const referral = await attribute({ buyer: me, email }).catch(() => null);

  let order;
  try {
    order = await Order.create({
      number: newOrderNumber(), token: newToken(), customerId: me?._id,
      package: { slug: pkg.slug, name: pkg.name, service: pkg.service, price: pkg.price, priceMax: pkg.priceMax, billing: pkg.billing, currency: pkg.currency, deliveryDays: pkg.deliveryDays },
      subtotal: price, discount, creditUsed, coupon: coupon || undefined, referral: referral || undefined,
      amount, currency: pkg.currency || 'USD',
      invoiceNumber: undefined,
      customer: { name: c.name.trim().slice(0, 100), email, phone: c.phone?.slice(0, 40), company: c.company?.slice(0, 120), country: c.country?.slice(0, 60) },
      requirements: (b.requirements || '').slice(0, 5000), method: method.id, status: 'pending_payment',
      payment: { provider: method.id, amountLocal: method.local && pkg.currency !== 'BDT' ? Math.ceil(amount * (pay.bdtRate || 120)) : amount },
      history: [{ status: 'pending_payment', note: 'Order placed' }],
    });
  } catch (e) {
    if (coupon) await releaseCoupon(coupon.code);
    if (creditUsed) await Customer.updateOne({ _id: me._id }, { $inc: { credit: creditUsed } });
    throw e;
  }
  order.invoiceNumber = `INV-${order.number.replace(/^MH-/, '')}`; await order.save();
  await Promise.all([
    touchContact({ email: order.customer.email, name: order.customer.name, phone: order.customer.phone, company: order.customer.company, country: order.customer.country, source: 'order', order: true, activity: `Ordered ${pkg.name} (${order.number})` }),
    sendOrderEmail(order, 'placed'), alertNewOrder(order),
  ]);

  const base = siteUrl();
  let redirect = `/order/${order.number}?t=${order.token}`;
  if (amount <= 0) {
    await markPaid(order.number, { provider: coupon ? 'coupon' : 'credit', reference: coupon?.code || 'store credit' }, 'Covered in full by coupon or credit');
    return NextResponse.json({ ok: true, redirect });
  }
  try {
    if (method.id === 'card' && sslczEnabled()) redirect = await sslczInit({ order, amountBDT: order.payment.amountLocal, siteUrl: base });
    if (method.id === 'paypal' && paypalEnabled()) redirect = await paypalCreate({ order, siteUrl: base });
  } catch (e) {
    return NextResponse.json({ error: e.message, redirect }, { status: 502 });
  }
  return NextResponse.json({ ok: true, redirect });
}
