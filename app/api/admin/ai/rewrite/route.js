import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { askAI, aiConfig } from '@/lib/ai';
import { WRITING_RULES, aiScan } from '@/lib/humanize';
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
  const system = `You are a senior editor.\n${WRITING_RULES}\nOutput only the revised Markdown. Keep every heading line, list, table, link and image exactly as is unless a change is required by the task. Do not shorten the section by more than 10 percent. Language: ${language}.`;
  let md = await askAI({ system, user: `Task: ${job}\n\nTEXT:\n${text}`, maxTokens: 2600, temperature: 0.8, cfg });
  md = md.replace(/^```(?:markdown|md)?\s*/i, '').replace(/\s*```$/i, '').replace(/[\u2014\u2013]/g, ',').trim();
  return NextResponse.json({ markdown: md });
});
