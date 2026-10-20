import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import { fetchHtml, assertPublic } from './safe-fetch';
import { UPLOAD_DIR } from './upload';
import { WRITING_RULES } from './humanize';
import { WORK_TYPES } from './project-ai-options';
import { CMS_OPTIONS, TECH_OPTIONS } from './options';

const decode = (s = '') => String(s).replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;|&#8217;/g, "'").replace(/&quot;/g, '"').replace(/&#8211;|&#8212;/g, '-').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const strip = (h = '') => decode(String(h).replace(/<[^>]+>/g, ' '));
export const normUrl = (u = '') => { const t = String(u).trim(); if (!t) return ''; return /^https?:\/\//i.test(t) ? t : `https://${t.replace(/^\/+/, '')}`; };

/* Platform and tools, read from the page source (no AI needed). */
const SIGNS = [
  [/cdn\.shopify\.com|Shopify\.theme/i, 'cms', 'Shopify'], [/static\.wixstatic\.com|wix-bolt|X-Wix/i, 'cms', 'Wix'],
  [/website-files\.com|data-wf-page|webflow\.js/i, 'cms', 'Webflow'], [/squarespace\.com|static1\.squarespace/i, 'cms', 'Squarespace'],
  [/framerusercontent\.com|framer\.com\/m\//i, 'cms', 'Framer'], [/irp\.cdn-website\.com|dudaone/i, 'cms', 'Duda'],
  [/hs-scripts\.com|hubspot/i, 'cms', 'HubSpot CMS'], [/ghost\.io|content="Ghost/i, 'cms', 'Ghost'], [/bigcommerce/i, 'cms', 'BigCommerce'],
  [/\/wp-content\/|\/wp-includes\/|wp-json/i, 'cms', 'WordPress'], [/Joomla!/i, 'cms', 'Joomla'], [/Drupal/i, 'cms', 'Drupal'],
  [/woocommerce/i, 'tech', 'WooCommerce'], [/elementor/i, 'tech', 'Elementor'], [/et_pb_|\/Divi\//i, 'tech', 'Divi'],
  [/bricks-|\/bricks\//i, 'tech', 'Bricks Builder'], [/oxygen-/i, 'tech', 'Oxygen'], [/fl-builder|beaver/i, 'tech', 'Beaver Builder'],
  [/wpbakery|js_composer/i, 'tech', 'WPBakery'], [/gutenberg|wp-block-/i, 'tech', 'Gutenberg'], [/astra/i, 'tech', 'Astra'], [/generatepress/i, 'tech', 'GeneratePress'],
  [/rank-math|rank.?math/i, 'tech', 'Rank Math'], [/yoast/i, 'tech', 'Yoast SEO'], [/wp-rocket/i, 'tech', 'WP Rocket'], [/litespeed/i, 'tech', 'LiteSpeed Cache'],
  [/cdn\.shopify\.com/i, 'tech', 'Liquid'], [/\/_next\/static|__NEXT_DATA__/i, 'tech', 'Next.js'], [/__NUXT__|\/_nuxt\//i, 'tech', 'Nuxt'],
  [/gsap|greensock/i, 'tech', 'GSAP'], [/bootstrap(\.min)?\.(css|js)/i, 'tech', 'Bootstrap'], [/tailwind/i, 'tech', 'Tailwind CSS'],
  [/googletagmanager\.com\/gtag|gtag\(/i, 'tech', 'Google Analytics'],
];
export function detectPlatform(html = '') {
  let cms = ''; const techs = [];
  const gen = (html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i) || [])[1] || '';
  for (const [re, kind, name] of SIGNS) { if (!re.test(html) && !re.test(gen)) continue; if (kind === 'cms') { if (!cms) cms = name; } else if (!techs.includes(name)) techs.push(name); }
  if (cms === 'WordPress' && techs.includes('WooCommerce')) cms = 'WooCommerce';
  const custom = !cms && techs.some((t) => ['Next.js', 'Nuxt'].includes(t));
  return { cms, platformType: custom ? 'custom' : cms ? 'cms' : '', techs: techs.slice(0, 8), generator: decode(gen).slice(0, 60) };
}

/* What the live website says about itself: title, description, headings, menu words and some text. */
export async function siteFacts(rawUrl) {
  const { url, html } = await fetchHtml(normUrl(rawUrl));
  return parseSite(url, html);
}
export function parseSite(url, html) {
  const meta = (n) => decode((html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${n}["'][^>]*content=["']([^"']*)`, 'i')) || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${n}["']`, 'i')) || [])[1] || '');
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const heads = [...html.matchAll(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => strip(m[2])).filter((t) => t && t.length < 140);
  const nav = [...new Set([...(html.match(/<nav[\s\S]*?<\/nav>/gi) || []).join(' ').matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => strip(m[1])).filter((t) => t && t.length < 40))].slice(0, 20);
  const body = html.replace(/<(head|script|style|noscript|svg|nav|footer|header|form)[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr|section)>/gi, '\n').replace(/<[^>]+>/g, ' ');
  const text = decode(body.replace(/\n\s*\n+/g, '\n')).slice(0, 3500);
  const lang = (html.match(/<html[^>]+lang=["']([^"']+)/i) || [])[1] || '';
  const phone = (html.match(/href=["']tel:([^"']+)/i) || [])[1] || '';
  const address = meta('og:locality') || decode((html.match(/"addressLocality"\s*:\s*"([^"]+)"/) || [])[1] || '');
  const country = decode((html.match(/"addressCountry"\s*:\s*"([^"]+)"/) || [])[1] || '');
  return { url, host: new URL(url).hostname.replace(/^www\./, ''), title, description: meta('description') || meta('og:description'), siteName: meta('og:site_name'), lang, h1: heads[0] || '', headings: [...new Set(heads)].slice(0, 18), nav, text, phone: phone ? 'yes' : '', locality: [address, country].filter(Boolean).join(', '), platform: detectPlatform(html) };
}

/* Reads an image the admin already uploaded and returns it as base64 for the AI. */
export async function loadImage(src) {
  const s = String(src || '').trim(); if (!s) throw new Error('Add a screenshot first.');
  let buf; let mime = '';
  const ext = (s.split('?')[0].split('.').pop() || '').toLowerCase();
  const TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif' };
  if (s.startsWith('/media/')) {
    const file = path.normalize(path.join(UPLOAD_DIR, decodeURIComponent(s.slice(7).split('?')[0])));
    if (!file.startsWith(UPLOAD_DIR)) throw new Error('That image path is not allowed.');
    buf = await fs.readFile(file).catch(() => { throw new Error('That image file was not found on the server.'); }); mime = TYPES[ext] || '';
  } else if (s.startsWith('/')) {
    const pub = path.join(process.cwd(), 'public'); const file = path.normalize(path.join(pub, decodeURIComponent(s.split('?')[0])));
    if (!file.startsWith(pub)) throw new Error('That image path is not allowed.');
    buf = await fs.readFile(file).catch(() => { throw new Error('That image file was not found.'); }); mime = TYPES[ext] || '';
  } else {
    let url = s;
    if (/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url)) url = url.replace('/image/upload/', '/image/upload/w_1024,c_limit,f_jpg,q_72/');
    await assertPublic(url);
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(`The image could not be opened (error ${r.status}).`);
    mime = (r.headers.get('content-type') || '').split(';')[0] || TYPES[ext] || '';
    buf = Buffer.from(await r.arrayBuffer());
  }
  if (/svg/.test(mime) || ext === 'svg') throw new Error('The AI cannot read SVG files. Upload the screenshot as PNG, JPG or WebP.');
  if (!/^image\/(png|jpeg|webp|gif)$/.test(mime)) mime = 'image/jpeg';
  if (buf.length > 4.5 * 1024 * 1024) throw new Error('The screenshot is too large for the AI (over 4.5 MB). Upload a smaller JPG or WebP, or use Cloudinary.');
  return { mime, data: buf.toString('base64') };
}

const workLines = (ids = []) => WORK_TYPES.filter((w) => ids.includes(w.id)).map((w) => `- ${w.label}: ${w.say}`).join('\n') || '- (not given, infer it carefully from the notes)';
const statusLine = (s) => ({ ongoing: 'The project is still in progress (being built right now). Write in the present tense about the work, do not claim a final result.', maintenance: 'This is an ongoing care arrangement: the owner keeps maintaining and improving the site. Write about what is looked after and how, in the present tense.' }[s] || 'The work is finished and delivered.');

/* Step 2: look at the screenshot. Colours, layout, alt text and banner prompts. */
export function visualPrompts(b) {
  const system = 'You are an art director and senior web designer. You look at a website screenshot and describe it precisely, then write image prompts for a portfolio banner. Never invent text, logos or claims that are not visible. Return JSON only.';
  const user = `This is a full-page screenshot of the website "${b.name}"${b.url ? ` (${b.url})` : ''}.
Work done on it: ${(WORK_TYPES.filter((w) => (b.workTypes || []).includes(w.id)).map((w) => w.label).join(', ')) || 'web design'}.

The banner will be used at the top of a portfolio page and as the social share image (Facebook, LinkedIn, X). Size 1600 x 840 pixels (about 1.9 to 1). Keep important things away from the edges (8 percent safe margin).

Return JSON with exactly these keys:
{
 "description": "3 to 4 plain sentences: the layout from top to bottom, the imagery, the style and the mood",
 "sections": ["short names of the visible page sections, top to bottom, max 10"],
 "palette": ["4 to 6 hex colours that really appear, most used first"],
 "accent": "#hex, the main brand colour (buttons, links, logo)",
 "background": "#hex, the main page background",
 "fonts": "what the typography looks like, for example 'bold geometric sans headings, light serif body'",
 "mood": "3 to 5 words",
 "industryGuess": "what kind of business this looks like, 2 to 5 words",
 "altText": "alt text for the screenshot, under 125 characters, says what the page is and shows",
 "fileName": "lowercase-words-with-dashes.jpg, includes the project name",
 "onImageText": { "headline": "${b.name}", "sub": "4 to 7 words describing the work, for example 'Website redesign and local SEO'" },
 "prompts": [
  { "label": "Device mockup", "tool": "ChatGPT (GPT image) or Nano Banana (Gemini)", "attach": true, "prompt": "detailed prompt: put the ATTACHED screenshot on the screen of a modern laptop and the top part of it on a phone, unchanged, at a slight angle, on a background built from the palette above, soft realistic shadows, the exact headline and sub text set cleanly in a font like the site uses, 1600 x 840, no other text, no fake logos" },
  { "label": "Floating browser", "tool": "ChatGPT (GPT image) or Nano Banana (Gemini)", "attach": true, "prompt": "detailed prompt: the ATTACHED screenshot inside a clean floating browser window, slightly tilted, with depth and a soft glow in the accent colour, background with subtle shapes from the palette, the exact headline and sub text, 1600 x 840" },
  { "label": "Background only", "tool": "Midjourney, Ideogram or any image AI", "attach": false, "prompt": "prompt for an empty background in the site's colours and mood with clear space on the right for a screenshot, no text, no devices; end with --ar 40:21 --style raw" }
 ],
 "tips": "one or two sentences on how to finish the banner (attach the screenshot to the chat, check the text spelling, export JPG under 300 KB)"
}

Each prompt must be complete on its own (someone will paste it alone), name the real hex colours, say the screenshot must not be redesigned or changed, and spell the on-image text exactly. English only. Do not use long dashes.`;
  return { system, user };
}

/* Step 3: the project itself, plus meta title and description. */
export function writePrompts(b, { site, seo, brand, facts, visual, examples = [], services = [] }) {
  const tpl = String(seo.titleTemplate || '%s').includes('%s') ? String(seo.titleTemplate) : '%s';
  const room = Math.max(40, 62 - (tpl.length - 2));
  const tagList = WORK_TYPES.filter((w) => (b.workTypes || []).includes(w.id)).map((w) => w.tag);
  const system = `You are ${site.name}, ${site.role}. You write the entries in your own portfolio: short, specific and honest, in the first person ("I"), for small business owners who are deciding whether to hire you. You are also an SEO editor. Return JSON only.
${WRITING_RULES}
Hard rules for this task:
- Use only facts from the brief, the owner's notes, the website text and the screenshot notes. Never invent results, numbers, percentages, rankings, traffic, revenue, client quotes, awards, team size or dates.
- Numbers may appear only if they are in the owner's notes.
- If something is unknown, leave it out instead of guessing. Say what was done and why it matters to the client's visitors.
- No long dashes (the characters U+2014 and U+2013). Plain words. No hype.`;
  const user = `Write the portfolio entry for this website project.

Website name: ${b.name}
Website address: ${b.url || 'not given'}
Client name: ${b.client || b.name}
Industry (owner's words): ${b.industry || 'not given, infer it from the website text'}
Platform chosen by the owner: ${b.platform || 'not given'}
Platform detected from the page source: ${facts?.platform?.cms || 'unknown'}${facts?.platform?.techs?.length ? `; tools seen: ${facts.platform.techs.join(', ')}` : ''}
What I did (work types):
${workLines(b.workTypes)}
Where the work is now: ${statusLine(b.status)}
Dates: ${[b.startDate && `started ${b.startDate}`, b.endDate && `finished ${b.endDate}`].filter(Boolean).join(', ') || 'not given'}
Owner's notes (real, use them; they beat everything else): ${b.notes || 'none'}

What the live website says:
Title: ${facts?.title || '-'}
Meta description: ${facts?.description || '-'}
Main heading: ${facts?.h1 || '-'}
Headings: ${(facts?.headings || []).join(' | ') || '-'}
Menu: ${(facts?.nav || []).join(', ') || '-'}
Location hints: ${facts?.locality || '-'}
Text from the page: ${(facts?.text || '').slice(0, 2400) || '-'}

What the screenshot shows: ${visual?.description || '-'}${visual?.sections?.length ? ` Sections: ${visual.sections.join(', ')}.` : ''}

My other portfolio entries, for tone and length (match this style):
${examples.map((e) => `- ${e.title}: ${e.summary}`).join('\n') || '- none yet'}

Services I sell (use the same words when they fit): ${services.join(', ') || '-'}
Meta title format on my site: "${seo.titleTemplate || '%s'}" (I add the brand part myself).
Brand voice: ${brand || 'plain, practical, honest'}

Return JSON with exactly these keys:
{
 "title": "the project name as people know it, usually the website name: ${b.name}",
 "client": "client or business name",
 "industry": "2 to 5 words, sentence case, for example 'Legal services'",
 "location": "city or country if the website clearly shows it, else empty",
 "summary": "1 to 2 sentences, 130 to 200 characters, for the portfolio card: what the business needed and what the site now does for its visitors",
 "content": "markdown, 180 to 380 words, first person. Use exactly three H2 headings fitting the stage: finished work: '## The brief', '## What I did', '## The result'; still building: '## The brief', '## What I am building', '## Where it stands'; ongoing care: '## The client', '## What I look after', '## How the care works'. Under the middle heading: one short paragraph plus a list of 3 to 6 concrete bullet points. The result section describes real, checkable outcomes without numbers unless the notes give numbers.",
 "deliverables": ["3 to 6 short lines, each a concrete thing delivered or looked after, under 90 characters"],
 "services": ["work type tags, 1 to 4, start with: ${tagList.join(', ') || 'Website design'}"],
 "technologies": ["tools and languages actually used or detected, from this list when possible: ${[...new Set([...(facts?.platform?.techs || []), ...TECH_OPTIONS])].slice(0, 45).join(', ')}"],
 "platformType": "cms or custom",
 "cms": "one of: ${CMS_OPTIONS.join(', ')}, or empty for custom code",
 "metrics": [{"value": "only numbers that are in the owner's notes", "label": "what it measures"}],
 "focusKeyword": "2 to 4 words someone might search to find this kind of work, for example '${(tagList[0] || 'website design').toLowerCase()} for ${(b.industry || 'law firms').toLowerCase()}'",
 "keywords": ["4 to 6 related search phrases"],
 "metaTitle": "the part before the brand, ${room - 14} to ${room} characters, starts with the project name, then the work type and industry or place",
 "metaDescription": "140 to 158 characters, says what was built or done, for whom and the benefit, ends with a light call to action like 'See the project.'",
 "ogTitle": "a slightly friendlier social headline, under 70 characters",
 "ogDescription": "under 120 characters",
 "breadcrumbTitle": "short name, 1 to 3 words",
 "imageAlt": "alt text for the full-page screenshot, under 125 characters"
}`;
  return { system, user };
}
