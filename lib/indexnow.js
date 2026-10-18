import 'server-only';
import crypto from 'crypto';
import { getSettingsFresh } from './data';
import { siteUrl } from './utils';
import { PUBLIC_PATH, isLive } from './trash';

/* IndexNow tells Bing, Yandex, Seznam and Naver about new or changed pages within minutes.
   The key is your own (SEO settings) or one derived from JWT_SECRET, served at /indexnow-key.txt. */
export async function indexNowKey() {
  const seo = await getSettingsFresh('seo');
  const own = String(seo.indexnow?.key || '').replace(/[^a-zA-Z0-9-]/g, '');
  if (own.length >= 8) return own;
  return crypto.createHash('sha256').update(`${process.env.JWT_SECRET || 'dev'}:indexnow`).digest('hex').slice(0, 32);
}

export async function pingIndexNow(resource, doc) {
  if (!doc?.slug || !PUBLIC_PATH[resource] || !isLive(resource, doc) || doc.seoNoindex || doc.trashedAt) return;
  const seo = await getSettingsFresh('seo');
  if (!seo.indexnow?.enabled) return;
  const base = siteUrl();
  if (/localhost|127\.0\.0\.1/.test(new URL(base).hostname)) return;
  const key = await indexNowKey();
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(base).host, key, keyLocation: `${base}/indexnow-key.txt`, urlList: [`${base}${PUBLIC_PATH[resource](doc.slug)}`] }),
    signal: AbortSignal.timeout(5000),
  }).catch(() => {});
}
