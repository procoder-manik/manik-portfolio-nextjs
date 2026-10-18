'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import PopupView from './PopupView';
import { targeted } from '@/lib/popups';

const LS = 'pp-state'; const SS = 'pp-session';
const read = (store, key) => { try { return JSON.parse(store.getItem(key) || '{}'); } catch { return {}; } };
const write = (store, key, v) => { try { store.setItem(key, JSON.stringify(v)); } catch {} };
const device = () => (window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1100 ? 'tablet' : 'desktop');
const beacon = (id, type) => { try { navigator.sendBeacon?.('/api/popups/event', new Blob([JSON.stringify({ id, type })], { type: 'application/json' })); } catch {} };

/* Decides when each live popup may show: page rules, device, visitor, schedule, triggers and how often.
   One popup at a time; global limits come from Popup settings. */
export default function PopupManager({ popups = [], rules = {} }) {
  const path = usePathname();
  const [active, setActive] = useState(null);
  const shownThisVisit = useRef(0); const lastClose = useRef(0); const activeRef = useRef(null);
  activeRef.current = active;

  useEffect(() => {
    if (!popups.length || rules.enabled === false) return;
    const ls = read(localStorage, LS); const ss = read(sessionStorage, SS);
    const returning = (ls.visits || 0) > 0;
    if (!ss.counted) { ls.visits = (ls.visits || 0) + 1; ss.counted = true; ss.pages = 0; }
    ss.pages = (ss.pages || 0) + 1; write(localStorage, LS, ls); write(sessionStorage, SS, ss);

    const ctx = () => ({ path, device: device(), returning, referrer: document.referrer });
    const eligible = (pp) => {
      if (!targeted(pp, ctx())) return false;
      const st = (ls.popups || {})[pp._id] || {}; const f = pp.frequency || {};
      if (st.converted && f.stopAfterConversion !== false) return false;
      if (f.mode === 'once') return !st.seen;
      if (f.mode === 'session') return !(ss.seen || {})[pp._id];
      if (f.mode === 'always') return true;
      return !st.seen || Date.now() - st.seen > Math.max(0, Number(f.days ?? 7)) * 86400000;
    };
    const show = (pp, force) => {
      if (activeRef.current) return;
      if (!force) {
        if (shownThisVisit.current >= (Number(rules.maxPerVisit) || 2)) return;
        if (Date.now() - lastClose.current < (Number(rules.gapSeconds) || 30) * 1000) return;
        if (!eligible(pp)) return;
      }
      shownThisVisit.current += 1; setActive(pp);
      const l = read(localStorage, LS); l.popups = { ...(l.popups || {}), [pp._id]: { ...((l.popups || {})[pp._id] || {}), seen: Date.now() } }; write(localStorage, LS, l);
      const s = read(sessionStorage, SS); s.seen = { ...(s.seen || {}), [pp._id]: 1 }; write(sessionStorage, SS, s);
      beacon(pp._id, 'view');
    };

    const cleanups = []; const byPriority = [...popups].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const fire = (pp) => show(pp);
    for (const pp of byPriority) {
      const t = pp.trigger || {};
      if (!targeted(pp, ctx())) continue;
      if (t.load?.enabled) { const id = setTimeout(() => fire(pp), Math.max(0, Number(t.load.delay) || 0) * 1000); cleanups.push(() => clearTimeout(id)); }
      if (t.scroll?.enabled) {
        const on = () => { const h = document.documentElement; const pct = (window.scrollY / Math.max(1, h.scrollHeight - window.innerHeight)) * 100; if (pct >= (Number(t.scroll.percent) || 50)) { fire(pp); window.removeEventListener('scroll', on); } };
        window.addEventListener('scroll', on, { passive: true }); cleanups.push(() => window.removeEventListener('scroll', on));
      }
      if (t.exit?.enabled) {
        const out = (e) => { if (e.clientY <= 0 && !e.relatedTarget) fire(pp); };
        document.addEventListener('mouseout', out);
        let lastY = window.scrollY; const up = () => { const y = window.scrollY; if (window.innerWidth < 768 && lastY - y > 140 && y > 400) fire(pp); lastY = y; };
        window.addEventListener('scroll', up, { passive: true });
        cleanups.push(() => { document.removeEventListener('mouseout', out); window.removeEventListener('scroll', up); });
      }
      if (t.idle?.enabled) {
        let id; const reset = () => { clearTimeout(id); id = setTimeout(() => fire(pp), Math.max(5, Number(t.idle.seconds) || 30) * 1000); };
        ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach((ev) => window.addEventListener(ev, reset, { passive: true })); reset();
        cleanups.push(() => { clearTimeout(id); ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach((ev) => window.removeEventListener(ev, reset)); });
      }
      if (t.pageviews?.enabled && ss.pages >= (Number(t.pageviews.count) || 2)) { const id = setTimeout(() => fire(pp), 1500); cleanups.push(() => clearTimeout(id)); }
    }
    // Click triggers and manual links: <a href="#popup-id"> or data-popup="id"
    const click = (e) => {
      const el = e.target.closest?.('a[href^="#popup-"], [data-popup]'); const id = el?.getAttribute('data-popup') || el?.getAttribute('href')?.replace('#popup-', '');
      let pp = id && popups.find((p) => p.slug === id);
      if (!pp) for (const p of popups) { const sel = p.trigger?.click?.enabled && p.trigger.click.selector; try { if (sel && e.target.closest?.(sel)) { pp = p; break; } } catch {} }
      if (pp && targeted(pp, { ...ctx(), now: Date.now() })) { e.preventDefault(); show(pp, true); }
    };
    document.addEventListener('click', click);
    cleanups.push(() => document.removeEventListener('click', click));
    return () => cleanups.forEach((c) => c());
  }, [path, popups, rules.enabled, rules.maxPerVisit, rules.gapSeconds]);

  const close = () => { lastClose.current = Date.now(); setActive(null); };
  const event = (type) => {
    if (!active) return; beacon(active._id, type);
    if (type === 'conversion' || type === 'click') { const l = read(localStorage, LS); l.popups = { ...(l.popups || {}), [active._id]: { ...((l.popups || {})[active._id] || {}), converted: true } }; write(localStorage, LS, l); }
  };
  if (!active) return null;
  return <PopupView popup={active} onClose={close} onEvent={event} />;
}
