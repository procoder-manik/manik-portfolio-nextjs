/* Built-in pages (home, portfolio, blog...) shown in Admin > Pages next to your own pages.
   Each one is made of "parts": the sections the code renders. In the Pages editor you can reorder,
   hide or remove parts, change their heading and intro, and add normal page sections between them.
   A part is saved as a block { type: 'core', part: '<id>', heading?, text?, ... }.
   Shared by the admin (browser) and the server. */

const intro = (heading, text) => [
  { name: 'heading', label: 'Heading', type: 'text', placeholder: heading, info: 'Empty uses the built-in text shown in grey.' },
  { name: 'text', label: 'Intro', type: 'textarea', placeholder: text, info: 'Empty uses the built-in text shown in grey.' },
];
const cta = (heading, label, href) => [
  { name: 'heading', label: 'Heading', type: 'text', placeholder: heading },
  { name: 'label', label: 'Button text', type: 'text', half: true, placeholder: label },
  { name: 'href', label: 'Button link', type: 'text', half: true, placeholder: href },
];
const HOME = '/admin/settings/home';

export const SYSTEM_PAGES = [
  { key: 'home', title: 'Home', path: '/', slug: 'home', locked: true, editHref: HOME, editLabel: 'Home page texts', parts: [
    { id: 'hero', label: 'Hero', desc: 'Headline, intro, buttons, numbers, screenshots and the tools strip', editHref: HOME },
    { id: 'about', label: 'About', desc: 'Photo, story and quote', editHref: HOME, flag: 'about' },
    { id: 'services', label: 'Services', desc: 'Service cards in groups', editHref: HOME, flag: 'services' },
    { id: 'work', label: 'Work', desc: 'Featured projects with hover scroll', editHref: HOME, flag: 'work' },
    { id: 'caseStudies', label: 'Case studies', desc: 'Featured case studies (needs the feature on)', editHref: HOME, flag: 'caseStudies' },
    { id: 'apps', label: 'Products', desc: 'Featured products', editHref: HOME, flag: 'apps' },
    { id: 'process', label: 'Process', desc: 'How a project runs, step by step', editHref: HOME, flag: 'process' },
    { id: 'resume', label: 'Resume', desc: 'Experience, education and skills', editHref: '/admin/settings/resume', flag: 'resume' },
    { id: 'pricing', label: 'Pricing', desc: 'Packages in tabs', editHref: '/admin/packages', flag: 'pricing' },
    { id: 'testimonials', label: 'Testimonials', desc: 'Client quotes and logos', editHref: HOME, flag: 'testimonials' },
    { id: 'blog', label: 'Blog', desc: 'Latest posts and daily updates', editHref: HOME, flag: 'blog' },
    { id: 'faq', label: 'FAQ', desc: 'Questions and answers', editHref: HOME, flag: 'faq' },
    { id: 'cta', label: 'Contact banner', desc: 'The closing call to action', editHref: HOME },
  ] },
  { key: 'portfolio', aliases: ['/#work'], title: 'Portfolio', path: '/portfolio', slug: 'portfolio', editHref: '/admin/projects', editLabel: 'Projects', parts: [
    { id: 'intro', label: 'Page heading', desc: 'Heading and intro at the top', fields: intro('Selected work', '{count} sites across law, healthcare, agencies, retail and more. Hover any screenshot to scroll the whole page.') },
    { id: 'grid', label: 'Projects grid', desc: 'All published projects with filters', editHref: '/admin/projects' },
  ] },
  { key: 'caseStudies', aliases: ['/#case-studies'], title: 'Case studies', path: '/case-studies', slug: 'case-studies', editHref: '/admin/case-studies', editLabel: 'Case studies', parts: [
    { id: 'intro', label: 'Page heading', desc: 'Heading and intro at the top', fields: intro('Case studies', 'From Home page texts > Case studies') },
    { id: 'list', label: 'Case study cards', desc: 'The first one large, the rest in a grid', editHref: '/admin/case-studies' },
    { id: 'cta', label: 'Call to action', desc: 'Blue banner with a button', fields: cta('Want results like these for your business?', 'Start a project', '/contact') },
  ] },
  { key: 'serviceAreas', aliases: ['/#service-areas'], title: 'Service areas', path: '/service-areas', slug: 'service-areas', editHref: '/admin/service-areas', editLabel: 'Service areas', parts: [
    { id: 'intro', label: 'Page heading', desc: 'Heading and intro at the top', fields: intro('Where I work', 'Pick a place to see the services I offer there and the sites I have built for businesses in that area.') },
    { id: 'areas', label: 'Places and their pages', desc: 'Every place with the service pages inside it', editHref: '/admin/area-categories' },
    { id: 'cta', label: 'Call to action', desc: 'Banner with a button', fields: cta('Not seeing your place or niche?', 'Tell me about your business', '/contact') },
  ] },
  { key: 'blog', aliases: ['/#blog'], title: 'Blog', path: '/blog', slug: 'blog', editHref: '/admin/posts', editLabel: 'Blog posts', parts: [
    { id: 'intro', label: 'Page heading and categories', desc: 'Heading, intro and category buttons', fields: intro('Blog', 'From Home page texts > Blog') },
    { id: 'posts', label: 'Posts and sidebar', desc: 'Featured post, all posts, daily updates and a contact box', editHref: '/admin/posts' },
  ] },
  { key: 'resume', aliases: ['/#resume'], title: 'Resume', path: '/resume', slug: 'resume', editHref: '/admin/settings/resume', editLabel: 'Resume texts', parts: [
    { id: 'header', label: 'Resume header', desc: 'Photo, name, headline, contact details and highlights', editHref: '/admin/settings/resume' },
    { id: 'body', label: 'Experience and skills', desc: 'Profile, experience, education, certifications, skills, tools and languages', editHref: '/admin/settings/resume' },
  ] },
  { key: 'pricing', aliases: ['/#pricing'], title: 'Pricing', path: '/pricing', slug: 'pricing', editHref: '/admin/packages', editLabel: 'Packages', parts: [
    { id: 'intro', label: 'Page heading', desc: 'Heading, intro, payment methods and jump links', fields: intro('Packages and pricing', 'From Home page texts > Pricing') },
    { id: 'packages', label: 'Packages', desc: 'One block per service with its packages', editHref: '/admin/packages' },
    { id: 'help', label: 'Questions and booking', desc: 'Book a call box and the FAQ', fields: intro('Not sure which one fits?', 'Book a free 30-minute call. You get a scope and an exact number either way.') },
  ] },
  { key: 'contact', aliases: ['/#contact'], title: 'Contact', path: '/contact', slug: 'contact', editHref: '/admin/settings/site', editLabel: 'Contact details', parts: [
    { id: 'main', label: 'Contact details and form', desc: 'Heading, ways to reach you and the message form', fields: intro('From Home page texts > Contact', 'From Home page texts > Contact') },
  ] },
  { key: 'apps', aliases: ['/#apps'], title: 'Products', path: '/apps', slug: 'apps', editHref: '/admin/apps', editLabel: 'Products', parts: [
    { id: 'intro', label: 'Page heading', desc: 'Heading and intro', fields: intro('Products', 'From Home page texts > Products') },
    { id: 'list', label: 'Product cards', desc: 'All published products', editHref: '/admin/apps' },
  ] },
  { key: 'faq', aliases: ['/#faq'], title: 'FAQ', path: '/faq', slug: 'faq', editHref: '/admin/knowledge', editLabel: 'Taught answers', parts: [
    { id: 'main', label: 'Questions and search', desc: 'Heading, intro, search and answers grouped by service', fields: intro('Frequently asked questions', 'Straight answers about every service, from price and timelines to payment and support. Cannot find yours? Ask the chat or send a message.') },
    { id: 'cta', label: 'Still have a question', desc: 'Box with Help center and contact buttons', fields: cta('Still have a question?', 'Ask me', '/contact') },
  ] },
  { key: 'help', title: 'Help center', path: '/help', slug: 'help', editHref: '/admin/knowledge', editLabel: 'Taught answers', parts: [
    { id: 'search', label: 'Heading and search', desc: 'Heading, intro and the search box', fields: intro('How can I help?', 'Answers about every service, from price and timelines to billing and support. {count} answers and counting.') },
    { id: 'topics', label: 'Topics and popular questions', desc: 'Topic cards and the most asked questions', editHref: '/admin/knowledge' },
    { id: 'cta', label: 'Did not find your answer', desc: 'Box with FAQ and contact buttons', fields: cta('Did not find your answer?', 'Ask me', '/contact') },
  ] },
];

