'use client';
import { useEffect, useRef, useState } from 'react';

/* Counts the number part of values like "550+", "100%" or "7+" up when it scrolls into view. */
export default function CountUp({ value = '', duration = 1400 }) {
  const m = String(value).match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
  const ref = useRef(null);
  const [n, setN] = useState(m ? 0 : null);
  useEffect(() => {
    if (!m) return;
    const target = parseFloat(m[2].replace(',', ''));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(target); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const tick = (t) => { const p = Math.min(1, (t - t0) / duration); setN(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: .4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <>{value}</>;
  return <span ref={ref}>{m[1]}{n === null ? m[2] : n.toLocaleString('en-US')}{m[3]}</span>;
}
