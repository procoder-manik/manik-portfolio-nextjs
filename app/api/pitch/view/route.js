import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { dbConnect, hasDB } from '@/lib/db';
import { Pitch } from '@/lib/models';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { notify } from '@/lib/mail';

const CODE = /^[a-z0-9-]{4,40}$/;
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|slack|discord|headless|lighthouse|pingdom|uptime/i;

/* A prospect opened a page from a pitch link. Counted only when real JavaScript runs, so link previews
   (WhatsApp, Slack, LinkedIn) and most robots are not counted. Never stores an IP address. */
export async function POST(req) {
  try {
    const b = await req.json().catch(() => ({}));
    const code = String(b.code || '').toLowerCase();
    if (!CODE.test(code) || !hasDB()) return NextResponse.json({ ok: true });
    const ua = (await headers()).get('user-agent') || '';
    if (BOT.test(ua)) return NextResponse.json({ ok: true });
    if (!(await rateLimit(`pitch:${await clientIp()}:${code}`, 40, 3600))) return NextResponse.json({ ok: true });
    await dbConnect();
    const pitch = await Pitch.findOne({ code });
    if (!pitch) return NextResponse.json({ ok: true });
    const now = new Date();
    const path = String(b.path || '/').slice(0, 160);
    const device = /mobile|android|iphone|ipad/i.test(ua) ? 'phone or tablet' : 'computer';
    let from = ''; try { from = b.from ? new URL(String(b.from)).hostname.replace(/^www\./, '').slice(0, 60) : ''; } catch {}
    const first = !pitch.firstViewAt;
    const quiet = pitch.lastAlertAt && now - pitch.lastAlertAt < 24 * 3600 * 1000;
    pitch.views += 1; pitch.lastViewAt = now; if (first) pitch.firstViewAt = now;
    if (pitch.status === 'sent') pitch.status = 'opened';
    pitch.log.push({ at: now, path, device, from }); if (pitch.log.length > 40) pitch.log = pitch.log.slice(-40);
    if (!quiet) pitch.lastAlertAt = now;
    await pitch.save();
    if (!quiet) {
      const who = pitch.company ? `${pitch.name} (${pitch.company})` : pitch.name;
      const base = process.env.NEXT_PUBLIC_SITE_URL || '';
      await notify(`${first ? 'Opened' : 'Opened again'}: ${who}`, `${who} ${first ? 'opened' : 'is looking at'} your page ${path} on a ${device}.\n\nViews so far: ${pitch.views}.\nSee it: ${base}/admin/pitches/${pitch._id}\n\nThis is a good moment to write to them.`).catch(() => {});
    }
  } catch (e) { console.error('[pitch]', e.message); }
  return NextResponse.json({ ok: true });
}
