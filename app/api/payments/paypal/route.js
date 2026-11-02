import { NextResponse } from 'next/server';
import { paypalCapture, paypalOrder, paypalOrderMatches } from '@/lib/payments/paypal';
import { markPaid } from '@/lib/orders';
import { dbConnect } from '@/lib/db';
import { Order } from '@/lib/models';
import { getBaseUrl } from '@/lib/base-url';

const PAID = ['paid', 'in_progress', 'completed'];

/* PayPal sends the buyer back here. The money is only captured after the PayPal order is proved to belong to this site order,
   so a payment for a cheap order can never be used to mark an expensive one as paid. */
export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const number = sp.get('order') || ''; const t = sp.get('t') || ''; const ppId = sp.get('token') || '';
  const back = `${(await getBaseUrl())}/order/${encodeURIComponent(number)}?t=${encodeURIComponent(t)}`;
  try {
    await dbConnect();
    const order = await Order.findOne({ number, token: t }).lean();
    if (order && PAID.includes(order.status)) return NextResponse.redirect(back);
    if (order && ppId) {
      const pp = await paypalOrder(ppId);
      if (paypalOrderMatches(pp, order)) {
        const cap = await paypalCapture(ppId);
        if (cap.status === 'COMPLETED') {
          const capId = cap.purchase_units?.[0]?.payments?.captures?.[0]?.id;
          await markPaid(number, { transactionId: capId, reference: ppId }, 'Paid via PayPal');
          return NextResponse.redirect(back);
        }
      } else console.error('[paypal] order mismatch', number, ppId);
    }
  } catch (e) { console.error(e); }
  return NextResponse.redirect(`${back}&failed=1`);
}
