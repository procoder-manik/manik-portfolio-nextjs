/* Builds the address of the automatic cover image (app/og/route.js): a branded image generated from the
   title alone, with no AI call, used only when the item has no cover/banner/social image of its own.
   base: the site address, needed because Open Graph tags must be absolute URLs. */
export function ogFallback(base, kind, title, { eyebrow, sub, accent } = {}) {
  if (!base || !title) return undefined;
  const p = new URLSearchParams({ k: kind, t: String(title).slice(0, 160) });
  if (eyebrow) p.set('e', eyebrow); if (sub) p.set('s', String(sub).slice(0, 100)); if (/^#?[0-9a-fA-F]{6}$/.test(accent || '')) p.set('a', accent.replace('#', ''));
  try { return new URL(`/og?${p.toString()}`, base).toString(); } catch { return undefined; }
}

/* Builds Next.js metadata from an item's SEO fields with sensible fallbacks.
   A custom SEO title is used exactly as typed (no "| Site name" added). An automatic cover
   (ogKind + a base URL) fills in only when the item has no image of its own and no explicit image was passed. */
export function seoMeta(item = {}, { title, description, image, path, type, ogKind, ogSub, ogAccent } = {}) {
  item = item || {};
  const custom = String(item.seoTitle || '').trim();
  const desc = String(item.seoDescription || '').trim() || description || undefined;
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  const img = item.seoImage || image || (ogKind ? ogFallback(base, ogKind, custom || (typeof title === 'string' ? title : title?.absolute) || item.title || item.name, { sub: ogSub, accent: ogAccent || item.accent }) : undefined);
  const ogTitle = String(item.ogTitle || '').trim() || custom || title;
  const ogDesc = String(item.ogDescription || '').trim() || desc;
  const canonical = String(item.canonical || '').trim() || path;
  const r = item.robots || {};
  const m = {
    title: custom ? { absolute: custom } : title,
    description: desc,
    keywords: [item.focusKeyword, ...(item.keywords || [])].filter(Boolean).join(', ') || undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: { ...(type ? { type } : {}), ...(ogTitle ? { title: ogTitle } : {}), ...(ogDesc ? { description: ogDesc } : {}), ...(img ? { images: [img] } : {}), ...(path ? { url: path } : {}) },
    twitter: { card: item.twitterCard || 'summary_large_image', ...(ogTitle ? { title: ogTitle } : {}), ...(ogDesc ? { description: ogDesc } : {}), ...(img ? { images: [img] } : {}) },
  };
  if (item.seoNoindex || r.nofollow || r.noarchive || r.nosnippet || r.noimageindex) {
    const flags = { index: !item.seoNoindex, follow: !r.nofollow, ...(r.noarchive ? { noarchive: true } : {}), ...(r.nosnippet ? { nosnippet: true } : {}), ...(r.noimageindex ? { noimageindex: true } : {}) };
    m.robots = { ...flags, googleBot: { ...flags, ...(r.nosnippet ? {} : { 'max-image-preview': 'large', 'max-snippet': -1 }) } };
  }
  return m;
}

/* Kept for older code: built-in pages now read their own SEO with getPageSeo(key). */
export function pageMeta(integrations, key, fallback) {
  return seoMeta(integrations?.pages?.[key] || {}, fallback);
}
