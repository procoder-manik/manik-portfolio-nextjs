import dns from 'node:dns';
import mongoose from 'mongoose';

/* mongodb+srv:// needs a DNS "SRV" lookup. Many ISP and router DNS servers (common in Bangladesh)
   refuse it, which shows up as "querySrv ECONNREFUSED". Asking public DNS for these lookups fixes it.
   This only affects dns.resolve* (used for SRV), not normal website requests.
   Set MONGODB_DNS="off" to skip it, or a comma list like "8.8.8.8,1.1.1.1" to choose servers. */
const dnsSetting = (process.env.MONGODB_DNS || '').trim();
if ((process.env.MONGODB_URI || '').startsWith('mongodb+srv://') && dnsSetting !== 'off') {
  try { dns.setServers(dnsSetting ? dnsSetting.split(',').map((s) => s.trim()).filter(Boolean) : ['8.8.8.8', '1.1.1.1']); } catch {}
}

const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

export const hasDB = () => Boolean(process.env.MONGODB_URI);

export async function dbConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 10000 }).catch((e) => {
      cached.promise = null;
      throw e;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
