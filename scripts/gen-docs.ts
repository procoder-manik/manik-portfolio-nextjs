/* Builds the REFERENCE part of the manual from the real code, so it can never go out of date.
   Run from the project root:  npx tsx scripts/gen-docs.ts     (writes docs/manual/reference/*.md)
   Re-run it after you add a field, a setting, an API route or a file. The guides in docs/manual/*.md are written by hand. */
import fs from 'node:fs';
import path from 'node:path';
import { RESOURCES, SETTINGS, BUILTIN_PAGES } from '../lib/admin-schema';
import { ROLES, RESOURCE_AREA, settingsArea } from '../lib/roles';

const root = process.cwd(); // run from the project root
const out = path.join(root, 'docs/manual/reference'); fs.mkdirSync(out, { recursive: true });
const w = (f, s) => fs.writeFileSync(path.join(out, f), `${s.trim()}\n`);
const rd = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const esc = (s = '') => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();
const short = (s = '', n = 150) => { const t = esc(s); return t.length > n ? `${t.slice(0, n - 1).trimEnd()}...` : t; };
const stamp = '> Generated from the code by `scripts/gen-docs.ts`. Do not edit by hand; run the script again after changing the code.\n';

/* ---------- resources ---------- */
function fieldRows(fields = []) {
  const rows = [];
  for (const f of fields) {
    if (!f || f.type === 'note') continue;
    rows.push(`| \`${f.name || ''}\` | ${esc(f.label || '')} | ${f.type || 'text'}${f.required ? ', required' : ''} | ${short(f.info || f.hint || '')} |`);
    if (f.fields) for (const s of f.fields) rows.push(`| \`${f.name}[].${s.name}\` | ${esc(s.label || '')} | ${s.type || 'text'} | |`);
  }
  return rows;
}
let md = `# Content types (admin lists and editors)\n\n${stamp}\nEach row below is a list in the admin (\`/admin/<name>\`) with its own editor. "Area" is the permission group that may use it (see Security and roles).\n\n`;
for (const [key, r] of Object.entries(RESOURCES)) {
  md += `## ${r.label || key} (\`${key}\`)\n\n- Admin: \`/admin/${key}\`, area: **${RESOURCE_AREA[key] || 'content'}**${r.slugFrom ? `, slug made from \`${r.slugFrom}\`` : ''}\n- List columns: ${(r.columns || []).map((c) => c.label || c.key).filter(Boolean).join(', ')}\n`;
  for (const s of r.sections || []) {
    const rows = fieldRows(s.fields);
    if (!rows.length) continue;
    md += `\n### Tab: ${s.title}\n\n| Field | Label | Type | What it does |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n`;
  }
  md += '\n';
}
w('content-types.md', md);

/* ---------- settings ---------- */
md = `# Settings pages\n\n${stamp}\nOne page per group at \`/admin/settings/<key>\`. Saved as a single document per key; defaults come from \`lib/seed-data.js\` and are merged underneath, so new options appear on their own.\n\n`;
const keys = Object.keys(SETTINGS);
for (const key of keys) {
  const s = SETTINGS[key];
  md += `## ${s.label} (\`${key}\`)\n\n- Admin: \`/admin/settings/${key}\`, area: **${settingsArea(key)}**\n`;
  for (const sec of s.sections || []) {
    const rows = fieldRows(sec.fields);
    if (!rows.length) continue;
    md += `\n### ${sec.title}\n\n| Field | Label | Type | What it does |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n`;
  }
  md += '\n';
}
w('settings.md', md);

/* ---------- built-in pages ---------- */
w('builtin-pages.md', `# Built-in pages with their own SEO\n\n${stamp}\n| Key | Page | Address | SEO settings |\n| --- | --- | --- | --- |\n${BUILTIN_PAGES.map((b) => `| \`${b.key}\` | ${b.label} | \`${b.path}\` | \`/admin/settings/seo-${b.key}\` |`).join('\n')}\n`);

/* ---------- roles ---------- */
w('roles.md', `# Roles and permission groups\n\n${stamp}\n| Role | Can do |\n| --- | --- |\n${Object.entries(ROLES).map(([k, r]) => `| **${r.label}** (\`${k}\`) | ${esc(r.desc)} |`).join('\n')}\n\n## Which area each list belongs to\n\n| List | Area |\n| --- | --- |\n${Object.entries(RESOURCE_AREA).map(([k, a]) => `| \`${k}\` | ${a} |`).join('\n')}\n`);

