export const cn = (...a) => a.filter(Boolean).join(' ');

export function slugify(s = '') {
  return String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

export function serialize(doc) {
  return JSON.parse(JSON.stringify(doc, (k, v) => (k === '__v' ? undefined : v)), (k, v) => v);
}

export function fmtDate(d, opts = { month: 'short', year: 'numeric' }) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date)) return '';
  return date.toLocaleDateString('en-US', opts);
}

export function readingTime(md = '') {
  const words = String(md).replace(/[#>*_`\-\[\]\(\)!]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function projectDuration(p) {
  if (p?.duration) return p.duration;
  if (p?.startDate && p?.endDate) {
    const days = Math.round((new Date(p.endDate) - new Date(p.startDate)) / 86400000) + 1;
    if (days <= 0) return '';
    if (days < 14) return `${days} days`;
    if (days < 70) return `${Math.round(days / 7)} weeks`;
    return `${Math.round(days / 30)} months`;
  }
  return '';
}

export function money(amount, currency = 'USD') {
  if (amount == null || amount === '') return '';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
  } catch { return `${currency} ${amount}`; }
}

export function priceLabel(pkg) {
  if (!pkg) return '';
  const a = money(pkg.price, pkg.currency);
  return pkg.priceMax ? `${a} to ${money(pkg.priceMax, pkg.currency)}` : a;
}

export const BILLING = { 'one-time': 'one time', monthly: 'per month', yearly: 'per year', hourly: 'per hour' };

export function videoEmbed(video) {
  if (!video?.url || video.provider === 'none') return null;
  const url = video.url.trim();
  let m;
  if ((m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/))) return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0` };
  if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return { type: 'iframe', src: `https://player.vimeo.com/video/${m[1]}` };
  if ((m = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/))) return { type: 'iframe', src: `https://www.loom.com/embed/${m[1]}` };
  if (/\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) || video.provider === 'upload') return { type: 'video', src: url };
  return { type: 'iframe', src: url };
}

export function get(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
export function set(obj, path, value) {
  const keys = path.split('.');
  const out = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
  let cur = out;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = value;
    else { cur[k] = { ...(cur[k] || {}) }; cur = cur[k]; }
  });
  return out;
}

export function deepMerge(base, over) {
  if (Array.isArray(over)) return over;
  if (over && typeof over === 'object' && base && typeof base === 'object' && !Array.isArray(base)) {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = deepMerge(base[k], over[k]);
    return out;
  }
  return over === undefined ? base : over;
}

export const siteUrl = () => {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  // A localhost value copied into a live host must never be used there.
  const envOk = env && !(process.env.VERCEL && /localhost|127\.0\.0\.1/.test(env));
  const u = (envOk && env)
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
    || 'http://localhost:3000';
  return u.replace(/\/$/, '');
};

export function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u || ''; } }
