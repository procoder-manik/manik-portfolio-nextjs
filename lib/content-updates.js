import { Setting, Knowledge } from './models';
import * as seed from './seed-data';

/* Adds the extra knowledge-base answers and applies the safe answer updates to a live database.
   Never overwrites text you edited: an answer is replaced only while it still equals the old starter text.
   Returns a short report. Used by the admin "Add starter content" button and by npm run seed. */
export async function applyContentUpdates() {
  const report = { knowledgeAdded: 0, answersUpdated: 0, faqAdded: 0, faqUpdated: 0, kept: [] };
  for (const r of seed.knowledgeMore || []) report.knowledgeAdded += (await Knowledge.updateOne({ question: r.question }, { $setOnInsert: r }, { upsert: true })).upsertedCount;
  for (const u of seed.answerUpdates || []) {
    if (!u.to) continue;
    const doc = await Knowledge.findOne({ question: u.question }).lean();
    if (!doc) continue;
    if (doc.answer === u.to) continue;
    if ((u.from || []).includes(doc.answer)) { await Knowledge.updateOne({ _id: doc._id }, { answer: u.to }); report.answersUpdated += 1; }
    else report.kept.push(`Answer "${u.question}" kept: you edited it.`);
  }
  const home = await Setting.findOne({ key: 'home' }).lean();
  if (home?.data) {
    const items = [...(home.data.faq?.items || [])]; let changed = false;
    for (const a of seed.homeFaqUpdates.add) if (!items.some((x) => x.q === a.q)) { items.push(a); report.faqAdded += 1; changed = true; }
    for (const r of seed.homeFaqUpdates.replace) {
      const i = items.findIndex((x) => x.q === r.q);
      if (i >= 0 && items[i].a !== r.to) { if (r.from.includes(items[i].a)) { items[i] = { ...items[i], a: r.to }; report.faqUpdated += 1; changed = true; } else report.kept.push(`Home FAQ "${r.q}" kept: you edited it.`); }
    }
    if (changed) await Setting.updateOne({ key: 'home' }, { $set: { 'data.faq.items': items } });
  }
  // Footer: a Help center link next to FAQ (once, and only if there is no link to /help yet).
  const site = await Setting.findOne({ key: 'site' }).lean();
  const cols = site?.data?.footerColumns;
  if (Array.isArray(cols) && !cols.some((c) => (c.links || []).some((l) => l.href === '/help'))) {
    const i = cols.findIndex((c) => (c.links || []).some((l) => l.href === '/faq'));
    if (i >= 0) { const next = cols.map((c, k) => (k === i ? { ...c, links: [...c.links, { label: 'Help center', href: '/help' }] } : c)); await Setting.updateOne({ key: 'site' }, { $set: { 'data.footerColumns': next } }); report.footerLink = true; }
  }
  return report;
}
