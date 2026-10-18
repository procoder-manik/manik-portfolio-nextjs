'use client';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/* Appears after you scroll down, with a ring that fills as you read. Sits above the chat bubble so they never overlap. */
export default function BackToTop() {
  const [show, setShow] = useState(false); const [pct, setPct] = useState(0);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0; const max = document.documentElement.scrollHeight - window.innerHeight; const y = window.scrollY;
      setShow(y > 500); setPct(max > 0 ? Math.min(1, y / max) : 0);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);
  const circ = 2 * Math.PI * 21;
  return (
    <button type="button" aria-label="Back to top" title="Back to top" tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
      className={`no-print group fixed right-4 z-[60] grid h-12 w-12 place-items-center rounded-full border border-line bg-surface/90 text-ink shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-signal hover:text-signal sm:right-6 ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.25rem)' }}>
      <svg className="absolute inset-0 -rotate-90" width="48" height="48" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r="21" fill="none" strokeWidth="2.5" className="stroke-line" />
        <circle cx="24" cy="24" r="21" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${pct * circ} ${circ}`} className="stroke-signal transition-[stroke-dasharray] duration-150" />
      </svg>
      <ArrowUp size={18} className="relative transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}
