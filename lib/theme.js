/* Custom colour tones: from an accent colour (and optional backgrounds and fonts) to a full palette for light and dark.
   Client-safe: used by the site layout (CSS), the header (swatches) and the admin preview. */
const HEX = /^#?([0-9a-f]{6})$/i;
const FONT = /^[A-Za-z0-9][A-Za-z0-9 ]{1,39}$/;
export const FONT_IDEAS = ['Sora', 'Plus Jakarta Sans', 'Space Grotesk', 'Outfit', 'Manrope', 'DM Sans', 'Poppins', 'Montserrat', 'Inter', 'IBM Plex Sans', 'Fraunces', 'Playfair Display', 'Lora', 'DM Serif Display', 'Syne', 'Urbanist'];

export const hexOk = (v) => HEX.test(String(v || '').trim());
const toRgb = (h) => { const m = HEX.exec(String(h).trim()); const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const toHex = ([r, g, b]) => `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
function toHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b); const mn = Math.min(r, g, b); const l = (mx + mn) / 2; let h = 0; let s = 0;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [h, s * 100, l * 100];
}
function fromHsl([h, s, l]) {
  h = ((h % 360) + 360) % 360; s = Math.min(100, Math.max(0, s)) / 100; l = Math.min(100, Math.max(0, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s; const x = c * (1 - Math.abs(((h / 60) % 2) - 1)); const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const trip = (rgb) => rgb.map((x) => Math.round(x)).join(' ');

/* The variables of one tone in one mode. Text stays readable: the accent is lifted on dark and deepened on light. */
export function deriveVars(def, mode) {
  const accRaw = toRgb(mode === 'dark' && hexOk(def.accentDark) ? def.accentDark : def.accent);
  let [h, s, l] = toHsl(accRaw); s = Math.max(s, 35);
  const acc = fromHsl([h, s, mode === 'dark' ? Math.max(l, 62) : Math.min(l, 42)]);
  const bgHex = mode === 'dark' ? def.darkBg : def.lightBg;
  let [bh, bs, bl] = hexOk(bgHex) ? toHsl(toRgb(bgHex)) : [h, mode === 'dark' ? 38 : 40, mode === 'dark' ? 8 : 97];
  if (mode === 'dark') bl = Math.min(bl, 16); else bl = Math.max(bl, 90);
  const v = {};
  if (mode === 'dark') {
    v['--base'] = trip(fromHsl([bh, bs, bl])); v['--surface'] = trip(fromHsl([bh, bs, bl + 4])); v['--raised'] = trip(fromHsl([bh, bs, bl + 9])); v['--line'] = trip(fromHsl([bh, bs * 0.85, bl + 18]));
    v['--ink'] = trip(fromHsl([bh, 25, 95])); v['--body'] = trip(fromHsl([bh, 18, 80])); v['--muted'] = trip(fromHsl([bh, 13, 62]));
  } else {
    v['--base'] = trip(fromHsl([bh, bs, bl])); v['--surface'] = '255 255 255'; v['--raised'] = trip(fromHsl([bh, bs * 0.9, Math.max(bl - 4, 88)])); v['--line'] = trip(fromHsl([bh, bs * 0.7, Math.max(bl - 10, 80)]));
    v['--ink'] = trip(fromHsl([bh, 45, 10])); v['--body'] = trip(fromHsl([bh, 25, 28])); v['--muted'] = trip(fromHsl([bh, 12, 42]));
  }
  v['--signal'] = trip(acc); v['--on-signal'] = lum(acc) > 0.42 ? '17 24 39' : '255 255 255';
  return v;
}

const id = (name, i) => `c-${String(name || 'tone').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'tone'}-${i + 1}`;

/* Cleans what the admin typed: valid colours only, fonts with plain names only, at most 6 tones. */
export function cleanCustom(list) {
  return (Array.isArray(list) ? list : []).slice(0, 6).map((t, i) => ({
    id: id(t?.name, i), name: String(t?.name || `Tone ${i + 1}`).trim().slice(0, 24) || `Tone ${i + 1}`,
    accent: hexOk(t?.accent) ? `#${HEX.exec(t.accent.trim())[1].toLowerCase()}` : '', accentDark: hexOk(t?.accentDark) ? `#${HEX.exec(t.accentDark.trim())[1].toLowerCase()}` : '',
    lightBg: hexOk(t?.lightBg) ? `#${HEX.exec(t.lightBg.trim())[1].toLowerCase()}` : '', darkBg: hexOk(t?.darkBg) ? `#${HEX.exec(t.darkBg.trim())[1].toLowerCase()}` : '',
    displayFont: FONT.test(String(t?.displayFont || '').trim()) ? String(t.displayFont).trim() : '', bodyFont: FONT.test(String(t?.bodyFont || '').trim()) ? String(t.bodyFont).trim() : '',
    makeDefault: Boolean(t?.makeDefault),
  })).filter((t) => t.accent);
}

export function customCss(list) {
  const block = (sel, vars) => `${sel}{${Object.entries(vars).map(([k, x]) => `${k}:${x}`).join(';')}}`;
  return cleanCustom(list).map((t) => [
    block(`[data-theme='dark'][data-tone='${t.id}']`, deriveVars(t, 'dark')),
    block(`[data-theme='light'][data-tone='${t.id}']`, deriveVars(t, 'light')),
    (t.displayFont || t.bodyFont) ? block(`[data-tone='${t.id}']`, { ...(t.displayFont ? { '--f-display': `"${t.displayFont}"` } : {}), ...(t.bodyFont ? { '--f-body': `"${t.bodyFont}"` } : {}) }) : '',
  ].join('\n')).join('\n');
}

/* One Google Fonts address for every font the custom tones use (the tolerant v1 address: it skips weights a font does not have). */
export function fontsHref(list) {
  const names = [...new Set(cleanCustom(list).flatMap((t) => [t.displayFont, t.bodyFont]).filter(Boolean))];
  return names.length ? `https://fonts.googleapis.com/css?family=${names.map((n) => `${n.replace(/ /g, '+')}:400,500,600,700`).join('|')}&display=swap` : '';
}
