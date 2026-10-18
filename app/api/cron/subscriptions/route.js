import { NextResponse } from 'next/server';
import { hasDB } from '@/lib/db';
import { runSubscriptionCheck } from '@/lib/subscriptions';
import { getAdmin } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/* Daily subscription check: reminders before a plan ends, and switching ended plans off.
   Vercel Cron calls this once a day with the header  Authorization: Bearer <CRON_SECRET>.
   You can also open it while signed in to the admin to run it by hand. */
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  const bearer = req.headers.get('authorization') === `Bearer ${secret}`;
  const admin = bearer ? null : await getAdmin().catch(() => null);
  if (!(secret && bearer) && !admin) return NextResponse.json({ error: 'Not allowed. Set CRON_SECRET, or sign in to the admin.' }, { status: 401 });
  if (!hasDB()) return NextResponse.json({ error: 'Database is not connected.' }, { status: 503 });
  try { return NextResponse.json({ ok: true, ...(await runSubscriptionCheck()) }); }
  catch (e) { console.error('[cron subscriptions]', e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}
