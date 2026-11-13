'use client';
import { useEffect, useRef } from 'react';

/* A soft web of dots and lines behind the hero. It drifts on its own, and the lines reach for the cursor.
   Colours come from the page's colour set. It stops when off screen and stays still for visitors who prefer less motion. */
export default function HeroFx({ density = 1 }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const host = cv.parentElement; const ctx = cv.getContext('2d'); if (!ctx || !host) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const css = getComputedStyle(cv.closest('.lp') || document.documentElement);
    const rgb = (n, fb) => (css.getPropertyValue(n).trim().split(/\s+/).join(',') || fb);
    const cols = [rgb('--lp-a', '255,176,87'), rgb('--lp-b', '255,99,140'), rgb('--lp-c', '168,112,255')];
    let w = 0; let h = 0; let pts = []; let raf = 0; let visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999, on: false };

    const size = () => {
      const r = host.getBoundingClientRect(); w = r.width; h = Math.min(r.height, 900);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(18, Math.min(86, Math.round((w * h) / 15000 * density)));
      pts = Array.from({ length: n }, (_, i) => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32, r: Math.random() * 1.7 + 0.9, c: cols[i % 3] }));
    };

    const LINK = 128; const REACH = 170;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      if (mouse.on) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
        g.addColorStop(0, `rgba(${cols[1]},.16)`); g.addColorStop(1, `rgba(${cols[1]},0)`);
        ctx.fillStyle = g; ctx.fillRect(mouse.x - 220, mouse.y - 220, 440, 440);
      }
      for (const p of pts) {
        if (!reduce) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
          if (mouse.on) { const dx = mouse.x - p.x; const dy = mouse.y - p.y; const d = Math.hypot(dx, dy); if (d < REACH && d > 1) { p.x += (dx / d) * 0.55; p.y += (dy / d) * 0.55; } }
        }
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j]; const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) { ctx.strokeStyle = `rgba(${a.c},${(1 - d / LINK) * 0.38})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        if (mouse.on) {
          const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (d < REACH) { ctx.strokeStyle = `rgba(${cols[1]},${(1 - d / REACH) * 0.7})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        }
      }
      for (const p of pts) { ctx.fillStyle = `rgba(${p.c},.75)`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
      if (!reduce && visible) raf = requestAnimationFrame(frame);
    };

    const move = (e) => { const r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true; };
    const leave = () => { mouse.on = false; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) raf = requestAnimationFrame(frame); });
    const ro = new ResizeObserver(() => { size(); if (reduce) frame(); });
    size(); io.observe(host); ro.observe(host);
    host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave);
    if (reduce) frame(); else raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); };
  }, [density]);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-full w-full" style={{ maskImage: 'linear-gradient(180deg, #000 55%, transparent)', WebkitMaskImage: 'linear-gradient(180deg, #000 55%, transparent)' }} />;
}
