import 'server-only';
import { dbConnect, hasDB } from './db';
import { AreaCategory, ServiceArea, Project } from './models';
import { getServicesWithPackages } from './data';
import { ask, normSeo, line } from './ai-run';
import { cleanText, WRITING_RULES } from './humanize';
import { slugify } from './utils';
import { SERVICE_ICONS } from './options';

const DESIGNS = ['aurora', 'split', 'spotlight', 'minimal'];
const hash = (s) => [...String(s)].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

/* The page's title and address follow one pattern, so every landing page is easy to find and nothing repeats:
   "Website design for dentists in New York" at /service-areas/website-design-for-dentists-in-new-york */
export function areaTitle(svcName, niche, placeName) {
  const n = String(niche || '').trim();
  return n ? `${svcName} for ${n.toLowerCase()} in ${placeName}` : `${svcName} in ${placeName}`;
}

/* Writes one landing page (a service for a niche in a place) from real facts about the site.
   Returns the fields of a ServiceArea document. Nothing is saved here. */
export async function buildAreaPage({ area: areaSlug, niche, service: svcSlug, notes, keyword }, site) {
  if (!hasDB()) throw new Error('Connect the database first.');
  await dbConnect();
  const area = await AreaCategory.findOne({ slug: areaSlug }).lean();
  if (!area) throw new Error('Pick a place first. Add places in Admin > Area locations.');
  const parent = area.parent ? await AreaCategory.findOne({ slug: area.parent }).select('name').lean() : null;
  const services = await getServicesWithPackages();
  const svc = services.find((s) => s.slug === svcSlug) || null;
  const svcName = svc?.name || 'Website design';
  const title = areaTitle(svcName, niche, area.name);
  const kw = String(keyword || '').trim().toLowerCase() || title.toLowerCase();
  const money = (p) => (p.price ? `$${p.price}${p.priceMax ? ` to $${p.priceMax}` : ''}` : '');
  const pk = (svc?.packages || []).map((p) => [p.name, money(p)].filter(Boolean).join(' ')).join('; ');
  const proof = (await Project.find({ published: true, trashedAt: null }).sort({ order: 1 }).limit(6).select('title industry').lean()).map((p) => `${p.title}${p.industry ? ` (${p.industry})` : ''}`).join(', ');
  const tpl = String(site.seo.titleTemplate || '%s').includes('%s') ? String(site.seo.titleTemplate) : '%s';
  const room = Math.max(40, 62 - (tpl.length - 2));

  const system = `You write landing pages that the site owner sends directly to a business owner in one place, to win them as a client, and that also rank in local search. Return JSON only.
${WRITING_RULES}
Hard rules: first person ("I"). Never invent numbers, results, client names, quotes, awards or years. Never claim an office, address, local team, local clients or local statistics in the place: say plainly that you work with clients there from a distance (calls, chat, shared screens, their time zone). Prices only from the list given. No long dashes. No hype.`;
  const user = `${site.text}

Write the landing page: "${title}".
Place: ${area.name}${area.kind ? ` (${area.kind}${parent ? ` in ${parent.name}` : ''})` : ''}. About it, from the owner: ${area.summary || 'nothing given'}
Who it is for: ${niche || 'local businesses'}.
My service: ${svcName}. ${svc?.summary || ''}${pk ? `\nPackages and prices: ${pk}` : ''}
Real work I can point to (names only, no claims about results): ${proof || 'none'}
Target search: "${kw}"
Facts from the owner (the only source for anything specific to this place or niche): ${notes || 'none given'}

Make it clearly different from a page for another place or niche: use what this niche needs from a website (for example bookings, trust, calls, local search, speed) and what ${area.name} implies (searching on phones, local map results) without invented facts.

Return JSON:
{"headline": "under 70 characters, benefit first, names the place", "summary": "2 sentences, 140 to 220 characters", "heroNote": "a short reassurance under the buttons, under 60 characters",
 "highlights": [{"title": "3 to 6 words", "body": "1 or 2 sentences", "icon": "one of: ${SERVICE_ICONS.slice(0, 40).join(', ')}"}] (exactly 4),
 "content": "Markdown, 150 to 260 words, 2 or 3 short ## sections: the problem for this niche in this place, what I build, how I work remotely",
 "ctaHeading": "under 60 characters", "ctaText": "1 or 2 sentences", "ctaLabel": "2 to 4 words",
 "seo": {"focusKeyword": "${kw}", "keywords": ["4 to 6 related searches"], "seoTitle": "${room - 14} to ${room} characters, starts with the focus keyword", "seoDescription": "140 to 158 characters, names the place and the service, ends with a light call to action", "ogTitle": "under 70 characters", "ogDescription": "under 120 characters", "breadcrumbTitle": "1 to 3 words"}}`;
  const r = await ask({ system, user }, { maxTokens: 3500, temperature: 0.75 });
  const j = r.data || {};
  const highlights = (Array.isArray(j.highlights) ? j.highlights : []).filter((h) => h?.title).slice(0, 4).map((h) => ({ title: line(h.title).slice(0, 60), body: line(h.body).slice(0, 220), icon: SERVICE_ICONS.includes(h.icon) ? h.icon : 'Check' }));
  if (!j.headline || !highlights.length) throw Object.assign(new Error('The AI answer was incomplete. Press the button again.'), { status: 502 });
  const seo = normSeo(j.seo || {}, site.seo); seo.focusKeyword = kw;
  const slug = slugify(title).slice(0, 80);
  return {
    via: r.via,
    doc: {
      title, slug, area: area.slug, niche: line(niche), service: svc?.slug || '', headline: line(j.headline).slice(0, 90), summary: line(j.summary).slice(0, 260), heroNote: line(j.heroNote).slice(0, 80),
      template: DESIGNS[hash(slug) % DESIGNS.length], accent: /^#[0-9a-f]{6}$/i.test(area.accent || '') ? area.accent : '#6391FF', highlights, content: cleanText(j.content || ''),
      ctaHeading: line(j.ctaHeading).slice(0, 80), ctaText: line(j.ctaText).slice(0, 220), ctaLabel: line(j.ctaLabel).slice(0, 30) || 'Start a project', showForm: true,
      schemaMarkup: { type: 'Service', name: title, serviceType: svcName, areaServed: area.name }, ...seo,
    },
  };
}

export async function saveAreaPage(input, site) {
  const built = await buildAreaPage(input, site);
  if (await ServiceArea.findOne({ slug: built.doc.slug }).select('_id').lean()) return { skipped: true, slug: built.doc.slug };
  const created = await ServiceArea.create({ ...built.doc, published: false, featured: false, publishedAt: new Date() });
  return { created: { id: String(created._id), slug: built.doc.slug, title: built.doc.title }, via: built.via };
}
