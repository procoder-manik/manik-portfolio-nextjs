import { Landing, Setting } from './models';
import { landings } from './seed-landings';

/* Adds the starter landing page (Kotha) to a live database once. After that it is yours: edit or delete it in Admin > Landing pages
   and it is not added back. Runs the first time an admin list loads after an update. */
let checked = false;
export async function ensureLandings() {
  if (checked) return; checked = true;
  try {
    const mark = await Setting.findOne({ key: 'migrations' }).lean();
    if (mark?.data?.landingsV3) return;
    for (const r of landings) {
      const had = await Landing.findOne({ slug: r.slug }).lean();
      if (!had) { await Landing.updateOne({ slug: r.slug }, { $setOnInsert: r }, { upsert: true }); continue; }
      // The page exists from an earlier version: add only the fields it does not have yet (new hero demo, strip, labels), never overwrite.
      const fill = Object.fromEntries(Object.entries(r).filter(([k, v]) => had[k] === undefined && v !== undefined));
      if (Object.keys(fill).length) await Landing.updateOne({ _id: had._id }, { $set: fill });
      // Real release file names, and the two Mac downloads, for a page saved before they were known. Anything you changed by hand is left alone.
      const fixed = (had.downloads || []).map((d) => ({ ...d, url: String(d.url || '').replace('/Kotha-Setup-Offline.exe', '/Kotha-Windows-Offline-Setup.exe').replace('/Kotha-Setup.exe', '/Kotha-Windows-Setup.exe') }));
      const macs = r.downloads.filter((d) => d.platform === 'mac');
      const noMac = !fixed.some((d) => d.platform === 'mac' && d.url);
      const next = noMac ? [...fixed.filter((d) => d.platform !== 'mac'), ...macs] : fixed;
      if (JSON.stringify(next) !== JSON.stringify(had.downloads || [])) await Landing.updateOne({ _id: had._id }, { $set: { downloads: next } });
    }
    await Setting.findOneAndUpdate({ key: 'migrations' }, { $set: { key: 'migrations', 'data.landingsV1': new Date().toISOString(), 'data.landingsV2': new Date().toISOString(), 'data.landingsV3': new Date().toISOString() } }, { upsert: true });
    const { refreshContent } = await import('./revalidate'); refreshContent();
  } catch (e) { checked = false; console.error('[landings] starter page check failed:', e.message); }
}
