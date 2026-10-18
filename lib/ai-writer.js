import 'server-only';
import { WRITING_RULES, WRITING_RULES_BN } from './humanize';
import { toneOf } from './tones';

const isBn = (b) => /bengali|bangla|বাংলা/i.test(b.language || '');
const lang = (b) => (isBn(b) ? 'Write in Bengali (Bangla script). Keep the URL slug, file names and image prompts in English letters.' : 'Write in English.');
const rules = (b) => (isBn(b) ? WRITING_RULES_BN : WRITING_RULES);
const toneLine = (b) => { const t = toneOf(b.tone); return `Tone: ${t.label}. ${t.guide}`; };

const PERSONA = (site) => `You are a specialist content writer and SEO editor with 10 years of experience, writing for ${site.name} (${site.role}). Your posts rank because they answer the search intent better than the pages already ranking, and they read like a real practitioner wrote them, not like AI.`;

/* Step 1: the SEO plan (title, meta, slug, keywords, outline, FAQ, terms). Kept small so free models answer reliably. */
export function planPrompts(b, { site, brand, categories = [], posts = [] }) {
  const system = `${PERSONA(site)} You plan articles. Return JSON only.\n${rules(b)}`;
  const n = Math.max(4, Math.min(10, Math.round((b.words || 1500) / 250)));
  const user = `Plan a blog post.
Topic: ${b.topic}
Primary keyword: ${b.primary || '(choose the best one)'}
Secondary keywords: ${(b.secondary || []).join(', ') || '(choose 6 to 10)'}
Real questions people ask about this topic (use them for H2/H3 headings and the FAQ where they fit): ${(b.questions || []).join(' | ') || 'none given'}
Audience: ${b.audience || 'small business owners'}
Search intent: ${b.intent || 'infer it'}
${toneLine(b)}
Target length: about ${b.words || 1500} words
${lang(b)}
Brand voice notes: ${brand || 'plain, practical, honest'}
Extra notes from the owner (use them, they are real experience): ${b.notes || 'none'}
Existing blog categories: ${categories.join(', ') || 'none'}
Existing posts to link to (slug: title): ${posts.slice(0, 25).map((p) => `${p.slug}: ${p.title}`).join(' | ') || 'none'}

Return JSON with exactly these keys:
{
 "title": "H1, under 60 characters, primary keyword near the start, no clickbait",
 "metaTitle": "under 60 characters, includes the primary keyword",
 "metaDescription": "145 to 158 characters, includes the primary keyword, promises a clear benefit, no quotes",
 "slug": "short-lowercase-english-words-with-keyword, 3 to 6 words, Latin letters only",
 "category": "best existing category, or a new short category name",
 "excerpt": "1 to 2 sentences for the blog card, 140 to 180 characters",
 "tags": ["4 to 6 short tags"],
 "primaryKeyword": "",
 "secondaryKeywords": ["6 to 10"],
 "searchIntent": "informational|commercial|transactional",
 "angle": "one sentence on what makes this post better than the usual top results",
 "outline": [{"h2": "heading that answers a real question, uses a keyword where natural", "h3": ["0 to 3 subheadings"], "points": ["3 to 5 specific things this section must cover"], "words": 250}] (${n} sections; the last one is a practical next step section, NOT "Conclusion"),
 "faq": [{"q": "real question", "a": "40 to 70 word answer"}] (4 to 6),
 "terms": [{"term": "related word or entity a thorough article should mention", "min": 1}] (14 to 20),
 "internalLinks": [{"slug": "existing-post-slug", "anchor": "natural anchor text", "section": 2}] (up to 3, only from the existing posts list),
 "cta": "one sentence call to action that fits the topic"
}`;
  return { system, user };
}

