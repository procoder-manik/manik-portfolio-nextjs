'use client';
import { useState } from 'react';
import { Link2, Check } from 'lucide-react';
export default function ShareLinks({ url, title }) {
  const [copied, setCopied] = useState(false);
  const e = encodeURIComponent;
  const links = [['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`], ['X', `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(title)}`], ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`]];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map(([n, h]) => <a key={n} href={h} target="_blank" rel="noopener noreferrer" className="chip hover:border-signal hover:text-ink">{n}</a>)}
      <button onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }} className="chip hover:border-signal hover:text-ink">
        {copied ? <Check size={12} /> : <Link2 size={12} />}{copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
