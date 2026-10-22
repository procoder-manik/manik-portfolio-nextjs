import 'server-only';
import { dbConnect } from './db';
import { Project, Post, Category, Service, Package, Page, Setting, App, CaseStudy, Form, Popup, Knowledge, AreaCategory, ServiceArea } from './models';
import * as seed from './seed-data';
import { applyContentUpdates } from './content-updates';

/* Adds the starter content. Never overwrites anything that already exists. */
export async function runSeed() {
  await dbConnect();
  const report = {};
  const sets = { projects: [Project, seed.projects], posts: [Post, seed.posts], categories: [Category, seed.categories], services: [Service, seed.services], packages: [Package, seed.packages], pages: [Page, seed.pages], apps: [App, seed.apps], areaCategories: [AreaCategory, seed.areaCategories || []], serviceAreas: [ServiceArea, seed.serviceAreas || []], caseStudies: [CaseStudy, seed.caseStudies], forms: [Form, seed.forms], popups: [Popup, seed.popups] };
  for (const [k, [M, rows]] of Object.entries(sets)) {
    let n = 0;
    for (const r of rows) n += (await M.updateOne({ slug: r.slug }, { $setOnInsert: r }, { upsert: true })).upsertedCount;
    report[k] = n;
  }
  // Taught answers have no slug, so they are matched by question.
  let kn = 0;
  for (const r of seed.knowledge || []) kn += (await Knowledge.updateOne({ question: r.question }, { $setOnInsert: r }, { upsert: true })).upsertedCount;
  report.knowledge = kn;
  report.contentUpdates = await applyContentUpdates();
  for (const [key, data] of Object.entries(seed.settings)) {
    report[`settings.${key}`] = (await Setting.updateOne({ key }, { $setOnInsert: { key, data } }, { upsert: true })).upsertedCount;
  }
  return report;
}
