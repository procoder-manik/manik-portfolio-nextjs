/* Builds Next.js metadata from an item's SEO fields with sensible fallbacks.
   A custom SEO title is used exactly as typed (no "| Site name" added). */
export function seoMeta(item = {}, { title, description, image, path, type } = {}) {
  item = item || {};
  const custom = String(item.seoTitle || '').trim();
  const desc = String(item.seoDescription || '').trim() || description || undefined;
  const img = item.seoImage || image;
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
