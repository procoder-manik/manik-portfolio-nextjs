import 'server-only';

const unesc = (s = '') => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const tag = (x, t) => x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, 'i'))?.[1] || '';

export function parseFeed(xml = '', source = '') {
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (const b of blocks.slice(0, 25)) {
    const title = unesc(tag(b, 'title'));
    let link = unesc(tag(b, 'link')) || b.match(/<link[^>]*href=["']([^"']+)/i)?.[1] || '';
    link = link.trim();
    const date = new Date(unesc(tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date')));
    const snippet = unesc(tag(b, 'description') || tag(b, 'summary') || tag(b, 'content')).slice(0, 220);
    if (title && /^https?:/.test(link)) items.push({ title, link, source, date: isNaN(date) ? null : date.toISOString(), snippet });
  }
  return items;
}

const cache = { at: 0, key: '', items: [] };
/* Headlines from the feeds you choose. Only title, a short snippet and the link are kept, never the full article. */
export async function fetchNews(feeds = []) {
  const key = JSON.stringify(feeds.map((f) => f.url));
  if (cache.key === key && Date.now() - cache.at < 20 * 60 * 1000) return cache.items;
  const results = await Promise.allSettled(feeds.slice(0, 12).map(async (f) => {
    const r = await fetch(f.url, { signal: AbortSignal.timeout(7000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteNewsBot/1.0)', Accept: 'application/rss+xml, application/atom+xml, text/xml, */*' } });
    if (!r.ok) throw new Error(`${r.status}`);
    return parseFeed((await r.text()).slice(0, 800000), f.name || new URL(f.url).hostname);
  }));
  const seen = new Set(); const items = [];
  for (const x of results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))) { const k = x.title.toLowerCase().slice(0, 60); if (seen.has(k)) continue; seen.add(k); items.push(x); }
  items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  const out = items.slice(0, 60);
  Object.assign(cache, { at: Date.now(), key, items: out });
  return out;
}
