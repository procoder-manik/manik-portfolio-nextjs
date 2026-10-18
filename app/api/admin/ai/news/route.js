import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { getSettingsFresh } from '@/lib/data';
import { fetchNews } from '@/lib/rss';
const adminRoute = (h) => guard(h, 'blog');
export const maxDuration = 30;
export const GET = adminRoute(async () => {
  const w = await getSettingsFresh('aiwriter');
  const feeds = (w.feeds || []).filter((f) => /^https?:\/\//.test(f.url || ''));
  return NextResponse.json({ items: await fetchNews(feeds), feeds: feeds.length });
});
