import { NextResponse } from 'next/server';
import { adminRoute } from '@/lib/server-auth';
import { dbConnect } from '@/lib/db';
import { Order, Message, Contact } from '@/lib/models';
import { sendInvoice, sendOrderEmail, sendCustom } from '@/lib/notifications';
import { touchContact } from '@/lib/crm';
import { serialize } from '@/lib/utils';
import { orderLink, invoiceLink } from '@/lib/email/templates';
import { siteUrl } from '@/lib/utils';

/* One endpoint for every email the admin sends by hand.
   kind: invoice | status | custom ; target: orderId | messageId | contactId | to */
export const POST = adminRoute(async (req) => {
  const b = await req.json();
  await dbConnect();
  let r;
  if (b.kind === 'invoice' || b.kind === 'status') {
    const o = await Order.findById(b.orderId);
    if (!o) throw new Error('Order not found.');
    r = b.kind === 'invoice' ? await sendInvoice(o) : await sendOrderEmail(o, b.status || 'placed', { force: true });
    if (!r.ok) throw new Error(r.error || 'Email failed.');
    return NextResponse.json({ ok: true, item: serialize(await Order.findById(o._id).lean()) });
  }
  if (b.kind === 'custom') {
    if (!b.subject?.trim() || !b.message?.trim()) throw new Error('Add a subject and a message.');
    let to = b.to; let name = b.name; let cta = {};
    if (b.orderId) { const o = await Order.findById(b.orderId).lean(); to = o.customer.email; name = o.customer.name; cta = b.attach === 'invoice' ? { ctaLabel: 'View invoice', ctaUrl: invoiceLink(o) } : b.attach === 'account' ? { ctaLabel: 'See it in your account', ctaUrl: `${siteUrl()}/account/orders/${o.number}` } : { ctaLabel: 'View your order', ctaUrl: orderLink(o) }; }
    if (b.messageId) { const m = await Message.findById(b.messageId).lean(); to = m.email; name = m.name; }
    if (b.contactId) { const c = await Contact.findById(b.contactId).lean(); to = c.email; name = c.name; }
    if (!to) throw new Error('No recipient.');
    r = await sendCustom({ to, name, subject: b.subject.trim(), message: b.message.trim(), ...cta });
    if (!r.ok) throw new Error(r.error || 'Email failed.');
    const entry = { kind: 'custom', subject: b.subject, message: b.message, to, at: new Date(), ok: true };
    if (b.orderId) await Order.updateOne({ _id: b.orderId }, { $push: { emails: entry } });
    if (b.messageId) await Message.updateOne({ _id: b.messageId }, { $push: { replies: entry }, read: true });
    await touchContact({ email: to, source: 'email', activity: `Email sent: ${b.subject}` });
    return NextResponse.json({ ok: true });
  }
  throw new Error('Unknown email type.');
});

/* GET /api/admin/mail?preview=thanks|placed|paid|in_progress|completed|cancelled|invoice
   Shows the email exactly as customers see it, filled with sample data. */
export const GET = adminRoute(async (req) => {
  const kind = req.nextUrl.searchParams.get('preview') || 'thanks';
  const { getSettingsFresh } = await import('@/lib/data');
  const { contactThanks, orderEmail, invoiceEmail } = await import('@/lib/email/templates');
  const [site, email] = await Promise.all([getSettingsFresh('site'), getSettingsFresh('email')]);
  const order = { _id: 'x', number: 'MH-261017-A1B2', token: 'preview', invoiceNumber: 'INV-261017-A1B2', createdAt: new Date(), status: kind === 'invoice' ? 'paid' : kind, method: 'bkash', amount: 300, currency: 'USD',
    package: { name: 'Small business site', billing: 'one-time' }, customer: { name: 'Sarah Ahmed', email: 'sarah@example.com' }, payment: { amountLocal: 36600 } };
  const m = kind === 'thanks' ? contactThanks({ msg: { name: 'Sarah Ahmed', email: 'sarah@example.com', service: 'Website design and development', budget: '$300 to $1,000', message: 'We need a new website for our dental clinic with online booking and local SEO.' }, site, email })
    : kind === 'invoice' ? invoiceEmail({ order, site, email }) : orderEmail({ order, status: kind, site, email });
  return new Response(m.html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
});
