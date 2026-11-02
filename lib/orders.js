import 'server-only';
import crypto from 'crypto';
import { dbConnect } from './db';
import { Order } from './models';
import { sendOrderEmail } from './notifications';
import { touchContact } from './crm';
import { rewardOrder } from './referrals';
import { activateSubscription } from './subscriptions';

export const newOrderNumber = () => `MH-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
export const newToken = () => crypto.randomBytes(16).toString('hex');

export async function markPaid(number, payment, note) {
  await dbConnect();
  const o = await Order.findOne({ number });
  if (!o) return null;
  if (!['paid', 'in_progress', 'completed'].includes(o.status)) {
    o.status = 'paid';
    o.payment = { ...(o.payment?.toObject?.() || o.payment || {}), ...payment, paidAt: new Date() };
    o.history.push({ status: 'paid', note });
    await o.save();
    await activateSubscription(o);
    await Promise.all([sendOrderEmail(o, 'paid'), touchContact({ email: o.customer.email, source: 'payment', spent: o.amount, activity: `Paid ${o.number}` }), rewardOrder(o)]);
  }
  return o;
}

/* token: the private order token, so nobody else can mark an order as failed. */
export async function markFailed(number, note, token) {
  await dbConnect();
  const o = await Order.findOne({ number: String(number), token: String(token || '') });
  if (o && o.status === 'pending_payment') { o.status = 'failed'; o.history.push({ status: 'failed', note }); await o.save(); }
  return o;
}
