import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Page, Post, Project, CaseStudy, Category, ServiceArea, AreaCategory } from '@/lib/models';
import { adminRoute as guard } from '@/lib/server-auth';
import { getSettingsFresh, getPageSeoFresh } from '@/lib/data';
import { BUILTIN_PAGES } from '@/lib/admin-schema';
import { analyzeDoc } from '@/lib/seo-analysis';
import * as seed from '@/lib/seed-data';
const adminRoute = (h) => guard(h, 'seo');

/* One row per page on the site with its SEO health, so you can see and fix everything in one place. */
export const GET = adminRoute(async () => {
  const seo = await getSettingsFresh('seo'); const tpl = seo.titleTemplate || '%s';
  const rows = [];
  const add = (kind, edit, path, doc, titleFrom, descFrom, live = true) => {
    const a = analyzeDoc(doc, { path, titleFrom, descFrom, template: tpl, contentAware: kind !== 'Built-in' });
    const title = String(doc.seoTitle || '').trim() || (doc[titleFrom] ? tpl.replace('%s', doc[titleFrom]) : '');
    const desc = String(doc.seoDescription || '').trim() || (descFrom ? doc[descFrom] || '' : '');
    rows.push({ kind, edit, path, title: doc[titleFrom] || doc.name || path, metaTitle: title, metaDesc: desc, keyword: doc.focusKeyword || '', noindex: !!doc.seoNoindex, nofollow: !!doc.robots?.nofollow, canonical: doc.canonical || '', schema: doc.schemaMarkup?.type || 'auto', sitemap: !(doc.sitemap?.exclude || doc.seoNoindex) && live, live, score: a.score, tone: a.tone, words: a.words, missing: a.checks.filter((c) => c.status === 'bad').slice(0, 3).map((c) => c.label) });
  };
  for (const b of BUILTIN_PAGES) add('Built-in', `/admin/settings/seo-${b.key}`, b.path, { name: b.label, ...(await getPageSeoFresh(b.key)) }, 'name');
  if (hasDB()) {
    await dbConnect();
    const live = { trashedAt: null };
    const [pages, posts, projects, cases, cats, sas, locs] = await Promise.all([Page.find(live).lean(), Post.find(live).lean(), Project.find(live).lean(), CaseStudy.find(live).lean(), Category.find(live).lean(), ServiceArea.find(live).lean(), AreaCategory.find(live).lean()]);
    pages.forEach((x) => add('Page', `/admin/pages/${x._id}`, `/${x.slug}`, x, 'title', undefined, x.published !== false));
    posts.forEach((x) => add('Post', `/admin/posts/${x._id}`, `/blog/${x.slug}`, x, 'title', 'excerpt', x.published !== false));
    projects.forEach((x) => add('Project', `/admin/projects/${x._id}`, `/portfolio/${x.slug}`, x, 'title', 'summary', x.published !== false));
    cases.forEach((x) => add('Case study', `/admin/case-studies/${x._id}`, `/case-studies/${x.slug}`, x, 'title', 'summary', x.published !== false));
    sas.forEach((x) => add('Service area', `/admin/service-areas/${x._id}`, `/service-areas/${x.slug}`, x, 'title', 'summary', x.published !== false));
    locs.forEach((x) => add('Place', `/admin/area-categories/${x._id}`, `/service-areas/${x.slug}`, x, 'name', 'summary', x.published !== false));
    cats.forEach((x) => add('Category', `/admin/categories/${x._id}`, `/blog/category/${x.slug}`, x, 'name', 'description'));
  } else {
    seed.pages.forEach((x) => add('Page', '/admin/pages', `/${x.slug}`, x, 'title'));
    seed.posts.forEach((x) => add('Post', '/admin/posts', `/blog/${x.slug}`, x, 'title', 'excerpt'));
    seed.projects.forEach((x) => add('Project', '/admin/projects', `/portfolio/${x.slug}`, x, 'title', 'summary'));
  }
  const dupKw = {}; rows.forEach((r) => { if (r.keyword) (dupKw[r.keyword.toLowerCase()] ||= []).push(r.path); });
  rows.forEach((r) => { r.dupKeyword = r.keyword && dupKw[r.keyword.toLowerCase()].length > 1; });
  return NextResponse.json({ rows, siteNoindex: !!seo.noindex });
});
