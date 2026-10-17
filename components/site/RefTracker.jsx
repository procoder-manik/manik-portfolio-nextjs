'use client';
import { useEffect } from 'react';

/* Visitors who arrive with ?ref=CODE: remember the code (httpOnly cookie set by the API),
   count the visit once per session, then tidy the address bar. */
export default function RefTracker() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('ref');
    if (!code) return;
    const key = `mh-ref-${code}`;
    let seen = false; try { seen = sessionStorage.getItem(key); sessionStorage.setItem(key, '1'); } catch {}
    if (!seen) fetch('/api/ref', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) }).catch(() => {});
    url.searchParams.delete('ref');
    window.history.replaceState(window.history.state, '', url.pathname + (url.search || '') + url.hash);
  }, []);
  return null;
}
