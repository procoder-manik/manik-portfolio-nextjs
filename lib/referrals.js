import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { dbConnect } from './db';
import { Customer, Commission, Coupon, Order } from './models';
import { getSettingsFresh } from './data';
import { round2, releaseCoupon } from './coupons';

export const REF_COOKIE = 'mh_ref';
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function refSettings() {
  const [r, pay] = await Promise.all([getSettingsFresh('referrals'), getSettingsFresh('payments')]);
  return { ...r, base: pay.currency || 'USD', bdtRate: pay.bdtRate || 120 };
}

export const programsOn = (r) => Boolean(r?.referral?.enabled || r?.affiliate?.enabled);

/* Converts an order amount to the store currency (credit and payouts are kept in it). */
export function toBase(amount, currency, r) {
  if (!currency || currency === r.base) return amount;
  if (currency === 'BDT' && r.base !== 'BDT') return amount / (r.bdtRate || 120);
  if (r.base === 'BDT' && currency !== 'BDT') return amount * (r.bdtRate || 120);
  return amount;
}

/* Every customer gets a short, unique code the first time they need one. */
export async function ensureRefCode(c) {
  if (c.refCode) return c.refCode;
  await dbConnect();
  const stem = (c.name || c.email || 'friend').split(/[\s@]/)[0].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'FRIEND';
  for (let i = 0; i < 6; i++) {
    const code = `${stem}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    try {
      const r = await Customer.updateOne({ _id: c._id, $or: [{ refCode: null }, { refCode: { $exists: false } }] }, { $set: { refCode: code } });
      if (r.modifiedCount) return code;
      const fresh = await Customer.findById(c._id).select('refCode').lean();
      if (fresh?.refCode) return fresh.refCode;
    } catch (e) { if (e.code !== 11000) throw e; }
  }
  throw new Error('Could not create a referral code. Try again.');
}

export async function refCookieCode() {
  return String((await cookies()).get(REF_COOKIE)?.value || '').toUpperCase().slice(0, 20) || null;
}

/* Who gets credit for this order, and as what. Returns null or { code, customerId, kind }. */
export async function attribute({ buyer, email }) {
  const r = await refSettings();
  if (!programsOn(r)) return null;
  await dbConnect();
  let owner = null;
  const code = await refCookieCode();
  if (code) owner = await Customer.findOne({ refCode: code, disabled: { $ne: true } }).lean();
  if (!owner && buyer?.referredBy) owner = await Customer.findById(buyer.referredBy).lean();
  if (!owner || owner.disabled) return null;
  const mail = String(email || '').trim().toLowerCase();
  if ((buyer && String(owner._id) === String(buyer._id)) || owner.email === mail) return null; // no self-referral

  if (r.affiliate?.enabled && owner.affiliate?.status === 'approved') return { code: owner.refCode, customerId: owner._id, kind: 'affiliate' };
  if (r.referral?.enabled) {
    if (r.referral.firstOrderOnly && (await Order.exists({ 'customer.email': new RegExp(`^${escRe(mail)}$`, 'i'), status: { $in: ['paid', 'in_progress', 'completed'] } }))) return null;
    return { code: owner.refCode, customerId: owner._id, kind: 'referral' };
  }
  return null;
}

/* Called whenever an order becomes paid. Safe to call more than once. */
export async function rewardOrder(order) {
  try {
    if (!order?.referral?.customerId) return;
    await dbConnect();
    const lock = await Order.updateOne({ _id: order._id, 'referral.rewarded': { $ne: true } }, { $set: { 'referral.rewarded': true } });
    if (!lock.modifiedCount) return;
    const r = await refSettings();
    const owner = await Customer.findById(order.referral.customerId).lean();
    if (!owner || owner.disabled) return;
    const paid = Number(order.amount) || 0;
    const baseAmt = round2(toBase(paid, order.currency, r));
    const common = { customerId: owner._id, orderId: order._id, orderNumber: order.number, buyerName: (order.customer?.name || '').split(' ')[0], base: baseAmt, currency: r.base };
    await Customer.updateOne({ _id: owner._id }, { $inc: { 'refStats.orders': 1 } });

    if (order.referral.kind === 'affiliate') {
      const rate = owner.affiliate?.rate ?? r.affiliate?.rate ?? 0;
      const amount = round2((baseAmt * rate) / 100);
      if (amount > 0) await Commission.create({ ...common, kind: 'affiliate', rate, amount, status: 'pending', availableAt: new Date(Date.now() + (r.affiliate?.holdDays || 0) * 86400000) });
      return;
    }
    // Referral reward
    const ref = r.referral || {};
    if (ref.rewardMode === 'coupon' && ref.rewardCoupon) {
      const t = await Coupon.findOne({ code: String(ref.rewardCoupon).toUpperCase() }).lean();
      if (!t) return;
      let code;
      for (let i = 0; i < 5 && !code; i++) {
        const c = `REF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        try {
          await Coupon.create({ code: c, description: `Referral reward for ${order.number}`, type: t.type, value: t.value, currency: t.currency, maxDiscount: t.maxDiscount, minAmount: t.minAmount, packages: t.packages,
            maxUses: 1, perCustomer: 1, assignedTo: owner._id, customersOnly: true, source: 'referral', active: true, expiresAt: ref.couponDays ? new Date(Date.now() + ref.couponDays * 86400000) : undefined });
          code = c;
        } catch (e) { if (e.code !== 11000) throw e; }
      }
      await Commission.create({ ...common, kind: 'referral', rate: 0, amount: 0, couponCode: code, status: 'credited' });
      return;
    }
    let amount = round2((baseAmt * (ref.rate || 0)) / 100);
    if (ref.maxReward) amount = Math.min(amount, ref.maxReward);
    if (amount > 0) {
      await Customer.updateOne({ _id: owner._id }, { $inc: { credit: amount } });
      await Commission.create({ ...common, kind: 'referral', rate: ref.rate, amount, status: 'credited' });
    }
  } catch (e) { console.error('[referral reward]', e.message); }
}