/* Step 1b: image, infographic, chart and table plan. A separate small call so the main plan never fails because of it. */
export function visualPrompts(plan, b, { site }) {
  const system = `${PERSONA(site)} You are also an art director who briefs image AIs precisely. Return JSON only.`;
  const heads = (plan.outline || []).map((s, i) => `${i + 1}. ${s.h2}`).join('\n');
  const user = `Plan the visuals for this blog post.
Title: ${plan.title}
Primary keyword: ${plan.primaryKeyword}
Language of the post: ${isBn(b) ? 'Bengali (but write prompts, alt text and file names in English; text rendered on images in the post language only if it is short, otherwise keep it in English)' : 'English'}
Sections (number: heading):
${heads}

Decide how many visuals this post really needs (usually 4 to 7 in total) and return JSON:
{
 "summary": "one sentence: how many visuals and why, for example: 1 featured image, 3 inline images, 1 infographic, 1 chart and 1 comparison table",
 "images": [
  {"slot": 1, "role": "featured|inline|infographic|chart|table", "after": 0, "title": "short label", "alt": "descriptive alt text with the keyword where natural (not for tables)", "filename": "seo-friendly-name.webp", "ratio": "16:9", "caption": "", "textOnImage": ["exact short words to render, empty if none"], "prompt": "see rules", "instructions": "step by step how to make or place it (2 to 4 short sentences)", "tool": "suggested free tool: ChatGPT image, Nano Banana in Gemini, Canva free, Google Sheets, Datawrapper, Excalidraw...", "chartType": "bar|line|pie|donut|none", "data": "for chart: a markdown table of the data to plot. For table: the finished markdown table to paste into the post. Otherwise empty.", "dataNote": "if the numbers are illustrative say: Replace with your real numbers"}
 ]
}
Rules:
- Slot 1 is ALWAYS the featured image (role featured, ratio 16:9, 1200x630 safe area). Describe exactly what it should show so it works as the social share image too. A short bold title on the image is fine if it is 6 words or fewer.
- "after" = the number of the section the visual follows; 0 = right after the intro.
- Include only the visuals that add something. Use an infographic for a process or checklist, a chart only when numbers or a trend are meaningful, a table for comparisons (options, prices, pros and cons).
- Never invent statistics. For a chart or table with numbers you cannot know, use clearly illustrative values and say so in dataNote.
- For role table: prompt stays empty, data holds the complete markdown table (3 to 6 rows), instructions say where it goes.
- Every other prompt must be 70 to 140 words and paste-ready for ChatGPT image generation, Nano Banana, Midjourney or similar: main subject and scene, art style (clean flat vector or photorealistic editorial), composition and camera angle, lighting, color palette (deep navy #0C1526 and signal blue #2F63E6 with amber accents when it fits), aspect ratio, where empty space should be, and the exact text to render in quotes (6 words or fewer per label, spell-checked). End with: "No watermark, no extra text, no distorted letters."
- Infographic prompts describe the layout block by block with the exact text of every label and number. Chart prompts name the chart type, axes, series colors and the exact data.`;
  return { system, user };
}

export function sectionPrompts(plan, kind, index, tail, b, { site, brand }) {
  const system = `${PERSONA(site)} You are now writing one part of the post as the ghostwriter. Output Markdown only: no preamble, no notes to the editor, no code fences around the answer.\n${rules(b)}\n${lang(b)}\nBrand voice: ${brand || 'plain, practical, honest'}. ${toneLine(b)}`;
  const terms = (plan.terms || []).map((t) => t.term || t).join(', ');
  const sec = (plan.secondaryKeywords || []).join(', ');
  const head = `Post title: ${plan.title}\nPrimary keyword: ${plan.primaryKeyword}\nSecondary keywords: ${sec}\nRelated terms to use where they fit naturally (do not force them): ${terms}\nAudience: ${b.audience || 'small business owners'}. Angle: ${plan.angle || ''}\nOwner's own notes (real experience, use where it fits): ${b.notes || 'none'}\n`;
  const links = (plan.internalLinks || []).filter((l) => l.slug).map((l) => `section ${l.section}: link the words "${l.anchor}" to /blog/${l.slug}`).join('; ');
  if (kind === 'intro') return { system, user: `${head}\nWrite the introduction only: 90 to 140 words, no heading. Answer the search intent in the first two sentences. Use the primary keyword once in the first 100 words, naturally. Hook with something specific (a number you are sure about, a common mistake, a short scenario), not a question or a generic claim. Do not preview the outline.` };
  if (kind === 'faq') return { system, user: `${head}\nWrite a "## ${isBn(b) ? 'সাধারণ প্রশ্ন' : 'Frequently asked questions'}" section. For each question use "### Question" then a 40 to 70 word answer in plain prose. Questions and answer drafts: ${JSON.stringify(plan.faq || [])}. Improve the answers, keep them accurate and direct.` };
  const s = plan.outline[index]; const last = index === plan.outline.length - 1;
  return { system, user: `${head}\nWrite this section (about ${s.words || 250} words).\nStart with the exact line: ## ${s.h2}\n${s.h3?.length ? `Then cover these subsections with ### headings: ${s.h3.join(' | ')}\n` : ''}Must cover: ${(s.points || []).join('; ')}.\nUse a short list or a table only where it genuinely helps. Give specific examples, steps or numbers you are sure about.\n${links ? `Internal links: ${links} (only in the matching section, only once).\n` : ''}${last ? `This is the final section. Give a practical next step. End with this call to action in your own words: ${plan.cta || 'a clear next step'}. Do not write a conclusion or summary.\n` : ''}${tail ? `The text so far ends with: "...${tail.slice(-500)}". Continue without repeating it.` : ''}` };
}
