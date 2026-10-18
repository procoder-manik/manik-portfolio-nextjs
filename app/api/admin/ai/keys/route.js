import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { keyStatus, saveKey, applySecrets, KEY_NAMES } from '@/lib/secrets';
import { askAIx, MODELS, aiReady } from '@/lib/ai';
const adminRoute = (h) => guard(h, 'system'); // administrators only
export const maxDuration = 30;

const PROVIDER = { GEMINI_API_KEY: 'gemini', GROQ_API_KEY: 'groq', OPENROUTER_API_KEY: 'openrouter', OPENAI_API_KEY: 'openai', ANTHROPIC_API_KEY: 'claude' };

export const GET = adminRoute(async () => NextResponse.json({ keys: await keyStatus() }));

/* PUT { name, value }  saves (empty value removes the saved key)
   POST { name }        sends one tiny request to check that the key works */
export const PUT = adminRoute(async (req) => {
  const { name, value } = await req.json();
  await saveKey(name, value);
  return NextResponse.json({ keys: await keyStatus() });
});

export const POST = adminRoute(async (req) => {
  const { name } = await req.json();
  if (!KEY_NAMES.includes(name)) throw new Error('Unknown key.');
  await applySecrets();
  const p = PROVIDER[name];
  if (!p) return NextResponse.json({ ok: true, message: 'Saved. Semrush is only used for optional paid keyword data.' });
  if (!aiReady(p)) throw new Error('No key saved for this provider yet.');
  try {
    const r = await askAIx({ system: 'Reply with the single word OK.', user: 'Say OK.', maxTokens: 12, temperature: 0, cfg: { chain: [p], models: { [p]: MODELS[p] } }, budgetMs: 22000 });
    return NextResponse.json({ ok: true, message: `Works. Answered by ${r.via}.` });
  } catch (e) { return NextResponse.json({ ok: false, message: e.message, details: e.attempts || [] }); }
});