/* Called when an order is cancelled: gives back the coupon use and credit, and voids rewards. */
export async function unwindOrder(order) {
  try {
    await dbConnect();
    const lock = await Order.updateOne({ _id: order._id, 'adjust.voided': { $ne: true } }, { $set: { 'adjust.voided': true } });
    if (!lock.modifiedCount) return;
    if (order.coupon?.code) await releaseCoupon(order.coupon.code);
    if (order.creditUsed > 0 && order.customerId) await Customer.updateOne({ _id: order.customerId }, { $inc: { credit: order.creditUsed } });
    const rewards = await Commission.find({ orderId: order._id, status: { $in: ['pending', 'credited'] } }).lean();
    for (const c of rewards) {
      if (c.kind === 'referral' && c.amount > 0) await Customer.updateOne({ _id: c.customerId }, { $inc: { credit: -c.amount } });
      if (c.couponCode) await Coupon.updateOne({ code: c.couponCode, usesCount: 0 }, { $set: { active: false } });
      await Commission.updateOne({ _id: c._id }, { $set: { status: 'void', note: `Order ${order.number} was cancelled` } });
    }
  } catch (e) { console.error('[referral unwind]', e.message); }
}

/* Affiliate balances in the store currency. */
export async function affiliateTotals(customerId) {
  await dbConnect();
  const rows = await Commission.find({ customerId, kind: 'affiliate', status: { $ne: 'void' } }).lean();
  const now = Date.now(); const t = { holding: 0, available: 0, requested: 0, paid: 0 };
  for (const c of rows) {
    if (c.status === 'paid') t.paid += c.amount;
    else if (c.status === 'requested') t.requested += c.amount;
    else if (c.status === 'pending') (new Date(c.availableAt || 0).getTime() <= now ? (t.available += c.amount) : (t.holding += c.amount));
  }
  Object.keys(t).forEach((k) => { t[k] = round2(t[k]); });
  return t;
}
