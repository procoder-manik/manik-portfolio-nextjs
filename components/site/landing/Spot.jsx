'use client';

/* A card with a soft light that follows the cursor. The light itself is in globals.css (.lp-spot). */
export default function Spot({ children, className = '' }) {
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return <div onPointerMove={move} className={`lp-spot ${className}`}>{children}</div>;
}
