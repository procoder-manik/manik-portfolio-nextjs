import { slugify } from './utils';

/* Turns the taught answers into Help center articles and topics. Pure functions: safe to use on the server and in the browser. */
const ICON_BY_WORD = [['seo', 'Search'], ['website', 'Globe'], ['design', 'Globe'], ['automation', 'Workflow'], ['crm', 'Workflow'], ['maintenance', 'Wrench'], ['speed', 'Gauge'], ['security', 'ShieldCheck'], ['payment', 'CreditCard'], ['billing', 'CreditCard'], ['plan', 'CreditCard'], ['about', 'User'], ['hosting', 'Server'], ['domain', 'Server']];
export const topicIcon = (name = '') => { const n = name.toLowerCase(); return (ICON_BY_WORD.find(([w]) => n.includes(w)) || [null, 'HelpCircle'])[1]; };

export function buildHelp(knowledge = []) {
  const used = new Set(); const articles = [];
  knowledge.filter((x) => x && x.active !== false && x.showInHelp !== false && x.question && x.answer).forEach((x) => {
    let slug = slugify(x.slug || x.question).slice(0, 80) || 'answer'; const base = slug; let n = 1;
    while (used.has(slug)) { n += 1; slug = `${base}-${n}`; }
    used.add(slug);
    articles.push({ slug, question: x.question, answer: x.answer, body: x.body || '', topic: x.category || 'General', topicSlug: slugify(x.category || 'General') || 'general', keywords: x.keywords || [], order: x.order || 0, updatedAt: x.updatedAt });
  });
  const topics = []; const idx = {};
  articles.forEach((a) => { if (!(a.topicSlug in idx)) { idx[a.topicSlug] = topics.length; topics.push({ slug: a.topicSlug, name: a.topic, icon: topicIcon(a.topic), articles: [] }); } topics[idx[a.topicSlug]].articles.push(a); });
  topics.forEach((t) => t.articles.sort((a, b) => a.order - b.order));
  return { articles, topics, bySlug: Object.fromEntries(articles.map((a) => [a.slug, a])) };
}

/* Short plain snippet for search results and cards. */
export const snippet = (t = '', n = 150) => { const s = String(t).replace(/\s+/g, ' ').trim(); return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s; };
