import 'server-only';
import { Page, Setting } from './models';
import { SYSTEM_PAGES, SYSTEM_BY_KEY, defaultBlocks, pagePath, pagePaths } from './system-pages';
import { refreshContent } from './revalidate';
import { headers } from 'next/headers';

/* The host the admin is open on (your live domain), so menu links written with the full domain still match. */
export async function ownHostsNow() { try { const h = await headers(); return [h.get('x-forwarded-host'), h.get('host')].filter(Boolean); } catch { return []; } }
import { menuState, applyMenu } from './menu';
import { getSettingsFresh, getPageSeoFresh } from './data';
import { isCaseStudyLink } from './features';

/* SEO fields of a built-in page live in the settings key seo-<key> (read by the page, the sitemap and the schema).
   The page editor shows and saves them there, so the old Page SEO screens and this editor always agree. */
export const SEO_FIELDS = ['seoTitle', 'seoDescription', 'seoImage', 'seoNoindex', 'focusKeyword', 'keywords', 'ogTitle', 'ogDescription', 'twitterCard', 'canonical', 'robots', 'sitemap', 'breadcrumbTitle', 'schemaMarkup', 'code'];

/* Creates the missing built-in page records. Safe when two requests run at once (upsert), and never breaks the Pages list. */
export async function ensureSystemPages() {
  try {
    const have = await Page.find({ builtin: { $nin: [null, ''] } }).select('builtin').lean();
    const missing = SYSTEM_PAGES.filter((d) => !have.some((h) => h.builtin === d.key));
    if (!missing.length) return 0;
    const [home, site, nav] = await Promise.all([getSettingsFresh('home'), getSettingsFresh('site'), getSettingsFresh('navigation')]);
    let created = 0; let navOut = nav;
    for (const d of missing) {
      try {
        // Never take over a page you made yourself with the same address.
        const clash = await Page.findOne({ slug: d.slug, builtin: { $in: [null, ''] } }).select('_id').lean();
        const slug = clash ? `${d.slug}-builtin` : d.slug;
        const r = await Page.updateOne({ builtin: d.key }, { $setOnInsert: { title: d.title, slug, builtin: d.key, published: true, blocks: defaultBlocks(d.key, home) } }, { upsert: true });
        if (!r.upsertedCount) continue;
        created += 1;
      } catch (e) { if (e.code !== 11000) console.error(`[pages] could not create the built-in page "${d.key}":`, e.message); continue; }
      // Case studies used to be added to the menus automatically. Keep that link once, as a normal link you can remove.
      if (d.key === 'caseStudies' && site.features?.caseStudies && site.features?.caseStudiesInMenu !== false) {
        const paths = pagePaths({ builtin: 'caseStudies' });
        if (!(navOut.header || []).some((l) => isCaseStudyLink(l.href))) {
          const header = [...(navOut.header || [])]; const at = header.findIndex((l) => /portfolio|#work/.test(l.href || ''));
          header.splice(at + 1, 0, { label: 'Case studies', href: paths[0] });
          navOut = { ...navOut, header };
        }
        const cols = (navOut.footerColumns || []).map((c) => ({ ...c, links: [...(c.links || [])] }));
        if (cols[0] && !cols.some((c) => c.links.some((l) => isCaseStudyLink(l.href)))) { const li = cols[0].links.findIndex((l) => /portfolio/.test(l.href || '')); cols[0].links.splice(li + 1, 0, { label: 'Case studies', href: paths[0] }); navOut = { ...navOut, footerColumns: cols }; }
      }
    }
    if (navOut !== nav) await saveNav(navOut);
    if (created) refreshContent();
    return created;
  } catch (e) { console.error('[pages] built-in pages check failed:', e.message); return 0; }
}

export async function saveNav(nav) {
  await Setting.findOneAndUpdate({ key: 'navigation' }, { key: 'navigation', data: nav }, { upsert: true });
}

/* Adds the menu state and (for built-in pages) the SEO from settings to a page for the editor. */
export async function decoratePage(item) {
  const nav = await getSettingsFresh('navigation');
  const out = { ...item, menu: menuState(nav, pagePaths(item), await ownHostsNow()) };
  if (item.builtin) {
    const seo = await getPageSeoFresh(item.builtin).catch(() => ({}));
    for (const k of SEO_FIELDS) if (seo[k] !== undefined) out[k] = seo[k];
    out.path = pagePath(item);
  }
  return out;
}

/* Before saving a page: writes its menu choices into Header and footer, and (built-in) its SEO into settings.
   Returns the body that is safe to store on the page. */
export async function prepareSave(body, prev) {
  const b = { ...body }; const builtin = prev?.builtin || '';
  delete b.builtin; delete b.path;
  if (builtin) {
    b.slug = prev.slug; // a built-in page keeps its address
    if (builtin === 'home') b.published = true;
    const seoIn = Object.fromEntries(SEO_FIELDS.filter((k) => k in b).map((k) => [k, b[k]]));
    SEO_FIELDS.forEach((k) => delete b[k]);
    if (Object.keys(seoIn).length) {
      const cur = await getPageSeoFresh(builtin);
      await Setting.findOneAndUpdate({ key: `seo-${builtin}` }, { key: `seo-${builtin}`, data: { ...cur, ...seoIn } }, { upsert: true });
    }
  }
  if (b.menu && typeof b.menu === 'object') {
    const path = pagePaths({ builtin, slug: b.slug || prev?.slug });
    const nav = await getSettingsFresh('navigation');
    await saveNav(applyMenu(nav, path, b.menu, b.title || prev?.title || '', await ownHostsNow()));
    b.showInHeader = Boolean(b.menu.header); b.showInFooter = Boolean(b.menu.footer);
  }
  delete b.menu;
  return b;
}

/* When a custom page changes its address, move its menu links along with it. */
export async function moveMenuLinks(oldPath, newPath) {
  if (oldPath === newPath) return;
  const nav = await getSettingsFresh('navigation');
  const fix = (l) => (l.href && l.href.replace(/\/+$/, '').toLowerCase() === oldPath.toLowerCase() ? { ...l, href: newPath } : l);
  await saveNav({ ...nav, header: (nav.header || []).map(fix), footerColumns: (nav.footerColumns || []).map((c) => ({ ...c, links: (c.links || []).map(fix) })) });
}

export const isSystem = (doc) => Boolean(doc?.builtin && SYSTEM_BY_KEY[doc.builtin]);
export const systemError = (what) => Object.assign(new Error(`Built-in pages cannot be ${what}. Switch "Published" off to hide the page and its menu links instead.`), { status: 400 });
