import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Pitch } from '@/lib/models';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { getSettings } from '@/lib/data';
import { validCode } from '@/lib/pitch';

const TITLES = /^(dr|mr|mrs|ms|miss|prof|professor|sir|madam)\.?$/i;
const greet = (p) => { const g = String(p.greetName || '').trim(); if (g) return g; const parts = String(p.name || '').trim().split(/\s+/).filter(Boolean); return (parts.find((w) => !TITLES.test(w)) || parts[0] || '').slice(0, 40); };

/* What a prospect sees on their own link: their name, your note and an optional headline.
   Only the name, business and the texts you wrote are returned (never the email or notes). */
export async function GET(req) {
  const res = (body) => NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
  const code = String(req.nextUrl.searchParams.get('code') || '').toLowerCase();
  if (!validCode(code) || !hasDB()) return res({ ok: false });
  if (!(await rateLimit(`pitch-hello:${await clientIp()}`, 60, 600))) return res({ ok: false });
  await dbConnect();
  const p = await Pitch.findOne({ code }).lean();
  if (!p || p.showBanner === false) return res({ ok: false });
  const site = await getSettings('site');
  const name = greet(p); const company = String(p.company || '').trim();
  const fill = (t) => String(t || '').replace(/\{name\}/gi, name).replace(/\{company\}/gi, company || 'your business').trim();
  return res({
    ok: true, name, who: [p.name, company].filter(Boolean).join(', '), company,
    message: fill(p.message).slice(0, 600), headline: fill(p.headline).slice(0, 140),
    path: p.customPath || (p.page ? `/service-areas/${p.page}` : ''),
    cta: { label: site.calendly ? 'Book a free call' : 'Write to me', href: site.calendly || '/contact' },
    owner: String(site.name || '').slice(0, 60),
  });
}
