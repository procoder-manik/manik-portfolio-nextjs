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
