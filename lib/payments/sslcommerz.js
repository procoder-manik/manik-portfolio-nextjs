import 'server-only';
/* SSLCommerz hosted checkout. One integration covers Visa, Mastercard, Amex,
   bKash, Nagad, Rocket and net banking. Charges are made in BDT. */
const base = () => (process.env.SSLCZ_SANDBOX === 'false' ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com');
export const sslczEnabled = () => Boolean(process.env.SSLCZ_STORE_ID && process.env.SSLCZ_STORE_PASSWORD);

export async function sslczInit({ order, amountBDT, siteUrl }) {
  const p = new URLSearchParams({
    store_id: process.env.SSLCZ_STORE_ID, store_passwd: process.env.SSLCZ_STORE_PASSWORD,
    total_amount: amountBDT.toFixed(2), currency: 'BDT', tran_id: order.number,
    success_url: `${siteUrl}/api/payments/sslcommerz?result=success`,
    fail_url: `${siteUrl}/api/payments/sslcommerz?result=fail`,
    cancel_url: `${siteUrl}/api/payments/sslcommerz?result=cancel`,
    ipn_url: `${siteUrl}/api/payments/sslcommerz?result=ipn`,
    cus_name: order.customer.name, cus_email: order.customer.email, cus_phone: order.customer.phone || '0000000000',
    cus_add1: order.customer.country || 'N/A', cus_city: 'N/A', cus_country: order.customer.country || 'Bangladesh',
    shipping_method: 'NO', product_name: order.package.name, product_category: 'Service', product_profile: 'non-physical-goods',
    value_a: order.token,
  });
  const r = await fetch(`${base()}/gwprocess/v4/api.php`, { method: 'POST', body: p });
  const j = await r.json();
  if (j.status !== 'SUCCESS' || !j.GatewayPageURL) throw new Error(j.failedreason || 'Card gateway is unavailable. Pick another method.');
  return j.GatewayPageURL;
}

export async function sslczValidate(valId) {
  const u = `${base()}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${process.env.SSLCZ_STORE_ID}&store_passwd=${process.env.SSLCZ_STORE_PASSWORD}&format=json`;
  const r = await fetch(u); return r.json();
}
