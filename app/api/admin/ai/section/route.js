import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { askAI, aiConfig } from '@/lib/ai';
import { sectionPrompts } from '@/lib/ai-writer';
import { getSettingsFresh } from '@/lib/data';
const adminRoute = (h) => guard(h, 'blog');
export const maxDuration = 60;

/* Step 2: writes one part (intro, a section, or the FAQ) so each call stays short. */
export const POST = adminRoute(async (req) => {
  const { plan, kind, index = 0, tail = '', brief = {} } = await req.json();
  if (!plan?.outline?.length) throw new Error('Missing plan.');
  const [site, cfg] = await Promise.all([getSettingsFresh('site'), aiConfig()]);
  const { system, user } = sectionPrompts(plan, kind, Number(index), String(tail).slice(-800), brief, { site, brand: cfg.settings?.brandVoice });
  let md = await askAI({ system, user, maxTokens: 2200, temperature: 0.8, cfg });
  md = md.replace(/^```(?:markdown|md)?\s*/i, '').replace(/\s*```$/i, '').replace(/[\u2014\u2013]/g, ',').trim();
  return NextResponse.json({ markdown: md });
});
