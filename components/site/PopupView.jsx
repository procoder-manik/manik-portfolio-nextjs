'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import Countdown from './Countdown';
import FormView from './FormView';
import { cn } from '@/lib/utils';

const THEMES = {
  site: { bg: 'rgb(var(--surface))', text: 'rgb(var(--ink))', accent: 'rgb(var(--signal))', border: 'rgb(var(--line))' },
  light: { bg: '#FFFFFF', text: '#0C1526', accent: '#2F63E6', border: '#DCE2EC' },
  dark: { bg: '#0C1526', text: '#ECF1F8', accent: '#6391FF', border: '#263758' },
  brand: { bg: '#2F63E6', text: '#FFFFFF', accent: '#FFFFFF', border: 'rgba(255,255,255,.25)' },
};
const RADIUS = { sharp: '4px', soft: '14px', round: '28px' };
const WIDTH = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' };

const scopeCss = (css = '') => String(css).replace(/(^|})\s*([^@{}]+)\{/g, (m, a, sel) => `${a}[data-pp] ${sel.split(',').map((x) => x.trim()).join(', [data-pp] ')}{`).replace(/<\/?style[^>]*>/gi, '');

function Btn({ b, primary, theme, onEvent, onClose, coupon }) {
  const [copied, setCopied] = useState(false);
  if (!b?.label) return null;
  const style = primary ? { background: theme.accent, color: theme.accentText } : { border: `1px solid ${theme.border}`, color: theme.text };
  const cls = 'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:opacity-90';
  const act = b.action || 'link';
  if (act === 'close') return <button type="button" onClick={onClose} className={cls} style={style}>{b.label}</button>;
  if (act === 'copy') return <button type="button" className={cls} style={style} onClick={() => { navigator.clipboard?.writeText(coupon || '').catch(() => {}); setCopied(true); onEvent?.('click'); setTimeout(() => setCopied(false), 1800); }}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : b.label}</button>;
  const href = act === 'phone' ? `tel:${String(b.href || '').replace(/\s/g, '')}` : b.href || '#';
  return <a href={href} target={b.newTab || /^https?:/.test(href) ? '_blank' : undefined} rel="noopener noreferrer" onClick={() => onEvent?.('click')} className={cls} style={style}>{b.label}</a>;
}

