import 'server-only';
import { WRITING_RULES } from './humanize';

const lang = (b) => (b.language && b.language !== 'English' ? `Write in ${b.language}.` : 'Write in English.');

export function planPrompts(b, { site, brand, categories = [], posts = [] }) {
  const system = `You are a senior SEO content strategist and editor for ${site.name} (${site.role}). You plan articles that rank and genuinely help readers. Return JSON only.\n${WRITING_RULES}`;
  const user = `Plan a blog post.
Topic: ${b.topic}
Primary keyword: ${b.primary || '(choose the best one)'}
Secondary keywords: ${(b.secondary || []).join(', ') || '(choose 6 to 10)'}
Audience: ${b.audience || 'small business owners'}
Search intent: ${b.intent || 'infer it'}
Tone: ${b.tone || 'friendly and expert'}
Target length: about ${b.words || 1500} words
${lang(b)}
Brand voice notes: ${brand || 'plain, practical, honest'}
Extra notes: ${b.notes || 'none'}
Existing blog categories: ${categories.join(', ') || 'none'}
Existing posts to link to (slug: title): ${posts.slice(0, 25).map((p) => `${p.slug}: ${p.title}`).join(' | ') || 'none'}

Return JSON with exactly these keys:
{
 "title": "H1, under 60 characters, primary keyword near the start, no clickbait, no colon-heavy formula",
 "metaTitle": "under 60 characters, includes the primary keyword",
 "metaDescription": "145 to 158 characters, includes the primary keyword, promises a clear benefit, no quotes",
 "slug": "short-lowercase-with-keyword, 3 to 6 words",
 "category": "best existing category, or a new short category name",
 "excerpt": "1 to 2 sentences for the blog card, 140 to 180 characters",
 "tags": ["4 to 6 short tags"],
 "primaryKeyword": "",
 "secondaryKeywords": ["6 to 10"],
 "searchIntent": "informational|commercial|transactional",
 "angle": "one sentence on what makes this post better than the usual top results",
 "outline": [{"h2": "heading that answers a real question, uses a keyword where natural", "h3": ["0 to 3 subheadings"], "points": ["3 to 5 specific things this section must cover"], "words": 250}] (${Math.max(4, Math.min(10, Math.round((b.words || 1500) / 250)))} sections; the last one is a practical next step section, NOT "Conclusion"),
 "faq": [{"q": "real question", "a": "40 to 70 word answer"}] (4 to 6),
 "terms": [{"term": "related word or entity a thorough article should mention", "min": 1}] (14 to 20),
 "images": [{"slot": 1, "role": "featured|inline|infographic", "after": 0, "alt": "descriptive alt text with the keyword where natural", "filename": "seo-friendly-name.webp", "ratio": "16:9", "caption": "", "textOnImage": ["exact short words to render on the image, empty if none"], "prompt": "see rules"}] (slot 1 is the featured image; then 2 to 4 inline images and 1 infographic; "after" = number of the section the image follows, 0 = after the intro),
 "internalLinks": [{"slug": "existing-post-slug", "anchor": "natural anchor text", "section": 2}] (up to 3, only from the existing posts list),
 "cta": "one sentence call to action that fits the topic"
}
Image prompt rules: each prompt must be 70 to 140 words and ready to paste into ChatGPT image generation, Nano Banana, Midjourney or similar. Include: the main subject and scene, art style (for example clean flat vector, or photorealistic editorial photo), composition and camera angle, lighting, color palette (use deep navy #0C1526 and signal blue #2F63E6 with amber accents when it fits the brand), the aspect ratio, where empty space should be, and the exact text to render in quotes (spell-checked, 6 words or fewer per label). End with: "No watermark, no extra text, no distorted letters." For the infographic, describe the layout block by block with the exact text of every label and number.`;
  return { system, user };
}

export function sectionPrompts(plan, kind, index, tail, b, { site, brand }) {
  const system = `You are the ghostwriter for ${site.name} (${site.role}), writing one part of a blog post. Output Markdown only: no preamble, no notes to the editor, no code fences.\n${WRITING_RULES}\n${lang(b)}\nBrand voice: ${brand || 'plain, practical, honest'}. Tone: ${b.tone || 'friendly and expert'}.`;
  const terms = (plan.terms || []).map((t) => t.term || t).join(', ');
  const sec = (plan.secondaryKeywords || []).join(', ');
  const head = `Post title: ${plan.title}\nPrimary keyword: ${plan.primaryKeyword}\nSecondary keywords: ${sec}\nRelated terms to use where they fit naturally (do not force them): ${terms}\nAudience: ${b.audience || 'small business owners'}. Angle: ${plan.angle || ''}\n`;
  const links = (plan.internalLinks || []).filter((l) => l.slug).map((l) => `section ${l.section}: link the words "${l.anchor}" to /blog/${l.slug}`).join('; ');
  if (kind === 'intro') return { system, user: `${head}\nWrite the introduction only: 90 to 140 words, no heading. Answer the search intent in the first two sentences. Use the primary keyword once in the first 100 words, naturally. Hook with something specific (a number, a mistake, a short scenario), not a question or a generic claim. Do not preview the outline.` };
  if (kind === 'faq') return { system, user: `${head}\nWrite a "## Frequently asked questions" section. For each question use "### Question" then a 40 to 70 word answer in plain prose. Questions and answer drafts: ${JSON.stringify(plan.faq || [])}. Improve the answers, keep them accurate and direct.` };
  const s = plan.outline[index]; const last = index === plan.outline.length - 1;
  return { system, user: `${head}\nWrite this section (about ${s.words || 250} words).\nStart with the exact line: ## ${s.h2}\n${s.h3?.length ? `Then cover these subsections with ### headings: ${s.h3.join(' | ')}\n` : ''}Must cover: ${(s.points || []).join('; ')}.\nUse a short list or a table only where it genuinely helps. Give specific examples, steps or numbers.\n${links ? `Internal links: ${links} (only in the matching section, only once).\n` : ''}${last ? `This is the final section. Give a practical next step. End with this call to action in your own words: ${plan.cta || 'a clear next step'}. Do not write a conclusion or summary.\n` : ''}${tail ? `The text so far ends with: "...${tail.slice(-500)}". Continue without repeating it.` : ''}` };
}
