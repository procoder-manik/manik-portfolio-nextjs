/* Shared by the admin (the "Write with AI" window) and the server (the prompts).
   id: saved in the brief; label: shown on the button; tag: the Work type chip it adds to the project. */
export const WORK_TYPES = [
  { id: 'new-build', label: 'New website build', tag: 'Website design', say: 'designed and built a new website from scratch' },
  { id: 'redesign', label: 'Redesign of an old site', tag: 'Website redesign', say: 'redesigned and rebuilt an existing website' },
  { id: 'page-building', label: 'New pages or landing pages', tag: 'Page building', say: 'designed and built new pages or landing pages on an existing website' },
  { id: 'maintenance', label: 'Maintenance and support', tag: 'Website maintenance', say: 'looks after the website on an ongoing basis: updates, backups, security, fixes and small changes' },
  { id: 'ecommerce', label: 'Online store', tag: 'E-commerce', say: 'set up or improved an online store: products, checkout and payments' },
  { id: 'speed', label: 'Speed optimisation', tag: 'Speed optimisation', say: 'made the website load faster and improved Core Web Vitals' },
  { id: 'seo', label: 'SEO', tag: 'SEO', say: 'did on-page and technical SEO: structure, metadata, schema and indexing' },
  { id: 'local-seo', label: 'Local SEO', tag: 'Local SEO', say: 'did local SEO: local pages, business details, schema and map signals' },
  { id: 'migration', label: 'Migration or move', tag: 'Website migration', say: 'moved the website to a new platform, host or domain without losing content or rankings' },
  { id: 'fixes', label: 'Fixes and updates', tag: 'Fixes and updates', say: 'fixed problems and updated the website' },
  { id: 'custom', label: 'Custom features', tag: 'Custom development', say: 'built custom features, integrations or plugins' },
];

export const WORK_STATUS = [
  { value: 'completed', label: 'Finished', hint: 'The work is done and delivered.' },
  { value: 'ongoing', label: 'Still building', hint: 'The project is in progress right now.' },
  { value: 'maintenance', label: 'Ongoing care', hint: 'You keep looking after this site (maintenance, updates, new pages).' },
];

export const statusLabel = (v) => ({ ongoing: 'In progress', maintenance: 'Ongoing care' }[v] || '');
