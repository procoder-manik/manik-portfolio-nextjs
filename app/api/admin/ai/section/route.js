import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { askAIx, aiConfig } from '@/lib/ai';
import { sectionPrompts } from '@/lib/ai-writer';
import { getSettingsFresh } from '@/lib/data';
import { cleanText, aiScan, WRITING_RULES, WRITING_RULES_BN } from '@/lib/humanize';
import { toneOf } from '@/lib/tones';
const adminRoute = (h) => guard(h, 'blog');
export const maxDuration = 60;

/* Step 2: writes one part (intro, a section, or the FAQ) so each call stays short.
   Every part is cleaned for free (stock AI words swapped, long dashes removed). If it still reads machine-made,
   one quick polish pass rewrites it, as long as there is time left. */
export const POST = adminRoute(async (req) => {
  const { plan, kind, index = 0, tail = '', brief = {} } = await req.json();
  if (!plan?.outline?.length) throw new Error('Missing plan.');
  const [site, cfg] = await Promise.all([getSettingsFresh('site'), aiConfig()]);
  const { system, user } = sectionPrompts(plan, kind, Number(index), String(tail).slice(-800), brief, { site, brand: cfg.settings?.brandVoice });
  const t0 = Date.now();
  const first = await askAIx({ system, user, maxTokens: 2400, temperature: 0.85, cfg, budgetMs: 40000 });
  let md = cleanText(first.text, brief.language); let polished = false;
  const bn = /bengali|bangla|বাংলা/i.test(brief.language || '');
  const scan = aiScan(md);
  if (cfg.settings?.autoPolish !== false && !bn && kind !== 'faq' && (scan.total >= 3 || scan.notNot >= 2 || scan.repeatedStarts >= 1) && Date.now() - t0 < 32000) {
    try {
      const flagged = scan.hits.slice(0, 10).map((h) => h.phrase).join(', ');
      const r = await askAIx({ system: `You are a senior human editor.\n${bn ? WRITING_RULES_BN : WRITING_RULES}\nTone: ${toneOf(brief.tone).guide}\nOutput only the revised Markdown. Keep every heading line, list, table and link exactly. Do not shorten by more than 10 percent.`, user: `Rewrite so it reads like a skilled human wrote it. Remove or rephrase: ${flagged || 'stock phrases, even rhythm, repeated sentence openings'}. Vary sentence length, add a concrete detail where something is vague, cut filler.\n\nTEXT:\n${md}`, maxTokens: 2400, temperature: 0.85, cfg, budgetMs: 50000 - (Date.now() - t0) });
      const better = cleanText(r.text, brief.language);
      if (better.length > md.length * 0.75 && aiScan(better).total <= scan.total) { md = better; polished = true; }
    } catch { /* keep the cleaned first draft */ }
  }
  return NextResponse.json({ markdown: md, via: first.via, polished });
});
