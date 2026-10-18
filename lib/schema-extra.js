import { siteUrl } from './utils';

/* Extends the base graph (lib/schema.js) with the business details from SEO settings, the page's own
   schema choice and any custom JSON-LD. Always returns ONE graph, never several scripts. */
const DAY = { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' };
const abs = (u) => (!u ? undefined : /^https?:/.test(u) ? u : `${siteUrl()}${u}`);
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length)));
const parse = (raw) => { if (!raw) return []; try { const j = typeof raw === 'string' ? JSON.parse(raw) : raw; const arr = Array.isArray(j) ? j : j['@graph'] || [j]; return arr.filter((x) => x && typeof x === 'object').map(({ '@context': _c, ...n }) => n); } catch { return []; } };
const ARTICLE = ['Article', 'BlogPosting', 'NewsArticle']; const WEBPAGE = ['WebPage', 'AboutPage', 'ContactPage', 'CollectionPage', 'ProfilePage'];

function offers(m, url) {
  if (m.price === undefined || m.price === null || m.price === '') return undefined;
  return clean({ '@type': 'Offer', price: String(m.price), priceCurrency: (m.currency || 'USD').toUpperCase(), url, availability: m.availability ? `https://schema.org/${m.availability}` : undefined });
}
const rating = (m) => (m.ratingValue && m.ratingCount ? { '@type': 'AggregateRating', ratingValue: String(m.ratingValue), reviewCount: String(m.ratingCount), bestRating: '5' } : undefined);

export function businessPatch(seo, site) {
  const b = seo.business || {};
  const hasAddr = b.street || b.city || b.region || b.postalCode;
  const sameAs = [...new Set([...(site.socials || []).map((s) => s.url), ...(b.sameAs || [])].filter(Boolean))];
  return clean({
    '@type': b.type || 'ProfessionalService', name: b.name, legalName: b.legalName, description: b.description,
    logo: b.logo ? { '@type': 'ImageObject', url: abs(b.logo) } : undefined, image: abs(b.image), telephone: b.phone, email: b.email, priceRange: b.priceRange,
    areaServed: b.areaServed, foundingDate: b.foundingDate,
    address: hasAddr || b.country ? clean({ '@type': 'PostalAddress', streetAddress: b.street, addressLocality: b.city, addressRegion: b.region, postalCode: b.postalCode, addressCountry: b.country }) : undefined,
    geo: b.lat && b.lng ? { '@type': 'GeoCoordinates', latitude: Number(b.lat), longitude: Number(b.lng) } : undefined, hasMap: b.mapUrl,
    openingHoursSpecification: (b.hours || []).filter((h) => h.days?.length && h.opens && h.closes).map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map((d) => DAY[d]).filter(Boolean), opens: h.opens, closes: h.closes })),
    aggregateRating: rating({ ratingValue: b.ratingValue, ratingCount: b.ratingCount }), sameAs, knowsAbout: b.knowsAbout,
  });
}

