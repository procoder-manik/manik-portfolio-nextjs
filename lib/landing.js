import { seoMeta } from './seo';
import { crumbs, faqNode } from './schema';

/* The address search engines and shared links use: the English address, or the first other address when that is switched on. */
export const landingPath = (l) => `/${l.canonicalAlias && l.aliases?.[0] ? l.aliases[0] : l.slug}`;

/* Browsers send the address percent-encoded (Bangla letters become %E0...), so decode before looking it up. */
export const landingKey = (s = '') => { try { return decodeURIComponent(s); } catch { return String(s); } };

export function landingMeta(l) {
  const path = encodeURI(landingPath(l));
  return seoMeta(l, { title: l.name + (l.tagline ? `: ${l.tagline}` : ''), description: l.tagline || l.subheadline, image: l.seoImage || l.heroImage, path });
}

/* Breadcrumbs, the page itself and its questions. The product (SoftwareApplication, price, rating) comes from the SEO > Schema tab. */
export function landingGraph(l) {
  const path = encodeURI(landingPath(l));
  const faqs = (l.faq || []).filter((f) => f?.q && f?.a);
  return [crumbs([['Home', '/'], [l.name, path]]), faqNode(faqs), { '@type': 'WebPage', name: l.seoTitle || l.name, description: l.seoDescription || l.tagline }];
}
