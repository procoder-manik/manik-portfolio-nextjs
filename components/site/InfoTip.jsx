'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/* Small (i) button with an explanation. Opens on hover, keyboard focus or tap.
   The bubble is placed in a portal with fixed coordinates so no container can clip it. */
export default function InfoTip({ text, className, size = 14, label = 'More information' }) {
  const id = useId(); const btn = useRef(null); const timer = useRef(null);
  const [open, setOpen] = useState(false); const [pos, setPos] = useState(null); const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const place = () => {
    const r = btn.current?.getBoundingClientRect(); if (!r) return;
    const w = Math.min(300, window.innerWidth - 24);
    const left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 12));
    const below = r.top < 140;
    setPos({ left, w, top: below ? r.bottom + 10 : r.top - 10, below, arrow: r.left + r.width / 2 - left });
  };
  const show = () => { clearTimeout(timer.current); place(); setOpen(true); };
  const hide = () => { timer.current = setTimeout(() => setOpen(false), 80); };

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (e.type === 'keydown' ? e.key === 'Escape' : !btn.current?.contains(e.target)) setOpen(false); };
    const move = () => place();
    window.addEventListener('scroll', move, true); window.addEventListener('resize', move);
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', close);
    return () => { window.removeEventListener('scroll', move, true); window.removeEventListener('resize', move); document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, [open]);

  if (!text) return null;
  return (
    <>
      <button ref={btn} type="button" aria-label={label} aria-describedby={open ? id : undefined}
        onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onClick={(e) => { e.preventDefault(); e.stopPropagation(); open ? setOpen(false) : show(); }}
        className={cn('inline-grid shrink-0 place-items-center rounded-full text-muted transition hover:text-signal focus-visible:text-signal', open && 'text-signal', className)}>
        <Info size={size} strokeWidth={2.2} />
      </button>
      {mounted && open && pos && createPortal(
        <div id={id} role="tooltip" onMouseEnter={show} onMouseLeave={hide}
          style={{ left: pos.left, top: pos.top, width: pos.w, transform: pos.below ? 'none' : 'translateY(-100%)' }}
          className="tip-in pointer-events-auto fixed z-[1000] rounded-xl border border-line bg-raised px-3.5 py-2.5 text-left text-[13px] font-normal normal-case leading-relaxed tracking-normal text-body shadow-[0_18px_40px_-16px_rgba(0,0,0,.6)]">
          <span className={cn('absolute h-2.5 w-2.5 rotate-45 border-line bg-raised', pos.below ? '-top-[6px] border-l border-t' : '-bottom-[6px] border-b border-r')} style={{ left: Math.max(10, Math.min(pos.arrow - 5, pos.w - 20)) }} />
          {text}
        </div>, document.body)}
    </>
  );
}
