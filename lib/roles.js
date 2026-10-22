/* Admin user roles. Each admin area belongs to one permission group; a role lists the groups it can use.
   Shared by the API (enforcement) and the sidebar (what to show). */

export const ROLES = {
  administrator: { label: 'Administrator', desc: 'Everything, including users, payments, integrations and custom code.' },
  editor: { label: 'Editor', desc: 'All content, pages, SEO, forms, popups, redirects, menus and the home page. No payments, users or custom code.' },
  shop: { label: 'Shop manager', desc: 'Orders, customers, coupons, affiliates, packages, messages, CRM and form entries.' },
  author: { label: 'Author', desc: 'Blog posts, categories and the media library only.' },
};

const GROUPS = {
  administrator: ['*'],
  editor: ['blog', 'content', 'media', 'marketing', 'seo', 'design', 'entries'],
  shop: ['shop', 'media', 'entries'],
  author: ['blog', 'media'],
};

/* Generic CRUD resources (/api/admin/<resource>) */
export const RESOURCE_AREA = {
  posts: 'blog', categories: 'blog',
  projects: 'content', pages: 'content', 'case-studies': 'content', 'service-areas': 'content', 'area-categories': 'content', apps: 'content',
  services: 'shop', packages: 'shop', orders: 'shop', customers: 'shop', coupons: 'shop', contacts: 'shop', messages: 'shop',
  media: 'media',
  forms: 'marketing', popups: 'marketing', redirects: 'marketing', knowledge: 'content',
};

/* Settings groups (/api/admin/settings/<key>) */
export function settingsArea(key = '') {
  if (key.startsWith('seo')) return 'seo';
  return {
    home: 'design', resume: 'design', navigation: 'design', site: 'design',
    announcement: 'marketing', popups: 'marketing', aiwriter: 'blog',
    payments: 'system', integrations: 'system', email: 'system', referrals: 'shop',
  }[key] || 'system';
}

export const roleOf = (r) => (ROLES[r] ? r : 'administrator');

export function can(role, area) {
  if (!area) return true;
  const g = GROUPS[roleOf(role)] || [];
  return g.includes('*') || g.includes(area);
}

/* Sidebar link -> area, so each role only sees what it can open. */
export function areaForPath(href = '') {
  const m = href.match(/^\/admin\/([^/?#]+)(?:\/([^/?#]+))?/);
  if (!m) return null;
  const [, a, b] = m;
  if (a === 'settings') return settingsArea(b);
  if (RESOURCE_AREA[a]) return RESOURCE_AREA[a];
  return {
    users: 'system', affiliates: 'shop', crm: 'shop', orders: 'shop', messages: 'shop', 'seo-overview': 'seo', 'not-found-log': 'marketing', forms: 'marketing', 'ai-writer': 'blog', 'ai-news': 'blog', 'ai-iq': 'content',
  }[a] || null;
}
