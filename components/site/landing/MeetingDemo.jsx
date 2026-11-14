'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/* An animated sample of AI meeting notes: a recording timer runs, then the title, summary, decisions and tasks appear one by one.
   Each line is "Label: text". The first words before the colon become the coloured tag. Everything comes from the admin. */
const TONE = ['bg-[#3fd39b]/20 text-[#5eead4]', 'bg-[#a78bfa]/25 text-[#c4b5fd]', 'bg-[#fb7185]/25 text-[#fda4af]', 'bg-[#fbbf24]/25 text-[#fcd34d]'];

export default function MeetingDemo({ title = 'Meeting', items = [], live = 'Recording', done = 'Notes ready' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduce = useReducedMotion();
  const [sec, setSec] = useState(reduce ? 754 : 0);
  const [ready, setReady] = useState(!!reduce);
  useEffect(() => {
    if (!inView || reduce) return undefined;
    let n = 0; const t = setInterval(() => { n += 1; setSec(n * 57); if (n >= 13) { clearInterval(t); setReady(true); } }, 90);
    return () => clearInterval(t);
  }, [inView, reduce]);
  const mm = String(Math.floor(sec / 60)).padStart(2, '0'); const ss = String(sec % 60).padStart(2, '0');
  const tags = []; const rows = items.map((x) => { const i = x.indexOf(':'); const tag = i > 0 && i < 24 ? x.slice(0, i).trim() : ''; if (tag && !tags.includes(tag)) tags.push(tag); return { tag, text: i > 0 && i < 24 ? x.slice(i + 1).trim() : x }; });
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-lg">
      <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[40px] opacity-70 blur-3xl" style={{ background: 'radial-gradient(60% 60% at 30% 20%, rgb(var(--lp-a) / .35), transparent), radial-gradient(60% 60% at 80% 80%, rgb(var(--lp-c) / .45), transparent)' }} />
      <div className="overflow-hidden rounded-[26px] border border-white/15 bg-[#0d1117]/90 text-white shadow-[0_40px_80px_-30px_rgba(0,0,0,.85)] backdrop-blur">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className={`h-2.5 w-2.5 rounded-full ${ready ? 'bg-[#3fd39b]' : 'bg-[#ff3b4e] lp-rec is-on'}`} />
            <span className="text-sm font-semibold">{ready ? done : live}</span>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-sm tabular-nums">{mm}:{ss}</span>
        </div>
        <div className="space-y-4 px-5 pb-6 pt-5">
          <motion.h3 initial={reduce ? false : { opacity: 0, y: 10 }} animate={ready || reduce ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-xl font-semibold tracking-[-0.02em] text-white">{title}</motion.h3>
          {rows.map((r, i) => (
            <motion.div key={i} initial={reduce ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }} animate={ready || reduce ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}} transition={{ duration: 0.7, delay: reduce ? 0 : 0.25 + i * 0.35, ease: [0.16, 1, 0.3, 1] }} className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-3.5">
              {r.tag && <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[tags.indexOf(r.tag) % TONE.length]}`}>{r.tag}</span>}
              <p className="text-[0.95rem] leading-relaxed text-white/85">{r.text}</p>
            </motion.div>
          ))}
          {!ready && <div className="flex items-end gap-[3px] pt-1" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <span key={i} className="lp-bar w-[3px] rounded-full bg-[#3fd39b]" data-on="1" style={{ '--d': `${(i * 61) % 700}ms`, '--h': `${8 + ((i * 29) % 19)}px` }} />)}</div>}
        </div>
      </div>
    </div>
  );
}
