import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { aiConfig, ALL_KEYS, FREE, PAID, LABEL, SIGNUP } from '@/lib/ai';
const adminRoute = (h) => guard(h, 'blog');

/* Which AI keys exist on the server (never the keys themselves). */
export const GET = adminRoute(async () => {
  const cfg = await aiConfig();
  const keys = Object.fromEntries([...FREE, ...PAID].map((p) => [p, Boolean(process.env[ALL_KEYS[p]])]));
  const usable = cfg.chain.filter((p) => keys[p]);
  return NextResponse.json({ keys, usable: usable.map((p) => LABEL[p]), ready: usable.length > 0, provider: cfg.provider, signup: SIGNUP, semrush: Boolean(process.env.SEMRUSH_API_KEY) });
});
