'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Copy, Check, ArrowRight } from 'lucide-react';
import Countdown from './Countdown';
import { pathMatches } from '@/lib/popups';
import { cn } from '@/lib/utils';

const PRESETS = { brand: ['#2F63E6', '#FFFFFF'], dark: ['#0C1526', '#ECF1F8'], light: ['#EEF2FA', '#0C1526'], amber: ['#FFB446', '#1A1204'] };
const KEY = 'ann-closed';
const hex6 = (h) => /^#[0-9a-f]{6}$/i.test(h || '');

/* The look of each style: background, text colour, accent (for the code, button and glow) and extra classes. */
function lookOf(cfg) {
  const a = hex6(cfg.accent) ? cfg.accent : '#6366F1';
  switch (cfg.style) {
    case 'gradient': return { bg: `linear-gradient(90deg, ${a}, #7C3AED, #DB2777, ${a})`, fg: '#FFFFFF', acc: '#FFFFFF', accText: a, cls: 'ann-sheen' };
    case 'glass': return { bg: `linear-gradient(90deg, ${a}26, ${a}12)`, fg: 'rgb(var(--ink))', acc: a, accText: '#FFFFFF', cls: 'backdrop-blur-xl border-b border-line', glass: true };
    case 'luxe': return { bg: 'linear-gradient(90deg, #0B0B0F, #1A1712 50%, #0B0B0F)', fg: '#F3E7C9', acc: '#D4AF37', accText: '#141008', cls: 'border-b border-[#D4AF37]/30' };
    case 'neon': return { bg: '#05060D', fg: '#E6EAFF', acc: a, accText: '#05060D', cls: '', neon: true };
    case 'festive': return { bg: `repeating-linear-gradient(135deg, #0B0B0B 0 18px, #141414 18px 36px)`, fg: '#FFFFFF', acc: hex6(cfg.accent) ? a : '#FACC15', accText: '#0B0B0B', cls: '' };
    default: {
      const [bg, fg] = cfg.preset === 'custom' ? [cfg.bg || '#2F63E6', cfg.text || '#FFFFFF'] : PRESETS[cfg.preset] || PRESETS.brand;
      return { bg, fg, acc: fg, accText: bg, cls: '' };
    }
  }
}

