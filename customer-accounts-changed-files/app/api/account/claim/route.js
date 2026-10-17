import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/ratelimit';
import { getCustomer, claimOrder } from '@/lib/customers';

/* Add an order to the signed-in account using its private order link. */
export async function POST(req) {
  const me = await getCustomer();
  if (!me) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (!(await rateLimit(`cclaim:${me._id}`, 20, 3600))) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  let number = String(b.number || '').trim(); let t = String(b.t || '').trim();
  // Accept a pasted order link too: https://site/order/MH-...?t=...
  const m = String(b.link || '').match(/order\/([A-Z0-9-]+)\?t=([a-f0-9]+)/i);
  if (m) { number = m[1]; t = m[2]; }
  if (!number || !t) return NextResponse.json({ error: 'Paste the order link from your confirmation email.' }, { status: 400 });
  const ok = await claimOrder(me, number.toUpperCase(), t);
  if (!ok) return NextResponse.json({ error: 'That order link does not match an order, or it already belongs to another account.' }, { status: 404 });
  return NextResponse.json({ ok: true, number: number.toUpperCase() });
}
