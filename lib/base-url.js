import 'server-only';
import { headers } from 'next/headers';
import { siteUrl } from './utils';

const isLocalHost = (h = '') => /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(h);
const bare = (h = '') => h.replace(/^www\./i, '').toLowerCase();

/* The address of the site that is running right now.
   - On localhost it returns http://localhost:3000 (or whatever port you use).
   - On Vercel or your domain it returns that live address, with no setting needed.
   Outside a request (a scheduled job, for example) it falls back to siteUrl(). */
export async function getBaseUrl() {
  try {
    const h = await headers();
    const host = (h.get('x-forwarded-host') || h.get('host') || '').split(',')[0].trim();
    if (!host) return siteUrl();
    const local = isLocalHost(host);
    let envHost = '';
    try { envHost = new URL(process.env.NEXT_PUBLIC_SITE_URL || '').host; } catch {}
    // Vercel sets the host itself, so it can be trusted. Elsewhere only accept localhost or the configured domain.
    const trusted = local || Boolean(process.env.VERCEL) || (envHost && bare(envHost) === bare(host));
    if (!trusted) return siteUrl();
    const proto = (h.get('x-forwarded-proto') || (local ? 'http' : 'https')).split(',')[0].trim();
    return `${proto}://${host}`;
  } catch {
    return siteUrl();
  }
}
