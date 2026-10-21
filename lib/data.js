import 'server-only';
import { unstable_cache } from 'next/cache';
import { dbConnect, hasDB } from './db';
import { Project, Post, Category, Service, Package, Page, Setting, App, CaseStudy, Form, Popup, Redirect, Knowledge } from './models';
import { publicForm } from './forms';
import { PAYMENT_METHODS } from './options';
import * as seed from './seed-data';
import { serialize, deepMerge } from './utils';
import { pagePath } from './system-pages';

export const SETTING_KEYS = ['site', 'home', 'resume', 'payments', 'integrations', 'navigation', 'email', 'referrals', 'seo', 'announcement', 'popups', 'aiwriter'];

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);
const byDate = (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt);
const withId = (arr) => arr.map((x, i) => ({ _id: x._id || `seed-${x.slug || i}`, ...x }));

async function q(fn, fallback) {
  if (!hasDB()) return fallback();
  try { await dbConnect(); return serialize(await fn()); }
  catch (e) { logOnce(e.message); return fallback(); }
}

/* The same database error would otherwise be printed for every setting on every page. Print it once a minute. */
const seen = new Map();
function logOnce(msg) { const now = Date.now(); if (now - (seen.get(msg) || 0) > 60000) { seen.set(msg, now); console.error('[data]', msg, '(showing built-in content until the database answers)'); } }

async function _getSettings(key) {
  const def = seed.settings[key] || {};
  const saved = await q(() => Setting.findOne({ key }).lean(), () => null);
  if (key === 'seo') {
    // Older sites kept the title template, keywords and site-wide noindex under integrations.seo.
    const legacy = (await q(() => Setting.findOne({ key: 'integrations' }).lean(), () => null))?.data?.seo || {};
    const keep = Object.fromEntries(['titleTemplate', 'keywords', 'noindex'].filter((k) => legacy[k] !== undefined && legacy[k] !== '').map((k) => [k, legacy[k]]));
    return deepMerge(deepMerge(def, keep), saved?.data || {});
  }
  return deepMerge(def, saved?.data || {});
}

/* SEO of a built-in page (home, portfolio, blog...). Older values in integrations.pages and site are the starting point. */
async function _getPageSeo(key) {
  const [own, ig, site] = await Promise.all([
    q(() => Setting.findOne({ key: `seo-${key}` }).lean(), () => null),
    q(() => Setting.findOne({ key: 'integrations' }).lean(), () => null),
    key === 'home' ? _getSettings('site') : null,
  ]);
  const legacy = key === 'home' ? { seoTitle: site?.seoTitle, seoDescription: site?.seoDescription } : ig?.data?.pages?.[key] || seed.settings.integrations?.pages?.[key] || {};
  return deepMerge(legacy, own?.data || {});
}

async function _getAllSettings() {
  const vals = await Promise.all(SETTING_KEYS.map(_getSettings));
  return Object.fromEntries(SETTING_KEYS.map((k, i) => [k, vals[i]]));
}

async function _getProjects({ featured, limit } = {}) {
  return q(async () => {
    const f = { published: true }; if (featured) f.featured = true;
    let c = Project.find(f).sort({ order: 1, createdAt: -1 }); if (limit) c = c.limit(limit);
    return c.lean();
  }, () => {
    let a = withId(seed.projects).filter((p) => p.published && (!featured || p.featured)).sort(byOrder);
    return limit ? a.slice(0, limit) : a;
  });
}

async function _getProject(slug) {
  return q(() => Project.findOne({ slug, published: true }).lean(), () => withId(seed.projects).find((p) => p.slug === slug) || null);
}

async function _getPosts({ category, kind, limit, exclude } = {}) {
  return q(async () => {
    const f = { published: true }; if (category) f.category = category; if (kind) f.kind = kind; if (exclude) f.slug = { $ne: exclude };
    let c = Post.find(f).sort({ publishedAt: -1 }); if (limit) c = c.limit(limit);
    return c.lean();
  }, () => {
    let a = withId(seed.posts).filter((p) => (!category || p.category === category) && (!kind || p.kind === kind) && p.slug !== exclude).sort(byDate);
    return limit ? a.slice(0, limit) : a;
  });
}

