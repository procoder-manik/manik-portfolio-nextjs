/* Finds a website's accent colour from its own HTML: the vivid colour its CSS uses most,
   preferring colours named in CSS variables (--brand, --red, --blue...). Dark backgrounds and greys are skipped.
   Returns '#rrggbb' or ''. */
function hsl(hex) {
  let h = hex.slice(1); if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b); const min = Math.min(r, g, b); const l = (max + min) / 2;
  const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
  return { s, l, hex: `#${h.toLowerCase()}` };
}

export function accentFromHtml(html = '') {
  const score = new Map();
  const add = (raw, w) => {
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return;
    const c = hsl(raw); if (c.s < 0.45 || c.l < 0.28 || c.l > 0.72) return;
    score.set(c.hex, (score.get(c.hex) || 0) + w * (0.6 + c.s));
  };
  // A colour kept in a CSS variable counts once for every place the page uses that variable.
  for (const m of html.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{3,6})\b/gi)) add(m[2], 2 + html.split(`var(${m[1]})`).length - 1);
  for (const m of html.matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi)) add(m[0], 1);
  let best = ''; let top = 0;
  for (const [hex, v] of score) if (v > top) { top = v; best = hex; }
  return best;
}

/* Black or white text, whichever reads better on this colour. */
export function inkOn(hex = '') {
  const c = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#2563eb';
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#0b0f17' : '#ffffff';
}
