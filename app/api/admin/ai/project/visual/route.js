import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { rateLimit } from '@/lib/ratelimit';
import { askAIx, parseJson, aiConfig } from '@/lib/ai';
import { loadImage, visualPrompts } from '@/lib/project-ai';
const adminRoute = (h) => guard(h, 'content');
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const hex = (v) => (/^#[0-9a-f]{6}$/i.test(String(v || '').trim()) ? String(v).trim().toUpperCase() : '');
const noDash = (s) => String(s || '').replace(/\s*[\u2014\u2013]\s*/g, ', ').trim();

/* Step 2: the AI looks at the screenshot and returns colours, alt text and banner prompts. */
export const POST = adminRoute(async (req, ctx, admin) => {
  if (!(await rateLimit(`aiproj-img:${admin.email}`, 40, 3600))) throw new Error('Too many screenshots read this hour. Try again later.');
  const b = await req.json();
  if (!String(b.name || '').trim()) throw new Error('Add the website name first.');
  let image = b.image;
  if (!(image?.data && /^image\/(png|jpeg|webp|gif)$/.test(image.mime || ''))) image = await loadImage(b.imageUrl);
  if (image.data.length > 6 * 1024 * 1024) throw new Error('The screenshot is too large. Upload a smaller JPG or WebP.');
  const cfg = await aiConfig();
  const { system, user } = visualPrompts(b);
  let v; let via; let last = '';
  for (let i = 0; i < 2 && !v; i++) {
    const r = await askAIx({ system, user, json: true, maxTokens: 3000, temperature: 0.5, cfg, images: [image], budgetMs: i ? 20000 : 34000 });
    via = r.via;
    try { v = parseJson(r.text); if (!Array.isArray(v.prompts) || !v.prompts.length) { last = 'The answer had no prompts.'; v = null; } } catch (e) { last = e.message; v = null; }
  }
  if (!v) throw Object.assign(new Error(`${last} Press the button again.`), { status: 502 });
  const out = {
    description: noDash(v.description), sections: (v.sections || []).map(noDash).filter(Boolean).slice(0, 10),
    palette: (v.palette || []).map(hex).filter(Boolean).slice(0, 6), accent: hex(v.accent), background: hex(v.background),
    fonts: noDash(v.fonts), mood: noDash(v.mood), industryGuess: noDash(v.industryGuess),
    altText: noDash(v.altText).slice(0, 140), fileName: String(v.fileName || '').toLowerCase().replace(/[^a-z0-9.-]+/g, '-').slice(0, 80),
    onImageText: { headline: noDash(v.onImageText?.headline || b.name), sub: noDash(v.onImageText?.sub) },
    prompts: v.prompts.filter((p) => p?.prompt).slice(0, 4).map((p) => ({ label: noDash(p.label) || 'Banner', tool: noDash(p.tool), attach: p.attach !== false, prompt: noDash(p.prompt) })),
    tips: noDash(v.tips), size: '1600 x 840', via, at: new Date().toISOString(),
  };
  return NextResponse.json({ visual: out, via });
});
