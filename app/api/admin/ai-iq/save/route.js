import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Knowledge, ChatGap } from '@/lib/models';
import { adminRoute as guard } from '@/lib/server-auth';
import { refreshContent } from '@/lib/revalidate';
const adminRoute = (h) => guard(h, 'content');

/* POST { items: [{ question, answer, category, keywords, source }], resolveGap? } saves taught answers, skipping questions that already exist. */
export const POST = adminRoute(async (req) => {
  await dbConnect();
  const { items = [], resolveGap } = await req.json();
  let added = 0;
  for (const it of items.slice(0, 50)) {
    const question = String(it.question || '').trim().slice(0, 300); const answer = String(it.answer || '').trim().slice(0, 3000);
    if (!question || !answer) continue;
    const r = await Knowledge.updateOne({ question }, { $setOnInsert: { question, answer, category: String(it.category || 'General').slice(0, 80), keywords: (it.keywords || []).slice(0, 10), source: it.source || 'manual', active: true, showOnFaq: it.showOnFaq !== false } }, { upsert: true });
    added += r.upsertedCount;
  }
  if (resolveGap) await ChatGap.updateOne({ _id: resolveGap }, { resolved: true });
  refreshContent();
  return NextResponse.json({ ok: true, added });
});
