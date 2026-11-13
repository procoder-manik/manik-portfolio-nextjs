'use client';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

/* A small pill at the bottom that follows the visitor down the page and goes away when the download section is on screen. */
export default function LandingBar({ name, label, logo }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let atDl = false; let passed = false;
    const upd = () => setShow(passed && !atDl);
    const onScroll = () => { passed = window.scrollY > 640; upd(); };
    const el = document.getElementById('download');
    const io = el && new IntersectionObserver(([e]) => { atDl = e.isIntersecting; upd(); }, { threshold: 0.15 });
    if (el) io.observe(el);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); io?.disconnect(); };
  }, []);
  return (
    <div className={`no-print pointer-events-none fixed inset-x-0 bottom-5 z-[55] flex justify-center px-4 transition duration-500 ${show ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} aria-hidden={!show}>
      <a href="#download" tabIndex={show ? 0 : -1} className="pointer-events-auto lp-glass flex items-center gap-3 rounded-full py-2 pl-2 pr-2 text-sm font-medium text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)]" style={{ background: 'rgb(var(--lp-d1) / .82)' }}>
        {logo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={logo} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />}
        <span className="pl-1">{name}</span>
        <span className="lp-btn inline-flex items-center gap-1.5 rounded-full px-4 py-2"><Download size={15} />{label}</span>
      </a>
    </div>
  );
}
