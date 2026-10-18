/* Redirect rules. Pure functions: used by the middleware (edge), the API and the admin. */

export function normPath(p = '/') {
  let s = String(p || '/').split('#')[0];
  if (!s.startsWith('/')) s = `/${s}`;
  if (s.length > 1) s = s.replace(/\/+$/, '');
  try { s = decodeURI(s); } catch {}
  return s.toLowerCase();
}

/* Returns { to, code, id } for the first matching rule, or null.
   exact: /old-page   prefix: /old-blog/* (keeps the rest of the path when "to" ends with /*)   regex: ^/blog/(\d+)$ with $1 in "to". */
export function matchRedirect(rules = [], pathname = '/') {
  const path = normPath(pathname);
  for (const r of rules) {
    const m = r.m || 'exact';
    if (m === 'regex') {
      try {
        const re = new RegExp(r.f, 'i');
        const mm = String(pathname).match(re);
        if (mm) return { to: (r.t || '').replace(/\$(\d)/g, (_, n) => mm[Number(n)] || ''), code: r.c, id: r.i, q: r.q };
      } catch {}
      continue;
    }
    let from = normPath(r.f);
    const wild = m === 'prefix' || from.endsWith('/*') || from.endsWith('*');
    if (wild) {
      from = from.replace(/\/?\*$/, '');
      if (from === '' || path === from || path.startsWith(`${from}/`)) {
        const rest = path.slice(from.length);
        const to = String(r.t || '');
        return { to: to.endsWith('/*') ? to.slice(0, -2) + rest : to, code: r.c, id: r.i, q: r.q };
      }
      continue;
    }
    if (path === from) return { to: r.t, code: r.c, id: r.i, q: r.q };
  }
  return null;
}

/* Tidies a rule before saving. Throws a readable error when something is missing. */
export function cleanRedirect(b) {
  let from = String(b.from || '').trim();
  if (b.match !== 'regex') {
    try { if (/^https?:\/\//i.test(from)) { const u = new URL(from); from = u.pathname + u.search; } } catch {}
    if (from && !from.startsWith('/')) from = `/${from}`;
    if (from.length > 1) from = from.replace(/\/+$/, '');
  } else {
    try { new RegExp(from); } catch { throw new Error('The pattern is not a valid regular expression.'); }
  }
  if (!from) throw new Error('Add the old address (From).');
  const code = Number(b.code || 301);
  if (![301, 302, 307, 308, 410, 451].includes(code)) throw new Error('Pick a redirect type.');
  const to = String(b.to || '').trim();
  if (![410, 451].includes(code) && !to) throw new Error('Add where visitors should go (To).');
  if (b.match !== 'regex' && normPath(from) === normPath(to)) throw new Error('From and To are the same address, which would loop forever.');
  return { from, code, to };
}

export const REDIRECT_TYPES = [
  { value: '301', label: '301 Moved permanently' }, { value: '302', label: '302 Found (temporary)' },
  { value: '307', label: '307 Temporary' }, { value: '308', label: '308 Permanent' },
  { value: '410', label: '410 Gone (deleted)' }, { value: '451', label: '451 Unavailable for legal reasons' },
];
