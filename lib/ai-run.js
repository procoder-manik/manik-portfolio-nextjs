import 'server-only';
import { askAIx, parseJson, aiConfig } from './ai';
import { cleanText } from './humanize';
import { SCHEMA_FIELDS } from './ai-assist';

/* Shared by the AI assist routes: text cleaners, SEO result cleaning and one AI call that retries once. */
export const line = (s) => cleanText(String(s ?? '')).replace(/\s*\n+\s*/g, ' ').trim();
export const cutAt = (s, n) => { s = line(s); if (s.length <= n) return s; const t = s.slice(0, n); const end = Math.max(t.lastIndexOf('. '), t.lastIndexOf('! '), t.lastIndexOf('? ')); return end > n * 0.55 ? t.slice(0, end + 1) : `${t.slice(0, t.lastIndexOf(' ') > n * 0.6 ? t.lastIndexOf(' ') : n).replace(/[\s,;:.-]+$/, '')}.`; };
export const cutTitle = (s, n) => { s = line(s).replace(/\.$/, ''); if (s.length <= n) return s; const t = s.slice(0, n); return t.slice(0, t.lastIndexOf(' ') > n * 0.6 ? t.lastIndexOf(' ') : n).replace(/[\s,;:.|-]+$/, '').replace(/\s+(and|or|the|a|an|to|of|for|with|in|on|at|by|&)$/i, ''); };
export const list = (a, n = 8) => [...new Set((Array.isArray(a) ? a : String(a || '').split(',')).map((x) => line(x)).filter(Boolean))].slice(0, n);
export const href = (h) => { const x = String(h || '').trim(); return /^(\/|#|https?:\/\/|mailto:|tel:)/.test(x) ? x : ''; };

/* Cleans every string in an object (AI words, long dashes), keeps the shape. */
export const deep = (v, md = false) => (typeof v === 'string' ? (md ? cleanText(v) : line(v)) : Array.isArray(v) ? v.map((x) => deep(x, md)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, /href$/i.test(k) ? href(x) : deep(x, /content|body|results/.test(k) && typeof x === 'string' && x.includes('\n'))])) : v);

export function normSeo(j = {}, seo = {}, want) {
  const tpl = String(seo.titleTemplate || '%s').includes('%s') ? String(seo.titleTemplate) : '%s';
  const room = 62 - (tpl.length - 2);
  const out = {};
  const has = (k) => !want || want.includes(k);
  if (has('focusKeyword') && j.focusKeyword) out.focusKeyword = line(j.focusKeyword).toLowerCase().replace(/\.$/, '').slice(0, 60);
  if (has('keywords') && j.keywords) out.keywords = list(j.keywords, 6).map((k) => k.toLowerCase().replace(/\.$/, ''));
  if (has('seoTitle') && j.seoTitle) { let raw = line(j.seoTitle); const suf = tpl.replace('%s', '').trim(); if (suf && raw.toLowerCase().endsWith(suf.toLowerCase())) raw = raw.slice(0, -suf.length).replace(/[\s|:-]+$/, ''); const base = cutTitle(raw, room >= 30 ? room : 60); out.seoTitle = room >= 30 ? tpl.replace('%s', base) : base; }
  if (has('seoDescription') && j.seoDescription) out.seoDescription = cutAt(j.seoDescription, 160);
  if (has('ogTitle') && j.ogTitle) out.ogTitle = cutTitle(j.ogTitle, 70);
  if (has('ogDescription') && j.ogDescription) out.ogDescription = cutAt(j.ogDescription, 125);
  if (has('breadcrumbTitle') && j.breadcrumbTitle) out.breadcrumbTitle = cutTitle(j.breadcrumbTitle, 30);
  if (has('schema') && j.schema?.type) {
    const type = String(j.schema.type);
    const sm = { type };
    for (const k of SCHEMA_FIELDS[type] || []) {
      if (k === 'faq') sm.faq = (j.schema.faq || []).filter((x) => x?.q && x?.a).slice(0, 8).map((x) => ({ q: line(x.q), a: line(x.a) }));
      else if (k === 'steps') sm.steps = (j.schema.steps || []).filter((x) => x?.name).slice(0, 10).map((x) => ({ name: line(x.name), text: line(x.text) }));
      else if (j.schema[k]) sm[k] = k === 'description' ? cutAt(j.schema[k], 200) : line(j.schema[k]);
    }
    if (['WebPage', 'AboutPage', 'ContactPage', 'CollectionPage', 'Article', 'BlogPosting', 'auto'].includes(type) || SCHEMA_FIELDS[type]) out.schemaMarkup = sm;
  }
  return out;
}

export async function ask(prompt, { json = true, maxTokens = 3000, temperature = 0.6 } = {}) {
  const cfg = await aiConfig();
  let last = '';
  for (let i = 0; i < 2; i++) {
    const r = await askAIx({ ...prompt, json, maxTokens, temperature, cfg, budgetMs: i ? 18000 : 38000 });
    if (!json) return { text: r.text, via: r.via };
    try { return { data: parseJson(r.text), via: r.via }; } catch (e) { last = e.message; }
  }
  throw Object.assign(new Error(`${last} Press the button again.`), { status: 502 });
}

