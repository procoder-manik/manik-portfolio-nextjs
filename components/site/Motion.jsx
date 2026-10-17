'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/* Site-wide motion for the public pages:
   - scroll reveal (headings rise word by word, cards and screenshots fade up in sequence)
   - pointer spotlight on cards and magnetic primary buttons (mouse only)
   - scroll values for parallax glows and the progress line
   Only elements that start below the fold are hidden, so nothing visible on load blinks.
   A CSS fallback shows everything after 4 s if this script never runs. Off with reduced motion. */
const TARGETS = 'main h2, main .lede, main .card, main .shot, main [data-reveal], main dl > div, main section ol > li, main .prose-site > *';

export default function Motion() {
  const path = usePathname();

  // Reveal on scroll, re-scanned on every page change and when content changes
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      const shown = entries.filter((e) => e.isIntersecting).map((e) => e.target).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
      shown.forEach((el, i) => {
        el.style.setProperty('--d', `${Math.min(i, 7) * 80}ms`);
        el.dataset.anim = 'in'; io.unobserve(el);
        setTimeout(() => el.style.removeProperty('--d'), 1600);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });

    const scan = () => {
      const fold = window.innerHeight;
      document.querySelectorAll(TARGETS).forEach((el) => {
        if (el.dataset.anim || el.closest('[data-noreveal], header, footer')) return;
        if (el.parentElement?.closest('[data-anim="wait"]')) return;
        if (el.closest('[style*="opacity"]')) return;
        if (el.getBoundingClientRect().top < fold * 0.9) { el.dataset.anim = 'in'; return; }
        el.dataset.anim = 'wait'; io.observe(el);
      });
    };
    const t = setTimeout(scan, 30);
    const mo = new MutationObserver(() => { clearTimeout(mo.t); mo.t = setTimeout(scan, 80); });
    const main = document.querySelector('main');
    if (main) mo.observe(main, { childList: true, subtree: true });
    return () => { clearTimeout(t); io.disconnect(); mo.disconnect(); };
  }, [path]);

  // Pointer effects and scroll values (set up once)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const root = document.documentElement;
    let raf = 0; let lastBtn = null;

    const onMove = (e) => {
      const card = e.target.closest?.('.card');
      if (card) { const r = card.getBoundingClientRect(); card.style.setProperty('--mx', `${e.clientX - r.left}px`); card.style.setProperty('--my', `${e.clientY - r.top}px`); }
      if (reduce) return;
      const btn = e.target.closest?.('.btn-primary');
      if (lastBtn && lastBtn !== btn) { lastBtn.style.setProperty('--tx', '0px'); lastBtn.style.setProperty('--ty', '0px'); lastBtn = null; }
      if (btn && !btn.disabled) {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width; const y = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.setProperty('--tx', `${(x * 8).toFixed(1)}px`); btn.style.setProperty('--ty', `${(y * 6).toFixed(1)}px`); lastBtn = btn;
      }
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY; const max = document.documentElement.scrollHeight - window.innerHeight;
        root.style.setProperty('--sy', String(Math.min(y, 1200)));
        root.style.setProperty('--sp', max > 0 ? (y / max).toFixed(4) : '0');
      });
    };
    if (fine) document.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    return () => { document.removeEventListener('pointermove', onMove); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return <div className="scroll-line no-print" aria-hidden="true" />;
}
