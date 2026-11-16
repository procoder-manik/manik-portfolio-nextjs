import { cookies, headers } from 'next/headers';
import { dbConnect, hasDB } from '@/lib/db';
import { PitchSite } from '@/lib/models';
import { getSettings } from '@/lib/data';
import { COOKIE, verifyToken } from '@/lib/auth';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { notify } from '@/lib/mail';
import { buildPitchPage, isBot, deviceOf, publicOrigin } from '@/lib/pitch-sites';

export const dynamic = 'force-dynamic';

/* yoursite.com/<slug> of a pitch website lands here (the middleware sends it). The answer is the saved HTML and nothing of this site.
   The middleware adds the sandbox policy: the page's scripts run with a private origin and cannot read this site's cookies or call the admin. */
const notFound = () => new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } });

export async function GET(req, { params }) {
  const { slug: raw } = await params;
  let slug = ''; try { slug = decodeURIComponent(raw || '').toLowerCase(); } catch { return notFound(); }
  if (!hasDB() || !/^[a-z0-9-]{1,120}$/.test(slug)) return notFound();
  await dbConnect();
  const site = await PitchSite.findOne({ slug, published: { $ne: false }, trashedAt: null }).lean();
  if (!site) return notFound();

  const s = await getSettings('site');
  // ?card=1 is the small live preview on your own cards: no credit strip, and it is not a visit by the prospect.
  const card = req.nextUrl.searchParams.get('card') === '1';
  const html = buildPitchPage(card ? { ...site, credit: { ...site.credit, show: false } } : site, { name: s.name || 'Manik Hossain', url: publicOrigin(await headers()) });
  if (!card && (await headers()).get('sec-fetch-dest') !== 'iframe') countView(site).catch((e) => console.error('[pitch-sites]', e.message));

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

/* Counts real visits: not you (signed in to the admin), not link previews or robots. Emails you at most once a day per site. */
async function countView(site) {
  const h = await headers();
  const ua = h.get('user-agent') || '';
  if (isBot(ua)) return;
  if (await verifyToken((await cookies()).get(COOKIE)?.value).catch(() => null)) return;
  if (!(await rateLimit(`pitchsite:${await clientIp()}:${site.slug}`, 30, 3600))) return;
  const now = new Date();
  const first = !site.firstViewAt;
  const quiet = site.lastAlertAt && now - new Date(site.lastAlertAt) < 24 * 3600 * 1000;
  let from = ''; try { const r = h.get('referer'); from = r ? new URL(r).hostname.replace(/^www\./, '').slice(0, 60) : ''; } catch {}
  await PitchSite.updateOne({ _id: site._id }, {
    $inc: { views: 1 },
    $set: { lastViewAt: now, ...(first ? { firstViewAt: now } : {}), ...(['draft', 'sent'].includes(site.status) ? { status: 'opened' } : {}), ...(quiet ? {} : { lastAlertAt: now }) },
    $push: { log: { $each: [{ at: now, device: deviceOf(ua), from }], $slice: -50 } },
  });
  if (!quiet) {
    const who = site.client || site.name;
    const base = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
    await notify(`${first ? 'Opened' : 'Opened again'}: ${who} website`, `${who} ${first ? 'opened' : 'is looking at'} the website you made for them (/${site.slug}) on a ${deviceOf(ua).toLowerCase()}.\n\nViews so far: ${(site.views || 0) + 1}.\nSee it: ${base}/admin/pitch-sites/${site._id}\n\nThis is a good moment to write to them.`);
  }
}
