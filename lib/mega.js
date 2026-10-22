/* Mega menus: turns the saved config on a header link into what the header draws.
   Server-side (it can read places and landing pages), returns plain data. */
export const MEGA_LAYOUTS = ['icons', 'featured', 'columns', 'areas'];
const s = (v, n = 160) => String(v ?? '').trim().slice(0, n);
const num = (v, d, lo, hi) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : d; };
const href = (h) => { const x = s(h, 300); return x || '#'; };

export const needsAreas = (links = []) => links.some((l) => l?.mega?.enabled && l.mega.layout === 'areas');

export function resolveMega(links = [], { areas = [], pages = [] } = {}) {
  return links.map((l) => {
    const { mega: m, ...rest } = l || {};
    if (!m || !m.enabled) return rest;
    const layout = MEGA_LAYOUTS.includes(m.layout) ? m.layout : 'icons';
    const f = m.featured || {};
    const featured = f.show && (f.title || f.image) ? { label: s(f.label, 40), title: s(f.title, 90), text: s(f.text, 200), image: s(f.image, 400), linkLabel: s(f.linkLabel, 40) || 'Learn more', href: href(f.href), accent: /^#[0-9a-f]{6}$/i.test(f.accent || '') ? f.accent : '' } : null;
    const bottom = (m.bottom?.show !== false ? (m.bottom?.links || []) : []).filter((b) => b?.label).slice(0, 4).map((b) => ({ label: s(b.label, 40), href: href(b.href), icon: s(b.icon, 40) }));
    let columns = [];
    if (layout === 'areas') {
      const a = m.areas || {}; const count = num(a.count, 4, 1, 6); const per = num(a.perColumn, 5, 1, 10);
      const byArea = new Map();
      for (const p of pages) { if (!p.area) continue; if (!byArea.has(p.area)) byArea.set(p.area, []); byArea.get(p.area).push(p); }
      columns = areas.filter((x) => byArea.has(x.slug)).slice(0, count).map((x) => {
        const list = byArea.get(x.slug);
        const items = list.slice(0, per).map((p) => ({ label: s(p.niche || p.title, 70), desc: s(p.niche ? p.title : '', 90), href: `/service-areas/${p.slug}`, icon: 'ArrowUpRight' }));
        if (list.length > per) items.push({ label: `All ${x.name} pages`, href: `/service-areas/${x.slug}`, more: true });
        return { title: `${x.flag ? `${x.flag} ` : ''}${x.name}`, href: `/service-areas/${x.slug}`, items };
      });
      if (!bottom.length) bottom.push({ label: s(a.allLabel, 40) || 'All locations', href: s(a.allHref, 200) || '/service-areas', icon: 'MapPin' });
    } else {
      columns = (m.columns || []).slice(0, 4).map((c) => ({ title: s(c?.title, 50), items: (c?.items || []).filter((i) => i?.label).slice(0, 8).map((i) => ({ label: s(i.label, 70), desc: s(i.desc, 120), href: href(i.href), icon: s(i.icon, 40), badge: s(i.badge, 16) })) })).filter((c) => c.items.length);
    }
    if (!columns.length && !featured) return rest;
    return { ...rest, mega: { layout, columns, featured, bottom, intro: s(m.intro, 120) } };
  });
}
