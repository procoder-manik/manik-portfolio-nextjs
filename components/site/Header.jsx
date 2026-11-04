'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Moon, Sun, Monitor, ArrowUpRight, UserRound, ChevronDown } from 'lucide-react';
import { MegaPanel, MegaMobile } from './MegaMenu';
import { cn } from '@/lib/utils';


const MODES = [['system', 'System', Monitor], ['light', 'Light', Sun], ['dark', 'Dark', Moon]];
export const TONES = [['blue', 'Blue', '#6391FF'], ['indigo', 'Indigo', '#818CF8'], ['emerald', 'Emerald', '#10B981'], ['violet', 'Violet', '#A78BFA'], ['rose', 'Rose', '#FB7185'], ['graphite', 'Graphite', '#CBD5E1'], ['sand', 'Sand', '#E8A962']];

/* Mode (System, Light, Dark) and colour tone, remembered on the visitor's device. System follows the device and
   updates live when the device switches between light and dark. */
export function ThemeToggle({ className, cfg, up = false }) {
  const c = { allowSwitch: true, showTones: true, defaultTone: 'blue', tones: TONES.map((t) => t[0]), ...(cfg || {}) };
  const [mode, setMode] = useState('system'); const [tone, setTone] = useState(c.defaultTone || 'blue'); const [dark, setDark] = useState(false); const [open, setOpen] = useState(false);
  const box = useRef(null); const pop = useRef(null); const [pos, setPos] = useState(null);
  useEffect(() => { const d = document.documentElement; setMode(d.dataset.mode || 'system'); setTone(d.dataset.tone || c.defaultTone || 'blue'); setDark(d.dataset.theme === 'dark'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => { const d = document.documentElement; if (d.dataset.mode === 'system') { d.dataset.theme = mq.matches ? 'dark' : 'light'; setDark(mq.matches); } };
    mq.addEventListener('change', on); return () => mq.removeEventListener('change', on);
  }, []);
  useEffect(() => { if (!open) return; const h = (e) => { if (!(box.current?.contains(e.target) || pop.current?.contains(e.target))) setOpen(false); }; const k = (e) => e.key === 'Escape' && setOpen(false); const r = () => setOpen(false); document.addEventListener('mousedown', h); document.addEventListener('keydown', k); window.addEventListener('resize', r); return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); window.removeEventListener('resize', r); }; }, [open]);
  // Place the panel next to its button, always fully inside the screen (the admin button sits at the very left).
  useLayoutEffect(() => {
    if (!open || !box.current) return;
    const r = box.current.getBoundingClientRect(); const w = Math.min(240, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8));
    setPos(up ? { left, width: w, bottom: window.innerHeight - r.top + 8 } : { left, width: w, top: r.bottom + 8 });
  }, [open, up]);
  if (c.allowSwitch === false) return null;
  const pickMode = (m) => {
    const d = document.documentElement; const r = m === 'system' ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : m;
    d.dataset.mode = m; d.dataset.theme = r; setMode(m); setDark(r === 'dark'); try { localStorage.setItem('theme', m); } catch {}
  };
  const pickTone = (t) => { const d = document.documentElement; d.dataset.tone = t; setTone(t); try { localStorage.setItem('tone', t); } catch {} };
  const tones = [...TONES.filter(([id]) => (c.tones || []).includes(id) || id === 'blue'), ...(c.custom || []).map((t) => [t.id, t.name, t.color])];
  return (
    <div className="relative" ref={box}>
      <button onClick={() => setOpen(!open)} aria-haspopup="true" aria-expanded={open} aria-label="Appearance: mode and colour" className={cn('grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition hover:bg-raised', className)}>
        {mode === 'system' ? <Monitor size={17} /> : dark ? <Moon size={17} /> : <Sun size={17} />}
      </button>
      {open && pos && typeof document !== 'undefined' && createPortal(
        <div ref={pop} role="dialog" aria-label="Appearance" style={pos} className="fixed z-[95] rounded-2xl border border-line bg-surface p-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,.55)]">
          <p className="px-1 pb-2 text-xs font-medium uppercase tracking-wider text-muted">Mode</p>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-raised p-1">
            {MODES.map(([id, label, I]) => (
              <button key={id} onClick={() => pickMode(id)} aria-pressed={mode === id} className={cn('flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition', mode === id ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink')}><I size={16} />{label}</button>
            ))}
          </div>
          {c.showTones !== false && tones.length > 1 && (<>
            <p className="px-1 pb-2 pt-4 text-xs font-medium uppercase tracking-wider text-muted">Colour</p>
            <div className="flex flex-wrap gap-2 px-1">
              {tones.map(([id, label, col]) => (
                <button key={id} onClick={() => pickTone(id)} title={label} aria-label={`${label} colour`} aria-pressed={tone === id} className={cn('grid h-8 w-8 place-items-center rounded-full border-2 transition', tone === id ? 'border-ink' : 'border-transparent hover:border-line')}>
                  <span className="h-5 w-5 rounded-full" style={{ background: col }} />
                </button>
              ))}
            </div>
          </>)}
        </div>,
        document.body,
      )}
    </div>
  );
}

export default function Header({ site, links = [], cta = {}, account = false, theme }) {
  const NAV = links.map((l) => ({ ...l, hash: l.href?.startsWith('/#') ? l.href.slice(2) : null }));
  const path = usePathname();
  const home = path === '/';
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const [mega, setMega] = useState(''); const [mobMega, setMobMega] = useState(''); const closeT = useRef(null);
  const openMega = (k) => { clearTimeout(closeT.current); setMega(k); };
  const laterClose = () => { clearTimeout(closeT.current); closeT.current = setTimeout(() => setMega(''), 170); };
  useEffect(() => { setMega(''); setMobMega(''); }, [path]);
  useEffect(() => { const k = (e) => e.key === 'Escape' && setMega(''); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, []);
  useEffect(() => { if (hidden) setMega(''); }, [hidden]);

  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Hide while reading down the page, show again on the slightest scroll up
      if (Math.abs(y - last) > 6) { setHidden(y > last && y > 320); last = y; }
    };
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!home) return;
    const els = NAV.filter((n) => n.hash).map((n) => document.getElementById(n.hash)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(window.scrollY < 300 ? '' : e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((el) => io.observe(el));
    const top = () => window.scrollY < 300 && setActive('');
    window.addEventListener('scroll', top, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', top); };
  }, [home]); // eslint-disable-line react-hooks/exhaustive-deps

  const hrefFor = (n) => (home && n.hash ? `#${n.hash}` : n.href);
  const isActive = (n) => (home ? Boolean(n.hash) && active === n.hash : !n.hash && n.href !== '/' && !/^https?:/.test(n.href || '') && path.startsWith(n.href));

  return (
    <header style={{ top: 'var(--bar-h, 0px)' }} className={cn('no-print header-enter fixed inset-x-0 z-50 px-3 pt-3 sm:px-5', hidden && !open && 'header-hidden')}>
      <div onMouseLeave={laterClose} className={cn('relative mx-auto flex max-w-shell items-center justify-between gap-4 rounded-full px-3 py-2 transition-all duration-500 ease-out sm:px-4',
        scrolled || open || mega ? 'border border-line bg-base/80 shadow-[0_20px_50px_-30px_rgba(0,0,0,.6)] backdrop-blur-xl' : 'border border-transparent')}>
        <Link href="/" className="group flex items-center gap-2.5" aria-label={`${site.name}, home`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-signal font-display text-[15px] font-bold text-white transition-transform duration-500 group-hover:rotate-[-8deg]">MH</span>
          <span className="hidden font-display text-[17px] font-semibold tracking-tight text-ink sm:block">{site.name}</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => {
            const k = n.label + n.href;
            const cls = cn('relative rounded-full px-3.5 py-2 text-[0.94rem] font-medium transition', isActive(n) || mega === k ? 'text-ink' : 'text-muted hover:text-ink');
            if (!n.mega) return (
              <Link key={k} href={hrefFor(n)} target={/^https?:/.test(n.href || '') ? '_blank' : undefined} onMouseEnter={laterClose} className={cls}>
                {isActive(n) && <span className="absolute inset-0 -z-10 rounded-full bg-raised" />}
                {n.label}
              </Link>
            );
            return (
              <div key={k} onMouseEnter={() => openMega(k)} className="relative flex items-center">
                <Link href={n.href && n.href !== '#' ? hrefFor(n) : '#'} onFocus={() => openMega(k)} onClick={(e) => { if (!n.href || n.href === '#') { e.preventDefault(); setMega(mega === k ? '' : k); } }} className={cn(cls, 'pr-1.5')}>
                  {(isActive(n) || mega === k) && <span className="absolute inset-0 -z-10 rounded-full bg-raised" />}
                  {n.label}
                </Link>
                <button type="button" aria-label={`${mega === k ? 'Close' : 'Open'} ${n.label} menu`} aria-expanded={mega === k} onClick={() => setMega(mega === k ? '' : k)} className="-ml-1 grid h-8 w-6 place-items-center rounded-full text-muted transition hover:text-ink"><ChevronDown size={15} className={cn('transition', mega === k && 'rotate-180')} /></button>
              </div>
            );
          })}
        </nav>
        {NAV.map((n) => n.mega && mega === n.label + n.href && (
          <div key={`panel-${n.label}`} onMouseEnter={() => openMega(n.label + n.href)} className="mega-enter absolute left-1/2 top-full z-50 hidden -translate-x-1/2 pt-3 lg:block">
            <MegaPanel mega={n.mega} onGo={() => setMega('')} />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <ThemeToggle cfg={theme} />
          {account && <Link href="/account" aria-label="My account" title="My account" className={cn('grid h-10 w-10 place-items-center rounded-full border text-ink transition hover:bg-raised', path.startsWith('/account') ? 'border-signal bg-signal/10' : 'border-line')}><UserRound size={17} /></Link>}
          {cta.show !== false && <Link href={cta.href || '/contact'} className="btn-primary btn-sm hidden sm:inline-flex">{cta.label || 'Hire me'} <ArrowUpRight size={16} /></Link>}
          <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink lg:hidden" aria-expanded={open} aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <div className={cn('mx-auto mt-2 max-w-shell overflow-hidden rounded-3xl border border-line bg-base/95 backdrop-blur-xl transition-all duration-500 ease-out lg:hidden', open ? 'max-h-[85vh] overflow-y-auto opacity-100' : 'pointer-events-none max-h-0 border-transparent opacity-0')}>
        <nav className="flex flex-col p-3" aria-label="Mobile">
          {[...NAV, ...(account ? [{ label: 'My account', href: '/account' }] : []), ...(cta.show !== false ? [{ label: cta.label || 'Contact', href: cta.href || '/contact' }] : [])].map((n) => (n.mega
            ? <MegaMobile key={n.label + n.href} n={n} open={mobMega === n.label + n.href} onToggle={() => setMobMega(mobMega === n.label + n.href ? '' : n.label + n.href)} onGo={() => setOpen(false)} />
            : <Link key={n.label + n.href} href={hrefFor(n)} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 font-display text-2xl font-semibold text-ink hover:bg-raised">{n.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
