/* Draft and Trash rules for each admin list. Shared by the API and the admin UI.
   field: the switch that decides if an item is live. invert: true when "on" means hidden (customers.disabled). */
export const STATUS = {
  projects: { field: 'published' }, posts: { field: 'published' }, pages: { field: 'published' }, 'case-studies': { field: 'published' }, apps: { field: 'published' },
  services: { field: 'active' }, packages: { field: 'active' }, coupons: { field: 'active' },
  forms: { field: 'active' }, popups: { field: 'active' }, redirects: { field: 'active' },
  customers: { field: 'disabled', invert: true },
};

/* Lists that have a Trash (everything that goes through the generic list). */
export const TRASHABLE = ['projects', 'posts', 'categories', 'pages', 'case-studies', 'apps', 'services', 'packages', 'coupons', 'customers', 'contacts', 'forms', 'popups', 'redirects'];

export const isLive = (resource, doc) => {
  const s = STATUS[resource]; if (!s) return true;
  return s.invert ? !doc?.[s.field] : doc?.[s.field] !== false;
};

/* Public address of an item, used for redirects when a slug changes. */
export const PUBLIC_PATH = {
  projects: (s) => `/portfolio/${s}`, posts: (s) => `/blog/${s}`, pages: (s) => `/${s}`,
  'case-studies': (s) => `/case-studies/${s}`, categories: (s) => `/blog/category/${s}`,
};
