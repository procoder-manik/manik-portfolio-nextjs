import 'server-only';
import { STATUS } from './trash';
import { slugify } from './utils';

const DROP = ['_id', '__v', 'createdAt', 'updatedAt', 'trashedAt', 'trashState', 'emails', 'replies'];

async function free(M, field, base, sep = '-') {
  let v = base; let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await M.exists({ [field]: v })) { n += 1; v = `${base}${sep}${n}`; }
  return v;
}

/* Builds a copy of one document: new title and slug, switched off so it is not live until you check it,
   counters at zero, nothing that must stay unique repeated. */
export async function buildCopy(resource, M, doc, conf) {
  const copy = { ...doc };
  DROP.forEach((k) => delete copy[k]);
  const tf = conf?.slugFrom;
  if (tf && copy[tf]) copy[tf] = `${copy[tf]} (copy)`;
  if (M.schema.path('slug')) copy.slug = await free(M, 'slug', slugify(`${doc.slug || doc[tf] || resource}-copy`));
  if (resource === 'coupons') { copy.code = await free(M, 'code', `${doc.code}-COPY`); copy.usesCount = 0; copy.assignedTo = undefined; copy.source = 'admin'; }
  if (resource === 'forms') { copy.entries = 0; copy.views = 0; }
  if (resource === 'popups') copy.stats = { views: 0, clicks: 0, conversions: 0 };
  if (resource === 'knowledge' && copy.question) copy.question = `${copy.question} (copy)`;
  if (copy.seo && typeof copy.seo === 'object') { delete copy.seo.canonical; }
  delete copy.canonical;
  const s = STATUS[resource];
  if (s) copy[s.field] = s.invert ? true : false; // starts as a draft
  if (typeof copy.order === 'number') copy.order += 1;
  return copy;
}