function itemNode(page, graph, seo) {
  const m = page.schemaMarkup || {}; const type = m.type;
  if (!type || type === 'auto' || type === 'none') return { node: null, type };
  const crumbs = graph.find((n) => n['@type'] === 'BreadcrumbList')?.itemListElement; const url = crumbs?.[crumbs.length - 1]?.item || siteUrl();
  const biz = { '@id': `${siteUrl()}/#business` }; const person = { '@id': `${siteUrl()}/#person` };
  const base = clean({ '@type': type, '@id': `${url}#schema`, url, name: m.name || page.seoTitle || page.title || page.name, description: m.description || page.seoDescription || page.excerpt || page.summary, image: abs(m.image || page.seoImage || page.cover || page.scrollImage || page.bannerImage), keywords: [page.focusKeyword, ...(page.keywords || [])].filter(Boolean).join(', ') });
  switch (type) {
    case 'Service': return { node: { ...base, serviceType: m.serviceType, areaServed: m.areaServed, provider: biz, offers: offers(m, url), aggregateRating: rating(m) }, type };
    case 'Product': return { node: { ...base, brand: m.brand ? { '@type': 'Brand', name: m.brand } : undefined, sku: m.sku, offers: offers(m, url), aggregateRating: rating(m) }, type };
    case 'SoftwareApplication': return { node: { ...base, applicationCategory: m.appCategory, operatingSystem: m.os, offers: offers(m, url), aggregateRating: rating(m), author: person }, type };
    case 'Course': return { node: { ...base, provider: biz, offers: offers(m, url), aggregateRating: rating(m) }, type };
    case 'Event': {
      const online = m.attendance === 'online'; const mixed = m.attendance === 'mixed';
      const loc = [];
      if (!online && (m.locationName || m.address)) loc.push(clean({ '@type': 'Place', name: m.locationName, address: m.address }));
      if (online || mixed) loc.push(clean({ '@type': 'VirtualLocation', url: m.eventUrl || url }));
      return { node: { ...base, startDate: m.startDate, endDate: m.endDate, eventAttendanceMode: `https://schema.org/${online ? 'Online' : mixed ? 'Mixed' : 'Offline'}EventAttendanceMode`, eventStatus: 'https://schema.org/EventScheduled', location: loc.length === 1 ? loc[0] : loc, organizer: biz, offers: offers(m, url) }, type };
    }
    case 'HowTo': return { node: { ...base, totalTime: m.totalTime, step: (m.steps || []).filter((s) => s.name || s.text).map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })) }, type };
    case 'VideoObject': return { node: { ...base, contentUrl: m.videoUrl, embedUrl: m.videoUrl, uploadDate: m.uploadDate, duration: m.duration, thumbnailUrl: base.image }, type };
    case 'FAQPage': return { node: { ...base, mainEntity: (m.faq || []).filter((f) => f.q && f.a).map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }, type };
    case 'LocalBusiness': return { node: { '@type': 'WebPage', '@id': `${url}#schema`, url, name: base.name, description: base.description, about: biz }, type };
    default: // Article family and web page family
      if (ARTICLE.includes(type)) return { node: { ...base, headline: base.name, author: person, publisher: person, datePublished: page.publishedAt || page.createdAt, dateModified: page.updatedAt || page.publishedAt, mainEntityOfPage: url }, type };
      return { node: { ...base, isPartOf: { '@id': `${siteUrl()}/#website` }, about: biz }, type };
  }
}

const mergeNode = (graph, n) => {
  const i = n['@id'] ? graph.findIndex((x) => x['@id'] === n['@id']) : -1;
  if (i >= 0) graph[i] = { ...graph[i], ...n }; else graph.push(n);
};

export function enhanceGraph(data, { seo = {}, site = {}, page = {} }) {
  if (!data?.['@graph']) return data;
  let graph = data['@graph'].map((n) => ({ ...n }));
  const biz = graph.find((n) => n['@id']?.endsWith('/#business'));
  if (biz) Object.assign(biz, businessPatch(seo, site));
  const person = graph.find((n) => n['@id']?.endsWith('/#person'));
  if (person && seo.business?.knowsAbout?.length) person.knowsAbout = seo.business.knowsAbout;

  if (seo.schema?.breadcrumbs === false) graph = graph.filter((n) => n['@type'] !== 'BreadcrumbList');
  else if (page.breadcrumbTitle) graph.forEach((n) => { if (n['@type'] === 'BreadcrumbList' && n.itemListElement?.length) n.itemListElement[n.itemListElement.length - 1].name = page.breadcrumbTitle; });

  const { node, type } = itemNode(page, graph, seo);
  if (node) {
    // Reuse the page's automatic node when it is the same kind, so the graph never describes one page twice.
    const sameKind = (t) => (ARTICLE.includes(type) && ARTICLE.includes(t)) || (WEBPAGE.includes(type) && WEBPAGE.includes(t)) || t === type;
    const existing = graph.find((n) => sameKind(Array.isArray(n['@type']) ? n['@type'][0] : n['@type']) && !['Person', 'ProfessionalService', 'WebSite'].includes(n['@type']));
    if (existing) { const keep = existing['@id']; Object.assign(existing, Object.fromEntries(Object.entries(node).filter(([k]) => !['@id'].includes(k)))); if (keep) existing['@id'] = keep; }
    else graph.push(node);
  } else if (page.keywords?.length || page.focusKeyword) {
    const main = [...graph].reverse().find((n) => !['BreadcrumbList', 'Person', 'ProfessionalService', 'WebSite'].includes(n['@type']));
    if (main && !main.keywords) main.keywords = [page.focusKeyword, ...(page.keywords || [])].filter(Boolean).join(', ');
  }
  for (const n of [...parse(seo.schema?.global), ...parse(page.schemaMarkup?.custom)]) mergeNode(graph, n);
  return { ...data, '@graph': graph };
}
