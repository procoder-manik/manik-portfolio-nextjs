import 'server-only';
import { dbConnect } from './db';
import { Order } from './models';
import { getSettingsFresh } from './data';
import { addPeriod, isRecurring } from './plans';
import { sendSubscriptionEmail, alertSubscription } from './notifications';

const DAY = 86400000;
const PAID = ['paid', 'in_progress', 'completed'];

/* Called when an order becomes paid. For monthly and yearly plans it starts the plan:
   from today, or from the end of the customer's previous plan of the same package (a renewal never loses days).
   Dates you already typed on the order are kept. */
export async function activateSubscription(order) {
  try {
    const sub = order.subscription || {};
    const period = sub.period || (isRecurring(order.package?.billing) ? order.package.billing : null);
    if (!period || !PAID.includes(order.status) || sub.status === 'active' || sub.status === 'expired' || sub.status === 'cancelled') return null;
    await dbConnect();
    const now = new Date();
    let startsAt = sub.startsAt ? new Date(sub.startsAt) : now; let endsAt = sub.endsAt ? new Date(sub.endsAt) : null;
    if (!sub.startsAt) {
      const prev = await Order.findOne({ _id: { $ne: order._id }, 'customer.email': new RegExp(`^${String(order.customer?.email || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), 'package.slug': order.package?.slug, 'subscription.status': { $in: ['active', 'expired'] } }).sort({ 'subscription.endsAt': -1 }).lean();
      if (prev?.subscription?.endsAt && new Date(prev.subscription.endsAt) > now) {
        startsAt = new Date(prev.subscription.endsAt);
        await Order.updateOne({ _id: prev._id }, { 'subscription.status': 'renewed', 'subscription.renewedBy': order.number });
      }
    }
    if (!endsAt) endsAt = addPeriod(startsAt, period);
    await Order.updateOne({ _id: order._id }, { subscription: { period, status: 'active', startsAt, endsAt, reminders: [], expiredAt: null } });
    return { startsAt, endsAt };
  } catch (e) { console.error('[subscription activate]', e.message); return null; }
}

const days = (txt) => String(txt || '7, 1').split(/[,\s]+/).map(Number).filter((n) => n > 0 && n < 400).sort((a, b) => b - a);

/* The daily check. Sends each reminder once and switches expired plans off. Safe to run as often as you like. */
export async function runSubscriptionCheck(now = new Date()) {
  await dbConnect();
  const email = await getSettingsFresh('email');
  const cfg = email.subscription || {};
  const list = days(cfg.reminderDays);
  const out = { reminded: 0, expired: 0, checked: 0 };
  const active = await Order.find({ 'subscription.status': 'active', 'subscription.endsAt': { $ne: null } });
  for (const o of active) {
    out.checked += 1;
    const ends = new Date(o.subscription.endsAt); const left = (ends - now) / DAY;
    if (left <= 0) {
      await Order.updateOne({ _id: o._id }, { 'subscription.status': 'expired', 'subscription.expiredAt': now });
      o.subscription.status = 'expired';
      await sendSubscriptionEmail(o, 'expired');
      if (cfg.ownerAlerts !== false) await alertSubscription(o, 'expired');
      out.expired += 1; continue;
    }
    const sent = o.subscription.reminders || [];
    // The smallest reminder day that has been reached and not sent yet. Earlier ones are marked as done so nothing is sent twice.
    const due = list.filter((d) => left <= d && !sent.includes(d));
    if (!due.length) continue;
    const mark = [...new Set([...sent, ...due])];
    await Order.updateOne({ _id: o._id }, { 'subscription.reminders': mark });
    const dLeft = Math.max(1, Math.ceil(left));
    await sendSubscriptionEmail(o, 'reminder', { days: dLeft });
    if (cfg.ownerAlerts !== false) await alertSubscription(o, 'reminder', { days: dLeft });
    out.reminded += 1;
  }
  return out;
}
