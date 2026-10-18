/* Fills MongoDB with the starter content. Safe to run more than once:
   existing items (matched by slug or key) are left alone unless you pass --fresh. */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import mongoose from 'mongoose';
import * as seed from '../lib/seed-data.js';
import { applyContentUpdates } from '../lib/content-updates.js';
import { Project, Post, Category, Service, Package, Page, Setting, App, CaseStudy, Form, Popup, Knowledge } from '../lib/models/index.js';

const fresh = process.argv.includes('--fresh');
if (!process.env.MONGODB_URI) { console.error('Set MONGODB_URI in .env first.'); process.exit(1); }
await mongoose.connect(process.env.MONGODB_URI);

const sets = [[Project, seed.projects], [Post, seed.posts], [Category, seed.categories], [Service, seed.services], [Package, seed.packages], [Page, seed.pages], [App, seed.apps], [CaseStudy, seed.caseStudies], [Form, seed.forms], [Popup, seed.popups]];
for (const [M, rows] of sets) {
  if (fresh) await M.deleteMany({});
  let added = 0;
  for (const r of rows) { const res = await M.updateOne({ slug: r.slug }, { $setOnInsert: r }, { upsert: true }); added += res.upsertedCount; }
  console.log(`${M.modelName}: ${added} added`);
}
if (fresh) await Knowledge.deleteMany({});
let kn = 0;
for (const r of seed.knowledge || []) kn += (await Knowledge.updateOne({ question: r.question }, { $setOnInsert: r }, { upsert: true })).upsertedCount;
console.log(`Knowledge: ${kn} added`);
console.log('Content updates:', JSON.stringify(await applyContentUpdates()));
for (const [key, data] of Object.entries(seed.settings)) {
  if (fresh) await Setting.deleteOne({ key });
  const res = await Setting.updateOne({ key }, { $setOnInsert: { key, data } }, { upsert: true });
  console.log(`Settings "${key}": ${res.upsertedCount ? 'added' : 'kept existing'}`);
}
await mongoose.disconnect();
console.log('Done. Sign in at /admin with ADMIN_EMAIL and ADMIN_PASSWORD.');
