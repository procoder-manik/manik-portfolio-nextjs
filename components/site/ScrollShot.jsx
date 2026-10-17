'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

/* A browser frame whose full-page screenshot scrolls slowly on hover (or focus/tap).
   Speed is tied to distance so short and long pages move at the same pace. */
export default function ScrollShot({ src, alt, url, direction = 'down', accent, className, aspect = 'aspect-[4/3]', speed = 220, auto = false, chrome = true, eager = false }) {
  const frame = useRef(null); const img = useRef(null);
  const [state, setState] = useState({ y: direction === 'up' ? null : 0, dur: 0 });
  const [loaded, setLoaded] = useState(false);

  const maxShift = () => {
    const f = frame.current, i = img.current; if (!f || !i) return 0;
    return Math.max(0, i.offsetHeight - f.offsetHeight);
  };
  const start = useCallback(() => {
    const d = maxShift(); if (!d) return;
    setState({ y: direction === 'up' ? 0 : -d, dur: d / speed });
  }, [direction, speed]);
  const stop = useCallback(() => {
    const d = maxShift();
    setState({ y: direction === 'up' ? -d : 0, dur: Math.min(1.2, d / (speed * 4)) });
  }, [direction, speed]);
  const onLoad = () => { setLoaded(true); if (direction === 'up') setState({ y: -maxShift(), dur: 0 }); if (auto) setTimeout(start, 600); };

  useEffect(() => { if (img.current?.complete && img.current.naturalHeight) onLoad(); }, []); // eslint-disable-line

  let host = '';
  try { host = url ? new URL(url).hostname.replace(/^www\./, '') : ''; } catch {}

  return (
    <div className={cn('shot overflow-hidden rounded-2xl border border-line bg-raised', className)}
      onMouseEnter={auto ? undefined : start} onMouseLeave={auto ? undefined : stop} onFocus={start} onBlur={stop} onTouchStart={start}>
      {chrome && (
        <div className="flex items-center gap-3 border-b border-line bg-surface px-3.5 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-raised px-3 py-1 text-xs text-muted">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent || 'rgb(var(--signal))' }} />
            <span className="truncate">{host || 'preview'}</span>
          </div>
        </div>
      )}
      <div ref={frame} className={cn('relative overflow-hidden bg-raised', aspect)}>
        {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-raised to-surface" />}
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img ref={img} src={src} alt={alt || ''} onLoad={onLoad} loading={eager ? 'eager' : 'lazy'} decoding="async"
            className={cn('absolute left-0 top-0 w-full transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0')}
            style={{ transform: state.y == null ? undefined : `translate3d(0, ${state.y}px, 0)`, transition: `transform ${state.dur}s ${state.dur > 2 ? 'linear' : 'cubic-bezier(.16,1,.3,1)'}, opacity .5s` }} />
        )}
      </div>
    </div>
  );
}