/* ---------- API routes ---------- */
const routes = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'route.js') {
      const rel = path.relative(path.join(root, 'app'), dir).replace(/\\/g, '/');
      const src = fs.readFileSync(p, 'utf8');
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].filter((m) => new RegExp(`export (const|async function) ${m}\\b`).test(src));
      const doc = (src.match(/\/\*([\s\S]*?)\*\//) || [])[1];
      const guard = /adminRoute\(/.test(src) ? (src.match(/adminRoute\s*=\s*\(h\)\s*=>\s*guard\(h,\s*'([a-z]+)'\)/) || [])[1] || 'admin' : /rateLimit/.test(src) ? 'public, rate-limited' : 'public';
      routes.push({ url: `/${rel}`, methods: methods.join(', ') || '-', guard, note: doc ? short(doc.replace(/\n\s*/g, ' ').replace(/^\s*\*+\s*/, ''), 170) : '' });
    }
  }
})(path.join(root, 'app'));
routes.sort((a, b) => a.url.localeCompare(b.url));
w('api.md', `# Routes that are not pages (API, feeds, files)\n\n${stamp}\n"Access" shows who may call it: an admin permission area, or public.\n\n| Address | Methods | Access | Notes |\n| --- | --- | --- | --- |\n${routes.map((r) => `| \`${r.url.replace(/\[([^\]]+)\]/g, ':$1')}\` | ${r.methods} | ${r.guard} | ${r.note} |`).join('\n')}\n`);

/* ---------- pages ---------- */
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'page.js') {
      const rel = path.relative(path.join(root, 'app'), dir).replace(/\\/g, '/').replace(/\(([^)]+)\)\/?/g, '');
      pages.push({ url: `/${rel}`.replace(/\/$/, '') || '/', file: path.relative(root, p).replace(/\\/g, '/') });
    }
  }
})(path.join(root, 'app'));
pages.sort((a, b) => a.url.localeCompare(b.url));
const pub = pages.filter((p) => !p.url.startsWith('/admin')); const adm = pages.filter((p) => p.url.startsWith('/admin'));
w('pages.md', `# Pages (public and admin)\n\n${stamp}\n## Public site\n\n| Address | File |\n| --- | --- |\n${pub.map((p) => `| \`${p.url.replace(/\[([^\]]+)\]/g, ':$1')}\` | \`${p.file}\` |`).join('\n')}\n\n## Admin\n\n| Address | File |\n| --- | --- |\n${adm.map((p) => `| \`${p.url.replace(/\[([^\]]+)\]/g, ':$1')}\` | \`${p.file}\` |`).join('\n')}\n`);

/* ---------- admin menu ---------- */
const nav = rd('components/admin/Sidebar.jsx');
const menu = []; const navSrc = nav.slice(nav.indexOf('const NAV = ['), nav.indexOf('];', nav.indexOf('const NAV = [')));
for (const g of navSrc.split('\n  [').slice(1)) { const name = (g.match(/^'([^']+)'/) || [])[1]; const items = [...g.matchAll(/\['(\/admin[^']*)',\s*'([^']+)'/g)].map((m) => `| ${m[2]} | \`${m[1]}\` |`); if (name) menu.push(`### ${name}\n\n| Menu item | Address |\n| --- | --- |\n${items.join('\n')}\n`); }
w('admin-menu.md', `# Admin menu map\n\n${stamp}\nThe left menu of the admin, in order. Items a role may not use are hidden for that role.\n\n${menu.join('\n')}`);

/* ---------- environment ---------- */
const env = rd('.env.example').split('\n'); let envMd = `# Environment variables\n\n${stamp}\nSet them in \`.env.local\` on your computer, or Vercel > Settings > Environment Variables. Parsed from \`.env.example\`.\n\n| Variable | Example or default | What it is for |\n| --- | --- | --- |\n`; let notes = [];
for (const l of env) {
  if (/^\s*#/.test(l) && !/^\s*#\s*[A-Z_]+=/.test(l)) { notes.push(l.replace(/^\s*#+\s*/, '').replace(/-{3,}/g, '').trim()); continue; }
  const m = l.match(/^\s*#?\s*([A-Z][A-Z0-9_]+)="?([^"]*)"?\s*$/);
  if (m) { envMd += `| \`${m[1]}\` | ${m[2] ? `\`${esc(m[2]).slice(0, 60)}\`` : '(empty)'} | ${esc(notes.filter(Boolean).join(' ')).slice(0, 260)} |\n`; notes = []; }
  else if (!l.trim()) { /* keep notes across blank lines */ }
}
w('environment.md', envMd);

/* ---------- models ---------- */
const models = rd('lib/models/index.js'); const mrows = [];
for (const m of models.matchAll(/export const (\w+) = model\('(\w+)', new Schema\(\{([\s\S]*?)\}, \{/g)) {
  const names = [...m[3].matchAll(/(?:^|[\s,{])([a-zA-Z_][\w]*):/gm)].map((x) => x[1]).filter((n) => !['type', 'default', 'index', 'required', 'unique', 'ref', 'trim', 'enum', 'min', 'max', 'sparse'].includes(n));
  mrows.push(`## ${m[2]}\n\n\`${[...new Set(names)].join(', ')}\`\n`);
}
w('models.md', `# Database models\n\n${stamp}\nMongoose models in \`lib/models/index.js\` (field names found in each schema; see the file for types and defaults).\n\n${mrows.join('\n')}`);

/* ---------- file index ---------- */
const dirs = ['lib', 'components/site', 'components/admin', 'scripts'];
let idx = `# File index\n\n${stamp}\nThe first comment of each source file, so you can find where something lives.\n\n`;
for (const d of dirs) {
  const files = fs.readdirSync(path.join(root, d), { withFileTypes: true }).filter((e) => e.isFile() && /\.(js|jsx|mjs)$/.test(e.name)).map((e) => e.name).sort();
  idx += `## \`${d}/\`\n\n| File | What it is |\n| --- | --- |\n`;
  for (const f of files) {
    const src = fs.readFileSync(path.join(root, d, f), 'utf8'); const c = src.match(/\/\*([\s\S]*?)\*\//);
    const first = c ? c[1].replace(/\n\s*\*?\s*/g, ' ').trim().split(/(?<=\.)\s/)[0] : '';
    idx += `| \`${f}\` | ${short(first, 190)} |\n`;
  }
  idx += '\n';
}
w('file-index.md', idx);
console.log('Reference docs written to docs/manual/reference');
