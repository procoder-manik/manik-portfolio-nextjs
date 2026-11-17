import { NextResponse } from 'next/server';
import { getPitchSitesFresh } from '@/lib/data';

export const dynamic = 'force-dynamic';

/* The current Pitch websites cards (only what a card shows, never the HTML). Read live from the database on every call,
   so a website added from any admin, local or live, appears on the cards at once. */
export async function GET(req) {
  const p = req.nextUrl.searchParams;
  const limit = Math.min(60, Math.max(1, Number(p.get('limit')) || 6));
  const sites = await getPitchSitesFresh({ all: p.get('all') === '1', limit });
  return NextResponse.json({ sites }, { headers: { 'Cache-Control': 'no-store' } });
}