export const SYSTEM_BY_KEY = Object.fromEntries(SYSTEM_PAGES.map((p) => [p.key, p]));
export const systemDef = (key) => SYSTEM_BY_KEY[key] || null;
export const partDef = (key, id) => systemDef(key)?.parts.find((p) => p.id === id) || null;

/* The public address of any page (built-in or your own). */
export const pagePath = (d = {}) => (d.builtin && SYSTEM_BY_KEY[d.builtin] ? SYSTEM_BY_KEY[d.builtin].path : `/${d.slug || ''}`);

/* The starting layout of a built-in page: every part in order. Home follows the old "Visible sections" switches. */
export function defaultBlocks(key, home) {
  const def = systemDef(key); if (!def) return [];
  return def.parts.map((p) => ({ type: 'core', part: p.id, ...(p.flag && home?.sections && home.sections[p.flag] === false ? { hidden: true } : {}) }));
}

/* The layout to render: the saved one, or the starting layout when the page has not been saved yet. */
export const layoutOf = (key, doc, home) => (Array.isArray(doc?.blocks) && doc.blocks.length ? doc.blocks : defaultBlocks(key, home));

/* A built-in page is live unless it was switched off (Home can never be switched off). */
export const pageLive = (doc) => !doc || doc.builtin === 'home' || (doc.published !== false && !doc.trashedAt);

