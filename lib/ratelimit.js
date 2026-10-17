import 'server-only';
import { headers } from 'next/headers';
import { dbConnect, hasDB } from './db';
import { RateHit } from './models';

const mem = global._rate || (global._rate = new Map());

export async function clientIp() {
  const h = await headers();
  return (h.get('x-forwarded-for') || h.get('x-real-ip') || 'unknown').split(',')[0].trim();
}

/* Fixed-window limiter. Uses MongoDB (shared across serverless instances) when available,
   memory otherwise. Returns true when the request is allowed. */
export async function rateLimit(key, limit, windowSec) {
  const now = Date.now();
  if (hasDB()) {
    try {
      await dbConnect();
      const bucket = Math.floor(now / (windowSec * 1000));
      const id = `${key}:${bucket}`;
      const r = await RateHit.findOneAndUpdate({ key: id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now + windowSec * 1000) } }, { upsert: true, new: true });
      return r.count <= limit;
    } catch { /* fall through to memory */ }
  }
  const e = mem.get(key);
  if (!e || e.reset < now) { mem.set(key, { count: 1, reset: now + windowSec * 1000 }); return true; }
  e.count += 1;
  return e.count <= limit;
}
