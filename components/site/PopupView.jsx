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
  const pos = c.image ? c.imagePosition || 'top' : 'none';
  const compact = ['slidein', 'drawer'].includes(popup.layout) || popup.size === 'sm';
  const text = (
    <div className={cn('p-6 sm:p-8', center ? 'text-center' : 'text-left', pos === 'background' && 'relative z-10')}>
      {c.icon && <div className="mb-3 text-4xl leading-none">{c.icon}</div>}
      {c.badge && <span className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ background: theme.accent, color: theme.accentText }}>{c.badge}</span>}
      {c.heading && <h3 className={cn('break-words font-display font-bold leading-tight', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}>{c.heading}</h3>}
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
  if (pos === 'left' || pos === 'right') return <div className={cn('grid', compact ? 'grid-cols-[36%_1fr]' : 'sm:grid-cols-2')}><div className={cn('relative', !compact && 'hidden sm:block', pos === 'right' && 'order-2')}>{img}</div>{text}</div>;
  if (pos === 'top') return <div>{img}{text}</div>;
  if (pos === 'background') return <div className="relative text-white"><img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-black/55" />{text}</div>;
  return text;
}

/* The popup itself: layout, colours and animation. preview=true draws it inside its parent box. */
export default function PopupView({ popup, preview = false, onClose, onEvent }) {
  const d = popup.design || {};
  const base = d.theme === 'custom' ? { bg: d.bg || '#0C1526', text: d.text || '#ECF1F8', accent: d.accent || '#6391FF', border: 'rgba(128,128,128,.3)' } : THEMES[d.theme] || THEMES.site;
  const theme = { ...base, accentText: d.theme === 'brand' ? '#2F63E6' : '#FFFFFF' };
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
  const panelStyle = { background: theme.bg, color: theme.text, borderRadius: radius, border: `1px solid ${theme.border}`, '--pp-accent': theme.accent };
  const abs = preview ? 'absolute' : 'fixed';
  const close = d.closeButton !== false && (
    <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/25 text-white backdrop-blur transition hover:bg-black/40"><X size={17} /></button>
  );
  const inner = <Body popup={popup} theme={theme} onClose={onClose} onEvent={onEvent} />;
  const overlay = d.overlay && !['slidein', 'bar'].includes(layout) && (
    <div onClick={() => d.closeOnOverlay !== false && onClose?.()} className={cn(abs, 'inset-0 pp-fade', d.blur && 'backdrop-blur-sm')} style={{ background: `rgba(5,10,20,${Math.min(0.9, (Number(d.overlayOpacity ?? 60)) / 100)})` }} aria-hidden />
  );
  const common = { ref, role: 'dialog', 'aria-modal': layout === 'modal' || layout === 'fullscreen' ? 'true' : undefined, 'aria-label': popup.content?.heading || popup.name || 'Popup', tabIndex: -1, style: { ...panelStyle, outline: 'none' } };

  if (layout === 'fullscreen') {
    const bgImg = popup.content?.image && popup.content?.imagePosition === 'background' ? popup.content.image : '';
    const inner2 = bgImg ? <Body popup={{ ...popup, content: { ...popup.content, image: '' } }} theme={theme} onClose={onClose} onEvent={onEvent} /> : inner;
    return (
      <div className={cn(abs, 'inset-0 z-[90] overflow-y-auto', anim)} {...common} style={{ ...panelStyle, border: 0, outline: 'none', ...(bgImg ? { color: '#fff' } : {}) }}>
        {bgImg && <><img src={bgImg} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" /><div className="pointer-events-none absolute inset-0 bg-black/55" /></>}
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
