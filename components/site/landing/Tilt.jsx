'use client';
import { useRef } from 'react';

/* Leans a little toward the cursor, like a card on a table. Off for visitors who prefer less motion and on touch screens. */
export default function Tilt({ children, className = '', max = 5 }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const set = (rx, ry) => { cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(() => { if (ref.current) ref.current.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)`; }); };
  const move = (e) => {
    if (e.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5;
    set((-y * max).toFixed(2), (x * max * 1.4).toFixed(2));
  };
  return <div ref={ref} onPointerMove={move} onPointerLeave={() => set(0, 0)} className={className} style={{ transition: 'transform .35s cubic-bezier(.16,1,.3,1)', willChange: 'transform' }}>{children}</div>;
}
