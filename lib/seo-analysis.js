/* On-page SEO analysis in the style of Rank Math and Yoast. Pure function: runs in the admin
   (live while you type) and on the server (SEO overview). Returns a 0 to 100 score and a checklist. */

const SKIP = new Set(['_id', 'slug', 'seoTitle', 'seoDescription', 'seoImage', 'ogTitle', 'ogDescription', 'canonical', 'code', 'schemaMarkup', 'focusKeyword', 'keywords', 'createdAt', 'updatedAt', 'publishedAt', 'trashState', 'accent', 'color', 'icon', 'background', 'anchor', 'type', 'align', 'width', 'href', 'url', 'liveUrl', 'image', 'cover', 'avatar', 'logo', 'scrollImage', 'bannerImage', 'gallery', 'images', 'source', 'columns', 'size']);
const TEXT_KEYS = ['content', 'body', 'text', 'intro', 'overview', 'results', 'summary', 'excerpt', 'description', 'quote', 'a', 'q', 'title', 'heading', 'challengeIntro', 'approachIntro', 'resultsIntro', 'caption'];

/* Collects the readable text of a document: markdown fields, page-builder sections, repeaters. */
export function collect(doc = {}) {
  const md = []; const headings = []; const images = []; const links = [];
  const walk = (v, key, depth = 0) => {
    if (depth > 6 || v == null) return;
    if (typeof v === 'string') {
      if (SKIP.has(key) || !TEXT_KEYS.includes(key)) return;
      if (key === 'heading' || (key === 'title' && depth > 1)) headings.push(v);
      md.push(v);
      return;
    }
    if (Array.isArray(v)) { v.forEach((x) => walk(x, key, depth + 1)); return; }
    if (typeof v === 'object') {
      if (v.hidden) return;
      if (typeof v.image === 'string' && v.image) images.push({ src: v.image, alt: v.alt || v.heading || '' });
      if (v.href && typeof v.href === 'string') links.push(v.href);
      for (const [k, x] of Object.entries(v)) if (!SKIP.has(k) || k === 'images' || k === 'gallery') {
        if ((k === 'images' || k === 'gallery') && Array.isArray(x)) x.forEach((src) => typeof src === 'string' && images.push({ src, alt: '' }));
        else walk(x, k, depth + 1);
      }
    }
  };
  for (const [k, v] of Object.entries(doc || {})) {
    if (k === 'title' || k === 'name') continue; // the page title is checked separately
    if (['cover', 'scrollImage', 'bannerImage'].includes(k) && v) images.push({ src: v, alt: doc.title || '' });
    else walk(v, k, 1);
  }
  const all = md.join('\n\n');
  for (const m of all.matchAll(/^#{1,6}\s+(.+)$/gm)) headings.push(m[1]);
  for (const m of all.matchAll(/!\[([^\]]*)\]\(([^)\s]+)/g)) images.push({ src: m[2], alt: m[1] });
  for (const m of all.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)/g)) links.push(m[1]);
  for (const m of all.matchAll(/<a\s[^>]*href=["']([^"']+)/gi)) links.push(m[1]);
  const plain = all.replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ').replace(/[#>*_`~|-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const paragraphs = all.split(/\n{2,}/).map((p) => p.replace(/^#{1,6}\s.*$/gm, '').trim()).filter((p) => p && !/^[-*\d]/.test(p));
  return { text: plain, headings, images, links, paragraphs };
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const words = (s = '') => (String(s).match(/[\p{L}\p{N}'’]+/gu) || []);
const has = (hay = '', kw = '') => !!kw && String(hay).toLowerCase().includes(kw.toLowerCase());
const slugHas = (slug = '', kw = '') => {
  const k = kw.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return !!k && String(slug).toLowerCase().includes(k);
};

/* input: { title, description, slug, path, keyword, keywords[], doc, noindex, contentAware, siteHost } */
export function analyze({ title = '', description = '', slug = '', path = '', keyword = '', keywords = [], doc = {}, noindex = false, contentAware = true } = {}) {
  const kw = String(keyword || '').trim();
  const c = contentAware ? collect(doc) : { text: '', headings: [], images: [], links: [], paragraphs: [] };
  const w = words(c.text); const wc = w.length;
  const kwCount = kw ? (c.text.toLowerCase().match(new RegExp(`(^|[^\\p{L}\\p{N}])${esc(kw.toLowerCase())}(?=$|[^\\p{L}\\p{N}])`, 'gu')) || []).length : 0;
  const kwWords = words(kw).length || 1;
  const density = wc ? (kwCount * kwWords * 100) / wc : 0;
  const first = w.slice(0, Math.max(30, Math.round(wc * 0.1))).join(' ');
  const internal = c.links.filter((l) => l.startsWith('/') || l.startsWith('#')).length;
  const external = c.links.filter((l) => /^https?:\/\//.test(l)).length;
  const sentences = c.text.split(/[.!?।]+\s/).map((s) => words(s).length).filter(Boolean);
  const avgSentence = sentences.length ? sentences.reduce((a, b) => a + b, 0) / sentences.length : 0;
  const longParas = c.paragraphs.filter((p) => words(p).length > 150).length;
  const T = String(title || ''); const D = String(description || '');
  const checks = [];
  const add = (group, id, ok, label, tip, weight = 1, warn) => checks.push({ group, id, status: ok === true ? 'good' : ok === 'ok' ? 'ok' : 'bad', label, tip, weight, warn });

  // Basic
  add('Basic SEO', 'kw', !!kw, kw ? `Focus keyword: "${kw}"` : 'Set a focus keyword', 'The main search phrase you want this page to rank for. Every other keyword check uses it.', 2);
  if (kw) {
    add('Basic SEO', 'kwTitle', has(T, kw), has(T, kw) ? 'Keyword is in the SEO title' : 'Add the keyword to the SEO title', 'Google gives the title the most weight. Use the exact phrase.', 3);
    const pos = T.toLowerCase().indexOf(kw.toLowerCase());
    add('Basic SEO', 'kwTitleStart', pos >= 0 && pos <= T.length * 0.5 ? true : pos >= 0 ? 'ok' : false, pos >= 0 && pos <= T.length * 0.5 ? 'Keyword is near the start of the title' : 'Move the keyword closer to the start of the title', 'Titles that start with the keyword tend to get more clicks and rank a little better.', 1);
    add('Basic SEO', 'kwDesc', has(D, kw), has(D, kw) ? 'Keyword is in the meta description' : 'Add the keyword to the meta description', 'Google bolds matching words in the description, which draws the eye.', 2);
    add('Basic SEO', 'kwUrl', slugHas(slug || path, kw), slugHas(slug || path, kw) ? 'Keyword is in the URL' : 'Use the keyword in the URL slug', 'A short URL with the keyword helps people and search engines understand the page.', 1);
    if (contentAware) {
      add('Basic SEO', 'kwFirst', has(first, kw), has(first, kw) ? 'Keyword appears at the start of the content' : 'Use the keyword in the first paragraph', 'Saying the topic early confirms to readers and Google what the page is about.', 2);
      add('Basic SEO', 'kwContent', kwCount > 0, kwCount ? `Keyword appears ${kwCount} time${kwCount > 1 ? 's' : ''} in the content` : 'The keyword does not appear in the content', 'Use the phrase naturally in the text.', 2);
    }
  }
  if (contentAware) add('Basic SEO', 'length', wc >= 600 ? true : wc >= 300 ? 'ok' : false, `Content length: ${wc} words${wc < 300 ? ' (thin)' : ''}`, 'Longer, useful pages rank better. 300 words is a minimum, 600 to 2,500 is a good range for articles.', 2);

  // Title and description
  add('Title and description', 'titleLen', T.length >= 30 && T.length <= 60 ? true : T.length && T.length <= 70 ? 'ok' : false, `SEO title is ${T.length} characters`, '30 to 60 characters shows in full on Google. Longer titles are cut off with dots.', 2);
  add('Title and description', 'descLen', D.length >= 120 && D.length <= 160 ? true : D.length >= 70 && D.length <= 180 ? 'ok' : false, D.length ? `Meta description is ${D.length} characters` : 'Write a meta description', '120 to 160 characters. Without one, Google picks random text from the page.', 2);
  add('Title and description', 'titleNum', /\d/.test(T) ? true : 'ok', /\d/.test(T) ? 'Title contains a number' : 'Tip: a number in the title (2026, 7 tips, 550+) often lifts clicks', 'Numbers stand out in search results. This is a suggestion, not a rule.', 0.5);
  const url = String(path || '');
  add('Title and description', 'urlLen', url.length <= 75, `URL is ${url.length} characters`, 'Short URLs are easier to share and read. Keep it under 75 characters.', 0.5);

  if (contentAware) {
    // Content
    if (kw) {
      add('Content', 'kwHeads', c.headings.some((h) => has(h, kw)), c.headings.some((h) => has(h, kw)) ? 'Keyword is in a subheading' : 'Use the keyword in at least one subheading', 'Subheadings (## in the editor or section headings) help Google and skimmers.', 1);
      add('Content', 'kwAlt', c.images.some((i) => has(i.alt, kw)) ? true : c.images.length ? 'ok' : false, c.images.some((i) => has(i.alt, kw)) ? 'Keyword is in an image alt text' : 'Add the keyword to an image alt text', 'Alt text describes images for Google Images and screen readers.', 0.5);
      add('Content', 'density', density >= 0.5 && density <= 2.5 ? true : density > 0 && density <= 3.5 ? 'ok' : false, `Keyword density ${density.toFixed(1)}%`, 'Around 0.5% to 2.5% is natural. Much more reads as stuffing.', 1);
    }
    add('Content', 'internal', internal > 0, internal ? `${internal} internal link${internal > 1 ? 's' : ''}` : 'Add a link to another page on your site', 'Internal links pass authority and keep visitors on the site.', 1);
    add('Content', 'external', external > 0 ? true : 'ok', external ? `${external} external link${external > 1 ? 's' : ''}` : 'Consider linking to a trusted outside source', 'Citing sources builds trust. Optional for sales pages.', 0.5);
    add('Content', 'media', c.images.length > 0, c.images.length ? `${c.images.length} image${c.images.length > 1 ? 's' : ''} on the page` : 'Add at least one image', 'Images make pages easier to read and can rank in Google Images.', 0.5);
    // Readability
    add('Readability', 'heads', wc < 300 || c.headings.length > 0, c.headings.length ? 'Content is split with subheadings' : 'Break long text with subheadings', 'Readers skim. A heading every 300 words or so helps.', 0.5);
    add('Readability', 'sentences', !sentences.length || avgSentence <= 20 ? true : avgSentence <= 26 ? 'ok' : false, sentences.length ? `Average sentence: ${Math.round(avgSentence)} words` : 'No sentences yet', 'Short sentences (under about 20 words) are easier to read.', 0.5);
    add('Readability', 'paras', longParas === 0, longParas ? `${longParas} very long paragraph${longParas > 1 ? 's' : ''}` : 'Paragraphs are a good length', 'Keep paragraphs under about 150 words, especially on phones.', 0.5);
  }

  if (noindex) checks.unshift({ group: 'Basic SEO', id: 'noindex', status: 'bad', label: 'This page is set to noindex', tip: 'Google is asked not to show it. Turn noindex off in the Advanced tab if you want it in search.', weight: 0, warn: true });

  const scored = checks.filter((x) => x.weight > 0);
  const total = scored.reduce((a, x) => a + x.weight, 0) || 1;
  const got = scored.reduce((a, x) => a + (x.status === 'good' ? x.weight : x.status === 'ok' ? x.weight * 0.5 : 0), 0);
  const score = Math.round((got / total) * 100);
  return { score, tone: score >= 80 ? 'good' : score >= 50 ? 'ok' : 'bad', checks, words: wc, density };
}

/* Convenience for an admin document with the usual SEO fields. */
export function analyzeDoc(doc = {}, { path = '', titleFrom = 'title', descFrom, template = '%s', contentAware = true } = {}) {
  const base = doc[titleFrom] || '';
  const title = String(doc.seoTitle || '').trim() || (base ? template.replace('%s', base) : '');
  const description = String(doc.seoDescription || '').trim() || (descFrom ? doc[descFrom] || '' : '');
  return analyze({ title, description, slug: doc.slug, path, keyword: doc.focusKeyword, keywords: doc.keywords, doc, noindex: doc.seoNoindex, contentAware });
}
