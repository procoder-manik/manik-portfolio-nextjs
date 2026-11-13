'use client';
import { useState } from 'react';

/* Questions that open smoothly. The answers stay in the page (just folded), so search engines and screen readers still read them. */
export default function LandingFaq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-3">
      {items.map((f, i) => {
        const on = open === i;
        return (
          <div key={i} className={`rounded-[22px] transition-colors duration-500 ${on ? 'bg-raised' : 'bg-raised/70 hover:bg-raised'}`}>
            <h3>
              <button type="button" aria-expanded={on} aria-controls={`lpf-${i}`} onClick={() => setOpen(on ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[1.05rem] font-semibold text-ink sm:text-lg">
                {f.q}
                <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-base text-xl leading-none transition duration-500 ${on ? 'rotate-45 text-signal' : 'text-muted'}`}>+</span>
              </button>
            </h3>
            <div id={`lpf-${i}`} role="region" className="grid transition-[grid-template-rows] duration-500 ease-out" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
              <div className="overflow-hidden"><p className={`px-6 pb-5 leading-relaxed text-muted transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`}>{f.a}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
