import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { ruleReply, aiReply, matchTaught, knowledge } from '@/lib/chatbot';
import { getSettingsFresh } from '@/lib/data';
const adminRoute = (h) => guard(h, 'content');
export const maxDuration = 60;

/* Asks the bot a question exactly like a visitor would, and shows which taught answers matched. */
export const POST = adminRoute(async (req) => {
  const { question = '' } = await req.json();
  const q = String(question).trim().slice(0, 400); if (!q) throw new Error('Type a question.');
  const [k, ig] = await Promise.all([knowledge(), getSettingsFresh('integrations')]);
  const matches = matchTaught(q, k.taught, 3).map((m) => ({ question: m.t.question, category: m.t.category, score: Math.round(m.sc * 10) / 10 }));
  const ai = await aiReply([{ role: 'user', text: q }], ig.chat?.ai);
  if (ai) return NextResponse.json({ source: 'ai', reply: ai.reply, matches });
  const r = await ruleReply(q);
  return NextResponse.json({ source: r.taught ? 'taught' : 'rules', reply: r.reply, matches });
});
