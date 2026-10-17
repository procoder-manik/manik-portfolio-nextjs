'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, Moon, Sun, ArrowUpRight, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';


export function ThemeToggle({ className }) {
  const [t, setT] = useState('dark');
  useEffect(() => setT(document.documentElement.dataset.theme || 'dark'), []);
  const flip = () => { const n = t === 'dark' ? 'light' : 'dark'; setT(n); document.documentElement.dataset.theme = n; try { localStorage.setItem('theme', n); } catch {} };
  return (
    <button onClick={flip} aria-label={`Switch to ${t === 'dark' ? 'light' : 'dark'} theme`} className={cn('grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition hover:bg-raised', className)}>
      {t === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export default function Header({ site, links = [], cta = {}, account = false }) {
  const NAV = links.map((l) => ({ ...l, hash: l.href?.startsWith('/#') ? l.href.slice(2) : null }));
  const path = usePathname();
  const home = path === '/';
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

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
    <header className={cn('no-print header-enter fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5', hidden && !open && 'header-hidden')}>
      <div className={cn('mx-auto flex max-w-shell items-center justify-between gap-4 rounded-full px-3 py-2 transition-all duration-500 ease-out sm:px-4',
        scrolled || open ? 'border border-line bg-base/80 shadow-[0_20px_50px_-30px_rgba(0,0,0,.6)] backdrop-blur-xl' : 'border border-transparent')}>
        <Link href="/" className="group flex items-center gap-2.5" aria-label={`${site.name}, home`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-signal font-display text-[15px] font-bold text-white transition-transform duration-500 group-hover:rotate-[-8deg]">MH</span>
          <span className="hidden font-display text-[17px] font-semibold tracking-tight text-ink sm:block">{site.name}</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.label + n.href} href={hrefFor(n)} target={/^https?:/.test(n.href || '') ? '_blank' : undefined} className={cn('relative rounded-full px-3.5 py-2 text-[0.94rem] font-medium transition', isActive(n) ? 'text-ink' : 'text-muted hover:text-ink')}>
              {isActive(n) && <span className="absolute inset-0 -z-10 rounded-full bg-raised" />}
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {account && <Link href="/account" aria-label="My account" title="My account" className={cn('grid h-10 w-10 place-items-center rounded-full border text-ink transition hover:bg-raised', path.startsWith('/account') ? 'border-signal bg-signal/10' : 'border-line')}><UserRound size={17} /></Link>}
          {cta.show !== false && <Link href={cta.href || '/contact'} className="btn-primary btn-sm hidden sm:inline-flex">{cta.label || 'Hire me'} <ArrowUpRight size={16} /></Link>}
          <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink lg:hidden" aria-expanded={open} aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <div className={cn('mx-auto mt-2 max-w-shell overflow-hidden rounded-3xl border border-line bg-base/95 backdrop-blur-xl transition-all duration-500 ease-out lg:hidden', open ? 'max-h-[80vh] opacity-100' : 'pointer-events-none max-h-0 border-transparent opacity-0')}>
        <nav className="flex flex-col p-3" aria-label="Mobile">
          {[...NAV, ...(account ? [{ label: 'My account', href: '/account' }] : []), ...(cta.show !== false ? [{ label: cta.label || 'Contact', href: cta.href || '/contact' }] : [])].map((n) => (
            <Link key={n.label + n.href} href={hrefFor(n)} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 font-display text-2xl font-semibold text-ink hover:bg-raised">{n.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
