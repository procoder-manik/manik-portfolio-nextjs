import { NextResponse } from 'next/server';
import { sslczValidate } from '@/lib/payments/sslcommerz';
import { markPaid, markFailed } from '@/lib/orders';
import { siteUrl } from '@/lib/utils';

/* SSLCommerz posts form data to success, fail, cancel and IPN. Every success is
   re-checked with the validation API before the order is marked paid. */
export async function POST(req) {
  const result = req.nextUrl.searchParams.get('result');
  const fd = await req.formData();
  const tran = fd.get('tran_id'); const token = fd.get('value_a'); const valId = fd.get('val_id');
  const back = `${siteUrl()}/order/${tran}?t=${token}`;
  if ((result === 'success' || result === 'ipn') && valId) {
    const v = await sslczValidate(valId);
    if (['VALID', 'VALIDATED'].includes(v.status) && v.tran_id === tran) {
      await markPaid(tran, { transactionId: v.bank_tran_id, reference: valId, raw: { card_type: v.card_type, amount: v.amount, currency: v.currency } }, `Paid by ${v.card_type || 'card'} via SSLCommerz`);
      return result === 'ipn' ? NextResponse.json({ ok: true }) : NextResponse.redirect(back, 303);
    }
  }
  if (result !== 'ipn') await markFailed(tran, result === 'cancel' ? 'Buyer cancelled card payment' : 'Card payment failed');
  return result === 'ipn' ? NextResponse.json({ ok: false }) : NextResponse.redirect(`${back}&failed=1`, 303);
}
