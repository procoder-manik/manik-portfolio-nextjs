import { money, fmtDate, siteUrl } from '../utils';
import { PAYMENT_METHODS, ORDER_STATUS } from '../options';

/* Email-safe templates that mirror the site: navy header, signal-blue buttons,
   rounded white card, generous spacing. Tables and inline styles only. */
const C = { navy: '#0C1526', ink: '#0C1526', body: '#33405A', muted: '#62718D', line: '#DCE2EC', bg: '#F3F5F9', blue: '#2F63E6', amber: '#B87000' };
const FONT = "'Instrument Sans','Segoe UI',Helvetica,Arial,sans-serif";
const DISPLAY = "'Bricolage Grotesque','Segoe UI',Helvetica,Arial,sans-serif";

export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const fill = (tpl = '', vars = {}) => String(tpl).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
const paras = (text = '') => String(text).split(/\n{2,}/).map((p) => `<p style="margin:0 0 16px;font:16px/1.65 ${FONT};color:${C.body}">${esc(p).replace(/\n/g, '<br>')}</p>`).join('');

export function button(label, url, secondary) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-block;margin:6px 8px 6px 0"><tr><td style="border-radius:999px;background:${secondary ? '#FFFFFF' : C.blue};${secondary ? `border:1px solid ${C.line};` : ''}">
  <a href="${esc(url)}" style="display:inline-block;padding:13px 24px;font:600 15px ${FONT};color:${secondary ? C.ink : '#FFFFFF'};text-decoration:none;border-radius:999px">${esc(label)}</a></td></tr></table>`;
}

export function table(rows) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;border:1px solid ${C.line};border-radius:14px;border-collapse:separate;overflow:hidden">
  ${rows.filter((r) => r && r[1] !== undefined && r[1] !== '').map(([k, v], i) => `<tr><td style="padding:12px 16px;font:14px ${FONT};color:${C.muted};${i ? `border-top:1px solid ${C.line};` : ''}">${esc(k)}</td><td align="right" style="padding:12px 16px;font:600 14px ${FONT};color:${C.ink};${i ? `border-top:1px solid ${C.line};` : ''}">${v}</td></tr>`).join('')}</table>`;
}

