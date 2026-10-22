'use client';
import { useEffect } from 'react';
import { cleanCustom, deriveVars, fontsHref, FONT_IDEAS } from '@/lib/theme';

/* Shows each of your tones as it will look in light and dark, with its fonts, before you save. */
export default function ThemePreview({ doc }) {
  const tones = cleanCustom(doc?.theme?.custom); const href = fontsHref(tones);
  useEffect(() => {
    if (!href) return; let el = document.getElementById('theme-preview-fonts');
    if (!el) { el = document.createElement('link'); el.id = 'theme-preview-fonts'; el.rel = 'stylesheet'; document.head.appendChild(el); }
    el.href = href;
  }, [href]);
  if (!tones.length) return <p className="rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted">Add a tone above and its preview shows here. Font ideas: {FONT_IDEAS.slice(0, 8).join(', ')}.</p>;
  const style = (vars) => Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, v]));
  return (
    <div className="space-y-4">
      {tones.map((t) => (
        <div key={t.id}>
          <p className="mb-2 text-sm font-semibold text-ink">{t.name}{t.makeDefault ? ' (default)' : ''} <span className="font-normal text-muted">· {t.displayFont || 'standard heading font'} / {t.bodyFont || 'standard body font'}</span></p>
          <div className="grid gap-3 sm:grid-cols-2">
            {['light', 'dark'].map((m) => {
              const v = deriveVars(t, m);
              return (
                <div key={m} style={{ ...style(v), fontFamily: t.bodyFont ? `"${t.bodyFont}", system-ui, sans-serif` : undefined, background: `rgb(${v['--base']})`, color: `rgb(${v['--body']})`, borderColor: `rgb(${v['--line']})` }} className="rounded-2xl border p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `rgb(${v['--signal']})` }}>{m} mode</p>
                  <p className="mt-1 text-xl font-bold leading-tight" style={{ color: `rgb(${v['--ink']})`, fontFamily: t.displayFont ? `"${t.displayFont}", system-ui, sans-serif` : undefined }}>Websites that bring in customers</p>
                  <p className="mt-1 text-sm" style={{ color: `rgb(${v['--muted']})` }}>A short line of body text, so you can judge the font and the contrast.</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full px-3.5 py-1.5 text-xs font-semibold" style={{ background: `rgb(${v['--signal']})`, color: `rgb(${v['--on-signal']})` }}>Start a project</span>
                    <span className="rounded-full border px-3.5 py-1.5 text-xs font-semibold" style={{ borderColor: `rgb(${v['--line']})`, color: `rgb(${v['--ink']})`, background: `rgb(${v['--surface']})` }}>See the work</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
