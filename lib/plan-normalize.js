/* Free AI models sometimes answer with the right idea in a slightly different shape (an object where a word was expected,
   a list instead of text). These helpers turn any answer into plain text and lists so the screen can never crash on it. */
export const str = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(str).filter(Boolean).join('\n');
  if (typeof v === 'object') return str(v.term ?? v.keyword ?? v.text ?? v.title ?? v.name ?? v.word ?? v.value ?? v.q ?? v.h2 ?? '');
  return '';
};
export const strList = (v, max = 40) => (Array.isArray(v) ? v : v ? [v] : []).map(str).filter(Boolean).slice(0, max);

/* Turns a table the AI wrote as an array of rows or objects into a Markdown table. */
export function tableText(v) {
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v) && v.length && Array.isArray(v[0])) { const [h, ...r] = v; return [`| ${h.map(str).join(' | ')} |`, `| ${h.map(() => '---').join(' | ')} |`, ...r.map((x) => `| ${x.map(str).join(' | ')} |`)].join('\n'); }
  if (Array.isArray(v) && v.length && typeof v[0] === 'object') { const keys = Object.keys(v[0]); return [`| ${keys.join(' | ')} |`, `| ${keys.map(() => '---').join(' | ')} |`, ...v.map((x) => `| ${keys.map((k) => str(x[k])).join(' | ')} |`)].join('\n'); }
  return str(v);
}

export function normalizePlan(p = {}) {
  const out = { ...p };
  ['title', 'metaTitle', 'metaDescription', 'slug', 'category', 'excerpt', 'primaryKeyword', 'searchIntent', 'angle', 'cta'].forEach((k) => { out[k] = str(p[k]); });
  out.tags = strList(p.tags, 8); out.secondaryKeywords = strList(p.secondaryKeywords, 12);
  out.outline = (Array.isArray(p.outline) ? p.outline : []).map((s) => (typeof s === 'string' ? { h2: s } : s)).map((s) => ({ h2: str(s?.h2 ?? s?.heading ?? s?.title), h3: strList(s?.h3 ?? s?.subheadings, 4), points: strList(s?.points ?? s?.cover, 6), words: Number(s?.words) || 250 })).filter((s) => s.h2);
  out.faq = (Array.isArray(p.faq) ? p.faq : []).map((f) => ({ q: str(f?.q ?? f?.question), a: str(f?.a ?? f?.answer) })).filter((f) => f.q);
  out.terms = (Array.isArray(p.terms) ? p.terms : []).map((t) => ({ term: str(t), min: Number(t?.min) || 1 })).filter((t) => t.term);
  out.internalLinks = (Array.isArray(p.internalLinks) ? p.internalLinks : []).map((l) => ({ slug: str(l?.slug), anchor: str(l?.anchor), section: Number(l?.section) || 1 })).filter((l) => l.slug && l.anchor);
  return out;
}

export function normalizeImages(list = [], sections = 0) {
  return (Array.isArray(list) ? list : []).slice(0, 10).map((x, i) => {
    const role = i === 0 ? 'featured' : ['inline', 'infographic', 'chart', 'table'].includes(str(x?.role)) ? str(x.role) : 'inline';
    return { slot: i + 1, role, after: Math.max(0, Math.min(sections, Number(x?.after) || 0)), title: str(x?.title), alt: str(x?.alt), filename: str(x?.filename), ratio: str(x?.ratio), caption: str(x?.caption), textOnImage: strList(x?.textOnImage, 8), prompt: str(x?.prompt), instructions: str(x?.instructions), tool: str(x?.tool), chartType: str(x?.chartType), data: role === 'table' || x?.data ? tableText(x?.data) : '', dataNote: str(x?.dataNote) };
  });
}
