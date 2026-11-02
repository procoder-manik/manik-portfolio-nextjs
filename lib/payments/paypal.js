import 'server-only';
const base = () => (process.env.PAYPAL_SANDBOX === 'false' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com');
export const paypalEnabled = () => Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

async function token() {
  const r = await fetch(`${base()}/v1/oauth2/token`, {
    method: 'POST', body: 'grant_type=client_credentials',
    headers: { Authorization: 'Basic ' + Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const j = await r.json(); if (!j.access_token) throw new Error('PayPal sign-in failed'); return j.access_token;
}

export async function paypalCreate({ order, siteUrl }) {
  const r = await fetch(`${base()}/v2/checkout/orders`, {
    method: 'POST', headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{ reference_id: order.number, description: order.package.name.slice(0, 120), amount: { currency_code: order.currency, value: order.amount.toFixed(2) } }],
      application_context: { brand_name: 'Manik Hossain', user_action: 'PAY_NOW', shipping_preference: 'NO_SHIPPING',
        return_url: `${siteUrl}/api/payments/paypal?order=${order.number}&t=${order.token}`, cancel_url: `${siteUrl}/order/${order.number}?t=${order.token}&cancelled=1` },
    }),
  });
  const j = await r.json();
  const link = j.links?.find((l) => l.rel === 'approve')?.href;
  if (!link) throw new Error('PayPal checkout could not start. Pick another method.');
  return link;
}

export async function paypalOrder(paypalOrderId) {
  const r = await fetch(`${base()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, { headers: { Authorization: `Bearer ${await token()}` } });
  return r.json();
}

/* True only when this PayPal order was created for this exact site order, in the same currency and for the full amount. */
export function paypalOrderMatches(pp, order) {
  const unit = pp?.purchase_units?.[0];
  return unit?.reference_id === order.number && unit?.amount?.currency_code === order.currency && Math.abs(Number(unit?.amount?.value) - order.amount) < 0.005;
}

export async function paypalCapture(paypalOrderId) {
  const r = await fetch(`${base()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, { method: 'POST', headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' } });
  return r.json();
}