export function layout({ site, preheader = '', heading, body, actions = '', note = '', signature }) {
  const url = siteUrl();
  const socials = (site.socials || []).slice(0, 5).map((s) => `<a href="${esc(s.url)}" style="color:${C.muted};text-decoration:none;margin:0 8px">${esc(s.label)}</a>`).join('·');
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:${C.bg}">
<span style="display:none!important;opacity:0;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:32px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
  <tr><td style="background:${C.navy};border-radius:22px 22px 0 0;padding:26px 32px;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:32px 32px">
    <table role="presentation" width="100%"><tr>
      <td><a href="${url}" style="text-decoration:none"><span style="display:inline-block;width:38px;height:38px;line-height:38px;text-align:center;border-radius:11px;background:#6391FF;color:#fff;font:700 15px ${DISPLAY};vertical-align:middle">MH</span>
      <span style="font:600 17px ${DISPLAY};color:#ECF1F8;vertical-align:middle;margin-left:10px">${esc(site.name)}</span></a></td>
      <td align="right" style="font:13px ${FONT};color:#8697B6">${esc(site.role?.split(',')[0] || '')}</td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#FFFFFF;padding:36px 32px 28px;border-left:1px solid ${C.line};border-right:1px solid ${C.line}">
    <h1 style="margin:0 0 18px;font:700 26px/1.2 ${DISPLAY};color:${C.ink};letter-spacing:-.02em">${esc(heading)}</h1>
    ${body}
    ${actions ? `<div style="margin:24px 0 8px">${actions}</div>` : ''}
    ${signature ? `<p style="margin:28px 0 0;font:15px/1.6 ${FONT};color:${C.body}">${esc(signature).replace(/\n/g, '<br>')}</p>` : ''}
  </td></tr>
  ${note ? `<tr><td style="background:#FFF8EC;padding:14px 32px;border:1px solid ${C.line};border-top:0;font:13px/1.55 ${FONT};color:${C.amber}">${note}</td></tr>` : ''}
  <tr><td style="background:#FFFFFF;border:1px solid ${C.line};border-top:1px solid ${C.line};border-radius:0 0 22px 22px;padding:20px 32px;text-align:center;font:13px/1.6 ${FONT};color:${C.muted}">
    <a href="${url}" style="color:${C.ink};font-weight:600;text-decoration:none">${esc(url.replace(/^https?:\/\//, ''))}</a> · ${esc(site.email)} · ${esc(site.phone || '')}<br>${socials}
  </td></tr>
  <tr><td style="padding:18px 8px;text-align:center;font:12px ${FONT};color:${C.muted}">You are receiving this because you contacted or ordered from ${esc(site.name)}.</td></tr>
</table></td></tr></table></body></html>`;
}

const strip = (html) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<br\s*\/?>/g, '\n').replace(/<\/(p|h1|tr|div)>/g, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n').trim();
const out = (subject, html) => ({ subject, html, text: strip(html) });

export const orderLink = (o) => `${siteUrl()}/order/${o.number}?t=${o.token}`;
export const invoiceLink = (o) => `${siteUrl()}/invoice/${o.number}?t=${o.token}`;
const methodName = (id) => PAYMENT_METHODS.find((m) => m.id === id)?.name || id;

/* Auto thank-you to someone who used the contact form or chat. */
export function contactThanks({ msg, site, email }) {
  const a = email.autoReply || {};
  const vars = { name: (msg.name || '').split(' ')[0] || 'there' };
  const body = paras(fill(a.body, vars)) + table([['Service', esc(msg.service || 'Not specified')], ['Budget', esc(msg.budget || 'Not sure yet')], ['Your message', esc((msg.message || '').slice(0, 220)) + ((msg.message || '').length > 220 ? '…' : '')]]);
  const actions = button('See recent work', `${siteUrl()}/portfolio`) + (site.calendly ? button('Book a free call', site.calendly, true) : '');
  return out(fill(a.subject, vars), layout({ site, preheader: 'I will reply within one working day.', heading: fill(a.heading, vars), body, actions, signature: email.signature }));
}

/* Order emails: placed, paid, in_progress, completed, cancelled. */
export function orderEmail({ order: o, status, site, email }) {
  const t = email.orders?.[status] || {};
  const vars = { name: o.customer?.name?.split(' ')[0] || '', number: o.number, package: o.package?.name };
  const st = ORDER_STATUS[status]?.label || status;
  const local = o.payment?.amountLocal && o.currency !== 'BDT' && ['bkash', 'nagad', 'rocket', 'card'].includes(o.method);
  const body = paras(`Hi ${vars.name},\n\n${fill(t.body, vars)}`) + table([
    ['Order', esc(o.number)], ['Package', esc(o.package?.name)],
    o.discount > 0 ? ['Coupon', `${esc(o.coupon?.code || '')} -${esc(money(o.discount, o.currency))}`] : null,
    o.creditUsed > 0 ? ['Referral credit', `-${esc(money(o.creditUsed, o.currency))}`] : null,
    ['Amount', esc(money(o.amount, o.currency))],
    local ? ['In taka', `৳${Number(o.payment.amountLocal).toLocaleString('en-US')}`] : null,
    ['Payment method', esc(methodName(o.method))], ['Status', `<span style="color:${status === 'cancelled' ? '#DC2626' : C.blue}">${esc(st)}</span>`],
  ]);
  const paidish = ['paid', 'in_progress', 'completed'].includes(status);
  const actions = button(status === 'placed' ? 'Complete payment' : 'View your order', orderLink(o)) + (paidish ? button('Download invoice', invoiceLink(o), true) : '') + (status !== 'placed' ? button('Open your account', `${siteUrl()}/account`, true) : '');
  return out(fill(t.subject, vars), layout({ site, preheader: `${o.package?.name}: ${st}`, heading: { placed: `Thanks for your order, ${vars.name}`, paid: 'Payment confirmed', in_progress: 'Work has started', completed: 'Your project is delivered', cancelled: 'Order cancelled' }[status] || st, body, actions, signature: email.signature,
    note: status === 'placed' ? 'Keep this email. The order link above is private to you.' : '' }));
}

export function invoiceEmail({ order: o, site, email }) {
  const vars = { name: o.customer?.name?.split(' ')[0] || '' };
  const paid = ['paid', 'in_progress', 'completed'].includes(o.status);
  const body = paras(`Hi ${vars.name},\n\nHere is the invoice for your order. You can view it online or save it as a PDF from the invoice page.`) + table([
    ['Invoice', esc(o.invoiceNumber || `INV-${o.number}`)], ['Date', esc(fmtDate(o.createdAt, { month: 'long', day: 'numeric', year: 'numeric' }))],
    ['Package', esc(o.package?.name)], ['Total', `<span style="font-size:16px">${esc(money(o.amount, o.currency))}</span>`],
    ['Status', paid ? '<span style="color:#059669">Paid</span>' : '<span style="color:#B87000">Unpaid</span>'],
  ]);
  return out(`Invoice ${o.invoiceNumber || `INV-${o.number}`} from ${site.name}`, layout({ site, preheader: `Invoice for ${o.package?.name}`, heading: 'Your invoice', body,
    actions: button('View and download invoice', invoiceLink(o)) + (paid ? '' : button('Pay now', orderLink(o), true)), signature: email.signature }));
}

/* Free-form email written in the admin (reply to a message, CRM email, order note). */
export function customEmail({ name, subject, message, site, email, ctaLabel, ctaUrl }) {
  const body = paras(`Hi ${(name || '').split(' ')[0] || 'there'},\n\n${message}`);
  return out(subject, layout({ site, preheader: String(message).slice(0, 90), heading: subject, body, actions: ctaLabel && ctaUrl ? button(ctaLabel, ctaUrl) : '', signature: email.signature }));
}

/* Customer portal */
export function verifyEmail({ name, link, site, email }) {
  const body = paras(`Hi ${(name || '').split(' ')[0] || 'there'},\n\nConfirm your email to finish setting up your account. Once it is confirmed, every order placed with this email shows up in your account automatically.`);
  return out(`Confirm your email for ${site.name}`, layout({ site, preheader: 'One click to confirm your email.', heading: 'Confirm your email', body, actions: button('Confirm my email', link),
    note: 'The link works for 48 hours. If you did not create an account, you can ignore this email.', signature: email.signature }));
}

export function resetEmail({ name, link, site, email }) {
  const body = paras(`Hi ${(name || '').split(' ')[0] || 'there'},\n\nSomeone asked to reset the password for your account. If it was you, choose a new password with the button below.`);
  return out(`Reset your password for ${site.name}`, layout({ site, preheader: 'Choose a new password.', heading: 'Reset your password', body, actions: button('Choose a new password', link),
    note: 'The link works for 1 hour. If you did not ask for this, ignore this email and your password stays the same.', signature: email.signature }));
}

/* Owner alerts */
export function adminAlert({ site, title, rows, link, linkLabel = 'Open in admin' }) {
  return out(title, layout({ site, heading: title, body: table(rows.map(([k, v]) => [k, esc(v || '-')])), actions: link ? button(linkLabel, link) : '' }));
}
