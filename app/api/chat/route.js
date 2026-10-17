import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { ruleReply, aiReply } from '@/lib/chatbot';
import { getSettings } from '@/lib/data';

export async function POST(req) {
  if (!(await rateLimit(`chat:${await clientIp()}`, 30, 600))) return NextResponse.json({ reply: 'You are sending messages very fast. Try again in a few minutes, or email me directly.' }, { status: 429 });
  const { history = [] } = await req.json().catch(() => ({}));
  const last = history.filter((m) => m.role === 'user').at(-1)?.text || '';
  if (!last.trim()) return NextResponse.json({ reply: 'Ask me anything about services, prices or timelines.' });
  const chat = (await getSettings('integrations')).chat || {};
  const ai = await aiReply(history.filter((m) => m.text).slice(-10), chat.ai);
  return NextResponse.json(ai || (await ruleReply(last.slice(0, 500))));
}
