import { NextResponse } from 'next/server';
import { refreshContent } from '@/lib/revalidate';
import { dbConnect, hasDB } from '@/lib/db';
import { Setting } from '@/lib/models';
import { adminRoute } from '@/lib/server-auth';
import { getSettingsFresh as getSettings } from '@/lib/data';
import { SETTINGS } from '@/lib/admin-schema';

export const GET = adminRoute(async (req, { params }) => {
  if (!SETTINGS[params.key]) throw new Error('Unknown settings group.');
  return NextResponse.json({ item: await getSettings(params.key), readOnly: !hasDB() });
});

export const PUT = adminRoute(async (req, { params }) => {
  if (!SETTINGS[params.key]) throw new Error('Unknown settings group.');
  if (!hasDB()) throw Object.assign(new Error('Connect MongoDB (set MONGODB_URI) to save changes.'), { status: 503 });
  await dbConnect();
  const data = await req.json();
  await Setting.findOneAndUpdate({ key: params.key }, { key: params.key, data }, { upsert: true });
  refreshContent();
  return NextResponse.json({ item: await getSettings(params.key) });
});
