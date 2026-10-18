import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { suggestFree, relatedWords, semrushRelated, aiIdeas, pickKeywords } from '@/lib/keywords';
import { aiConfig, aiReady } from '@/lib/ai';
import { rateLimit } from '@/lib/ratelimit';
const adminRoute = (h) => guard(h, 'blog');
export const maxDuration = 60;

/* POST { topic, audience, language } -> free search suggestions (Google, Bing, DuckDuckGo, YouTube), related words,
   AI ideas (free AI) and a ready pick of primary and secondary keywords. Every part fails on its own.
   Semrush is optional and only used when SEMRUSH_API_KEY is set. */
export const POST = adminRoute(async (req, ctx, admin) => {
  if (!(await rateLimit(`aikw:${admin.email}`, 60, 3600))) throw new Error('Too many keyword searches this hour.');
  const { topic = '', audience = '', language = 'English' } = await req.json();
  const t = String(topic).trim().slice(0, 140); if (t.length < 3) throw new Error('Type a topic first.');
  const bn = /bengali|bangla|বাংলা/i.test(language);
  const out = { free: [], questions: [], related: [], semrush: null, ai: null, picked: null, notes: [] };
  const cfg = await aiConfig();
  const [f, w, s] = await Promise.allSettled([suggestFree(t, bn ? 'bn' : 'en'), bn ? Promise.resolve([]) : relatedWords(t), process.env.SEMRUSH_API_KEY ? semrushRelated(t, cfg.settings?.semrushDatabase || 'us') : Promise.resolve(null)]);
  if (f.status === 'fulfilled') { out.free = f.value.list; out.questions = f.value.questions; if (!f.value.list.length) out.notes.push('The search engines returned no suggestions for this topic. Try different words.'); } else out.notes.push('Search suggestions could not be loaded from this server.');
  if (w.status === 'fulfilled') out.related = w.value;
  if (s.status === 'fulfilled') out.semrush = s.value; else out.notes.push(`Semrush (optional): ${s.reason.message}`);
  if (aiReady(cfg.provider)) {
    try { out.ai = await aiIdeas(t, { audience, language, real: out.free.map((x) => x.keyword) }); }
    catch (e) { out.notes.push('AI keyword ideas are skipped for now (the free AI is busy). The suggestions above are still real.'); }
  }
  out.picked = pickKeywords(t, out.free, out.ai);
  return NextResponse.json(out);
});
