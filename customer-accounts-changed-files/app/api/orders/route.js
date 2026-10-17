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
  const order = await Order.create({
    number: newOrderNumber(), token: newToken(), customerId: me?._id,
    package: { slug: pkg.slug, name: pkg.name, service: pkg.service, price: pkg.price, priceMax: pkg.priceMax, billing: pkg.billing, currency: pkg.currency, deliveryDays: pkg.deliveryDays },
    amount: pkg.price, currency: pkg.currency || 'USD',
    invoiceNumber: undefined,
    customer: { name: c.name.trim().slice(0, 100), email: (me?.email || c.email.trim()).slice(0, 160), phone: c.phone?.slice(0, 40), company: c.company?.slice(0, 120), country: c.country?.slice(0, 60) },
    requirements: (b.requirements || '').slice(0, 5000), method: method.id, status: 'pending_payment',
    payment: { provider: method.id, amountLocal: method.local && pkg.currency !== 'BDT' ? Math.ceil(pkg.price * (pay.bdtRate || 120)) : pkg.price },
    history: [{ status: 'pending_payment', note: 'Order placed' }],
  });
  order.invoiceNumber = `INV-${order.number.replace(/^MH-/, '')}`; await order.save();
  await Promise.all([
    touchContact({ email: order.customer.email, name: order.customer.name, phone: order.customer.phone, company: order.customer.company, country: order.customer.country, source: 'order', order: true, activity: `Ordered ${pkg.name} (${order.number})` }),
    sendOrderEmail(order, 'placed'), alertNewOrder(order),
  ]);

  const base = siteUrl();
  let redirect = `/order/${order.number}?t=${order.token}`;
  try {
    if (method.id === 'card' && sslczEnabled()) redirect = await sslczInit({ order, amountBDT: order.payment.amountLocal, siteUrl: base });
    if (method.id === 'paypal' && paypalEnabled()) redirect = await paypalCreate({ order, siteUrl: base });
  } catch (e) {
    return NextResponse.json({ error: e.message, redirect }, { status: 502 });
  }
  return NextResponse.json({ ok: true, redirect });
}
