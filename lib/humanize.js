/* Patterns that make text read like generic AI output. Used to steer the writer and to score "human voice".
   Pure functions (admin and server). The list is about style, not about beating any one detector. */
export const AI_WORDS = ['delve', 'leverage', 'utilize', 'robust', 'seamless', 'seamlessly', 'streamline', 'harness', 'elevate', 'foster', 'bolster', 'spearhead', 'cutting-edge', 'groundbreaking', 'pivotal', 'paramount', 'multifaceted', 'myriad', 'plethora', 'realm', 'paradigm', 'synergy', 'holistic', 'facilitate', 'endeavor', 'embark', 'underscore', 'supercharge', 'captivate', 'beacon', 'resonate', 'tapestry', 'nuanced', 'bustling', 'daunting', 'meticulously', 'moreover', 'furthermore', 'game-changer', 'game changer', 'unlock', 'revolutionize', 'transformative', 'ever-evolving', 'testament'];
export const AI_PHRASES = ["in today's fast-paced", "in today's digital", "in today's ever", 'in the realm of', 'are you looking to', 'have you ever wondered', 'picture this', "let's face it", "it's no secret", 'when it comes to', "whether you're a", 'take it to the next level', 'in conclusion', 'at the end of the day', 'the possibilities are endless', 'the future is bright', "let's dive", 'dive into', 'dive deeper', "let's break it down", "let's explore", "let's unpack", "here's the thing", "here's the deal", "here's what you need to know", 'without further ado', "here's the kicker", 'the bottom line is', 'in a nutshell', 'it is important to note', "it's important to note", "it's worth noting", 'it is worth noting', 'not just a', 'more than just', 'a testament to', 'plays a crucial role', 'plays a vital role', 'a wide range of', 'navigate the', 'unlock the power', 'key takeaways', 'final thoughts', 'stay ahead of the curve', 'in the world of', 'look no further'];

const sentences = (t) => String(t).replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/).map((s) => s.trim()).filter((s) => s.split(' ').length > 2);

export function aiScan(text = '') {
  const plain = String(text).replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#>*_`|]/g, ' ');
  const low = plain.toLowerCase(); const words = (low.match(/[\p{L}\p{N}'’-]+/gu) || []).length || 1;
  const hits = [];
  for (const w of AI_WORDS) { const n = (low.match(new RegExp(`(^|[^\\p{L}])${w}(?=$|[^\\p{L}])`, 'gu')) || []).length; if (n) hits.push({ phrase: w, count: n }); }
  for (const ph of AI_PHRASES) { const n = low.split(ph).length - 1; if (n > 0) hits.push({ phrase: ph, count: n }); }
  const emd = (plain.match(/[\u2014\u2013]/g) || []).length;
  if (emd) hits.push({ phrase: 'long dashes', count: emd });
  const lens = sentences(plain).map((s) => s.split(' ').length);
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1));
  const burst = mean ? sd / mean : 0; // human writing varies more
  const total = hits.reduce((a, h) => a + h.count, 0);
  const notNot = (low.match(/\b(isn't|is not|it's not|not just|not only)\b[^.]{0,60}\b(it's|but|it is)\b/g) || []).length;
  const starts = sentences(plain).map((s) => s.split(' ')[0].toLowerCase()); const repeatedStarts = Object.values(starts.reduce((m, w) => ((m[w] = (m[w] || 0) + 1), m), {})).filter((n) => n >= 4).length;
  const per1000 = (total / words) * 1000;
  return { hits: hits.sort((a, b) => b.count - a.count), total, per1000, burstiness: burst, avgSentence: mean, notNot, repeatedStarts, words };
}

/* The writing rules sent to the AI with every request. */
export const WRITING_RULES = `Write like an experienced human practitioner, not like a generic AI.
- Start with the point. No throat-clearing intro, no definition nobody asked for, no restating the topic.
- Vary sentence length a lot. Mix very short sentences with longer ones. Vary paragraph length too (1 to 5 sentences). Never make every paragraph the same size.
- Be concrete: real numbers, named tools, small examples, short scenarios, trade-offs, mistakes people actually make. Prefer "I" or "we" for practical experience only where it is plausible and general; never invent clients, statistics, quotes or studies. If you give a statistic, only use well-known ones you are sure about, otherwise describe the idea without a number.
- Banned words: ${AI_WORDS.slice(0, 32).join(', ')}.
- Banned phrases: ${AI_PHRASES.slice(0, 30).join(' | ')}.
- No "it's not X, it's Y" reframes. No rhetorical questions as filler. No "In conclusion" or "Final thoughts" or "Key takeaways" headings. No em dashes or en dashes; use commas or full stops.
- Do not open consecutive sentences with the same word. Do not stack three adjectives. Do not end sections with a moral.
- Follow Google's helpful content and E-E-A-T guidance: answer the search intent fully and early, show first-hand knowledge, be accurate, cite no fake sources, and write for the reader first.
- Use plain words a smart friend would use. Short words over long ones.`;
