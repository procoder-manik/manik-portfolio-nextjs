import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { rateLimit } from '@/lib/ratelimit';
import { askAIx, parseJson, aiConfig } from '@/lib/ai';
import { writePrompts } from '@/lib/project-ai';
import { WORK_TYPES } from '@/lib/project-ai-options';
import { cleanText } from '@/lib/humanize';
import { getSettingsFresh } from '@/lib/data';
import { dbConnect, hasDB } from '@/lib/db';
import { Project, Service } from '@/lib/models';
import { slugify } from '@/lib/utils';
import { CMS_OPTIONS } from '@/lib/options';
const adminRoute = (h) => guard(h, 'content');
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const line = (s) => cleanText(String(s || '')).replace(/\s*\n+\s*/g, ' ').trim();
const list = (a, n = 8) => [...new Set((Array.isArray(a) ? a : String(a || '').split(',')).map((x) => line(x)).filter(Boolean))].slice(0, n);
// Shortens text to n characters: at the end of a sentence when possible, else at a word.
const cut = (s, n) => {
  s = line(s); if (s.length <= n) return s;
  const t = s.slice(0, n); const end = Math.max(t.lastIndexOf('. '), t.lastIndexOf('! '), t.lastIndexOf('? '));
  if (end > n * 0.55) return t.slice(0, end + 1);
  return `${t.slice(0, t.lastIndexOf(' ') > n * 0.6 ? t.lastIndexOf(' ') : n).replace(/[\s,;:.-]+$/, '').replace(/\s+(and|or|the|a|an|to|of|for|with|how|in|on|it)$/i, '')}.`;
};
const cutTitle = (s, n) => { s = line(s).replace(/\.$/, ''); if (s.length <= n) return s; const t = s.slice(0, n); return t.slice(0, t.lastIndexOf(' ') > n * 0.6 ? t.lastIndexOf(' ') : n).replace(/[\s,;:.|-]+$/, '').replace(/\s+(and|or|the|a|an|to|of|for|with|in|on|at|by|&)$/i, ''); };

/* Step 3: writes the project (story, summary, deliverables, tags, meta title and description). */
export const POST = adminRoute(async (req, ctx, admin) => {
  if (!(await rateLimit(`aiproj-write:${admin.email}`, 60, 3600))) throw new Error('Too many projects written this hour. Try again later.');
  const b = await req.json();
  b.name = String(b.name || '').trim();
  if (b.name.length < 2) throw new Error('Add the website name.');
  if (!Array.isArray(b.workTypes) || !b.workTypes.length) throw new Error('Pick at least one kind of work.');
  const [site, seo, cfg] = await Promise.all([getSettingsFresh('site'), getSettingsFresh('seo'), aiConfig()]);
  let examples = []; let services = [];
  if (hasDB()) {
    try {
      await dbConnect();
      [examples, services] = await Promise.all([
        Project.find({ trashedAt: null, published: true, summary: { $nin: ['', null] }, ...(b.id ? { _id: { $ne: b.id } } : {}) }).sort({ order: 1 }).limit(3).select('title summary').lean(),
        Service.find({ trashedAt: null, active: { $ne: false } }).select('name').limit(30).lean(),
      ]);
    } catch { /* write without examples */ }
  }
  const { system, user } = writePrompts(b, { site, seo, brand: cfg.settings?.brandVoice, facts: b.facts, visual: b.visual, examples, services: services.map((s) => s.name) });
  let j; let via; let last = '';
  for (let i = 0; i < 2 && !j; i++) {
    const r = await askAIx({ system, user, json: true, maxTokens: 4000, temperature: 0.6, cfg, budgetMs: i ? 20000 : 36000 });
    via = r.via;
    try { j = parseJson(r.text); if (!j.summary || !j.content) { last = 'The answer was incomplete.'; j = null; } } catch (e) { last = e.message; j = null; }
  }
  if (!j) throw Object.assign(new Error(`${last} Press the button again.`), { status: 502 });

  const tags = WORK_TYPES.filter((w) => b.workTypes.includes(w.id)).map((w) => w.tag);
  const detected = b.facts?.platform || {};
  const pickCms = (v) => CMS_OPTIONS.find((c) => c.toLowerCase() === String(v || '').toLowerCase()) || '';
  const userCustom = b.platform === 'custom';
  const cms = userCustom ? '' : pickCms(b.platform) || pickCms(detected.cms) || pickCms(j.cms);
  const platformType = userCustom ? 'custom' : cms ? 'cms' : detected.platformType || (j.platformType === 'custom' ? 'custom' : 'cms');
  // Results only when the number is in your own notes, so nothing is made up.
  const notesNums = (String(b.notes || '').match(/\d[\d.,]*/g) || []).map((n) => n.replace(/[.,]+$/, ''));
  const metrics = (Array.isArray(j.metrics) ? j.metrics : []).filter((m) => m?.value && m?.label && notesNums.some((n) => String(m.value).includes(n))).slice(0, 4).map((m) => ({ value: line(m.value).slice(0, 16), label: line(m.label).slice(0, 50) }));

  let slug = slugify(j.title || b.name).slice(0, 60) || slugify(b.name);
  if (hasDB()) { try { await dbConnect(); let n = 2; const base = slug; while (await Project.exists({ slug, ...(b.id ? { _id: { $ne: b.id } } : {}) })) slug = `${base}-${n++}`; } catch {} }

  // Meta title: keeps your brand part from SEO settings (for example "%s | Manik Hossain") when it fits in about 62 characters.
  const tpl = String(seo.titleTemplate || '%s').includes('%s') ? String(seo.titleTemplate) : '%s';
  const room = 62 - (tpl.length - 2);
  const baseTitle = cutTitle(j.metaTitle || `${b.name} website`, room >= 30 ? room : 60);
  const full = room >= 30 ? tpl.replace('%s', baseTitle) : baseTitle;
  const project = {
    title: line(j.title) || b.name, slug, client: line(b.client || j.client) || b.name, industry: line(b.industry || j.industry),
    liveUrl: b.facts?.url || (b.url ? (/^https?:\/\//i.test(b.url) ? b.url : `https://${b.url}`) : ''), summary: cut(j.summary, 220), content: cleanText(j.content),
    deliverables: list(j.deliverables, 6).map((d) => d.replace(/\.$/, '')), services: list([...tags, ...list(j.services, 4)], 5),
    technologies: list([...(detected.techs || []).filter((t) => !/analytics/i.test(t)), ...list(j.technologies, 8)], 8),
    platformType, cms: platformType === 'custom' ? '' : cms || 'WordPress', metrics, workStatus: b.status || 'completed',
    ...(b.startDate ? { startDate: b.startDate } : {}), ...(b.status === 'completed' && b.endDate ? { endDate: b.endDate } : {}),
    focusKeyword: line(j.focusKeyword).toLowerCase().replace(/\.$/, '').slice(0, 60), keywords: list(j.keywords, 6).map((k) => k.toLowerCase().replace(/\.$/, '')),
    seoTitle: full.length <= 62 ? full : baseTitle, seoDescription: cut(j.metaDescription, 160),
    ogTitle: cutTitle(j.ogTitle, 70), ogDescription: cut(j.ogDescription, 125), breadcrumbTitle: cutTitle(j.breadcrumbTitle, 30),
    imageAlt: cutTitle(b.visual?.altText || j.imageAlt, 125),
  };
  if (b.visual?.accent) project.accent = b.visual.accent;
  return NextResponse.json({ project, location: line(j.location), via });
});
