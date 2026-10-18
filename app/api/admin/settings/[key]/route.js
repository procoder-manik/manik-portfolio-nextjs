import { NextResponse } from 'next/server';
import { refreshContent } from '@/lib/revalidate';
import { dbConnect, hasDB } from '@/lib/db';
import { Setting } from '@/lib/models';
import { adminRoute } from '@/lib/server-auth';
import { getSettingsFresh, getPageSeoFresh } from '@/lib/data';
import { SETTINGS } from '@/lib/admin-schema';
import { settingsArea } from '@/lib/roles';

const area = (p) => settingsArea(p.key);
const isPageSeo = (k) => /^seo-[a-zA-Z]+$/.test(k);

export const GET = adminRoute(async (req, { params }) => {
  if (!SETTINGS[params.key]) throw new Error('Unknown settings group.');
  const item = isPageSeo(params.key) ? await getPageSeoFresh(params.key.slice(4)) : await getSettingsFresh(params.key);
  return NextResponse.json({ item, readOnly: !hasDB() });
}, area);

export const PUT = adminRoute(async (req, { params }) => {
  if (!SETTINGS[params.key]) throw new Error('Unknown settings group.');
  if (!hasDB()) throw Object.assign(new Error('Connect MongoDB (set MONGODB_URI) to save changes.'), { status: 503 });
  await dbConnect();
  const data = await req.json();
  await Setting.findOneAndUpdate({ key: params.key }, { key: params.key, data }, { upsert: true });
  refreshContent();
  const item = isPageSeo(params.key) ? await getPageSeoFresh(params.key.slice(4)) : await getSettingsFresh(params.key);
  return NextResponse.json({ item });
}, area);
