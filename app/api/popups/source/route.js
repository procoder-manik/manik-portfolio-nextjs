import { NextResponse } from 'next/server';
import { popupSource } from '@/lib/data';
import { serialize } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/* For the admin popup preview: what a popup set to "Fill from" takes from a landing page or a product.
   Only public details (name, pitch, picture, logo, link, colour). */
export async function GET(req) {
  const p = req.nextUrl.searchParams;
  const type = p.get('type'); const ref = p.get('ref');
  if (!['landing', 'app'].includes(type) || !ref) return NextResponse.json({ auto: null });
  try { return NextResponse.json({ auto: serialize(await popupSource(type, ref)) }, { headers: { 'Cache-Control': 'no-store' } }); } catch { return NextResponse.json({ auto: null }); }
}
