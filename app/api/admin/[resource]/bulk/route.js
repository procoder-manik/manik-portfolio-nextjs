import { NextResponse } from 'next/server';
import { refreshContent } from '@/lib/revalidate';
import { dbConnect, hasDB } from '@/lib/db';
import { MODELS } from '@/lib/models';
import { adminRoute } from '@/lib/server-auth';
import { RESOURCE_AREA } from '@/lib/roles';
import { TRASHABLE } from '@/lib/trash';
import { trashUpdate, restoreUpdate, draftUpdate } from '@/lib/trash-server';

/* POST { action: trash | restore | draft | publish | delete | empty, ids: [] } */
export const POST = adminRoute(async (req, { params }) => {
  const M = MODELS[params.resource]; if (!M) throw new Error('Unknown section.');
  if (!hasDB()) throw Object.assign(new Error('Connect MongoDB (set MONGODB_URI) to save changes.'), { status: 503 });
  await dbConnect();
  const { action, ids = [] } = await req.json().catch(() => ({}));
  if (action === 'empty') {
    const r = await M.deleteMany({ trashedAt: { $ne: null } });
    refreshContent();
    return NextResponse.json({ ok: true, count: r.deletedCount });
  }
  if (!Array.isArray(ids) || !ids.length) throw new Error('Select at least one item.');
  const docs = await M.find({ _id: { $in: ids.slice(0, 500) } }).lean();
  let n = 0;
  for (const d of docs) {
    let set = null;
    if (action === 'trash' && TRASHABLE.includes(params.resource)) set = trashUpdate(params.resource, d);
    else if (action === 'restore') set = restoreUpdate(params.resource, d);
    else if (action === 'draft') set = draftUpdate(params.resource);
    else if (action === 'publish') { const s = draftUpdate(params.resource); if (s) set = Object.fromEntries(Object.entries(s).map(([k, v]) => [k, !v])); }
    else if (action === 'delete') { if (!d.trashedAt && TRASHABLE.includes(params.resource)) continue; await M.deleteOne({ _id: d._id }); n++; continue; }
    if (set) { await M.updateOne({ _id: d._id }, set); n++; }
  }
  refreshContent();
  return NextResponse.json({ ok: true, count: n });
}, (p) => RESOURCE_AREA[p.resource] || 'system');
