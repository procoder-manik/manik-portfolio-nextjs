import 'server-only';
import { sendMail, notify } from './mail';
import { getSettingsFresh } from './data';
import { orderEmail, invoiceEmail, contactThanks, adminAlert, customEmail, verifyEmail, resetEmail } from './email/templates';
import { Order } from './models';
import { money } from './utils';
import { getBaseUrl } from './base-url';

async function ctx() {
  const [site0, email, base] = await Promise.all([getSettingsFresh('site'), getSettingsFresh('email'), getBaseUrl()]);
  const site = { ...site0, _base: base };
  return { site, base, email, replyTo: email.replyTo || site.email, fromName: email.fromName || site.name };
}

async function log(orderId, entry) {
  try { await Order.updateOne({ _id: orderId }, { $push: { emails: { ...entry, at: new Date() } } }); } catch {}
}

/* status: placed | paid | in_progress | completed | cancelled. force=true sends even if switched off (manual send). */
export async function sendOrderEmail(order, status, { force } = {}) {
  const c = await ctx();
  if (!force && !c.email.orders?.[status]?.enabled) return { ok: false, skipped: true };
  const m = orderEmail({ order, status, site: c.site, email: c.email });
  const r = await sendMail({ to: order.customer.email, ...m, replyTo: c.replyTo, fromName: c.fromName });
  await log(order._id, { kind: `status:${status}`, subject: m.subject, to: order.customer.email, ok: r.ok, error: r.error });
  return r;
}

export async function sendInvoice(order) {
  const c = await ctx();
  if (!order.invoiceNumber) { order.invoiceNumber = `INV-${order.number.replace(/^MH-/, '')}`; await Order.updateOne({ _id: order._id }, { invoiceNumber: order.invoiceNumber }); }
  const m = invoiceEmail({ order, site: c.site, email: c.email });
  const r = await sendMail({ to: order.customer.email, ...m, replyTo: c.replyTo, fromName: c.fromName });
  await log(order._id, { kind: 'invoice', subject: m.subject, to: order.customer.email, ok: r.ok, error: r.error });
  return r;
}

export async function sendThanks(msg) {
  const c = await ctx();
  if (!c.email.autoReply?.enabled) return { ok: false, skipped: true };
  const m = contactThanks({ msg, site: c.site, email: c.email });
  return sendMail({ to: msg.email, ...m, replyTo: c.replyTo, fromName: c.fromName });
}

export async function sendCustom({ to, name, subject, message, ctaLabel, ctaUrl }) {
  const c = await ctx();
  const m = customEmail({ name, subject, message, site: c.site, email: c.email, ctaLabel, ctaUrl });
  return sendMail({ to, ...m, replyTo: c.replyTo, fromName: c.fromName });
}

export async function alertNewMessage(msg) {
  const c = await ctx();
  const m = adminAlert({ site: c.site, title: `New message from ${msg.name}`, rows: [['Name', msg.name], ['Email', msg.email], ['Phone', msg.phone], ['Service', msg.service], ['Budget', msg.budget], ['Message', msg.message]], link: `${c.base}/admin/messages` });
  await notify(m.subject, m.text, m.html);
}

export async function alertNewOrder(o) {
  const c = await ctx();
  const m = adminAlert({ site: c.site, title: `New order ${o.number}: ${o.package?.name}`, rows: [['Customer', o.customer.name], ['Email', o.customer.email], ['Amount', money(o.amount, o.currency)], ['Method', o.method], ['Brief', o.requirements]], link: `${c.base}/admin/orders/${o._id}` });
  await notify(m.subject, m.text, m.html);
}

export async function sendVerifyEmail(customer, link) {
  const c = await ctx();
  const m = verifyEmail({ name: customer.name, link, site: c.site, email: c.email });
  return sendMail({ to: customer.email, ...m, replyTo: c.replyTo, fromName: c.fromName });
}

export async function sendResetEmail(customer, link) {
  const c = await ctx();
  const m = resetEmail({ name: customer.name, link, site: c.site, email: c.email });
  return sendMail({ to: customer.email, ...m, replyTo: c.replyTo, fromName: c.fromName });
}

/* Customer posted a message from their account. */
export async function alertAccountMessage(msg) {
  const c = await ctx();
  const m = adminAlert({ site: c.site, title: `Account message from ${msg.name}${msg.orderNumber ? ` about ${msg.orderNumber}` : ''}`, rows: [['Name', msg.name], ['Email', msg.email], ['Order', msg.orderNumber], ['Subject', msg.subject], ['Message', msg.message]], link: `${c.base}/admin/messages` });
  await notify(m.subject, m.text, m.html);
}
