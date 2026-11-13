'use client';
import { useEffect, useRef, useState } from 'react';

/* A live demo of the product: keys press, the mic listens, and the sentence types itself, then the next one.
   Sentences come from the admin. Typing goes letter by letter, grouped the way people read (so Bangla joined letters stay whole). */
const graphemes = (s) => { try { return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s), (x) => x.segment); } catch { return Array.from(s); } };

export default function HeroDemo({ phrases = [], keys = ['Ctrl', 'Win'], listening = 'Listening…', chips = [], app = 'Notes' }) {
  const list = phrases.filter(Boolean);
  const [text, setText] = useState(list[0] || '');
  const [phase, setPhase] = useState('hold');
  const box = useRef(null);
  const visible = useRef(true);

  useEffect(() => {
    if (!list.length) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setText(list[0]); setPhase('hold'); return undefined; }
    let dead = false;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; });
    if (box.current) io.observe(box.current);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const ready = async () => { while (!visible.current && !dead) await sleep(250); };
    (async () => {
      let i = 0; setText('');
      while (!dead) {
        const g = graphemes(list[i % list.length]);
        await ready(); setPhase('listen'); await sleep(1100); if (dead) return;
        setPhase('type');
        for (let k = 1; k <= g.length && !dead; k += 1) { await ready(); setText(g.slice(0, k).join('')); await sleep(34 + Math.random() * 46); }
        setPhase('hold'); await sleep(2800); if (dead) return;
        setPhase('erase'); await sleep(350); setText(''); await sleep(500);
        i += 1;
      }
    })();
    return () => { dead = true; io.disconnect(); };
  }, [list.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  const live = phase === 'listen' || phase === 'type';
  return (
    <div ref={box} className="relative mx-auto w-full max-w-3xl px-2 pb-10 pt-6 sm:px-6">
      {chips.slice(0, 3).map((c, i) => (
        <span key={i} className={`lp-glass lp-chip lp-chip-${i} absolute z-10 rounded-full px-4 py-1.5 text-sm font-semibold text-white`} style={{ animationDelay: `${i * -1.6}s` }}>{c}</span>
      ))}
      <div className="lp-demo-win overflow-hidden rounded-[22px] bg-white text-[#1d1d1f] shadow-[0_30px_70px_-30px_rgba(0,0,0,.7)] sm:rounded-[28px]">
        <div className="flex items-center gap-1.5 bg-[#f1f0f8] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#7a76a3]">{app}</span>
        </div>
        <p className="min-h-[9.5rem] px-5 pb-12 pt-5 text-left text-[clamp(1.1rem,2.3vw,1.55rem)] font-semibold leading-snug sm:px-8 sm:pt-7" aria-live="off">
          {text}<span className="lp-caret" aria-hidden="true" />
        </p>
      </div>
      <div className="lp-pop absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-[#0f1a16] px-4 py-2.5 text-white sm:gap-4 sm:px-5 sm:py-3">
        <span className={`lp-rec h-3 w-3 rounded-full bg-[#ff3b4e] ${live ? 'is-on' : ''}`} />
        <span className="flex h-7 items-end gap-[3px]" aria-hidden="true">
          {Array.from({ length: 13 }, (_, i) => <span key={i} className="lp-bar w-[3px] rounded-full bg-[#3fd39b]" data-on={live ? '1' : '0'} style={{ '--d': `${(i * 83) % 700}ms`, '--h': `${10 + ((i * 37) % 17)}px` }} />)}
        </span>
        <span className="min-w-[4.5rem] text-sm font-semibold">{live ? listening : '✓'}</span>
        <span className="hidden items-center gap-1.5 sm:flex">
          {keys.map((k, i) => <kbd key={i} className={`lp-key rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-semibold ${live ? 'is-down' : ''}`}>{k}</kbd>)}
        </span>
      </div>
    </div>
  );
}
