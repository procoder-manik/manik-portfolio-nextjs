import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Category, Post } from '@/lib/models';
import { adminRoute as guard } from '@/lib/server-auth';
import { askAI, parseJson, aiConfig } from '@/lib/ai';
import { planPrompts } from '@/lib/ai-writer';
import { getSettingsFresh } from '@/lib/data';
import { rateLimit } from '@/lib/ratelimit';
import { slugify } from '@/lib/utils';
const adminRoute = (h) => guard(h, 'blog');
export const maxDuration = 60;

/* Step 1 of writing: title, meta, URL, category, outline, FAQ, related terms and image prompts. */
export const POST = adminRoute(async (req, ctx, admin) => {
  if (!(await rateLimit(`aiplan:${admin.email}`, 40, 3600))) throw new Error('Too many AI posts planned this hour.');
  const b = await req.json();
  if (String(b.topic || '').trim().length < 3) throw new Error('Type a topic.');
  const [site, cfg] = await Promise.all([getSettingsFresh('site'), aiConfig()]);
  let categories = []; let posts = [];
  if (hasDB()) { await dbConnect(); [categories, posts] = await Promise.all([Category.find({ trashedAt: null }).select('name').lean(), Post.find({ trashedAt: null, published: true }).sort({ publishedAt: -1 }).limit(30).select('slug title').lean()]); }
  const { system, user } = planPrompts(b, { site, brand: cfg.settings?.brandVoice, categories: categories.map((c) => c.name), posts });
  const plan = parseJson(await askAI({ system, user, json: true, maxTokens: 6000, temperature: 0.6, cfg }));
  if (!plan.title || !Array.isArray(plan.outline) || !plan.outline.length) throw new Error('The AI plan was incomplete. Try again.');
  plan.slug = slugify(plan.slug || plan.title).slice(0, 70);
  plan.primaryKeyword = plan.primaryKeyword || b.primary || '';
  plan.secondaryKeywords = (plan.secondaryKeywords || b.secondary || []).slice(0, 12);
  plan.images = (plan.images || []).map((x, i) => ({ ...x, slot: i + 1, after: Math.max(0, Math.min(plan.outline.length, Number(x.after) || 0)) }));
  return NextResponse.json({ plan, categories: categories.map((c) => c.name) });
});
