/* Tiny safe "rich line" helper: keeps only links, bold, italic, underline and line breaks.
   Used by the admin editor (to clean what is saved) and by the public site (to render it). */
const ALLOWED = new Set(['a', 'strong', 'b', 'em', 'i', 'u', 'br']);
export const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
const esc = (s) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attrEsc = (s) => s.replace(/"/g, '&quot;');

export function sanitizeInline(html = '', tokens = null) {
  const parts = String(html || '').split(/(<[^>]*>)/g);
  const stack = [];
  let out = '';
  for (const part of parts) {
    if (!part) continue;
    const m = /^<\s*(\/?)\s*([a-z0-9]+)([^>]*)>$/i.exec(part);
    if (!m) {
      let t = esc(part);
      if (tokens) t = t.replace(/\{year\}/gi, tokens.year ?? '').replace(/\{site\}/gi, esc(String(tokens.site ?? '')));
      out += t;
      continue;
    }
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    if (!ALLOWED.has(tag)) continue;
    if (tag === 'br') { if (!closing) out += '<br>'; continue; }
    if (!closing) {
      if (tag === 'a') {
        const h = /href\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(m[3]);
        const href = ((h && (h[1] ?? h[2])) || '').replace(/&amp;/g, '&').trim();
        const ok = SAFE_HREF.test(href);
        stack.push({ tag, emitted: ok });
        if (ok) {
          const blank = /target\s*=\s*["']?_blank/i.test(m[3]);
          out += `<a href="${attrEsc(href)}"${blank ? ' target="_blank" rel="noopener noreferrer"' : ''}>`;
        }
      } else { stack.push({ tag, emitted: true }); out += `<${tag}>`; }
    } else {
      let i = stack.length - 1;
      while (i >= 0 && stack[i].tag !== tag) i--;
      if (i < 0) continue;
      while (stack.length > i) { const s = stack.pop(); if (s.emitted) out += `</${s.tag}>`; }
    }
  }
  while (stack.length) { const s = stack.pop(); if (s.emitted) out += `</${s.tag}>`; }
  return out;
}
