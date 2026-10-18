import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { askAIx, aiConfig } from '@/lib/ai';
import { WRITING_RULES, WRITING_RULES_BN, aiScan, cleanText } from '@/lib/humanize';
const adminRoute = (h) => guard(h, 'blog');
export const maxDuration = 60;

/* Rewrites one section: more human, or with missing keywords and terms worked in. Keeps the meaning, headings and links. */
export const POST = adminRoute(async (req) => {
  const { text = '', mode = 'humanize', primary = '', secondary = [], terms = [], language = 'English' } = await req.json();
  if (text.length < 40) throw new Error('Nothing to rewrite.');
  const cfg = await aiConfig();
  const flagged = aiScan(text).hits.slice(0, 14).map((h) => h.phrase).join(', ');
  const job = mode === 'seo'
    ? `Work these into the text naturally where they fit, without stuffing and without changing facts: ${[...secondary, ...terms].slice(0, 12).join(', ')}. The primary keyword is "${primary}".`
    : `Make it read like a skilled human wrote it. Fix these AI-sounding items if present: ${flagged || 'stock phrases, even rhythm'}. Vary sentence length, add a concrete detail where something is vague, cut filler.`;
  const bn = /bengali|bangla|বাংলা/i.test(language);
  const system = `You are a senior editor.\n${bn ? WRITING_RULES_BN : WRITING_RULES}\nOutput only the revised Markdown. Keep every heading line, list, table, link and image exactly as is unless a change is required by the task. Do not shorten the section by more than 10 percent. Language: ${language}.`;
  const r = await askAIx({ system, user: `Task: ${job}\n\nTEXT:\n${text}`, maxTokens: 2800, temperature: 0.85, cfg, budgetMs: 50000 });
  return NextResponse.json({ markdown: cleanText(r.text, language), via: r.via });
});