/* Is a part visible in this layout? */
export const partOn = (blocks, id) => blocks.some((b) => b?.type === 'core' && b.part === id && !b.hidden);

/* Replaces {count} in built-in texts. */
export const fill = (s, vars = {}) => String(s || '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));

/* Every address a menu link to this page may use: its path, plus the matching home anchor (for example /#case-studies). */
export const pagePaths = (d = {}) => [pagePath(d), ...((d.builtin && SYSTEM_BY_KEY[d.builtin]?.aliases) || [])];

/* Hosts that count as "this site": the browser's host, the site address setting, and any extra hosts passed in (the server passes the host the admin is open on). */
const ownHosts = (extra = []) => {
  const out = [...extra];
  try { if (typeof window !== 'undefined') out.push(window.location.host); } catch {}
  try { if (process.env.NEXT_PUBLIC_SITE_URL) out.push(new URL(process.env.NEXT_PUBLIC_SITE_URL).host); } catch {}
  return out.filter(Boolean).map((h) => String(h).split(',')[0].trim().replace(/^www\./, '').toLowerCase());
  // '*' (used for menu switches on inner pages): a full link ending in this page's address counts as this page, whatever the domain.
};

/* Same address, ignoring a trailing slash, letter case and the site's own domain (with or without www). path may be a list of addresses. */
export function samePath(href = '', path = '', hosts = []) {
  const own = ownHosts(hosts);
  const norm = (h) => {
    let x = String(h || '').trim().split('?')[0];
    if (/^https?:\/\//i.test(x) || x.startsWith('//')) {
      try { const u = new URL(x.startsWith('//') ? `https:${x}` : x); const mine = own.includes(u.host.replace(/^www\./, '').toLowerCase()) || (own.includes('*') && u.pathname !== '/');
        if (!mine) return `ext:${x}`; x = u.pathname + u.hash; } catch { return `ext:${x}`; }
    } else if (/^[a-z]+:/i.test(x)) return `ext:${x}`;
    x = x.replace(/\/+(#|$)/, '$1');
    return (x || '/').toLowerCase();
  };
  const a = norm(href);
  return (Array.isArray(path) ? path : [path]).some((p) => norm(p) === a);
}
