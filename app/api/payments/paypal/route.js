import { NextResponse } from 'next/server';
import { paypalCapture } from '@/lib/payments/paypal';
import { markPaid } from '@/lib/orders';
import { siteUrl } from '@/lib/utils';
import { getBaseUrl } from '@/lib/base-url';

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const number = sp.get('order'); const t = sp.get('t'); const ppId = sp.get('token');
  const back = `${(await getBaseUrl())}/order/${number}?t=${t}`;
  try {
    const cap = await paypalCapture(ppId);
    if (cap.status === 'COMPLETED') {
      const capId = cap.purchase_units?.[0]?.payments?.captures?.[0]?.id;
      await markPaid(number, { transactionId: capId, reference: ppId }, 'Paid via PayPal');
      return NextResponse.redirect(back);
    }
  } catch (e) { console.error(e); }
  return NextResponse.redirect(`${back}&failed=1`);
}
