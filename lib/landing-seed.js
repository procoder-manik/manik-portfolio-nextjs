import { Landing, Setting } from './models';
import { landings } from './seed-landings';

/* Adds the starter landing page (Kotha) to a live database once. After that it is yours: edit or delete it in Admin > Landing pages
   and it is not added back. Runs the first time an admin list loads after an update. */
let checked = false;
export async function ensureLandings() {
  if (checked) return; checked = true;
  try {
    const mark = await Setting.findOne({ key: 'migrations' }).lean();
    if (mark?.data?.landingsV2) return;
    for (const r of landings) {
      const had = await Landing.findOne({ slug: r.slug }).lean();
      if (!had) { await Landing.updateOne({ slug: r.slug }, { $setOnInsert: r }, { upsert: true }); continue; }
      // The page exists from an earlier version: add only the fields it does not have yet (new hero demo, strip, labels), never overwrite.
      const fill = Object.fromEntries(Object.entries(r).filter(([k, v]) => had[k] === undefined && v !== undefined));
      if (Object.keys(fill).length) await Landing.updateOne({ _id: had._id }, { $set: fill });
    }
    await Setting.findOneAndUpdate({ key: 'migrations' }, { $set: { key: 'migrations', 'data.landingsV1': new Date().toISOString(), 'data.landingsV2': new Date().toISOString() } }, { upsert: true });
    const { refreshContent } = await import('./revalidate'); refreshContent();
  } catch (e) { checked = false; console.error('[landings] starter page check failed:', e.message); }
}
