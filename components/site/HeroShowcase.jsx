'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ScrollShot from './ScrollShot';

/* The hero's one orchestrated motion: a stack of real client sites, the front one
   scrolling top to bottom, rotating to the next every few seconds. */
export default function HeroShowcase({ projects = [] }) {
  const list = projects.filter((p) => p.scrollImage).slice(0, 5);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (list.length < 2 || paused || reduce) return;
    const t = setTimeout(() => setI((x) => (x + 1) % list.length), 7000);
    return () => clearTimeout(t);
  }, [i, paused, list.length, reduce]);

  if (!list.length) return null;
  const order = [0, 1, 2].map((k) => list[(i + k) % list.length]).filter((v, k, a) => a.indexOf(v) === k);
  const front = order[0];

  return (
    <div className="relative mx-auto w-full max-w-[560px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative aspect-[5/5.1]">
        <AnimatePresence initial={false}>
          {order.slice().reverse().map((p) => {
            const depth = order.indexOf(p);
            return (
              <motion.div key={p.slug} className="absolute inset-x-0 bottom-0"
                initial={{ opacity: 0, y: 40, scale: .9 }}
                animate={{ opacity: depth === 0 ? 1 : depth === 1 ? .55 : .25, y: depth * -34, scale: 1 - depth * 0.06, rotate: depth === 0 ? 0 : depth * -1.2 }}
                exit={{ opacity: 0, y: 60, scale: 1.02 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{ zIndex: 10 - depth, transformOrigin: '50% 0%' }}>
                <ScrollShot key={`${p.slug}-${depth}`} src={p.scrollImage} alt={p.imageAlt || `${p.title} website`} url={p.liveUrl} accent={p.accent}
                  auto={depth === 0 && !reduce} speed={120} aspect="aspect-[16/12]" eager={depth === 0}
                  className="shadow-[0_50px_100px_-40px_rgba(0,0,0,.7)]" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4 text-sm">
        <Link href={`/portfolio/${front.slug}`} className="group min-w-0 text-muted">
          <span className="text-ink transition group-hover:text-signal">{front.title}</span>
          <span className="mx-2 text-line">/</span>{front.platformType === 'custom' ? 'Custom code' : front.cms}
        </Link>
        <div className="flex gap-1.5" role="tablist" aria-label="Showcased projects">
          {list.map((p, k) => (
            <button key={p.slug} role="tab" aria-selected={k === i} aria-label={p.title} onClick={() => setI(k)}
              className={`h-1.5 rounded-full transition-all duration-500 ${k === i ? 'w-6 bg-signal' : 'w-1.5 bg-line hover:bg-muted'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
