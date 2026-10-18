import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { askAIx, parseJson, aiConfig } from '@/lib/ai';
import { visualPrompts } from '@/lib/ai-writer';
import { getSettingsFresh } from '@/lib/data';
import { normalizeImages, str } from '@/lib/plan-normalize';
const adminRoute = (h) => guard(h, 'blog');
export const maxDuration = 60;

/* Step 1b: how many images, the featured image, infographics, charts and tables, each with a ready prompt and instructions. */
export const POST = adminRoute(async (req) => {
  const { plan, brief = {} } = await req.json();
  if (!plan?.outline?.length) throw new Error('Missing plan.');
  const [site, cfg] = await Promise.all([getSettingsFresh('site'), aiConfig()]);
  const { system, user } = visualPrompts(plan, brief, { site });
  let out; let via;
  for (let i = 0; i < 2 && !out; i++) {
    const r = await askAIx({ system, user, json: true, maxTokens: 6000, temperature: 0.6, cfg, budgetMs: i ? 22000 : 38000 });
    via = r.via;
    try { const j = parseJson(r.text); if (Array.isArray(j.images) && j.images.length) out = j; } catch {}
  }
  if (!out) throw Object.assign(new Error('The image plan did not come back. Press Make image prompts again.'), { status: 502 });
  const n = plan.outline.length;
  const images = normalizeImages(out.images, plan.outline.length);
  return NextResponse.json({ images, summary: str(out.summary), via });
});
