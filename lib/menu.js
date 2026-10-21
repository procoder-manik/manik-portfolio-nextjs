import { samePath } from './system-pages';

/* Menus are kept in Admin > Header and footer (settings key "navigation").
   The page editor's "Menus" switches read and write that same list, so there is one source of truth. */
export function menuState(nav = {}, path) {
  const h = (nav.header || []).find((l) => samePath(l.href, path));
  let column = -1; let f = null;
  (nav.footerColumns || []).forEach((c, i) => { const x = (c.links || []).find((l) => samePath(l.href, path)); if (x && column < 0) { column = i; f = x; } });
  return { header: Boolean(h), headerLabel: h?.label || '', footer: column >= 0, footerLabel: f?.label || '', column: Math.max(0, column) };
}

/* Adds, renames or removes the page's link in the header menu and in one footer column. Positions of existing links are kept. */
export function applyMenu(nav = {}, paths, want = {}, title = '') {
  const path = paths; const primary = Array.isArray(paths) ? paths[0] : paths;
  const before = menuState(nav, path);
  let header = [...(nav.header || [])];
  const hLabel = String(want.headerLabel || '').trim() || before.headerLabel || title;
  const hi = header.findIndex((l) => samePath(l.href, path));
  if (want.header) { if (hi >= 0) header[hi] = { ...header[hi], label: hLabel }; else header.push({ label: hLabel, href: primary }); }
  else header = header.filter((l) => !samePath(l.href, path));

  let cols = (nav.footerColumns || []).map((c) => ({ ...c, links: [...(c.links || [])] }));
  const fLabel = String(want.footerLabel || '').trim() || before.footerLabel || title;
  if (want.footer) {
    if (!cols.length) cols = [{ title: 'Pages', links: [] }];
    const target = Math.min(Math.max(0, Number(want.column) || 0), cols.length - 1);
    cols = cols.map((c, i) => (i === target ? c : { ...c, links: c.links.filter((l) => !samePath(l.href, path)) }));
    const li = cols[target].links.findIndex((l) => samePath(l.href, path));
    if (li >= 0) cols[target].links[li] = { ...cols[target].links[li], label: fLabel }; else cols[target].links.push({ label: fLabel, href: primary });
  } else cols = cols.map((c) => ({ ...c, links: c.links.filter((l) => !samePath(l.href, path)) }));
  return { ...nav, header, footerColumns: cols };
}

/* Removes links to pages that are switched off, so a menu never points at a missing page. */
export function dropPaths(links = [], hidden = []) {
  return hidden.length ? links.filter((l) => !hidden.some((p) => samePath(l.href, p))) : links;
}
