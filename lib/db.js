import dns from 'node:dns';
import mongoose from 'mongoose';

/* mongodb+srv:// needs a DNS "SRV" lookup. Many ISP and router DNS servers (common in Bangladesh) refuse it,
   which shows up as "querySrv ECONNREFUSED". Two automatic fixes, in this order:
   1. Ask public DNS (Google, Cloudflare) for the lookup. Set MONGODB_DNS="off" to skip, or a list like "8.8.8.8,1.1.1.1".
   2. If that is blocked too (some networks block every DNS server except their own), ask over HTTPS instead
      (DNS over HTTPS, port 443, which is never blocked if websites open) and connect with the standard address.
   Nothing to configure. */
const dnsSetting = (process.env.MONGODB_DNS || '').trim();
if ((process.env.MONGODB_URI || '').startsWith('mongodb+srv://') && dnsSetting !== 'off') {
  const list = dnsSetting ? dnsSetting.split(',').map((s) => s.trim()).filter(Boolean) : ['8.8.8.8', '1.1.1.1'];
  try { dns.setServers(list); } catch {}
  try { dns.promises.setServers(list); } catch {}
}

const cached = global._mongoose || (global._mongoose = { conn: null, promise: null, direct: null });

export const hasDB = () => Boolean(process.env.MONGODB_URI);

const DNS_FAIL = /querySrv|querytxt|ECONNREFUSED|ENOTFOUND|ETIMEOUT|ETIMEDOUT|EAI_AGAIN|ESERVFAIL|ECONNRESET/i;

async function doh(name, type) {
  const urls = [`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`];
  for (const u of urls) {
    try {
      const r = await fetch(u, { headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(7000), cache: 'no-store' });
      const j = await r.json();
      const rows = (j.Answer || []).filter((a) => a.data);
      if (rows.length) return rows.map((a) => String(a.data));
    } catch { /* try the next resolver */ }
  }
  return [];
}

/* mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/db?x=y  ->  mongodb://user:pass@shard1:27017,shard2:27017,shard3:27017/db?authSource=admin&replicaSet=...&tls=true&x=y */
export async function srvToStandard(uri) {
  const m = String(uri).match(/^mongodb\+srv:\/\/(?:([^@]*)@)?([^/?]+)(\/[^?]*)?(?:\?(.*))?$/);
  if (!m) throw new Error('MONGODB_URI is not a valid mongodb+srv:// address.');
  const [, auth, host, path, query] = m;
  const [srv, txt] = await Promise.all([doh(`_mongodb._tcp.${host}`, 'SRV'), doh(host, 'TXT')]);
  const hosts = srv.map((d) => { const p = d.trim().split(/\s+/); return p.length >= 4 ? `${p[3].replace(/\.$/, '')}:${p[2]}` : ''; }).filter(Boolean);
  if (!hosts.length) throw new Error('Could not find the database servers over HTTPS either. Check the internet connection, or paste the standard (non-SRV) connection string from Atlas > Connect > Drivers > "I need the older connection string".');
  const params = new URLSearchParams(txt.map((t) => t.replace(/"\s*"/g, '').replace(/^"|"$/g, '')).join('&'));
  new URLSearchParams(query || '').forEach((v, k) => params.set(k, v));
  if (!params.has('tls') && !params.has('ssl')) params.set('tls', 'true');
  return `mongodb://${auth ? `${auth}@` : ''}${hosts.join(',')}${path || '/'}?${params.toString()}`;
}

const opts = { bufferCommands: false, serverSelectionTimeoutMS: 12000 };

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (cached.direct) return mongoose.connect(cached.direct, opts);
  try { return await mongoose.connect(uri, opts); }
  catch (e) {
    if (!uri.startsWith('mongodb+srv://') || !DNS_FAIL.test(String(e?.message))) throw e;
    console.warn('[db] DNS blocked the SRV lookup, trying DNS over HTTPS...');
    cached.direct = await srvToStandard(uri);
    const c = await mongoose.connect(cached.direct, opts);
    console.warn('[db] Connected using the standard address (DNS over HTTPS).');
    return c;
  }
}

export async function dbConnect() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = connect().catch((e) => { cached.promise = null; throw e; });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