async function _getPost(slug) {
  return q(() => Post.findOne({ slug, published: true }).lean(), () => withId(seed.posts).find((p) => p.slug === slug) || null);
}

async function _getCategories() {
  return q(() => Category.find({ trashedAt: null }).sort({ order: 1, name: 1 }).lean(), () => withId(seed.categories));
}

async function _getServicesWithPackages() {
  return q(async () => {
    const [svc, pk] = await Promise.all([Service.find({ active: true }).sort({ order: 1 }).lean(), Package.find({ active: true }).sort({ order: 1 }).lean()]);
    return svc.map((s) => ({ ...s, packages: pk.filter((p) => p.service === s.slug) }));
  }, () => withId(seed.services).sort(byOrder).map((s) => ({ ...s, packages: withId(seed.packages).filter((p) => p.service === s.slug).sort(byOrder) })));
}

async function _getPackage(slug) {
  return q(() => Package.findOne({ slug, active: true }).lean(), () => withId(seed.packages).find((p) => p.slug === slug) || null);
}

async function _getPage(slug) {
  return q(() => Page.findOne({ slug, published: true, builtin: { $in: [null, ''] }, trashedAt: null }).lean(), () => withId(seed.pages).find((p) => p.slug === slug) || null);
}

async function _getAllPages() {
  return q(() => Page.find({ published: true, builtin: { $in: [null, ''] }, trashedAt: null }).select('title slug seoNoindex sitemap robots updatedAt').lean(), () => seed.pages.filter((p) => p.published !== false));
}

async function _getFooterPages() {
  return q(() => Page.find({ published: true, showInFooter: true }).select('title slug').lean(), () => seed.pages.filter((p) => p.showInFooter));
}

async function _getApps({ featured, footer, limit } = {}) {
  return q(async () => {
    const f = { published: true }; if (featured) f.featured = true; if (footer) f.showInFooter = true;
    let c = App.find(f).sort({ order: 1, createdAt: -1 }); if (limit) c = c.limit(limit);
    return c.lean();
  }, () => {
    const a = withId(seed.apps || []).filter((x) => x.published !== false && (!featured || x.featured) && (!footer || x.showInFooter !== false)).sort(byOrder);
    return limit ? a.slice(0, limit) : a;
  });
}

async function _getCaseStudies({ featured, limit, exclude } = {}) {
  return q(async () => {
    const f = { published: true }; if (featured) f.featured = true; if (exclude) f.slug = { $ne: exclude };
    let c = CaseStudy.find(f).sort({ order: 1, publishedAt: -1 }); if (limit) c = c.limit(limit);
    return c.lean();
  }, () => {
    const a = withId(seed.caseStudies || []).filter((x) => x.published !== false && (!featured || x.featured) && x.slug !== exclude).sort(byOrder);
    return limit ? a.slice(0, limit) : a;
  });
}

async function _getCaseStudy(slug) {
  return q(() => CaseStudy.findOne({ slug, published: true }).lean(), () => withId(seed.caseStudies || []).find((x) => x.slug === slug) || null);
}

async function _getNavPages() {
  return q(() => Page.find({ published: true, builtin: { $in: [null, ''] }, trashedAt: null, $or: [{ showInHeader: true }, { showInFooter: true }] }).select('title slug showInHeader showInFooter').lean(),
    () => seed.pages.filter((p) => p.showInFooter || p.showInHeader));
}

/* Built-in pages saved in Admin > Pages (layout, on or off). null when not created yet: the page then uses its starting layout. */
async function _getSystemPages() {
  return q(() => Page.find({ builtin: { $nin: [null, ''] } }).select('builtin title published trashedAt blocks updatedAt').lean(), () => []);
}
/* Addresses of pages that are switched off or in the Trash: their menu links are hidden. */
async function _getHiddenPaths() {
  return q(async () => {
    const off = await Page.find({ $or: [{ published: false }, { trashedAt: { $ne: null } }] }).select('builtin slug').lean();
    return off.filter((p) => p.builtin !== 'home').map((p) => pagePath(p));
  }, () => []);
}

