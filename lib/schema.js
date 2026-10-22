import { siteUrl, projectDuration } from './utils';

/* One combined JSON-LD @graph per page: Person, ProfessionalService, WebSite,
   plus whatever the page adds (BreadcrumbList, BlogPosting, CreativeWork, FAQPage, OfferCatalog). */
export function buildGraph(site, extra = []) {
  const url = siteUrl();
  const person = {
    '@type': 'Person', '@id': `${url}/#person`, name: site.name, jobTitle: site.role, url,
    image: site.avatar?.startsWith('http') ? site.avatar : `${url}${site.avatar}`, email: `mailto:${site.email}`, telephone: site.phoneTel,
    address: { '@type': 'PostalAddress', addressCountry: 'BD' },
    sameAs: (site.socials || []).map((s) => s.url).filter(Boolean),
    knowsAbout: ['Web design', 'WordPress', 'Shopify', 'WooCommerce', 'SEO', 'Next.js', 'MERN stack'],
  };
  const business = {
    '@type': 'ProfessionalService', '@id': `${url}/#business`, name: `${site.name} | Web Design and SEO`, url,
    image: `${url}${site.ogImage || ''}`, founder: { '@id': `${url}/#person` }, email: site.email, telephone: site.phoneTel,
    areaServed: 'Worldwide', priceRange: '$$', address: { '@type': 'PostalAddress', addressCountry: 'BD' },
  };
  const website = { '@type': 'WebSite', '@id': `${url}/#website`, url, name: site.name, publisher: { '@id': `${url}/#person` }, inLanguage: 'en' };
  return { '@context': 'https://schema.org', '@graph': [person, business, website, ...extra.filter(Boolean)] };
}

export const crumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${siteUrl()}${path}` })),
});

export const faqNode = (items = []) => items.length ? ({
  '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}) : null;

export const projectNode = (p) => ({
  '@type': 'CreativeWork', '@id': `${siteUrl()}/portfolio/${p.slug}#work`, name: p.title, description: p.summary,
  url: `${siteUrl()}/portfolio/${p.slug}`, image: abs(p.useScrollAsBanner ? p.scrollImage : p.bannerImage || p.scrollImage),
  creator: { '@id': `${siteUrl()}/#person` }, dateCreated: p.startDate, timeRequired: projectDuration(p) || undefined,
  keywords: [p.cms, ...(p.technologies || []), ...(p.services || [])].filter(Boolean).join(', '),
  about: p.industry, sameAs: p.liveUrl || undefined,
});

export const postNode = (p) => ({
  '@type': 'BlogPosting', '@id': `${siteUrl()}/blog/${p.slug}#post`, headline: p.title, description: p.excerpt,
  image: p.cover ? abs(p.cover) : undefined, datePublished: p.publishedAt, dateModified: p.updatedAt || p.publishedAt,
  author: { '@id': `${siteUrl()}/#person` }, publisher: { '@id': `${siteUrl()}/#person` },
  mainEntityOfPage: `${siteUrl()}/blog/${p.slug}`, articleSection: p.category, keywords: (p.tags || []).join(', '),
});

export const catalogNode = (services) => ({
  '@type': 'OfferCatalog', name: 'Web design, SEO and automation packages', url: `${siteUrl()}/pricing`,
  itemListElement: services.map((s) => ({
    '@type': 'OfferCatalog', name: s.name,
    itemListElement: s.packages.map((p) => ({
      '@type': 'Offer', name: p.name, description: p.tagline, url: `${siteUrl()}/checkout/${p.slug}`,
      priceSpecification: { '@type': 'PriceSpecification', price: p.price, minPrice: p.price, maxPrice: p.priceMax || p.price, priceCurrency: p.currency },
      itemOffered: { '@type': 'Service', name: p.name, provider: { '@id': `${siteUrl()}/#business` } },
    })),
  })),
});

function abs(u) { if (!u) return undefined; return u.startsWith('http') ? u : `${siteUrl()}${u}`; }

export const caseNode = (c) => {
  const url = `${siteUrl()}/case-studies/${c.slug}`;
  return {
    '@type': 'Article', '@id': `${url}#case-study`, headline: c.title, description: c.summary, url, image: c.cover ? abs(c.cover) : undefined,
    datePublished: c.publishedAt, dateModified: c.updatedAt || c.publishedAt, author: { '@id': `${siteUrl()}/#person` }, publisher: { '@id': `${siteUrl()}/#person` },
    articleSection: 'Case study', about: { '@type': 'Organization', name: c.client, url: c.liveUrl || undefined }, keywords: [...(c.services || []), ...(c.technologies || [])].join(', '),
  };
};

/* A landing page for one service in one place. */
export const serviceAreaNode = (sa, area) => {
  const url = `${siteUrl()}/service-areas/${sa.slug}`;
  const type = { Country: 'Country', 'State or province': 'AdministrativeArea', City: 'City' }[area?.kind] || 'Place';
  return {
    '@type': 'Service', '@id': `${url}#service`, name: sa.headline || sa.title, description: sa.summary, url,
    serviceType: sa.niche || sa.title, image: sa.cover ? abs(sa.cover) : undefined,
    provider: { '@id': `${siteUrl()}/#person` }, ...(area ? { areaServed: { '@type': type, name: area.name } } : {}),
  };
};

/* Reads the FAQ section out of an article so the FAQ schema always matches what is on the page, even after you edit it.
   Looks for a heading like "Frequently asked questions" or "FAQ", then takes each question heading (### or ####) with the paragraph under it. */
export function faqFromMarkdown(md = '') {
  const lines = String(md).split('\n'); const out = []; let inFaq = false; let q = ''; let a = [];
  const plain = (t) => t.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`>#|]/g, '').replace(/\s+/g, ' ').trim();
  const push = () => { const ans = plain(a.join(' ')); if (q && ans.length > 20) out.push({ q: plain(q).replace(/\?*$/, '?'), a: ans }); q = ''; a = []; };
  for (const line of lines) {
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      const depth = h[1].length; const text = h[2];
      if (depth <= 3 && /(frequently asked|\bfaqs?\b|common questions|সাধারণ প্রশ্ন|প্রশ্নোত্তর)/i.test(text) && depth === 2) { push(); inFaq = true; continue; }
      if (inFaq && depth === 2) { push(); inFaq = false; continue; }
      if (inFaq && depth >= 3) { push(); q = text; continue; }
    }
    if (inFaq && q) a.push(line);
  }
  push();
  return out.slice(0, 15);
}
