import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Message } from '@/lib/models';
import { rateLimit } from '@/lib/ratelimit';
import { touchContact } from '@/lib/crm';
import { alertAccountMessage } from '@/lib/notifications';
import { getCustomer, customerOrder } from '@/lib/customers';

/* A signed-in customer writes to you. It lands in Admin > Messages; your replies show in their account. */
export async function POST(req) {
  const me = await getCustomer();
  if (!me) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (!(await rateLimit(`cmsg:${me._id}`, 10, 3600))) return NextResponse.json({ error: 'You have sent a lot of messages in the last hour. Try again a bit later.' }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const message = String(b.message || '').trim().slice(0, 5000);
  if (message.length < 2) return NextResponse.json({ error: 'Write your message first.' }, { status: 400 });
  let orderNumber;
  if (b.orderNumber) { const o = await customerOrder(me, String(b.orderNumber)); if (o) orderNumber = o.number; }
  await dbConnect();
  const msg = await Message.create({
    name: me.name, email: me.email, phone: me.phone, customerId: me._id, orderNumber,
    subject: String(b.subject || '').trim().slice(0, 160) || (orderNumber ? `About order ${orderNumber}` : 'Message from my account'),
    service: orderNumber ? `Order ${orderNumber}` : undefined, message,
  });
  await Promise.all([touchContact({ email: me.email, name: me.name, source: 'account', message: true, activity: `Account message: ${msg.subject}` }), alertAccountMessage(msg)]);
  return NextResponse.json({ ok: true });
}
