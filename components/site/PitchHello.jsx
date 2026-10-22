'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, ArrowUpRight } from 'lucide-react';

const CODE = /^[a-z0-9-]{4,40}$/;

/* A personal card for a prospect who opened a pitch link: their name, your note, and (on a service area page)
   a headline written for them. Shown on the page the link points to, or whenever the link itself is opened. */
export default function PitchHello() {
  const path = usePathname();
  const [d, setD] = useState(null); const [gone, setGone] = useState(false);
  useEffect(() => {
    let dead = false;
    try {
      const fromUrl = (new URL(window.location.href).searchParams.get('p') || '').toLowerCase();
      let code = CODE.test(fromUrl) ? fromUrl : '';
      if (!code) { const j = JSON.parse(localStorage.getItem('pitch') || 'null'); if (j?.code && Date.now() - j.at < 30 * 864e5) code = j.code; }
      if (!code) return;
      setGone(sessionStorage.getItem(`hello:${code}`) === '1');
      fetch(`/api/pitch/hello?code=${code}`).then((r) => r.json()).then((j) => {
        if (dead || !j.ok) return;
        const here = (j.path || '').replace(/\/+$/, '') === path.replace(/\/+$/, '');
        if (!fromUrl && !here) return; // later pages on the same visit: stay quiet
        j.code = code; setD(j);
        const h = document.querySelector('[data-pitch-h]');
        if (h && j.headline && here) { h.textContent = j.headline; h.dataset.pitchDone = '1'; }
      }).catch(() => {});
    } catch {}
    return () => { dead = true; };
  }, [path]);
  if (!d || gone) return null;
  const close = () => { setGone(true); try { sessionStorage.setItem(`hello:${d.code}`, '1'); } catch {} };
  return (
    <aside role="complementary" aria-label={`A note for ${d.name}`} className="no-print fixed inset-x-3 bottom-3 z-40 mx-auto max-w-xl animate-[mega-in_.35s_ease-out_both] rounded-2xl border border-line bg-surface p-4 shadow-[0_30px_80px_-24px_rgba(0,0,0,.55)] sm:bottom-5 sm:left-1/2 sm:right-auto sm:w-[34rem] sm:-translate-x-1/2">
      <button onClick={close} aria-label="Close this note" className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full text-muted transition hover:bg-raised hover:text-ink"><X size={15} /></button>
      <div className="flex items-start gap-3 pr-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-signal font-display text-base font-bold" style={{ color: 'rgb(var(--on-signal))' }}>{(d.owner || 'M').slice(0, 1)}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-signal">Made for {d.who}</p>
          {!/^\s*(hi|hello|hey|dear|good (morning|afternoon|evening))\b/i.test(d.message || '') && <p className="mt-1 font-display text-lg font-semibold leading-snug text-ink">Hi {d.name},</p>}
          {d.message && <p className={/^\s*(hi|hello|hey|dear|good (morning|afternoon|evening))\b/i.test(d.message) ? 'mt-1 text-[0.97rem] leading-relaxed text-ink' : 'mt-1 text-[0.95rem] leading-relaxed text-body'}>{d.message}</p>}
          <a href={d.cta.href} target={/^https?:/.test(d.cta.href) ? '_blank' : undefined} rel="noopener noreferrer" className="btn-primary btn-sm mt-3 inline-flex">{d.cta.label} <ArrowUpRight size={15} /></a>
        </div>
      </div>
    </aside>
  );
}
