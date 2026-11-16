import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { PitchSite } from '@/lib/models';

export const dynamic = 'force-dynamic';

/* The addresses of live pitch websites. The middleware keeps this list for a few seconds and sends those addresses to the page route. */
export async function GET() {
  if (!hasDB()) return NextResponse.json({ sites: [] });
  try {
    await dbConnect();
    const rows = await PitchSite.find({ published: { $ne: false }, trashedAt: null }).select('slug sandbox').lean();
    return NextResponse.json({ sites: rows.filter((r) => r.slug).map((r) => ({ slug: r.slug, sandbox: r.sandbox !== false })) });
  } catch { return NextResponse.json({ sites: [] }, { status: 503 }); }
}
