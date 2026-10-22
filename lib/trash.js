/* Draft and Trash rules for each admin list. Shared by the API and the admin UI.
   field: the switch that decides if an item is live. invert: true when "on" means hidden (customers.disabled). */
export const STATUS = {
  projects: { field: 'published' }, posts: { field: 'published' }, pages: { field: 'published' }, 'case-studies': { field: 'published' }, 'service-areas': { field: 'published' }, 'area-categories': { field: 'published' }, apps: { field: 'published' },
  services: { field: 'active' }, packages: { field: 'active' }, coupons: { field: 'active' },
  forms: { field: 'active' }, knowledge: { field: 'active' }, popups: { field: 'active' }, redirects: { field: 'active' },
  customers: { field: 'disabled', invert: true },
};

/* Lists that have a Trash (everything that goes through the generic list). */
export const TRASHABLE = ['projects', 'posts', 'categories', 'pages', 'case-studies', 'service-areas', 'area-categories', 'apps', 'services', 'packages', 'coupons', 'customers', 'contacts', 'forms', 'popups', 'redirects', 'knowledge'];

export const isLive = (resource, doc) => {
  const s = STATUS[resource]; if (!s) return true;
  return s.invert ? !doc?.[s.field] : doc?.[s.field] !== false;
};

/* Public address of an item, used for redirects when a slug changes. */
export const PUBLIC_PATH = {
  projects: (s) => `/portfolio/${s}`, posts: (s) => `/blog/${s}`, pages: (s) => `/${s}`,
  'case-studies': (s) => `/case-studies/${s}`, 'service-areas': (s) => `/service-areas/${s}`, 'area-categories': (s) => `/service-areas/${s}`, categories: (s) => `/blog/category/${s}`,
};

/* Lists that get a Duplicate button (not customers, contacts or orders: those are real people and real payments). */
export const DUPLICABLE = ['projects', 'posts', 'categories', 'pages', 'case-studies', 'service-areas', 'area-categories', 'apps', 'services', 'packages', 'coupons', 'forms', 'popups', 'redirects', 'knowledge'];

/* Lists whose Quick Edit also shows the Index / Noindex switch (they have the seoNoindex field). */
export const NOINDEXABLE = ['projects', 'posts', 'pages', 'case-studies', 'categories', 'service-areas', 'area-categories'];
