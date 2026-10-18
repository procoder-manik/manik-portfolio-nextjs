import 'server-only';
import { dbConnect, hasDB } from './db';
import { NotFoundHit } from './models';
import { getSettings } from './data';

const ASSET = /\.(png|jpe?g|gif|svg|webp|avif|ico|css|js|map|woff2?|ttf|txt|xml|json|pdf|mp4|webm)$/i;
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview/i;

/* Remembers a missing address so you can redirect it (Marketing > 404 log). Ignores assets, bots and probes. */
export async function logNotFound(path, referrer = '', ua = '') {
  try {
    if (!hasDB() || !path || path.length > 300 || ASSET.test(path) || BOT.test(ua) || /^\/(wp-|\.env|xmlrpc|phpmyadmin|cgi-bin|\.git)/i.test(path)) return;
    const seo = await getSettings('seo');
    if (seo.redirects?.monitor404 === false) return;
    await dbConnect();
    await NotFoundHit.updateOne({ path }, { $inc: { hits: 1 }, $set: { lastAt: new Date(), referrer: referrer.slice(0, 300), ua: ua.slice(0, 200) } }, { upsert: true });
  } catch {}
}
