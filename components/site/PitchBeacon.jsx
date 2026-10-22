'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/* Reads ?p=<code> from a pitch link. The code is kept for 30 days on this device, so later pages (and the contact form)
   are linked to the same prospect. Each page is reported once per visit. */
export default function PitchBeacon() {
  const path = usePathname();
  useEffect(() => {
    try {
      const url = new URL(window.location.href); const fromUrl = (url.searchParams.get('p') || '').toLowerCase();
      let code = /^[a-z0-9-]{4,40}$/.test(fromUrl) ? fromUrl : '';
      if (code) localStorage.setItem('pitch', JSON.stringify({ code, at: Date.now() }));
      else { const j = JSON.parse(localStorage.getItem('pitch') || 'null'); if (j?.code && Date.now() - j.at < 30 * 864e5) code = j.code; }
      if (!code) return;
      const key = `pitch:${code}:${path}`;
      if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1');
      const body = JSON.stringify({ code, path, from: document.referrer || '' });
      if (navigator.sendBeacon) navigator.sendBeacon('/api/pitch/view', new Blob([body], { type: 'application/json' }));
      else fetch('/api/pitch/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
    } catch {}
  }, [path]);
  return null;
}