function Body({ popup, theme, onClose, onEvent }) {
  const c = popup.content || {}; const d = popup.design || {};
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const center = d.align === 'center';
  if (popup.contentType === 'html') {
    return (
      <div ref={ref} data-pp="" onClick={(e) => { if (e.target.closest('[data-popup-close]')) onClose?.(); else if (e.target.closest('a')) onEvent?.('click'); }}>
        <style dangerouslySetInnerHTML={{ __html: scopeCss(c.css) }} />
        <div dangerouslySetInnerHTML={{ __html: String(c.html || '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+=("[^"]*"|'[^']*')/gi, '') }} />
      </div>
    );
  }
  const st = d.style || 'classic';
  const spot = st === 'spotlight' && c.image;
  const pos = spot ? 'none' : c.image ? c.imagePosition || 'top' : 'none';
  const compact = ['slidein', 'drawer'].includes(popup.layout) || popup.size === 'sm';
  const text = (
    <div className={cn('p-6 sm:p-8', center ? 'text-center' : 'text-left', pos === 'background' && 'relative z-10')}>
      {spot && (
        <div className="relative mb-7">
          <div className="pointer-events-none absolute inset-x-6 -bottom-6 h-16 rounded-full blur-2xl" style={{ background: theme.glow }} />
          <div className="pp-float relative overflow-hidden rounded-2xl border border-white/15 shadow-[0_30px_70px_-25px_rgba(0,0,0,.7)]"><img src={c.image} alt="" className="aspect-[16/9] w-full object-cover object-top" loading="lazy" /></div>
        </div>
      )}
      {c.logo && <img src={c.logo} alt="" className={cn('mb-4 h-14 w-14 rounded-2xl object-cover shadow-lg', center && 'mx-auto')} loading="lazy" />}
      {c.icon && <div className="mb-3 text-4xl leading-none">{c.icon}</div>}
      {c.badge && st !== 'ticket' && <span className={cn('mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', st !== 'classic' && 'pp-badge')} style={{ background: theme.accent, color: theme.accentText }}>{st !== 'classic' && <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.accentText }} />}{c.badge}</span>}
      {c.heading && <h3 className={cn('break-words font-display font-bold leading-tight [color:inherit]', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}>{c.heading}</h3>}
      {c.body && <p className="mt-3 text-[0.97rem] leading-relaxed opacity-85">{c.body}</p>}
      {c.countdownTo && <div className="mt-5">{c.countdownLabel && <p className="mb-2 text-xs opacity-75">{c.countdownLabel}</p>}<Countdown to={c.countdownTo} big /></div>}
      {c.coupon && (
        <button type="button" onClick={() => { navigator.clipboard?.writeText(c.coupon).catch(() => {}); setCopied(true); onEvent?.('click'); setTimeout(() => setCopied(false), 1800); }} className={cn('mt-5 inline-flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-2.5 font-mono text-lg font-bold tracking-wider', center && 'mx-auto')} style={{ borderColor: theme.accent }} aria-label={`Copy coupon code ${c.coupon}`}>
          {c.coupon}<span className="inline-flex items-center gap-1 text-xs font-sans font-medium opacity-80">{copied ? <><Check size={13} />Copied</> : <><Copy size={13} />Copy</>}</span>
        </button>
      )}
      {c.form && <div className="mt-5 text-left"><FormView slug={c.form} compact onDone={() => onEvent?.('conversion')} themeVars={{ '--pp-accent': theme.accent }} /></div>}
      {(c.primary?.label || c.secondary?.label) && (
        <div className={cn('mt-6 flex flex-wrap gap-2.5', center && 'justify-center')}>
          <Btn b={c.primary} primary theme={theme} onEvent={onEvent} onClose={onClose} coupon={c.coupon} />
          <Btn b={c.secondary} theme={theme} onEvent={onEvent} onClose={onClose} coupon={c.coupon} />
        </div>
      )}
      {c.note && <p className="mt-4 text-xs opacity-60">{c.note}</p>}
    </div>
  );
  const img = c.image && <img src={c.image} alt="" className={cn('w-full object-cover', pos === 'top' ? 'aspect-[16/8]' : 'h-full min-h-[200px]')} loading="lazy" />;
  if (st === 'ticket') {
    return (
      <div className="grid sm:grid-cols-[38%_1fr]">
        <div className="relative flex flex-col items-center justify-center gap-2 overflow-hidden p-8 text-center text-white" style={{ background: `linear-gradient(150deg, ${theme.hex}, ${theme.hex}bb)` }}>
          <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          {c.icon && <div className="text-4xl leading-none">{c.icon}</div>}
          {c.badge && <p className="font-display text-[2.6rem] font-black leading-none tracking-tight">{c.badge}</p>}
          {c.countdownTo && <div className="mt-3">{c.countdownLabel && <p className="mb-1.5 text-[11px] uppercase tracking-[0.15em] opacity-80">{c.countdownLabel}</p>}<Countdown to={c.countdownTo} /></div>}
          <span aria-hidden className="absolute inset-y-4 right-0 hidden border-r-2 border-dashed border-white/50 sm:block" />
        </div>
        <Body popup={{ ...popup, design: { ...d, style: 'classic' }, content: { ...c, badge: '', icon: '', countdownTo: '' } }} theme={theme} onClose={onClose} onEvent={onEvent} />
      </div>
    );
  }
  if (pos === 'left' || pos === 'right') return <div className={cn('grid', compact ? 'grid-cols-[36%_1fr]' : 'sm:grid-cols-2')}><div className={cn('relative', !compact && 'hidden sm:block', pos === 'right' && 'order-2')}>{img}</div>{text}</div>;
  if (pos === 'top') return <div>{img}{text}</div>;
  if (pos === 'background') return <div className="relative text-white"><img loading="lazy" decoding="async" src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-black/55" />{text}</div>;
  return text;
}

