import 'server-only';
import { STATUS } from './trash';
import { getSettingsFresh } from './data';

/* Moves one document to the Trash: remembers its live switch, then hides it from the site. */
export function trashUpdate(resource, doc) {
  const s = STATUS[resource];
  const set = { trashedAt: new Date(), trashState: s ? { [s.field]: doc?.[s.field] } : {} };
  if (s) set[s.field] = s.invert ? true : false;
  return set;
}

/* Puts it back exactly as it was before it was trashed. */
export function restoreUpdate(resource, doc) {
  const s = STATUS[resource];
  const set = { trashedAt: null, trashState: null };
  if (s && doc?.trashState && s.field in doc.trashState) set[s.field] = doc.trashState[s.field];
  return set;
}

export function draftUpdate(resource) {
  const s = STATUS[resource]; if (!s) return null;
  return { [s.field]: s.invert ? true : false };
}

/* Items older than the limit in Site and contact > Features are removed for good. 0 keeps them forever. */
export async function purgeOld(M) {
  try {
    const site = await getSettingsFresh('site');
    const days = Number(site.features?.trashDays ?? 30);
    if (!days || days < 1) return;
    await M.deleteMany({ trashedAt: { $ne: null, $lt: new Date(Date.now() - days * 86400000) } });
  } catch (e) { console.error('[trash purge]', e.message); }
}
