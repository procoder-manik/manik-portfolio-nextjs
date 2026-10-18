import { NextResponse } from 'next/server';
import { refreshContent } from '@/lib/revalidate';
import { adminRoute as guard } from '@/lib/server-auth';
const adminRoute = (h) => guard(h, 'system');
import { hasDB } from '@/lib/db';
import { runSeed } from '@/lib/seed-run';

export const maxDuration = 60;

export const POST = adminRoute(async () => {
  if (!hasDB()) throw new Error('Set MONGODB_URI first.');
  const added = await runSeed();
  refreshContent();
  return NextResponse.json({ ok: true, added });
});
