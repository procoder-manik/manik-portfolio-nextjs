import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Order } from '@/lib/models';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { notify } from '@/lib/mail';

/* Buyer submits the transaction ID for a manual payment (bKash, Nagad, Rocket, bank, PayPal, Payoneer). */
export async function POST(req, props) {
  const params = await props.params;
  if (!(await rateLimit(`proof:${await clientIp()}`, 10, 600))) return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  if (!b.transactionId?.trim()) return NextResponse.json({ error: 'Enter the transaction ID from your payment.' }, { status: 400 });
  await dbConnect();
  const o = await Order.findOne({ number: params.number, token: b.t });
  if (!o) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (!['pending_payment', 'failed', 'verifying'].includes(o.status)) return NextResponse.json({ error: 'This order is already confirmed.' }, { status: 400 });
  o.payment.transactionId = b.transactionId.trim().slice(0, 80);
  o.payment.senderNumber = (b.senderNumber || '').trim().slice(0, 40);
  o.status = 'verifying';
  o.history.push({ status: 'verifying', note: `Buyer sent transaction ID ${o.payment.transactionId}` });
  await o.save();
  notify(`Payment sent for ${o.number}`, `${o.customer.name} says they paid by ${o.method}. Transaction ID: ${o.payment.transactionId}. Sender: ${o.payment.senderNumber || '-'}. Verify it in Admin > Orders.`);
  return NextResponse.json({ ok: true });
}
