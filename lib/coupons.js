import 'server-only';
import { dbConnect } from './db';
import { Coupon, Order } from './models';

export const normCode = (c) => String(c || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 40);
export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function couponLabel(c, money) {
  if (!c) return '';
  return c.type === 'percent' ? `${c.value}% off${c.maxDiscount ? ` (up to ${money(c.maxDiscount, c.currency)})` : ''}` : `${money(c.value, c.currency)} off`;
}

/* Checks a code against a package and buyer. Returns { ok, coupon, discount } or { ok: false, error }. */
export async function checkCoupon({ code, pkg, email, customer }) {
  const c0 = normCode(code);
  if (!c0) return { ok: false, error: 'Enter a coupon code.' };
  await dbConnect();
  const c = await Coupon.findOne({ code: c0 }).lean();
  const no = (error) => ({ ok: false, error });
  if (!c || !c.active) return no('That coupon code is not valid.');
  const now = new Date();
  if (c.startsAt && new Date(c.startsAt) > now) return no('That coupon is not active yet.');
  if (c.expiresAt && new Date(c.expiresAt) < now) return no('That coupon has expired.');
  if (c.maxUses && (c.usesCount || 0) >= c.maxUses) return no('That coupon has been fully used.');
  if (c.packages?.length && !c.packages.includes(pkg.slug)) return no('That coupon does not apply to this package.');
  if ((c.customersOnly || c.assignedTo) && !customer) return no('Sign in to your account to use this coupon.');
  if (c.assignedTo && String(c.assignedTo) !== String(customer?._id)) return no('That coupon belongs to another account.');
  const price = Number(pkg.price) || 0;
  if (c.type === 'fixed' && (c.currency || 'USD') !== (pkg.currency || 'USD')) return no(`That coupon only works on ${c.currency} prices.`);
  if (c.minAmount && price < c.minAmount) return no(`That coupon needs an order of at least ${c.minAmount} ${pkg.currency || 'USD'}.`);
  const mail = String(email || customer?.email || '').trim();
  if (mail && (c.perCustomer || c.firstOrderOnly)) {
    const byEmail = { 'customer.email': new RegExp(`^${escRe(mail)}$`, 'i'), status: { $ne: 'cancelled' } };
    if (c.firstOrderOnly && (await Order.exists(byEmail))) return no('That coupon is for first orders only.');
    if (c.perCustomer && (await Order.countDocuments({ ...byEmail, 'coupon.code': c.code })) >= c.perCustomer) return no('You have already used this coupon.');
  }
  let discount = c.type === 'percent' ? (price * (c.value || 0)) / 100 : c.value || 0;
  if (c.type === 'percent' && c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
  discount = round2(Math.min(discount, price));
  if (discount <= 0) return no('That coupon gives no discount on this package.');
  return { ok: true, coupon: c, discount };
}

/* Count a use. Fails (returns false) if the last use was taken a moment ago. */
export async function redeemCoupon(code) {
  await dbConnect();
  const c = await Coupon.findOne({ code }).select('maxUses').lean();
  if (!c) return false;
  const r = await Coupon.updateOne(c.maxUses ? { code, usesCount: { $lt: c.maxUses } } : { code }, { $inc: { usesCount: 1 } });
  return r.modifiedCount === 1;
}

export async function releaseCoupon(code) {
  if (!code) return;
  await dbConnect();
  await Coupon.updateOne({ code, usesCount: { $gt: 0 } }, { $inc: { usesCount: -1 } });
}
