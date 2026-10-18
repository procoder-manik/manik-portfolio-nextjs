import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Knowledge, ChatGap } from '@/lib/models';
import { adminRoute as guard } from '@/lib/server-auth';
import { getServicesWithPackages, getSettingsFresh } from '@/lib/data';
import { serialize } from '@/lib/utils';
import { aiConfig, aiReady } from '@/lib/ai';
import { KEYS } from '@/lib/chatbot';
const adminRoute = (h) => guard(h, 'content');

/* Overview for the AI IQ page: answers per group, questions the bot could not answer, and AI status. */
export const GET = adminRoute(async () => {
  const [services, cfg, ig] = await Promise.all([getServicesWithPackages(), aiConfig(), getSettingsFresh('integrations')]);
  const chat = ig.chat?.ai || {};
  const out = { groups: [], gaps: [], total: 0, services: services.map((s) => s.name), ai: { provider: cfg.provider || 'off', ready: aiReady(cfg.provider), key: KEYS[cfg.provider] || '', chatProvider: chat.provider || 'off', chatReady: aiReady(chat.provider), chatMode: ig.chat?.mode || 'builtin' } };
  if (!hasDB()) return NextResponse.json({ ...out, noDB: true });
  await dbConnect();
  const [agg, gaps] = await Promise.all([
    Knowledge.aggregate([{ $match: { trashedAt: null, active: true } }, { $group: { _id: '$category', n: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ChatGap.find({ resolved: false }).sort({ count: -1, lastAt: -1 }).limit(40).lean(),
  ]);
  out.groups = agg.map((g) => ({ name: g._id || 'General', n: g.n })); out.total = agg.reduce((a, g) => a + g.n, 0); out.gaps = serialize(gaps);
  return NextResponse.json(out);
});
