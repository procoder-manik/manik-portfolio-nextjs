import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { autocomplete, semrushRelated, aiIdeas } from '@/lib/keywords';
import { aiConfig, aiReady } from '@/lib/ai';
import { rateLimit } from '@/lib/ratelimit';
const adminRoute = (h) => guard(h, 'blog');
export const maxDuration = 60;

/* POST { topic, audience, language } -> real Google suggestions, optional Semrush data, and AI ideas. Each part fails on its own. */
export const POST = adminRoute(async (req, ctx, admin) => {
  if (!(await rateLimit(`aikw:${admin.email}`, 60, 3600))) throw new Error('Too many keyword searches this hour.');
  const { topic = '', audience = '', language = 'English' } = await req.json();
  const t = String(topic).trim().slice(0, 140); if (t.length < 3) throw new Error('Type a topic first.');
  const out = { google: [], semrush: null, ai: null, notes: [] };
  const cfg = await aiConfig();
  const [g, s] = await Promise.allSettled([autocomplete(t, 'en'), semrushRelated(t, cfg.settings?.semrushDatabase || 'us')]);
  if (g.status === 'fulfilled') out.google = g.value; else out.notes.push('Google suggestions could not be loaded from this server.');
  if (s.status === 'fulfilled') out.semrush = s.value; else out.notes.push(`Semrush: ${s.reason.message}`);
  if (!process.env.SEMRUSH_API_KEY) out.notes.push('Add SEMRUSH_API_KEY to also see real search volume and difficulty from Semrush.');
  if (aiReady(cfg.provider)) { try { out.ai = await aiIdeas(t, { audience, language, real: out.google }); } catch (e) { out.notes.push(`AI ideas: ${e.message}`); } }
  else out.notes.push('Choose an AI provider and add its key to get AI keyword ideas.');
  return NextResponse.json(out);
});
