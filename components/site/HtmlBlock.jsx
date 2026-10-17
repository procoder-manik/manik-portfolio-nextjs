'use client';
import { useEffect, useRef } from 'react';
/* Renders admin HTML inside its own box and lets embedded scripts run. */
export default function HtmlBlock({ code }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.innerHTML = '';
    el.appendChild(document.createRange().createContextualFragment(code || ''));
  }, [code]);
  return <div ref={ref} />;
}
