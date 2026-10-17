'use client';
import { useEffect } from 'react';

/* Inserts admin-provided HTML (scripts included) into <head>, the top or the bottom of <body>.
   createContextualFragment makes <script> tags execute, unlike innerHTML. */
export default function CodeInjector({ html, where = 'bodyEnd' }) {
  useEffect(() => {
    if (!html?.trim()) return;
    const target = where === 'head' ? document.head : document.body;
    const frag = document.createRange().createContextualFragment(html);
    const nodes = [...frag.childNodes];
    if (where === 'bodyStart') target.prepend(frag); else target.append(frag);
    return () => nodes.forEach((n) => n.parentNode && n.parentNode.removeChild(n));
  }, [html, where]);
  return null;
}
