import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { ruleReply, aiReply } from '@/lib/chatbot';
import { getSettings, getKnowledge } from '@/lib/data';
import { matchTaught } from '@/lib/chatbot';
import { dbConnect, hasDB } from '@/lib/db';
import { ChatGap } from '@/lib/models';

export async function POST(req) {
  if (!(await rateLimit(`chat:${await clientIp()}`, 30, 600))) return NextResponse.json({ reply: 'You are sending messages very fast. Try again in a few minutes, or email me directly.' }, { status: 429 });
  const { history = [] } = await req.json().catch(() => ({}));
  const last = history.filter((m) => m.role === 'user').at(-1)?.text || '';
  if (!last.trim()) return NextResponse.json({ reply: 'Ask me anything about services, prices or timelines.' });
  const chat = (await getSettings('integrations')).chat || {};
  // Remember questions with no taught answer, so you can teach the bot (Admin > AI IQ).
  if (hasDB() && last.trim().length > 6) {
    try {
      const taught = await getKnowledge();
      if (!matchTaught(last, taught, 1)[0]) { await dbConnect(); await ChatGap.updateOne({ question: last.trim().slice(0, 300).toLowerCase() }, { $inc: { count: 1 }, $set: { lastAt: new Date() }, $setOnInsert: { resolved: false } }, { upsert: true }); }
    } catch {}
  }
  const ai = await aiReply(history.filter((m) => m.text).slice(-10), chat.ai);
  return NextResponse.json(ai || (await ruleReply(last.slice(0, 500))));
}
