'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Copy, Check } from 'lucide-react';
import Countdown from './Countdown';
import { pathMatches } from '@/lib/popups';
import { cn } from '@/lib/utils';

const PRESETS = { brand: ['#2F63E6', '#FFFFFF'], dark: ['#0C1526', '#ECF1F8'], light: ['#EEF2FA', '#0C1526'], amber: ['#FFB446', '#1A1204'] };
const KEY = 'ann-closed';

/* Slim strip above the header. Visitors can close it; it stays closed for the chosen days.
   It sets --bar-h so the fixed header sits just below it and slides to the top as the page scrolls. */
export default function AnnouncementBar({ cfg }) {
  const path = usePathname(); const ref = useRef(null);
  const [open, setOpen] = useState(true); const [i, setI] = useState(0); const [copied, setCopied] = useState(false); const [ended, setEnded] = useState(false);
  const msgs = (cfg.messages || []).filter((m) => m.text);
  const sig = JSON.stringify([msgs.map((m) => m.text), cfg.countdownTo]);

  const now = Date.now();
  const inWindow = !(cfg.startAt && new Date(cfg.startAt).getTime() > now) && !(cfg.endAt && new Date(cfg.endAt).getTime() < now);
  const onPage = cfg.pages === 'include' ? pathMatches(cfg.paths, path) : cfg.pages === 'exclude' ? !pathMatches(cfg.paths, path) : true;
  const visible = open && msgs.length && inWindow && onPage && !ended;

  useEffect(() => {
    try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && c.sig === sig && c.until > Date.now()) setOpen(false); } catch {}
  }, [sig]);
  useEffect(() => { if (msgs.length < 2) return; const t = setInterval(() => setI((x) => (x + 1) % msgs.length), Math.max(3, Number(cfg.rotate) || 6) * 1000); return () => clearInterval(t); }, [msgs.length, cfg.rotate]);
  useEffect(() => {
    const root = document.documentElement;
    if (!visible || !ref.current) { root.style.setProperty('--bar-h', '0px'); return; }
    const h = () => root.style.setProperty('--bar-h', `${Math.max(0, ref.current.offsetHeight - window.scrollY)}px`);
    h(); window.addEventListener('scroll', h, { passive: true }); window.addEventListener('resize', h);
    return () => { window.removeEventListener('scroll', h); window.removeEventListener('resize', h); root.style.setProperty('--bar-h', '0px'); };
  }, [visible, i]);

  if (!visible) return null;
  const [bg, fg] = cfg.preset === 'custom' ? [cfg.bg || '#2F63E6', cfg.text || '#FFFFFF'] : PRESETS[cfg.preset] || PRESETS.brand;
  const m = msgs[Math.min(i, msgs.length - 1)];
  const close = () => { setOpen(false); try { localStorage.setItem(KEY, JSON.stringify({ sig, until: Date.now() + Math.max(0, Number(cfg.rememberDays ?? 7)) * 86400000 })); } catch {} };
  const pad = { compact: 'py-1.5 text-[13px]', normal: 'py-2.5 text-sm', large: 'py-3.5 text-base' }[cfg.size || 'normal'];
  return (
    <div ref={ref} role="region" aria-label="Announcement" className={cn('no-print relative z-[60]', cfg.hideOnMobile && 'hidden md:block')} style={{ background: bg, color: fg }}>
      <div className={cn('mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-4 gap-y-1 px-12 text-center', pad)}>
        <span key={i} className="pp-fade">{m.icon && <span className="mr-1.5">{m.icon}</span>}<span className="font-medium">{m.text}</span></span>
        {m.code && <button type="button" onClick={() => { navigator.clipboard?.writeText(m.code).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1800); }} className="inline-flex items-center gap-1.5 rounded-md border border-dashed px-2 py-0.5 font-mono text-[0.85em] font-bold" style={{ borderColor: fg }} aria-label={`Copy code ${m.code}`}>{m.code}{copied ? <Check size={13} /> : <Copy size={13} />}</button>}
        {cfg.countdownTo && <span className="inline-flex items-center gap-1.5">{cfg.countdownLabel}<Countdown to={cfg.countdownTo} onEnd={() => setEnded(true)} /></span>}
        {m.linkLabel && m.href && <a href={m.href} target={m.newTab || /^https?:/.test(m.href) ? '_blank' : undefined} rel="noopener noreferrer" className="font-semibold underline underline-offset-4">{m.linkLabel}</a>}
      </div>
      {cfg.dismissible !== false && <button type="button" onClick={close} aria-label="Close announcement" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full transition hover:bg-black/15 sm:right-4"><X size={16} /></button>}
    </div>
  );
}
