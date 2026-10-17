'use client';
import { useEffect, useState } from 'react';
/* Sticky "on this page" list that highlights the section in view. */
export default function ScrollSpy({ items = [], accent }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean);
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-35% 0px -60% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="On this page" className="sticky top-28">
      <p className="text-sm font-semibold text-ink">On this page</p>
      <ol className="mt-4 space-y-1 border-l border-line">
        {items.map((i, n) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className={`-ml-px flex items-center gap-3 border-l-2 py-1.5 pl-4 text-sm transition ${active === i.id ? 'font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}`} style={active === i.id ? { borderColor: accent } : undefined}>
              <span className="font-display text-xs text-muted">{String(n + 1).padStart(2, '0')}</span>{i.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
