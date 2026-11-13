'use client';
import { useEffect, useRef, useState } from 'react';

/* Counts a number up when it scrolls into view. "85+", "15 MB" and "100%" count; text such as "MIT" stays as it is. */
export default function LpCount({ value, className }) {
  const m = String(value).match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const ref = useRef(null);
  const target = m ? parseFloat(m[2]) : 0;
  const dec = m && m[2].includes('.') ? m[2].split('.')[1].length : 0;
  const [n, setN] = useState(target);
  useEffect(() => {
    if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const el = ref.current; let raf = 0; let started = false;
    const run = () => {
      const t0 = performance.now(); const dur = 1500;
      const tick = (t) => { const p = Math.min(1, (t - t0) / dur); setN(target * (1 - Math.pow(1 - p, 4))); if (p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) { started = true; run(); io.disconnect(); } }, { threshold: 0.4 });
    setN(0); io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <span className={className}>{value}</span>;
  return <span ref={ref} className={className}>{m[1]}{n.toFixed(dec)}{m[3]}</span>;
}
