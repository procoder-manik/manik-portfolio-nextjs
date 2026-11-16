import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { PitchSite } from '@/lib/models';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { notify } from '@/lib/mail';

/* The prospect pressed "Get this website" on their pitch website. Sent with navigator.sendBeacon, so it never slows the click. */
export async function POST(req) {
  try {
    const slug = String(req.nextUrl.searchParams.get('s') || '').toLowerCase();
    if (!hasDB() || !/^[a-z0-9-]{1,120}$/.test(slug)) return NextResponse.json({ ok: true });
    if (!(await rateLimit(`pitchclick:${await clientIp()}:${slug}`, 10, 3600))) return NextResponse.json({ ok: true });
    await dbConnect();
    const site = await PitchSite.findOneAndUpdate({ slug, trashedAt: null }, { $inc: { clicks: 1 } }, { new: true }).lean();
    if (site && ['draft', 'sent', 'opened'].includes(site.status)) await PitchSite.updateOne({ _id: site._id }, { $set: { status: 'interested' } });
    if (site) await notify(`Interested: ${site.client || site.name}`, `${site.client || site.name} pressed "Get this website" on /${site.slug}. They are on their way to your contact page.`);
  } catch (e) { console.error('[pitch-sites click]', e.message); }
  return NextResponse.json({ ok: true });
}
