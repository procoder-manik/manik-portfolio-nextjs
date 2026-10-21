import { NextResponse } from 'next/server';
import { adminRoute } from '@/lib/server-auth';
import { rateLimit } from '@/lib/ratelimit';
import { askAIx, parseJson, aiConfig } from '@/lib/ai';
import { cleanText } from '@/lib/humanize';
import { slugify } from '@/lib/utils';
import { BLOCK_DEFAULTS } from '@/lib/blocks';
import { WORK_TYPES } from '@/lib/project-ai-options';
import { siteContext, fieldPrompts, seoPrompts, blockPrompts, pagePrompts, caseStudyPrompts, AI_BLOCKS, SCHEMA_FIELDS } from '@/lib/ai-assist';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const line = (s) => cleanText(String(s ?? '')).replace(/\s*\n+\s*/g, ' ').trim();
const cutAt = (s, n) => { s = line(s); if (s.length <= n) return s; const t = s.slice(0, n); const end = Math.max(t.lastIndexOf('. '), t.lastIndexOf('! '), t.lastIndexOf('? ')); return end > n * 0.55 ? t.slice(0, end + 1) : `${t.slice(0, t.lastIndexOf(' ') > n * 0.6 ? t.lastIndexOf(' ') : n).replace(/[\s,;:.-]+$/, '')}.`; };
const cutTitle = (s, n) => { s = line(s).replace(/\.$/, ''); if (s.length <= n) return s; const t = s.slice(0, n); return t.slice(0, t.lastIndexOf(' ') > n * 0.6 ? t.lastIndexOf(' ') : n).replace(/[\s,;:.|-]+$/, '').replace(/\s+(and|or|the|a|an|to|of|for|with|in|on|at|by|&)$/i, ''); };
const list = (a, n = 8) => [...new Set((Array.isArray(a) ? a : String(a || '').split(',')).map((x) => line(x)).filter(Boolean))].slice(0, n);
const href = (h) => { const x = String(h || '').trim(); return /^(\/|#|https?:\/\/|mailto:|tel:)/.test(x) ? x : ''; };

/* Cleans every string in an object (AI words, long dashes), keeps the shape. */
const deep = (v, md = false) => (typeof v === 'string' ? (md ? cleanText(v) : line(v)) : Array.isArray(v) ? v.map((x) => deep(x, md)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, /href$/i.test(k) ? href(x) : deep(x, /content|body|results/.test(k) && typeof x === 'string' && x.includes('\n'))])) : v);

