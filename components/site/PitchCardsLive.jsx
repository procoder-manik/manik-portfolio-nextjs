'use client';
import { useEffect, useState } from 'react';
import CardLayout from './cards/CardLayout';
import PitchSiteCard from './PitchSiteCard';

/* The Pitch websites cards. The page arrives with the list it was built with, then asks for the current list,
   so a website you add or switch on shows up at once, even while the page itself is still a saved copy. */
export default function PitchCardsLive({ initial = [], all = false, limit = 6, layout, columns, autoplay, interval }) {
  const [sites, setSites] = useState(initial);
  useEffect(() => {
    let on = true;
    fetch(`/api/pitch-sites/cards?limit=${encodeURIComponent(limit)}${all ? '&all=1' : ''}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (on && Array.isArray(j?.sites)) setSites(j.sites); })
      .catch(() => {});
    return () => { on = false; };
  }, [all, limit]);
  if (!sites.length) return null;
  return (
    <CardLayout layout={layout} columns={columns || 3} autoplay={autoplay} interval={interval} label="Websites">
      {sites.map((s) => <PitchSiteCard key={s.slug} site={s} />)}
    </CardLayout>
  );
}
