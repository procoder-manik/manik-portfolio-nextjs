import { ImageResponse } from 'next/og';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

/* Each unique query string is its own cached response: a CDN or browser caches it by URL, and the page
   always asks for the same URL for the same title, so this never regenerates once warm. */
const CACHE = 'public, max-age=31536000, immutable';

/* Exact pixel size per kind, matching lib/image-specs.js (the same sizes the AI cover-prompt tool targets). */
const SIZE = { post: [1600, 900], case: [1600, 1000], project: [1600, 840], page: [1200, 630] };
const EYEBROW = { post: 'ARTICLE', case: 'CASE STUDY', project: 'PROJECT', page: 'MANIK HOSSAIN' };

let fonts;
async function loadFonts() {
  if (fonts) return fonts;
  const dir = path.join(process.cwd(), 'lib', 'og-fonts');
  const [b700, b600, i400, i600] = await Promise.all(['bricolage-700.ttf', 'bricolage-600.ttf', 'instrument-400.ttf', 'instrument-600.ttf'].map((f) => fs.readFile(path.join(dir, f))));
  fonts = [
    { name: 'Display', data: b700, weight: 700, style: 'normal' },
    { name: 'Display', data: b600, weight: 600, style: 'normal' },
    { name: 'Body', data: i400, weight: 400, style: 'normal' },
    { name: 'Body', data: i600, weight: 600, style: 'normal' },
  ];
  return fonts;
}

const hex = (v, d) => (/^[0-9a-fA-F]{6}$/.test(v || '') ? `#${v}` : d);
const clamp = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trim()}…` : s);

/* GET /og?k=post|case|project|page&t=Title&e=Eyebrow override&a=accent hex (no #)&s=small line (industry, domain...)
   A plain, brand-styled cover generated from the title alone, used only when the item has no image of its own.
   Not an AI image: no network call, instant, free, and always available even without an AI key. */
export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const kind = SIZE[sp.get('k')] ? sp.get('k') : 'page';
  const [w, h] = SIZE[kind];
  const title = clamp(String(sp.get('t') || 'Manik Hossain').trim(), 90) || 'Manik Hossain';
  const eyebrow = clamp(String(sp.get('e') || EYEBROW[kind]).trim().toUpperCase(), 28);
  const sub = clamp(String(sp.get('s') || '').trim(), 60);
  const accent = hex(sp.get('a'), '#6391FF');
  const big = title.length <= 42 ? 72 : title.length <= 70 ? 58 : 46;
  const pad = Math.round(h * 0.11);

  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: { width: w, height: h, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: pad, background: '#0C1526', fontFamily: 'Body', position: 'relative', overflow: 'hidden' },
        children: [
          { type: 'div', props: { style: { position: 'absolute', width: h * 0.9, height: h * 0.9, borderRadius: 9999, right: -h * 0.28, top: -h * 0.32, background: `radial-gradient(circle, ${accent}55 0%, ${accent}00 70%)`, display: 'flex' } } },
          { type: 'div', props: { style: { position: 'absolute', width: h * 0.7, height: h * 0.7, borderRadius: 9999, left: -h * 0.22, bottom: -h * 0.3, background: `radial-gradient(circle, #ffffff10 0%, #ffffff00 70%)`, display: 'flex' } } },
          { type: 'div', props: { style: { position: 'absolute', right: pad, bottom: pad, display: 'flex', color: '#5A6B8C', fontSize: 20, fontWeight: 400 }, children: 'manikhossain.in' } },
          { type: 'div', props: {
            style: { display: 'flex', alignItems: 'center', gap: 14, position: 'relative' },
            children: [
              { type: 'div', props: { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 13, background: accent, color: '#0C1526', fontFamily: 'Display', fontWeight: 700, fontSize: 22 }, children: 'M' } },
              { type: 'div', props: { style: { display: 'flex', color: '#C7D2E5', fontSize: 22, fontWeight: 600, fontFamily: 'Display', letterSpacing: -0.2 }, children: 'Manik Hossain' } },
            ],
          } },
          { type: 'div', props: {
            style: { display: 'flex', flexDirection: 'column', gap: 18, maxWidth: w - pad * 2, position: 'relative' },
            children: [
              { type: 'div', props: { style: { display: 'flex', width: 56, height: 6, borderRadius: 3, background: accent, marginBottom: 2 } } },
              { type: 'div', props: { style: { display: 'flex', color: accent, fontSize: 21, fontWeight: 600, fontFamily: 'Body', letterSpacing: 3 }, children: eyebrow } },
              { type: 'div', props: { style: { display: 'flex', color: '#F4F7FC', fontSize: big, fontWeight: 700, fontFamily: 'Display', lineHeight: 1.12, letterSpacing: -1.2 }, children: title } },
              sub ? { type: 'div', props: { style: { display: 'flex', color: '#8C9BBE', fontSize: 24, fontWeight: 400, marginTop: 4 }, children: sub } } : null,
            ].filter(Boolean),
          } },
        ],
      },
    },
    { width: w, height: h, fonts: await loadFonts(), headers: { 'Cache-Control': CACHE } },
  );
}