const enabledMethods = (pay) => PAYMENT_METHODS.filter((m) => pay?.[m.id]?.enabled).map((m) => ({ id: m.id, name: m.name, color: m.color, kind: m.kind }));

/* A builder form, safe to send to the browser (no notification emails or private settings). */
async function _getForm(slug) {
  if (!slug) return null;
  const [f, pay] = await Promise.all([
    q(() => Form.findOne({ slug, trashedAt: null }).lean(), () => (seed.forms || []).find((x) => x.slug === slug) || null),
    _getSettings('payments'),
  ]);
  return f ? publicForm(f, enabledMethods(pay)) : null;
}

/* Live popups for the public site. Only what the browser needs. */
async function _getPopups() {
  return q(() => Popup.find({ active: true, trashedAt: null }).sort({ priority: -1, createdAt: -1 }).select('-stats -__v').lean(), () => []);
}

/* Redirect rules in a compact shape for the middleware. */
async function _getRedirectRules() {
  return q(async () => (await Redirect.find({ active: true, trashedAt: null }).select('from to code match keepQuery').lean())
    .map((r) => ({ f: r.from, t: r.to, c: r.code, m: r.match, q: r.keepQuery !== false, i: String(r._id) }))
    .sort((a, b) => (a.m === 'exact' ? 0 : a.m === 'prefix' ? 1 : 2) - (b.m === 'exact' ? 0 : b.m === 'prefix' ? 1 : 2)), () => []);
}

/* Answers taught to the chatbot (AI IQ). Also the source of the /faq page. */
async function _getKnowledge() {
  return q(() => Knowledge.find({ active: true, trashedAt: null }).sort({ category: 1, order: 1, createdAt: 1 }).select('question answer category keywords showOnFaq showInHelp slug body order').lean(), () => withId(seed.knowledgeAll || seed.knowledge || []).filter((x) => x.active !== false));
}

/* Every public read is cached and tagged "content". Admin saves call revalidateTag('content'),
   so pages are served from cache and refresh the moment something changes. */
const cache = (fn, name) => unstable_cache(fn, [name, process.env.CONTENT_BUILD_ID || 'dev'], { tags: ['content'], revalidate: 600 });
export const getSettings = cache(_getSettings, 'getSettings');
export const getAllSettings = cache(_getAllSettings, 'getAllSettings');
export const getProjects = cache(_getProjects, 'getProjects');
export const getProject = cache(_getProject, 'getProject');
export const getPosts = cache(_getPosts, 'getPosts');
export const getPost = cache(_getPost, 'getPost');
export const getCategories = cache(_getCategories, 'getCategories');
export const getServicesWithPackages = cache(_getServicesWithPackages, 'getServicesWithPackages');
export const getPackage = cache(_getPackage, 'getPackage');
export const getPage = cache(_getPage, 'getPage');
export const getFooterPages = cache(_getFooterPages, 'getFooterPages');
export const getAllPages = cache(_getAllPages, 'getAllPages');
export const getApps = cache(_getApps, 'getApps');
export const getCaseStudies = cache(_getCaseStudies, 'getCaseStudies');
export const getCaseStudy = cache(_getCaseStudy, 'getCaseStudy');
export const getNavPages = cache(_getNavPages, 'getNavPages');
export const getSystemPages = cache(_getSystemPages, 'getSystemPages');
export const getHiddenPaths = cache(_getHiddenPaths, 'getHiddenPaths');
export async function getSystemPage(key) { return (await getSystemPages()).find((p) => p.builtin === key) || null; }
export const getKnowledge = cache(_getKnowledge, 'getKnowledge');
export const getPageSeo = cache(_getPageSeo, 'getPageSeo');
export const getForm = cache(_getForm, 'getForm');
export const getPopups = cache(_getPopups, 'getPopups');
export const getRedirectRules = cache(_getRedirectRules, 'getRedirectRules');
export const getSettingsFresh = _getSettings;
export const getPageSeoFresh = _getPageSeo;
export const getFormFresh = _getForm;
