/* Builds Next.js metadata from an item's SEO fields with sensible fallbacks.
   A custom SEO title is used exactly as typed (no "| Site name" added). */
export function seoMeta(item = {}, { title, description, image, path, type } = {}) {
  const custom = String(item.seoTitle || '').trim();
  const desc = String(item.seoDescription || '').trim() || description || undefined;
  const img = item.seoImage || image;
  const m = {
    title: custom ? { absolute: custom } : title,
    description: desc,
    alternates: path ? { canonical: path } : undefined,
    openGraph: { ...(type ? { type } : {}), ...(custom || title ? { title: custom || title } : {}), ...(desc ? { description: desc } : {}), ...(img ? { images: [img] } : {}) },
    twitter: { card: 'summary_large_image', ...(desc ? { description: desc } : {}), ...(img ? { images: [img] } : {}) },
  };
  if (item.seoNoindex) m.robots = { index: false, follow: true };
  return m;
}

/* Fixed pages (portfolio, blog, pricing...) read their SEO from Settings > SEO and integrations > Page SEO. */
export function pageMeta(integrations, key, fallback) {
  return seoMeta(integrations?.pages?.[key] || {}, fallback);
}
