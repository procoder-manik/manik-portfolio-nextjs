import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { CUSTOMER_COOKIE, signCustomerToken, verifyCustomerToken } from './auth';
import { dbConnect, hasDB } from './db';
import { Customer, Order } from './models';

export const customerCookieOpts = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 };
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const normEmail = (e) => String(e || '').trim().toLowerCase().slice(0, 160);
export const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
export const newSecret = () => crypto.randomBytes(24).toString('hex');
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function passwordProblem(p) {
  const s = String(p || '');
  if (s.length < 8) return 'Use at least 8 characters for the password.';
  if (s.length > 200) return 'That password is too long.';
  return '';
}

/* The signed-in customer (fresh from the database) or null. */
export async function getCustomer() {
  if (!hasDB()) return null;
  const t = await verifyCustomerToken((await cookies()).get(CUSTOMER_COOKIE)?.value);
  if (!t?.sub) return null;
  try {
    await dbConnect();
    const c = await Customer.findById(t.sub).lean();
    if (!c || c.disabled || (c.tokenVersion || 0) !== (t.v || 0)) return null;
    return c;
  } catch { return null; }
}

export async function sessionCookie(c) {
  return [CUSTOMER_COOKIE, await signCustomerToken({ id: c._id, email: c.email, v: c.tokenVersion || 0 }), customerCookieOpts];
}

/* Orders the customer can see: ones placed while signed in or claimed with the order link,
   plus every order under their email once that email is verified. */
export function orderFilter(c) {
  const or = [{ customerId: c._id }];
  if (c.emailVerified) or.push({ 'customer.email': new RegExp(`^${escRe(c.email)}$`, 'i') });
  return { $or: or };
}

export async function customerOrders(c, extra = {}) {
  await dbConnect();
  return Order.find({ ...orderFilter(c), ...extra }).sort({ createdAt: -1 }).limit(200).lean();
}

export async function customerOrder(c, number) {
  await dbConnect();
  return Order.findOne({ ...orderFilter(c), number }).lean();
}

/* Attach an order to the account when the buyer proves they hold the private order link. */
export async function claimOrder(c, number, token) {
  if (!number || !token) return false;
  await dbConnect();
  const r = await Order.updateOne({ number: String(number), token: String(token), $or: [{ customerId: null }, { customerId: { $exists: false } }, { customerId: c._id }] }, { $set: { customerId: c._id } });
  return r.matchedCount > 0;
}

/* After the email is verified, link every past order placed with it. */
export async function linkOrdersByEmail(c) {
  await dbConnect();
  await Order.updateMany({ 'customer.email': new RegExp(`^${escRe(c.email)}$`, 'i'), $or: [{ customerId: null }, { customerId: { $exists: false } }] }, { $set: { customerId: c._id } });
}

export const ACTIVE = ['paid', 'in_progress'];
export const WAITING = ['pending_payment', 'verifying', 'failed'];
export const DONE = ['completed'];

/* Messages the customer can see: sent from the account, plus contact-form messages once the email is verified. */
export function messageFilter(c) {
  const or = [{ customerId: c._id }];
  if (c.emailVerified) or.push({ email: new RegExp(`^${escRe(c.email)}$`, 'i') });
  return { $or: or };
}
