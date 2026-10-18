'use client';
import { useEffect, useState } from 'react';

/* Live countdown to a date. Renders nothing once the time has passed. Compact (inline) or large boxes. */
export default function Countdown({ to, big = false, onEnd }) {
  const target = to ? new Date(to).getTime() : 0;
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (!target) return;
    const tick = () => { const d = target - Date.now(); setLeft(d); if (d <= 0) onEnd?.(); };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!target || left == null || left <= 0) return null;
  const s = Math.floor(left / 1000); const d = Math.floor(s / 86400); const h = Math.floor((s % 86400) / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60;
  const parts = [...(d ? [[d, 'days']] : []), [h, 'hours'], [m, 'mins'], [sec, 'secs']];
  if (!big) return <span className="tabular-nums font-semibold" aria-label={`${d} days ${h} hours ${m} minutes left`}>{d ? `${d}d ` : ''}{String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(sec).padStart(2, '0')}</span>;
  return (
    <div className="flex justify-center gap-2.5" role="timer">
      {parts.map(([n, l]) => (
        <div key={l} className="min-w-[56px] rounded-xl bg-black/20 px-2 py-2 text-center">
          <div className="font-display text-2xl font-bold tabular-nums leading-none">{String(n).padStart(2, '0')}</div>
          <div className="mt-1 text-[10px] opacity-70">{l}</div>
        </div>
      ))}
    </div>
  );
}
