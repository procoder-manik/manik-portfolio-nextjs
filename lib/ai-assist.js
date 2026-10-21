import 'server-only';
import { getSettingsFresh, getServicesWithPackages, getProjects, getPageSeoFresh } from './data';
import { dbConnect, hasDB } from './db';
import { Page, Project } from './models';
import { WRITING_RULES } from './humanize';
import { SERVICE_ICONS } from './options';
import { SYSTEM_PAGES, systemDef, pagePath } from './system-pages';
import { WORK_TYPES } from './project-ai-options';
import { siteFacts } from './project-ai';
import { specOf, arOf } from './image-specs';

/* Everything the AI needs to write in the voice and structure of this website. */
export async function siteContext() {
  const [site, seo, home, services, projects] = await Promise.all([
    getSettingsFresh('site'), getSettingsFresh('seo'), getSettingsFresh('home'), getServicesWithPackages(), getProjects({ limit: 8 }),
  ]);
  let pages = [];
  if (hasDB()) { try { await dbConnect(); pages = await Page.find({ published: true, trashedAt: null }).select('title slug builtin').lean(); } catch {} }
  const money = (p) => (p.price ? `$${p.price}${p.priceMax ? ` to $${p.priceMax}` : ''}${p.billing && p.billing !== 'one-time' ? ` ${p.billing}` : ''}` : '');
  const svc = services.map((s) => `- ${s.name} (/pricing#${s.slug}): ${s.summary || ''}${s.packages?.length ? ` Packages: ${s.packages.map((p) => [p.name, money(p)].filter(Boolean).join(' ')).join('; ')}` : ''}`).join('\n');
  const links = [...SYSTEM_PAGES.map((d) => `${d.path} (${d.title})`), ...pages.filter((p) => !p.builtin).map((p) => `${pagePath(p)} (${p.title})`)].join(', ');
  return {
    site, seo, home,
    text: `Website owner: ${site.name}, ${site.role}. Tagline: ${site.tagline || '-'}. Based in: ${site.location || '-'}. Replies within: ${site.replyTime || 'one working day'}.
Services and prices (use only these prices, never invent others):
${svc || '-'}
Recent projects: ${projects.map((p) => `${p.title}${p.industry ? ` (${p.industry})` : ''}`).join(', ') || '-'}
Pages on the site you may link to (use only these paths): ${links}
Meta title format: "${seo.titleTemplate || '%s'}"`,
  };
}

const VOICE = (ctx) => `You write for ${ctx.site.name}'s own website, in the first person ("I"), for small business owners deciding whether to hire ${ctx.site.name}. Plain, specific and honest. British-neutral English unless the brief says otherwise.
${WRITING_RULES}
Hard rules: never invent numbers, results, client names, quotes, awards, years or prices. Use prices only from the services list. Link only to the listed paths. No long dashes (U+2014, U+2013). No hype words.`;

