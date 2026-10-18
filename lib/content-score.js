import { aiScan } from './humanize';

/* NeuronWriter style content score: 0 to 100 from six weighted groups. Pure function, runs live in the editor.
   input: { title, metaTitle, metaDescription, slug, primary, secondary[], markdown, terms[{term,min,max}], targetWords, faq, imageCount, brand } */
const W = (s = '') => (String(s).match(/[\p{L}\p{N}'’-]+/gu) || []);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const count = (hay, needle) => (needle ? (hay.match(new RegExp(`(^|[^\\p{L}\\p{N}])${esc(needle.toLowerCase())}(?=$|[^\\p{L}\\p{N}])`, 'gu')) || []).length : 0);
const slugOf = (k = '') => k.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function flesch(text) {
  const words = W(text); if (!words.length) return 0;
  const sents = Math.max(1, (text.match(/[.!?]+(\s|$)/g) || []).length);
  const syl = words.reduce((a, w) => a + Math.max(1, (w.toLowerCase().replace(/e$/, '').match(/[aeiouy]+/g) || []).length), 0);
  return 206.835 - 1.015 * (words.length / sents) - 84.6 * (syl / words.length);
}

export function scoreContent(inp) {
  const md = String(inp.markdown || ''); const primary = String(inp.primary || '').trim(); const sec = (inp.secondary || []).map((x) => String(x).trim()).filter(Boolean);
  const heads = [...md.matchAll(/^(#{1,6})\s+(.+)$/gm)].map((m) => ({ d: m[1].length, t: m[2].trim() }));
  const body = md.replace(/^#{1,6}\s.*$/gm, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`>|]/g, ' ');
  const plain = body.replace(/\s+/g, ' ').trim(); const low = plain.toLowerCase(); const words = W(plain); const wc = words.length;
  const first = words.slice(0, 110).join(' ').toLowerCase(); const lowFull = `${heads.map((h) => h.t).join(' ')} ${plain}`.toLowerCase();
  const pk = primary.toLowerCase(); const kwWords = W(primary).length || 1;
  const pkCount = count(lowFull, pk); const density = wc ? (pkCount * kwWords * 100) / wc : 0;
  const h2 = heads.filter((h) => h.d === 2); const h3 = heads.filter((h) => h.d === 3);
  const target = Number(inp.targetWords) || 1500;
  const paras = md.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p && !/^(#|[-*\d]|\||!\[|>)/.test(p));
  const longParas = paras.filter((p) => W(p).length > 130).length;
  const sentLens = (plain.match(/[^.!?]+[.!?]+/g) || []).map((s) => W(s).length).filter(Boolean); const avg = sentLens.reduce((a, b) => a + b, 0) / (sentLens.length || 1);
  const latin = (plain.match(/[a-z]/gi) || []).length > plain.length * 0.5; const fre = latin ? flesch(plain) : null;
  const imgs = [...md.matchAll(/!\[([^\]]*)\]\(([^)]*)\)/g)]; const imgAlt = imgs.filter((m) => m[1].trim().length > 3).length; const imgKw = imgs.some((m) => primary && m[1].toLowerCase().includes(pk));
  const links = [...md.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)/g)].map((m) => m[1]); const internal = links.filter((l) => l.startsWith('/') || (inp.brand && l.includes(inp.brand))).length; const external = links.filter((l) => /^https?:/.test(l) && !(inp.brand && l.includes(inp.brand))).length;
  const lists = (md.match(/^\s*([-*]|\d+\.)\s/gm) || []).length; const tables = /\n\|.+\|\s*\n\|[\s:|-]+\|/.test(md);
  const hasFaq = heads.some((h) => /faq|frequently asked|questions/i.test(h.t)) || (inp.faq || 0) > 0;
  const ai = aiScan(md); const year = /\b(20[2-3]\d)\b/.test(md); const exp = (low.match(/\b(i |i'|we |my |our |in my experience|when i|i've|we've)\b/g) || []).length; const nums = (plain.match(/\b\d[\d,.]*\b/g) || []).length;
  const T = String(inp.metaTitle || inp.title || ''); const D = String(inp.metaDescription || '');

  const groups = [];
  const g = (name, max, rows) => { const got = rows.reduce((a, r) => a + r.pts, 0); groups.push({ name, max, got: Math.round(got * 10) / 10, rows }); };
  const row = (label, pts, max, tip, ok) => ({ label, pts, max, tip, status: pts >= max * 0.95 ? 'good' : pts >= max * 0.45 ? 'ok' : 'bad' });
  const lin = (v, lo, hi, max) => (v >= lo && v <= hi ? max : v < lo ? max * Math.max(0, v / lo) : max * Math.max(0, 1 - (v - hi) / hi));

  g('Keyword targeting', 25, [
    row(primary ? `Primary keyword in the title` : 'Set a primary keyword', primary && T.toLowerCase().includes(pk) ? 4 : 0, 4, 'Put the exact primary keyword in the SEO title, near the start.'),
    row('Primary keyword in the meta description', primary && D.toLowerCase().includes(pk) ? 3 : 0, 3, 'Mention the keyword naturally in the meta description.'),
    row('Primary keyword in the URL', primary && slugOf(inp.slug || '').includes(slugOf(primary)) ? 3 : 0, 3, 'Use the keyword in the URL slug.'),
    row('Primary keyword in the first 100 words', primary && first.includes(pk) ? 4 : 0, 4, 'Say what the post is about in the first paragraph.'),
    row('Primary keyword in a subheading', primary && h2.concat(h3).some((h) => h.t.toLowerCase().includes(pk)) ? 3 : 0, 3, 'Use the keyword (or a close variant) in at least one H2.'),
    row(`Keyword density ${density.toFixed(1)}%`, primary ? lin(density, 0.5, 1.8, 4) : 0, 4, 'Aim for about 0.5% to 1.8%. More reads as stuffing.'),
    row('Secondary keywords used', sec.length ? 4 * (sec.filter((k) => count(lowFull, k.toLowerCase()) > 0).length / sec.length) : 2, 4, 'Work every secondary keyword into the text at least once.'),
  ]);
  const terms = inp.terms || []; const tUsed = terms.filter((t) => count(lowFull, String(t.term || t).toLowerCase()) >= (t.min || 1)).length;
  g('Depth and coverage', 20, [
    row(`Length ${wc} words (target ${target})`, lin(wc, target * 0.85, target * 1.5, 9), 9, 'Match the depth the topic needs. Longer is only better if every section adds something.'),
    row(`Related terms covered ${tUsed}/${terms.length || 0}`, terms.length ? 8 * (tUsed / terms.length) : 4, 8, 'Use the recommended related terms where they fit naturally. They show Google you cover the topic.'),
    row('Examples and numbers', Math.min(3, nums / 6), 3, 'Add specific numbers, tools and examples. Concrete beats vague.'),
  ]);
  const skip = heads.some((h, i) => i && h.d > heads[i - 1].d + 1);
  g('Structure', 20, [
    row('No H1 inside the text', heads.some((h) => h.d === 1) ? 0 : 3, 3, 'The post title is the only H1. Start the text with H2 headings.'),
    row(`H2 sections: ${h2.length}`, lin(h2.length, Math.max(3, Math.round(wc / 350)), 14, 6), 6, 'About one H2 per 250 to 350 words.'),
    row('Heading levels do not skip', skip ? 0 : 3, 3, 'Go H2 then H3, never H2 then H4.'),
    row('FAQ section', hasFaq ? 3 : 0, 3, 'A short FAQ answers extra questions and can win rich results.'),
    row('Lists', lists >= 4 ? 3 : lists ? 1.5 : 0, 3, 'Use bullet or numbered lists for steps and options.'),
    row('Table or comparison', tables ? 2 : 0, 2, 'A small table helps comparison topics and often earns featured snippets.'),
  ]);
  g('Readability', 15, [
    row(fre == null ? 'Readability (non-English text)' : `Reading ease ${Math.round(fre)}`, fre == null ? 5 : lin(fre, 50, 80, 5), 5, 'Easier is better for most audiences. Use shorter words and sentences.'),
    row(`Average sentence ${Math.round(avg)} words`, lin(avg, 8, 20, 5), 5, 'Keep the average under about 20 words.'),
    row('Paragraph length', longParas === 0 ? 5 : longParas === 1 ? 3 : 0, 5, 'Split paragraphs over about 130 words.'),
  ]);
  g('Media and links', 10, [
    row(`Images with alt text ${imgAlt}`, Math.min(4, imgAlt * 1.5), 4, 'Add 2 to 3 images, each with a descriptive alt text.'),
    row('Image alt includes the keyword', imgKw ? 1 : 0, 1, 'Use the keyword in one image alt text.'),
    row(`Internal links ${internal}`, Math.min(3, internal * 1.5), 3, 'Link to 2 or more of your own pages or posts.'),
    row(`External sources ${external}`, Math.min(2, external * 2), 2, 'Link to one trusted source when you state a fact.'),
  ]);
  g('Human voice and trust', 10, [
    row(`AI-style phrases ${ai.total}`, lin(ai.per1000, 0, 0.5, 4) >= 0 ? Math.max(0, 4 - ai.per1000 * 1.2) : 0, 4, 'Remove or rewrite flagged filler words and stock phrases.'),
    row(`Sentence variety ${(ai.burstiness * 100).toFixed(0)}%`, lin(ai.burstiness, 0.45, 1, 2.5), 2.5, 'Mix short and long sentences. Even rhythm sounds machine-made.'),
    row('First-hand experience', Math.min(2, exp / 3), 2, 'Add practical experience: what you saw, tried or got wrong.'),
    row('Fresh and dated', year ? 1.5 : 0, 1.5, 'Mention the current year where it matters. It signals up to date content.'),
  ]);
  const total = groups.reduce((a, x) => a + x.got, 0); const max = groups.reduce((a, x) => a + x.max, 0);
  const score = Math.round((total / max) * 100);
  return { score, tone: score >= 80 ? 'good' : score >= 60 ? 'ok' : 'bad', groups, words: wc, density, ai, fre, headings: { h2: h2.length, h3: h3.length }, missingTerms: terms.filter((t) => count(lowFull, String(t.term || t).toLowerCase()) < (t.min || 1)).map((t) => t.term || t), missingSecondary: sec.filter((k) => !count(lowFull, k.toLowerCase())) };
}
