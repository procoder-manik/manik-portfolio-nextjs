import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Message, Order, Contact } from '@/lib/models';
import { adminRoute as guard } from '@/lib/server-auth';
import { draftReply } from '@/lib/ai-mail';
import { rateLimit } from '@/lib/ratelimit';
import { money } from '@/lib/utils';
const adminRoute = (h) => guard(h, 'shop');

export const maxDuration = 60;

/* POST { messageId | orderId | contactId, tone?, note? } -> { body, source: 'ai' | 'template', warning? } */
export const POST = adminRoute(async (req, ctx, admin) => {
  if (!(await rateLimit(`aimail:${admin.email}`, 40, 3600))) throw new Error('Too many AI drafts this hour. Wait a bit or write it yourself.');
  await dbConnect();
  const b = await req.json();
  let message; let replies = []; let context = '';
  if (b.messageId) {
    const m = await Message.findById(b.messageId).lean(); if (!m) throw new Error('Message not found.');
    message = m; replies = m.replies || [];
  } else if (b.orderId) {
    const o = await Order.findById(b.orderId).lean(); if (!o) throw new Error('Order not found.');
    message = { name: o.customer?.name, email: o.customer?.email, service: o.package?.name, message: o.requirements || '(no brief written)' };
    context = `This customer has an order ${o.number}: ${o.package?.name}, ${money(o.amount, o.currency)}, status ${o.status}, progress ${o.progress || 0}%.`;
  } else if (b.contactId) {
    const c = await Contact.findById(b.contactId).lean(); if (!c) throw new Error('Contact not found.');
    message = { name: c.name, email: c.email, message: (c.activity || []).slice(-3).map((a) => a.text).join('\n') || c.notes || '(no message)' };
  } else throw new Error('Nothing to reply to.');
  return NextResponse.json(await draftReply({ message, replies, tone: b.tone, note: String(b.note || '').slice(0, 500), context }));
});