/* The popup itself: layout, colours and animation. preview=true draws it inside its parent box. */
export default function PopupView({ popup, preview = false, onClose, onEvent }) {
  const d = popup.design || {};
  const base = d.theme === 'custom' ? { bg: d.bg || '#0C1526', text: d.text || '#ECF1F8', accent: d.accent || '#6391FF', border: 'rgba(128,128,128,.3)' } : THEMES[d.theme] || THEMES.site;
  const hex = /^#[0-9a-f]{6}$/i.test(d.accent || '') ? d.accent : /^#[0-9a-f]{6}$/i.test(base.accent) ? base.accent : '#6391FF';
  const st = d.style || 'classic';
  // Premium styles bring their own colours; the accent tints them.
  const STYLE = {
    aurora: { bg: '#070B1A', text: '#EEF2FF', accent: hex, border: 'rgba(255,255,255,.12)' },
    spotlight: { bg: '#0A0E1A', text: '#F1F5FF', accent: hex, border: 'rgba(255,255,255,.12)' },
    gradient: { bg: `linear-gradient(135deg, ${hex}, #7C3AED 60%, #DB2777)`, text: '#FFFFFF', accent: '#FFFFFF', border: 'rgba(255,255,255,.28)' },
    glass: { bg: 'rgb(var(--surface) / .72)', text: 'rgb(var(--ink))', accent: hex, border: 'rgba(255,255,255,.4)' },
    ticket: { ...base, accent: hex },
  }[st];
  const theme = { ...(STYLE || base), hex, glow: `${hex}99`, accentText: st === 'gradient' ? hex : d.theme === 'brand' && !STYLE ? '#2F63E6' : '#FFFFFF' };
  const layout = popup.layout || 'modal'; const pos = popup.position || 'center';
  const ref = useRef(null);
  useEffect(() => {
    if (preview) return;
    const k = (e) => { if (e.key === 'Escape' && d.closeOnOverlay !== false) onClose?.(); };
    document.addEventListener('keydown', k);
    const prev = document.activeElement; ref.current?.focus?.();
    if (layout === 'modal' || layout === 'fullscreen') { const o = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = o; document.removeEventListener('keydown', k); prev?.focus?.(); }; }
    return () => { document.removeEventListener('keydown', k); prev?.focus?.(); };
  }, [preview, layout]); // eslint-disable-line react-hooks/exhaustive-deps

  const radius = layout === 'bar' || layout === 'fullscreen' ? '0' : layout === 'drawer' ? '0' : RADIUS[d.radius] || RADIUS.round;
  const anim = { zoom: 'pp-zoom', fade: 'pp-fade', 'slide-up': 'pp-slide-up', 'slide-left': pos === 'left' ? 'pp-slide-right' : 'pp-slide-left', none: '' }[d.animation || 'zoom'];
  const glassFx = { backdropFilter: 'blur(28px) saturate(160%)', WebkitBackdropFilter: 'blur(28px) saturate(160%)', boxShadow: `0 40px 100px -30px ${hex}88, inset 0 1px 0 rgba(255,255,255,.35)` };
  const panelStyle = { background: theme.bg, color: theme.text, borderRadius: radius, border: `1px solid ${theme.border}`, '--pp-accent': theme.accent, ...(st === 'glass' ? glassFx : st !== 'classic' ? { boxShadow: `0 40px 110px -30px ${hex}aa` } : {}) };
  const abs = preview ? 'absolute' : 'fixed';
  const close = d.closeButton !== false && (
    <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/25 text-white backdrop-blur transition hover:bg-black/40"><X size={17} /></button>
  );
  // Premium styles add a moving glow, a light sweep or a soft colour edge behind the content.
  const layer = 'pointer-events-none absolute inset-0 overflow-hidden';
  const deco = st === 'aurora' ? (
    <div aria-hidden className={layer} style={{ borderRadius: 'inherit' }}>
      <div className="pp-blob absolute -left-16 -top-20 h-64 w-64 rounded-full opacity-70 blur-3xl" style={{ background: hex }} />
      <div className="pp-blob pp-blob-2 absolute -bottom-24 -right-10 h-72 w-72 rounded-full opacity-60 blur-3xl" style={{ background: '#A855F7' }} />
      <div className="pp-blob pp-blob-3 absolute left-1/3 top-1/3 h-40 w-40 rounded-full opacity-40 blur-3xl" style={{ background: '#22D3EE' }} />
      <div className="absolute inset-0 bg-[#070B1A]/40" />
    </div>
  ) : st === 'spotlight' ? (
    <div aria-hidden className={layer} style={{ borderRadius: 'inherit' }}>
      <div className="absolute left-1/2 top-0 h-72 w-[130%] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-60 blur-3xl" style={{ background: `radial-gradient(closest-side, ${hex}, transparent)` }} />
      <div className="absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
    </div>
  ) : st === 'gradient' ? (
    <div aria-hidden className={layer} style={{ borderRadius: 'inherit' }}><div className="pp-shine absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" /></div>
  ) : st === 'glass' ? (
    <div aria-hidden className={layer} style={{ borderRadius: 'inherit' }}>
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-40 blur-3xl" style={{ background: hex }} />
      <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full opacity-25 blur-3xl" style={{ background: '#A855F7' }} />
    </div>
  ) : null;
  const inner = <>{deco}<div className="relative z-[1]"><Body popup={popup} theme={theme} onClose={onClose} onEvent={onEvent} /></div></>;
  const overlay = d.overlay && !['slidein', 'bar'].includes(layout) && (
    <div onClick={() => d.closeOnOverlay !== false && onClose?.()} className={cn(abs, 'inset-0 pp-fade', d.blur && 'backdrop-blur-sm')} style={{ background: `rgba(5,10,20,${Math.min(0.9, (Number(d.overlayOpacity ?? 60)) / 100)})` }} aria-hidden />
  );
  const common = { ref, role: 'dialog', 'aria-modal': layout === 'modal' || layout === 'fullscreen' ? 'true' : undefined, 'aria-label': popup.content?.heading || popup.name || 'Popup', tabIndex: -1, style: { ...panelStyle, outline: 'none' } };

  if (layout === 'fullscreen') {
    const bgImg = popup.content?.image && popup.content?.imagePosition === 'background' ? popup.content.image : '';
    const inner2 = bgImg ? <Body popup={{ ...popup, content: { ...popup.content, image: '' } }} theme={theme} onClose={onClose} onEvent={onEvent} /> : inner;
    return (
      <div className={cn(abs, 'inset-0 z-[90] overflow-y-auto', anim)} {...common} style={{ ...panelStyle, border: 0, outline: 'none', ...(bgImg ? { color: '#fff' } : {}) }}>
        {bgImg && <><img loading="lazy" decoding="async" src={bgImg} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" /><div className="pointer-events-none absolute inset-0 bg-black/55" /></>}
        {close}<div className="relative mx-auto grid min-h-full max-w-3xl place-items-center">{inner2}</div>
      </div>
    );
  }
  if (layout === 'bar') {
    const c = popup.content || {}; const top = pos === 'top';
    return (
      <div className={cn(abs, 'inset-x-0 z-[85]', top ? 'top-0' : 'bottom-0', anim)} {...common} style={{ ...panelStyle, border: 0 }}>
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-5 gap-y-2 px-12 py-3 text-center text-sm">
          <span>{c.icon && <span className="mr-2">{c.icon}</span>}<strong className="font-semibold">{c.heading}</strong>{c.body && <span className="ml-2 opacity-85">{c.body}</span>}</span>
          {c.countdownTo && <Countdown to={c.countdownTo} />}
          <Btn b={c.primary} primary theme={theme} onEvent={onEvent} onClose={onClose} coupon={c.coupon} />
        </div>
        {d.closeButton !== false && <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full hover:bg-black/20"><X size={16} /></button>}
      </div>
    );
  }
  if (layout === 'slidein') {
    const side = pos === 'bottom-left' ? 'left-4' : 'right-4';
    return <div className={cn(abs, 'bottom-4 z-[85] w-[min(92vw,400px)] overflow-hidden shadow-2xl', side, anim)} {...common}>{close}{inner}</div>;
  }
  if (layout === 'drawer') {
    const side = pos === 'left' ? 'left-0' : 'right-0';
    return (<>{overlay}<div className={cn(abs, 'inset-y-0 z-[90] w-[min(94vw,460px)] overflow-y-auto shadow-2xl', side, anim)} {...common}>{close}<div className="pt-8">{inner}</div></div></>);
  }
  return (
    <>
      {overlay}
      <div className={cn(preview ? 'relative grid min-h-[420px] place-items-center p-6' : 'fixed inset-0 z-[90] grid place-items-center p-4 pointer-events-none')}>
        <div className={cn('relative w-full shadow-2xl', preview ? 'overflow-hidden' : 'pointer-events-auto max-h-[92vh] overflow-y-auto', WIDTH[popup.size] || WIDTH.md, anim)} {...common}>{close}{inner}</div>
      </div>
    </>
  );
}