/* Turns any document into short plain context for the prompt. */
export function compact(doc = {}, max = 5000) {
  const out = []; const skip = /^(_id|__v|slug|createdAt|updatedAt|trashedAt|trashState|aiMeta|code|css|html|schemaMarkup|accent|order|scroll|cover|image|avatar|logo|video|gallery|images|url|href|liveUrl|seo|og|twitter|canonical|robots|sitemap|menu|path|kind)/i;
  const walk = (v, key, depth) => {
    if (out.join('\n').length > max || depth > 4) return;
    if (typeof v === 'string') { const t = v.trim(); if (t && !/^(https?:|\/|#)/.test(t) && !skip.test(key)) out.push(`${key}: ${t.slice(0, 700)}`); }
    else if (Array.isArray(v)) v.slice(0, 14).forEach((x, i) => walk(x, `${key}[${i}]`, depth + 1));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => { if (!skip.test(k)) walk(x, key ? `${key}.${k}` : k, depth + 1); });
  };
  walk(doc, '', 0);
  return out.join('\n').slice(0, max);
}

const SCOPES = { pages: 'a page of the website', posts: 'a blog post', projects: 'a portfolio project', 'case-studies': 'a case study', categories: 'a blog category', knowledge: 'a FAQ and Help center answer', services: 'a service', packages: 'a package (price plan)', apps: 'a product', forms: 'a form' };
export const scopeLabel = (scope = '') => SCOPES[scope] || (scope.startsWith('seo-') ? `the SEO of the ${scope.slice(4)} page` : scope ? `the "${scope}" settings` : 'the website');

/* One field: write, improve or shorten. Returns plain text (Markdown for markdown fields). */
export function fieldPrompts(b, ctx) {
  const f = b.field || {}; const type = f.type || 'text';
  const long = /answer|overview|body|content|results|description|bio|story|about/i.test(f.name || '');
  const size = type === 'markdown' ? '150 to 400 words of Markdown with ## headings where useful' : type === 'textarea' ? (long ? '2 to 5 sentences' : '1 to 2 sentences') : `one line, under ${f.max || 70} characters, no full stop at the end unless it is a sentence`;
  const job = { improve: 'Improve the current text: clearer, more specific, same facts and meaning.', shorter: 'Make the current text shorter and tighter, same meaning.', longer: 'Expand the current text with useful specifics, without inventing facts.' }[b.mode] || 'Write this field from the context.';
  const system = `${VOICE(ctx)}\nOutput only the text for the field. No quotes around it, no labels, no explanations.`;
  const user = `${ctx.text}

You are filling in ${scopeLabel(b.scope)} in the admin.
Field: "${f.label || f.name}"${f.hint ? ` (help text: ${f.hint})` : ''}${f.placeholder ? ` (example: ${f.placeholder})` : ''}
Length: ${size}.
Task: ${job}${b.instruction ? `\nThe owner adds: ${b.instruction}` : ''}
Current text: ${b.value ? String(b.value).slice(0, 3000) : '(empty)'}

The rest of this item (for context):
${compact(b.doc) || '-'}${b.parent ? `\n\nThe page or item it belongs to:\n${compact(b.parent, 2500)}` : ''}`;
  return { system, user };
}

/* SEO fields (and schema) for any page or item. */
export const SCHEMA_FIELDS = {
  Service: ['name', 'description', 'serviceType', 'areaServed'], Product: ['name', 'description', 'brand'], SoftwareApplication: ['appCategory', 'os'],
  Course: ['name', 'description'], HowTo: ['totalTime', 'steps'], FAQPage: ['faq'], LocalBusiness: ['areaServed'],
};
export async function seoPrompts(b, ctx) {
  let page = compact(b.doc, 4500);
  const def = b.doc?.builtin ? systemDef(b.doc.builtin) : b.scope?.startsWith('seo-') ? systemDef(b.scope.slice(4)) : null;
  if (def) {
    page = `Built-in page "${def.title}" at ${def.path}. It contains: ${def.parts.map((p) => `${p.label} (${p.desc})`).join('; ')}.\n${page}`;
    // Read the live page so the SEO describes what is really on it.
    try { const base = process.env.NEXT_PUBLIC_SITE_URL; if (base) { const f = await siteFacts(new URL(def.path, base).toString()); page += `\nLive page heading: ${f.h1}\nLive page headings: ${f.headings.join(' | ')}\nLive page text: ${f.text.slice(0, 1800)}`; } } catch {}
  }
  const tpl = String(ctx.seo.titleTemplate || '%s').includes('%s') ? String(ctx.seo.titleTemplate) : '%s';
  const room = Math.max(40, 62 - (tpl.length - 2));
  const want = b.fields?.length ? b.fields : ['focusKeyword', 'keywords', 'seoTitle', 'seoDescription', 'ogTitle', 'ogDescription', 'breadcrumbTitle', 'schema'];
  const system = `${VOICE(ctx)}\nYou are also a senior SEO editor. Return JSON only.`;
  const user = `${ctx.text}

Write the search and social texts for ${scopeLabel(b.scope)} at ${b.path || '/'}.
${b.keyword ? `The owner wants to target: "${b.keyword}".` : ''}${b.instruction ? `\nThe owner adds: ${b.instruction}` : ''}
What is on the page:
${page || '-'}

Return JSON with only these keys: ${want.join(', ')}
- focusKeyword: 2 to 4 words a real customer would search for this page, lowercase
- keywords: 4 to 6 related search phrases, lowercase
- seoTitle: the part before the brand, ${room - 14} to ${room} characters, the focus keyword near the start, readable (I add "${tpl.replace('%s', '').trim()}" myself)
- seoDescription: 140 to 158 characters, includes the focus keyword, says what the visitor gets, ends with a light call to action
- ogTitle: friendlier social headline under 70 characters
- ogDescription: under 120 characters
- breadcrumbTitle: 1 to 3 words
- schema: { "type": one of auto, WebPage, AboutPage, ContactPage, CollectionPage, FAQPage, Article, BlogPosting, Service, Product, SoftwareApplication, Course, HowTo, LocalBusiness. Use "auto" when the site already marks the page up well (blog posts, projects, case studies, home, listings). For a page that sells one service use Service. Then only the fields that type uses: name, description (under 200 characters), serviceType, areaServed (only if the page clearly says), brand, appCategory, os, totalTime, steps [{name,text}], faq [{q,a}] from questions really on the page. Never add prices, ratings or dates. }`;
  return { system, user, want };
}

/* One page section (block): returns the block's text fields. */
const BLOCK_SHAPES = {
  hero: '{"heading": "headline under 70 characters", "text": "1 to 2 sentences", "primary": {"label": "2 to 4 words", "href": "a listed path"}, "secondary": {"label": "", "href": ""}}',
  richText: '{"content": "Markdown, 120 to 350 words, with ## headings and short paragraphs"}',
  split: '{"heading": "", "body": "Markdown, 60 to 140 words", "button": {"label": "", "href": ""}}',
  cards: '{"eyebrow": "SHORT UPPERCASE LABEL", "heading": "", "intro": "1 sentence", "items": [{"icon": "an icon name", "title": "", "body": "1 to 2 sentences", "linkLabel": "", "href": "a listed path or empty"}]}',
  features: '{"heading": "", "intro": "1 sentence", "items": [{"icon": "an icon name", "title": "", "body": "1 to 2 sentences"}]}',
  steps: '{"heading": "", "intro": "1 sentence", "items": [{"title": "", "body": "1 to 2 sentences", "meta": "Day 1 or Week 1 style label"}]}',
  stats: '{"heading": "", "items": [{"value": "only numbers from the context", "label": ""}]}',
  timeline: '{"heading": "", "intro": "", "items": [{"when": "only dates from the context", "title": "", "sub": "", "body": ""}]}',
  faq: '{"heading": "", "useSite": false, "items": [{"q": "a real customer question", "a": "2 to 4 sentences"}]}',
  cta: '{"heading": "under 60 characters", "body": "1 to 2 sentences", "primary": {"label": "", "href": "/contact"}}',
  projects: '{"heading": "", "intro": "1 sentence"}', posts: '{"heading": ""}', pricing: '{"heading": "", "intro": "1 sentence"}', caseStudies: '{"heading": "", "intro": "1 sentence"}',
  apps: '{"heading": "", "intro": "1 sentence"}', testimonials: '{"heading": ""}', contactForm: '{"heading": "", "intro": "1 sentence"}', form: '{"heading": "", "intro": "1 sentence"}',
  logos: '{"heading": ""}', gallery: '{"heading": ""}', video: '{"heading": "", "caption": ""}', core: '{"heading": "", "text": "1 to 2 sentences"}',
};
export const AI_BLOCKS = Object.keys(BLOCK_SHAPES).filter((k) => k !== 'core');
export function blockPrompts(b, ctx) {
  const t = b.block?.type; const shape = BLOCK_SHAPES[t]; if (!shape) throw new Error('This kind of section has no text for the AI to write.');
  const system = `${VOICE(ctx)}\nYou write one section of a web page. Return JSON only, in exactly the shape asked.`;
  const user = `${ctx.text}

Page: ${b.pageTitle || '-'} (${scopeLabel(b.scope)})
Other sections on this page, in order: ${(b.outline || []).join(' | ') || '-'}
Write the section "${b.label || t}"${b.part ? ` (the built-in part "${b.part}")` : ''}.${b.instruction ? `\nThe owner adds: ${b.instruction}` : ''}
Current content of this section:
${compact(b.block, 2500) || '(empty)'}
More about the page:
${compact(b.parent, 2500) || '-'}

Return JSON in this shape: ${shape}
${/items/.test(shape) ? `Use 3 to 6 items unless the section already has a different number. Icon names from: ${SERVICE_ICONS.slice(0, 30).join(', ')}.` : ''}`;
  return { system, user };
}

/* A whole new page: sections from the site's own section types, plus SEO. Built-in pages: their part texts plus SEO. */
export const PAGE_TYPES = [
  ['service', 'Service page (one service you sell)'], ['landing', 'Landing page for ads or a campaign'], ['about', 'About me'], ['location', 'Location page (a city or country)'],
  ['industry', 'Industry page (who you work for)'], ['resource', 'Guide or resource page'], ['legal', 'Legal page (privacy, terms, refunds)'], ['other', 'Something else'],
];
export function pagePrompts(b, ctx) {
  const def = b.builtin ? systemDef(b.builtin) : null;
  const tpl = String(ctx.seo.titleTemplate || '%s').includes('%s') ? String(ctx.seo.titleTemplate) : '%s';
  const room = Math.max(40, 62 - (tpl.length - 2));
  const seoKeys = `"seo": {"focusKeyword": "", "keywords": [], "seoTitle": "${room - 14} to ${room} characters, before the brand", "seoDescription": "140 to 158 characters", "ogTitle": "", "ogDescription": "", "breadcrumbTitle": ""}`;
  const system = `${VOICE(ctx)}\nYou plan and write web pages from the website's own section types. Return JSON only.`;
  if (def) {
    const parts = def.parts.filter((p) => p.fields?.length);
    const user = `${ctx.text}

Write the texts of the built-in "${def.title}" page (${def.path}). Its parts: ${def.parts.map((p) => `${p.id}: ${p.label} (${p.desc})`).join('; ')}.
${b.keyword ? `Target search: "${b.keyword}".` : ''}${b.notes ? `\nThe owner adds: ${b.notes}` : ''}
Return JSON: {"parts": {${parts.map((p) => `"${p.id}": {${p.fields.map((f) => `"${f.name}": "${f.type === 'textarea' ? '1 to 2 sentences' : 'short'}"`).join(', ')}}`).join(', ')}}, ${seoKeys}}`;
    return { system, user };
  }
  const type = PAGE_TYPES.find(([v]) => v === b.type)?.[1] || 'a page';
  const legal = b.type === 'legal';
  const user = `${ctx.text}

Write a complete new page: ${type}.
Topic or purpose: ${b.topic}
${['location', 'industry'].includes(b.type) ? `Rules for this ${b.type} page: it must be clearly different from a page written for any other ${b.type}, so Google does not see copies. ${b.type === 'location' ? 'Never claim an office, address, local team, local clients or local statistics there. Say plainly that you work with clients in that place from a distance (calls, chat, shared screens) in their time zone, and what that means for them.' : 'Describe what businesses of this kind typically need from a website (for example trust, bookings, speed, local search), without invented statistics or client names.'} Use only the facts the owner gives. Link to the service page or pricing and to the contact page.\n` : ''}${b.audience ? `For: ${b.audience}\n` : ''}${b.keyword ? `Target search: "${b.keyword}"\n` : ''}${b.notes ? `Facts from the owner (use them, they beat everything else): ${b.notes}\n` : ''}
Build it from these section types only, in a sensible order, ${legal ? '2 to 3 sections (a short hero and one or two richText sections; plain, complete and careful wording; leave dates out; add a note that it is a template to check with a lawyer)' : '4 to 7 sections. Start with a hero, end with a call to action. Prefer: hero, features or cards (what they get), steps (how it works), pricing (only if it is about a service you sell), projects or caseStudies (proof), faq (3 to 6 real questions), cta'}.
Section shapes:
${Object.entries(BLOCK_SHAPES).filter(([k]) => !['core', 'gallery', 'logos', 'video', 'form', 'timeline', 'stats'].includes(k)).map(([k, v]) => `${k}: ${v}`).join('\n')}

Return JSON: {"title": "page title for the admin and menus, 1 to 4 words", "slug": "short-url-words", "blocks": [{"type": "hero", ...the fields of that shape}], ${seoKeys}}
Icon names from: ${SERVICE_ICONS.slice(0, 30).join(', ')}.`;
  return { system, user };
}

/* A whole case study from a short brief (optionally from a linked portfolio project). */
export async function caseStudyPrompts(b, ctx) {
  let proj = '';
  if (b.project && hasDB()) { try { await dbConnect(); const p = await Project.findOne({ slug: b.project }).lean(); if (p) proj = compact({ title: p.title, client: p.client, industry: p.industry, summary: p.summary, content: p.content, deliverables: p.deliverables, services: p.services, technologies: p.technologies, metrics: p.metrics, cms: p.cms }, 3500); } catch {} }
  let live = '';
  if (b.url) { try { const f = await siteFacts(b.url); live = `Title: ${f.title}\nDescription: ${f.description}\nHeadings: ${f.headings.join(' | ')}\nPlatform: ${f.platform.cms || '-'} ${f.platform.techs.join(', ')}\nText: ${f.text.slice(0, 1800)}`; } catch {} }
  const work = WORK_TYPES.filter((w) => (b.workTypes || []).includes(w.id)).map((w) => `- ${w.label}: ${w.say}`).join('\n');
  const system = `${VOICE(ctx)}\nYou write portfolio case studies: problem, approach, result. Return JSON only.`;
  const user = `${ctx.text}

Write a case study.
Client or website: ${b.client}${b.url ? ` (${b.url})` : ''}
Industry: ${b.industry || 'infer it carefully'}
What I did:
${work || '-'}
The problem in the owner's words: ${b.problem || '-'}
Results and facts from the owner (the ONLY source of numbers): ${b.results || 'none given'}
${proj ? `Linked portfolio project:\n${proj}\n` : ''}${live ? `The live website:\n${live}\n` : ''}
Return JSON:
{"title": "headline that leads with the outcome, under 80 characters, no invented numbers", "client": "", "industry": "", "location": "only if clearly known", "summary": "2 sentences for cards", "duration": "only if given", "platform": "", "services": ["work type tags"], "technologies": [],
 "overview": "3 to 5 sentences: the client and their situation", "challengeIntro": "one line", "challenges": [{"title": "", "body": "1 to 3 sentences"}],
 "approachIntro": "one line", "approach": [{"phase": "Week 1 style label, only if timing is known else empty", "title": "", "body": "1 to 3 sentences"}],
 "resultsIntro": "one line", "metrics": [{"label": "", "before": "", "after": "", "value": ""}], "results": "Markdown, 80 to 200 words, outcomes the owner can stand behind",
 "seo": {"focusKeyword": "", "keywords": [], "seoTitle": "", "seoDescription": "140 to 158 characters", "ogTitle": "", "ogDescription": ""}}
Metrics: only numbers that appear in the owner's results; otherwise an empty list. 2 to 4 challenges, 3 to 5 approach steps.`;
  return { system, user };
}

export { getPageSeoFresh };


/* Image prompts for a cover or share image, in the site's own look and the exact size it needs. */
export const COVER_KINDS = { post: 'a blog post cover', case: 'a case study cover', project: 'a portfolio banner', page: 'a page social share image' };
export function coverPrompts(b, ctx) {
  const spec = specOf(b.kind); const d = b.doc || {};
  const hasShot = Boolean(d.scrollImage);
  const accent = /^#[0-9a-f]{6}$/i.test(d.accent || '') ? d.accent.toUpperCase() : '#6391FF';
  const title = d.title || d.name || '';
  const system = `You are an art director who writes paste-ready prompts for ChatGPT image generation, Nano Banana (Gemini), Midjourney and Ideogram. You never invent logos, brand names, numbers or claims. Return JSON only.`;
  const shots = hasShot ? `The owner has a full-page screenshot of the client's website. One prompt must put that screenshot, ATTACHED to the chat, unchanged, on a laptop and a phone mockup.` : `There is no screenshot, so do not ask for one.`;
  const byKind = {
    post: 'Three prompts: (1) a clean editorial illustration of the topic, no text; (2) a bold text cover with the exact short title on it; (3) a realistic photographic scene that suits the topic, no text.',
    case: `Three prompts: (1) ${hasShot ? 'device mockup with the attached screenshot, plus the exact short headline' : 'a browser and laptop mockup concept in the client\'s industry (the owner adds the screenshot later in Canva or Figma), plus the exact short headline'}; (2) a result-focused graphic${(d.metrics || []).length ? ' showing only the numbers listed in the context' : ' with no numbers at all'}; (3) an industry scene in the site's style, no text.`,
    project: 'Three prompts: (1) device mockup; (2) floating browser window; (3) background only with space on the right for a screenshot.',
    page: 'Three prompts: (1) a text card with the exact page title in large type; (2) an abstract branded background, no text; (3) a simple illustrated concept of the page topic, no text.',
  }[b.kind] || '';
  const user = `${ctx.text}

Write image prompts for ${COVER_KINDS[b.kind] || 'an image'} of "${title}".
Final size: ${spec.w} x ${spec.h} pixels (${spec.ratio}). Keep every important thing and all text inside the centre ${spec.safe[0]} x ${spec.safe[1]} pixels.
The site's look: dark navy (#0C1526) base, electric blue (#6391FF) accent, soft glows, a faint grid texture, clean modern sans-serif type. This item's accent colour: ${accent}.
About the item:
${compact(d, 2200) || '(nothing yet)'}
${b.instruction ? `The owner adds: ${b.instruction}\n` : ''}${shots}
${byKind}
Every prompt: 60 to 130 words, complete on its own, names the colours as hex codes, describes subject, composition, lighting, style and mood, spells any on-image text exactly (6 words or fewer), and says what must NOT appear.

Return JSON: {"headline": "the exact short text for the image, 6 words or fewer", "altText": "alt text under 125 characters", "fileName": "lowercase-words-with-dashes.jpg", "prompts": [{"label": "short name", "tool": "best tool", "attach": ${hasShot ? 'true or false' : 'false'}, "prompt": ""}], "tips": "one or two sentences on finishing and checking the image"}`;
  return { system, user, spec };
}
