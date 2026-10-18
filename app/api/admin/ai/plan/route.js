import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Category, Post } from '@/lib/models';
import { adminRoute as guard } from '@/lib/server-auth';
import { askAIx, parseJson, aiConfig } from '@/lib/ai';
import { planPrompts } from '@/lib/ai-writer';
import { getSettingsFresh } from '@/lib/data';
import { rateLimit } from '@/lib/ratelimit';
import { slugify } from '@/lib/utils';
import { cleanText } from '@/lib/humanize';
import { normalizePlan, str } from '@/lib/plan-normalize';
const adminRoute = (h) => guard(h, 'blog');
export const maxDuration = 60;

/* Step 1 of writing: title, meta, URL, category, keywords, outline, FAQ and related terms. (Image prompts come from /visuals.) */
export const POST = adminRoute(async (req, ctx, admin) => {
  if (!(await rateLimit(`aiplan:${admin.email}`, 60, 3600))) throw new Error('Too many AI posts planned this hour.');
  const b = await req.json();
  if (String(b.topic || '').trim().length < 3) throw new Error('Type a topic.');
  const [site, cfg] = await Promise.all([getSettingsFresh('site'), aiConfig()]);
  let categories = []; let posts = [];
  if (hasDB()) { await dbConnect(); [categories, posts] = await Promise.all([Category.find({ trashedAt: null }).select('name').lean(), Post.find({ trashedAt: null, published: true }).sort({ publishedAt: -1 }).limit(30).select('slug title').lean()]); }
  const { system, user } = planPrompts(b, { site, brand: cfg.settings?.brandVoice, categories: categories.map((c) => c.name), posts });
  let plan; let via; let lastErr;
  for (let i = 0; i < 2 && !plan; i++) {
    const r = await askAIx({ system, user, json: true, maxTokens: 6500, temperature: 0.5, cfg, budgetMs: i ? 24000 : 36000 });
    via = r.via;
    try { plan = parseJson(r.text); if (!plan.title || !Array.isArray(plan.outline) || !plan.outline.length) { lastErr = 'The plan was incomplete.'; plan = null; } } catch (e) { lastErr = e.message; plan = null; }
  }
  if (!plan) throw Object.assign(new Error(`${lastErr} Press the button again.`), { status: 502 });
  plan = normalizePlan(plan);
  if (!plan.title || !plan.outline.length) throw Object.assign(new Error('The plan was incomplete. Press the button again.'), { status: 502 });
  plan.title = cleanText(plan.title, b.language).replace(/\n/g, ' ');
  plan.slug = slugify(plan.slug || plan.title).slice(0, 70) || slugify(b.topic).slice(0, 70);
  plan.primaryKeyword = plan.primaryKeyword || str(b.primary);
  plan.secondaryKeywords = (plan.secondaryKeywords.length ? plan.secondaryKeywords : b.secondary || []).slice(0, 12);
  plan.metaTitle = String(plan.metaTitle || plan.title).slice(0, 70);
  plan.metaDescription = String(plan.metaDescription || plan.excerpt || '').slice(0, 170);
  return NextResponse.json({ plan, via, categories: categories.map((c) => c.name) });
});