function normSeo(j = {}, seo = {}, want) {
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

async function ask(prompt, { json = true, maxTokens = 3000, temperature = 0.6 } = {}) {
  const cfg = await aiConfig();
  let last = '';
  for (let i = 0; i < 2; i++) {
    const r = await askAIx({ ...prompt, json, maxTokens, temperature, cfg, budgetMs: i ? 18000 : 38000 });
    if (!json) return { text: r.text, via: r.via };
    try { return { data: parseJson(r.text), via: r.via }; } catch (e) { last = e.message; }
  }
  throw Object.assign(new Error(`${last} Press the button again.`), { status: 502 });
}

/* POST { task: field | seo | block | page | caseStudy, ... } -> the written content, cleaned and ready to put in the form. */
export const POST = adminRoute(async (req, ctx, admin) => {
  if (!(await rateLimit(`ai-assist:${admin.email}`, 200, 3600))) throw new Error('Too many AI requests this hour. Try again later.');
  const b = await req.json();
  const site = await siteContext();

  if (b.task === 'field') {
    const r = await ask(fieldPrompts(b, site), { json: false, maxTokens: b.field?.type === 'markdown' ? 2200 : 700, temperature: 0.7 });
    let v = String(r.text || '').trim().replace(/^["'`]+|["'`]+$/g, '');
    if (b.field?.type === 'markdown') v = cleanText(v);
    else if (b.field?.type === 'textarea') v = cleanText(v).trim();
    else v = cutTitle(v.split('\n')[0], b.field?.max || 120);
    return NextResponse.json({ value: v, via: r.via });
  }

  if (b.task === 'seo') {
    const p = await seoPrompts(b, site);
    const r = await ask(p, { maxTokens: 1800 });
    return NextResponse.json({ seo: normSeo(r.data, site.seo, p.want), via: r.via });
  }

  if (b.task === 'block') {
    const r = await ask(blockPrompts(b, site), { maxTokens: 2400, temperature: 0.7 });
    const v = deep(r.data);
    if (Array.isArray(v.items)) v.items = v.items.filter((x) => x && Object.values(x).some(Boolean)).slice(0, 8);
    if (b.block?.type === 'faq' && v.items?.length) v.useSite = false;
    if (b.block?.type === 'richText' && r.data.content) v.content = cleanText(r.data.content);
    return NextResponse.json({ block: v, via: r.via });
  }

  if (b.task === 'page') {
    if (!b.builtin && String(b.topic || '').trim().length < 3) throw new Error('Say what the page is about.');
    const r = await ask(pagePrompts(b, site), { maxTokens: 5000, temperature: 0.7 });
    const j = r.data || {};
    if (b.builtin) return NextResponse.json({ parts: deep(j.parts || {}), seo: normSeo(j.seo || {}, site.seo), via: r.via });
    const blocks = (Array.isArray(j.blocks) ? j.blocks : []).filter((x) => x && AI_BLOCKS.includes(x.type)).slice(0, 9).map((x) => {
      const clean = deep(x); if (x.type === 'richText' && x.content) clean.content = cleanText(x.content);
      if (x.type === 'faq') clean.useSite = !(clean.items || []).length;
      return { ...(BLOCK_DEFAULTS[x.type] || {}), ...clean, type: x.type };
    });
    if (!blocks.length) throw Object.assign(new Error('The AI returned no sections. Press the button again.'), { status: 502 });
    return NextResponse.json({ title: line(j.title) || b.topic, slug: slugify(j.slug || j.title || b.topic).slice(0, 60), blocks, seo: normSeo(j.seo || {}, site.seo), via: r.via });
  }

  if (b.task === 'caseStudy') {
    if (String(b.client || '').trim().length < 2) throw new Error('Add the client or website name.');
    const r = await ask(await caseStudyPrompts(b, site), { maxTokens: 4500, temperature: 0.6 });
    const j = r.data || {};
    const nums = (String(b.results || '').match(/\d[\d.,]*/g) || []).map((n) => n.replace(/[.,]+$/, ''));
    const okNum = (m) => [m.value, m.before, m.after].filter(Boolean).every((x) => nums.some((n) => String(x).includes(n)));
    const tags = WORK_TYPES.filter((w) => (b.workTypes || []).includes(w.id)).map((w) => w.tag);
    const cs = {
      title: cutTitle(j.title, 90), client: line(j.client) || b.client, industry: line(b.industry || j.industry), location: line(j.location), summary: cutAt(j.summary, 260),
      ...(b.url ? { liveUrl: /^https?:\/\//.test(b.url) ? b.url : `https://${b.url}` } : {}), ...(b.project ? { project: b.project } : {}),
      duration: b.duration ? line(b.duration) : '', platform: line(j.platform), services: list([...tags, ...list(j.services, 4)], 5), technologies: list(j.technologies, 8),
      overview: cleanText(j.overview || ''), challengeIntro: line(j.challengeIntro), challenges: (j.challenges || []).filter((x) => x?.title).slice(0, 5).map((x) => ({ title: line(x.title), body: line(x.body) })),
      approachIntro: line(j.approachIntro), approach: (j.approach || []).filter((x) => x?.title).slice(0, 6).map((x) => ({ phase: line(x.phase), title: line(x.title), body: line(x.body) })),
      resultsIntro: line(j.resultsIntro), metrics: (j.metrics || []).filter((m) => m?.label && (m.value || m.after) && nums.length && okNum(m)).slice(0, 4).map((m) => ({ label: line(m.label), before: line(m.before), after: line(m.after), value: line(m.value) })),
      results: cleanText(j.results || ''), slug: slugify(j.title || b.client).slice(0, 60),
      ...normSeo(j.seo || {}, site.seo),
    };
    return NextResponse.json({ caseStudy: cs, via: r.via });
  }

  throw new Error('Unknown AI task.');
});
