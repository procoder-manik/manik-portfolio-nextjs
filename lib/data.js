import 'server-only';
import { unstable_cache } from 'next/cache';
import { dbConnect, hasDB } from './db';
import { Project, Post, Category, Service, Package, Page, Setting, App, CaseStudy } from './models';
import * as seed from './seed-data';
import { serialize, deepMerge } from './utils';

export const SETTING_KEYS = ['site', 'home', 'resume', 'payments', 'integrations', 'navigation', 'email', 'referrals'];

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);
const byDate = (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt);
const withId = (arr) => arr.map((x, i) => ({ _id: x._id || `seed-${x.slug || i}`, ...x }));

async function q(fn, fallback) {
  if (!hasDB()) return fallback();
  try { await dbConnect(); return serialize(await fn()); }
  catch (e) { console.error('[data]', e.message); return fallback(); }
}

async function _getSettings(key) {
  const def = seed.settings[key] || {};
  const saved = await q(() => Setting.findOne({ key }).lean(), () => null);
  return deepMerge(def, saved?.data || {});
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
  return q(() => Category.find().sort({ order: 1, name: 1 }).lean(), () => withId(seed.categories));
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
  return q(() => Page.findOne({ slug, published: true }).lean(), () => withId(seed.pages).find((p) => p.slug === slug) || null);
}

async function _getAllPages() {
  return q(() => Page.find({ published: true }).select('title slug seoNoindex updatedAt').lean(), () => seed.pages.filter((p) => p.published !== false));
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
  return q(() => Page.find({ published: true, $or: [{ showInHeader: true }, { showInFooter: true }] }).select('title slug showInHeader showInFooter').lean(),
    () => seed.pages.filter((p) => p.showInFooter || p.showInHeader));
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
export const getSettingsFresh = _getSettings;