function Code({ code, look }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard?.writeText(code).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-dashed px-2 py-0.5 font-mono text-[0.85em] font-bold transition hover:opacity-80" style={{ borderColor: look.acc, color: look.acc }} aria-label={`Copy code ${code}`}>
      {code}{copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function Msg({ m, look, cfg }) {
  const btn = cfg.linkStyle === 'button';
  return (
    <span className="inline-flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1">
      <span>{m.icon && <span className="mr-1.5">{m.icon}</span>}<span className="font-medium" style={look.neon ? { textShadow: `0 0 12px ${look.acc}` } : undefined}>{m.text}</span></span>
      {m.code && <Code code={m.code} look={look} />}
      {m.linkLabel && m.href && (
        <a href={m.href} target={m.newTab || /^https?:/.test(m.href) ? '_blank' : undefined} rel="noopener noreferrer"
          className={btn ? 'inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[0.85em] font-semibold shadow-sm transition hover:brightness-110' : 'shrink-0 font-semibold underline underline-offset-4'}
          style={btn ? { background: look.acc, color: look.accText, ...(look.neon ? { boxShadow: `0 0 18px ${look.acc}` } : {}) } : undefined}>
          {m.linkLabel}{btn && <ArrowRight size={13} />}
        </a>
      )}
    </span>
  );
}

/* The promo bar. At the top it sits above the header (sets --bar-h so the fixed header sits just below it);
   at the bottom it floats over the page. Messages rotate one by one or scroll past as a ticker. Visitors can close it. */
export default function AnnouncementBar({ cfg }) {
  const path = usePathname(); const ref = useRef(null);
  const [open, setOpen] = useState(true); const [i, setI] = useState(0); const [ended, setEnded] = useState(false);
  const msgs = (cfg.messages || []).filter((m) => m.text);
  const sig = JSON.stringify([msgs.map((m) => m.text), cfg.countdownTo]);
  const marquee = cfg.mode === 'marquee';
  const bottom = cfg.placement === 'bottom';

  const now = Date.now();
  const inWindow = !(cfg.startAt && new Date(cfg.startAt).getTime() > now) && !(cfg.endAt && new Date(cfg.endAt).getTime() < now);
  const onPage = cfg.pages === 'include' ? pathMatches(cfg.paths, path) : cfg.pages === 'exclude' ? !pathMatches(cfg.paths, path) : true;
  const visible = open && msgs.length && inWindow && onPage && !ended;

  useEffect(() => {
    try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && c.sig === sig && c.until > Date.now()) setOpen(false); } catch {}
  }, [sig]);
  useEffect(() => { if (marquee || msgs.length < 2) return undefined; const t = setInterval(() => setI((x) => (x + 1) % msgs.length), Math.max(3, Number(cfg.rotate) || 6) * 1000); return () => clearInterval(t); }, [msgs.length, cfg.rotate, marquee]);
  useEffect(() => {
    const root = document.documentElement;
    if (!visible || !ref.current || bottom) { root.style.setProperty('--bar-h', '0px'); return undefined; }
    const h = () => root.style.setProperty('--bar-h', `${Math.max(0, ref.current.offsetHeight - window.scrollY)}px`);
    h(); window.addEventListener('scroll', h, { passive: true }); window.addEventListener('resize', h);
    return () => { window.removeEventListener('scroll', h); window.removeEventListener('resize', h); root.style.setProperty('--bar-h', '0px'); };
  }, [visible, i, bottom]);

  if (!visible) return null;
  const look = lookOf(cfg);
  const m = msgs[Math.min(i, msgs.length - 1)];
  const close = () => { setOpen(false); try { localStorage.setItem(KEY, JSON.stringify({ sig, until: Date.now() + Math.max(0, Number(cfg.rememberDays ?? 7)) * 86400000 })); } catch {} };
  const pad = { compact: 'py-1.5 text-[13px]', normal: 'py-2.5 text-sm', large: 'py-3.5 text-base' }[cfg.size || 'normal'];
  const timer = cfg.countdownTo && <span className="inline-flex shrink-0 items-center gap-1.5 font-medium">{cfg.countdownLabel}<Countdown to={cfg.countdownTo} onEnd={() => setEnded(true)} /></span>;
  const sep = <span aria-hidden className="mx-6 inline-block h-1.5 w-1.5 shrink-0 rounded-full opacity-60" style={{ background: look.acc }} />;
  // The ticker repeats the messages so the loop never shows a gap.
  const loop = marquee && (
    <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
      <div className="ann-marquee items-center" style={{ '--ann-speed': `${Math.max(10, Number(cfg.speed) || 30)}s` }}>
        {[0, 1].map((k) => <span key={k} className="flex shrink-0 items-center" aria-hidden={k === 1 || undefined}>{[...msgs, ...msgs].map((x, j) => <span key={j} className="flex items-center">{sep}<Msg m={x} look={look} cfg={cfg} /></span>)}</span>)}
      </div>
    </div>
  );

  return (
    <div ref={ref} role="region" aria-label="Announcement"
      className={cn('no-print z-[60] overflow-hidden', bottom ? 'fixed inset-x-3 bottom-3 rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.5)] sm:inset-x-auto sm:left-1/2 sm:w-[min(960px,calc(100%-2rem))] sm:-translate-x-1/2' : 'relative', look.cls, cfg.hideOnMobile && 'hidden md:block')}
      style={{ background: look.bg, color: look.fg, ...(look.neon ? { boxShadow: `inset 0 -1px 0 ${look.acc}88, 0 0 24px -6px ${look.acc}` } : {}) }}>
      {cfg.style === 'festive' && <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${look.acc}, transparent)` }} />}
      <div className={cn('mx-auto flex max-w-[1240px] items-center gap-x-4 gap-y-1 px-12 text-center', pad, marquee ? 'justify-start' : 'flex-wrap justify-center')}>
        {marquee ? <>{cfg.label && <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[0.78em] font-bold uppercase tracking-[0.12em]" style={{ background: look.acc, color: look.accText }}>{cfg.label}</span>}{loop}{timer}</> : (
          <>
            {cfg.label && <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[0.78em] font-bold uppercase tracking-[0.12em]" style={{ background: look.acc, color: look.accText }}>{cfg.label}</span>}
            <span key={i} className="pp-fade"><Msg m={m} look={look} cfg={cfg} /></span>
            {timer}
          </>
        )}
      </div>
      {cfg.dismissible !== false && <button type="button" onClick={close} aria-label="Close announcement" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full transition hover:bg-black/15 sm:right-4"><X size={16} /></button>}
    </div>
  );
}
