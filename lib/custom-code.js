/* Code that runs in visitors' browsers: HTML blocks, popup and form HTML, custom card templates and a page's SEO > Code tab.
   Only an administrator may add or change it. Everything else in the same document stays editable by the other roles. */
const clean = (v) => (typeof v === 'string' ? v.trim() : '');

function collect(v, out = []) {
  if (Array.isArray(v)) { v.forEach((x) => collect(x, out)); return out; }
  if (!v || typeof v !== 'object') return out;
  for (const [k, x] of Object.entries(v)) {
    if (k === 'html' || k === 'css') { if (clean(x)) out.push(clean(x)); }
    else if (k === 'code' && typeof x === 'string') { if (v.type === 'html' && clean(x)) out.push(clean(x)); }
    else if (k === 'code' && x && typeof x === 'object') Object.values(x).forEach((c) => clean(c) && out.push(clean(c)));
    else collect(x, out);
  }
  return out;
}
const fingerprint = (v) => JSON.stringify(collect(v).sort());
const at = (o, path) => path.split('.').reduce((a, k) => a?.[k], o);

/* A javascript: address in any link field runs code when clicked. */
function hasScriptUrl(v) {
  if (typeof v === 'string') return /^javascript:/i.test(v.replace(/[\u0000- ]/g, ''));
  if (Array.isArray(v)) return v.some(hasScriptUrl);
  return Boolean(v && typeof v === 'object' && Object.values(v).some(hasScriptUrl));
}

/* Throws when a role other than administrator changes custom code. body may hold only some fields of the document. */
export function assertCustomCode(role, body, prev = {}) {
  if (role === 'administrator') return;
  const deny = (message) => { throw Object.assign(new Error(message), { status: 403 }); };
  if (hasScriptUrl(body)) deny('Links cannot start with javascript:. Remove it and save again.');
  for (const [k, v] of Object.entries(body || {})) {
    const changed = k.includes('.')
      ? /(^code\.|\.(html|css)$)/.test(k) && clean(v) !== clean(at(prev, k))
      : fingerprint({ [k]: v }) !== fingerprint({ [k]: prev?.[k] });
    if (changed) deny('Only an administrator can add or change custom code (HTML, CSS or scripts).');
  }
}
