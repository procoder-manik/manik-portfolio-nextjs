import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Form, FormEntry, Order } from '@/lib/models';
import { getForm, getSettingsFresh } from '@/lib/data';
import { validate, computeTotal, display, formClosed, FIELD_TYPES } from '@/lib/forms';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { touchContact } from '@/lib/crm';
import { sendMail, notify } from '@/lib/mail';
import { sendCustom, sendOrderEmail, alertNewOrder } from '@/lib/notifications';
import { adminAlert } from '@/lib/email/templates';
import { newOrderNumber, newToken } from '@/lib/orders';
import { PAYMENT_METHODS } from '@/lib/options';
import { sslczEnabled, sslczInit } from '@/lib/payments/sslcommerz';
import { paypalEnabled, paypalCreate } from '@/lib/payments/paypal';
import { siteUrl, money } from '@/lib/utils';
import { getBaseUrl } from '@/lib/base-url';
import { explainError } from '@/lib/explain-error';
import { headers } from 'next/headers';

export const maxDuration = 30;

/* Public: the form definition (used by popups and the form block). Never includes private settings. */
export async function GET(req, { params }) {
  const { slug } = await params;
  const form = await getForm(slug);
  if (!form) return NextResponse.json({ error: 'This form does not exist or is switched off.' }, { status: 404 });
  return NextResponse.json({ form });
}

const fill = (t = '', v = {}) => String(t).replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

export async function POST(req, { params }) {
  try { return await submit(req, (await params).slug); }
  catch (e) { console.error('[form submit]', e); return NextResponse.json({ error: explainError(e) }, { status: 500 }); }
}

async function submit(req, slug) {
  const b = await req.json().catch(() => ({}));
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  const ip = await clientIp();
  if (!(await rateLimit(`form:${ip}`, 12, 600))) return NextResponse.json({ error: 'Too many submissions in a short time. Try again in a few minutes.' }, { status: 429 });
  if (!hasDB()) return NextResponse.json({ error: 'This form is not connected yet (no database). Please email instead.' }, { status: 503 });
  await dbConnect();
  const form = await Form.findOne({ slug, trashedAt: null }).lean();
  if (!form) return NextResponse.json({ error: 'This form does not exist or is switched off.' }, { status: 404 });
  const closed = formClosed(form, form.entries);
  if (closed) return NextResponse.json({ error: closed }, { status: 403 });

  const { errors, clean, fields } = validate(form, b.values || {});
  if (Object.keys(errors).length) return NextResponse.json({ error: 'Please fix the highlighted fields.', errors }, { status: 400 });

  const byType = (t) => fields.find((f) => f.type === t && clean[f.key]);
  const pay = form.payment || {};
  const pick = (key, fallback) => (key && clean[key]) || fallback;
  const email = String(pick(pay.emailField || form.autoReply?.emailField, byType('email') && clean[byType('email').key]) || '').trim();
  const name = String(pick(pay.nameField, clean[fields.find((f) => /name/i.test(f.label) && f.type === 'text')?.key]) || '').trim() || (email ? email.split('@')[0] : '');
  const phone = String(pick(pay.phoneField, byType('phone') && clean[byType('phone').key]) || '').trim();

  const labels = Object.fromEntries(fields.map((f) => [f.key, f.label]));
  const rows = fields.map((f) => [f.label, display(f, clean[f.key])]).filter(([, v]) => v !== '');
  const { total, lines } = computeTotal(form, clean);
  const site = await getSettingsFresh('site');

  let order = null; let redirect = '';
  if (pay.enabled && total > 0) {
    const methods = await getSettingsFresh('payments');
    const allowed = PAYMENT_METHODS.filter((m) => methods[m.id]?.enabled && (!(pay.methods || []).length || pay.methods.includes(m.id)));
    const method = allowed.find((m) => m.id === b.method);
    if (!method) return NextResponse.json({ error: 'Choose a payment method.' }, { status: 400 });
    if (!email || !name) return NextResponse.json({ error: 'This form needs a name and an email to take payment. Ask the site owner to add them.' }, { status: 400 });
    const currency = pay.currency || 'USD';
    order = await Order.create({
      number: newOrderNumber(), token: newToken(),
      package: { slug: `form-${form.slug}`, name: pay.productName || form.title || form.name, service: 'form', price: total, billing: 'one-time', currency },
      subtotal: total, discount: 0, creditUsed: 0, amount: total, currency,
      customer: { name: name.slice(0, 100), email: email.slice(0, 160), phone: phone.slice(0, 40) },
      requirements: rows.map(([k, v]) => `${k}: ${v}`).join('\n').slice(0, 5000), method: method.id, status: 'pending_payment',
      payment: { provider: method.id, amountLocal: method.local && currency !== 'BDT' ? Math.ceil(total * (methods.bdtRate || 120)) : total },
      history: [{ status: 'pending_payment', note: `Order placed through the form "${form.name}"` }],
    });
    order.invoiceNumber = `INV-${order.number.replace(/^MH-/, '')}`; await order.save();
    redirect = `/order/${order.number}?t=${order.token}`;
    try {
      if (method.id === 'card' && sslczEnabled()) redirect = await sslczInit({ order, amountBDT: order.payment.amountLocal, siteUrl: await getBaseUrl() });
      if (method.id === 'paypal' && paypalEnabled()) redirect = await paypalCreate({ order, siteUrl: await getBaseUrl() });
    } catch (e) { console.error('[form gateway]', e.message); }
    sendOrderEmail(order, 'placed').catch(() => {}); alertNewOrder(order).catch(() => {});
  }

  let entry = null;
  if (form.settings?.saveEntries !== false || order) {
    const h = await headers();
    entry = await FormEntry.create({
      formId: form._id, formSlug: form.slug, formName: form.name, data: clean, labels, email, name,
      payment: order ? { orderNumber: order.number, amount: total, currency: pay.currency || 'USD', method: order.method, lines } : undefined,
      page: String(b.page || '').slice(0, 200), referrer: (h.get('referer') || '').slice(0, 300), ip, ua: (h.get('user-agent') || '').slice(0, 200),
    });
    await Form.updateOne({ _id: form._id }, { $inc: { entries: 1 } });
  }
  if (email) touchContact({ email, name, phone, source: `form: ${form.name}`, message: true, activity: `Form "${form.name}"` }).catch(() => {});

  // Notifications. A mail problem never loses the answer: it is already saved.
  const vars = { form: form.name, name: name || 'someone', email, total: total ? money(total, pay.currency) : '' };
  const nt = form.notify || {};
  if (nt.enabled !== false) {
    const m = adminAlert({ site, title: fill(nt.subject || 'New answer: {form}', vars), rows: [...rows, ...(total ? [['Total', money(total, pay.currency)]] : [])], link: `${(await getBaseUrl())}/admin/entries?form=${form._id}`, linkLabel: 'Open the answers' });
    const to = (nt.to || []).filter(Boolean);
    const replyTo = nt.replyToField && clean[nt.replyToField] ? String(clean[nt.replyToField]) : email || undefined;
    if (to.length) sendMail({ to, subject: m.subject, html: m.html, text: m.text, replyTo }).catch(() => {});
    else notify(m.subject, m.text, m.html).catch(() => {});
  }
  if (form.autoReply?.enabled && email) sendCustom({ to: email, name, subject: fill(form.autoReply.subject, vars), message: fill(form.autoReply.message, vars) }).catch(() => {});

  return NextResponse.json({ ok: true, redirect: redirect || undefined, title: order ? 'Almost done' : undefined });
}
