import 'server-only';
import crypto from 'crypto';
import { dbConnect, hasDB } from './db';
import { Setting } from './models';

/* API keys you paste into Admin > AI writer > Settings.
   They are stored ENCRYPTED (AES-256-GCM, key derived from JWT_SECRET) in the database, are never sent back to the browser
   (only the last 4 characters are shown), and take priority over the same variable in the environment.
   Clearing a key in the admin falls back to the environment value again. */
export const KEY_NAMES = ['GEMINI_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'SEMRUSH_API_KEY'];

const secretKey = () => crypto.createHash('sha256').update(`${process.env.JWT_SECRET || ''}:ai-keys:v1`).digest();
export function encrypt(plain) {
  const iv = crypto.randomBytes(12); const c = crypto.createCipheriv('aes-256-gcm', secretKey(), iv);
  const ct = Buffer.concat([c.update(String(plain), 'utf8'), c.final()]);
  return `v1:${iv.toString('base64')}:${c.getAuthTag().toString('base64')}:${ct.toString('base64')}`;
}
export function decrypt(blob) {
  try {
    const [v, iv, tag, ct] = String(blob).split(':'); if (v !== 'v1') return '';
    const d = crypto.createDecipheriv('aes-256-gcm', secretKey(), Buffer.from(iv, 'base64')); d.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([d.update(Buffer.from(ct, 'base64')), d.final()]).toString('utf8');
  } catch { return ''; }
}

const ORIGINAL = {}; // what the environment held before any admin key was applied
let cache = { at: 0, data: {} };

async function loadStored() {
  if (!hasDB()) return {};
  if (Date.now() - cache.at < 60000) return cache.data;
  try { await dbConnect(); const doc = await Setting.findOne({ key: 'secrets' }).lean(); cache = { at: Date.now(), data: doc?.data || {} }; }
  catch { cache = { at: Date.now() - 50000, data: cache.data }; }
  return cache.data;
}
export const forgetSecretsCache = () => { cache.at = 0; };

/* Puts admin-saved keys into process.env so every AI feature (writer, chat, email replies, AI IQ) sees them. Cheap: cached for a minute. */
export async function applySecrets() {
  for (const n of KEY_NAMES) if (!(n in ORIGINAL)) ORIGINAL[n] = process.env[n];
  const stored = await loadStored();
  for (const n of KEY_NAMES) {
    const v = stored[n] ? decrypt(stored[n]) : '';
    if (v) process.env[n] = v; else if (ORIGINAL[n]) process.env[n] = ORIGINAL[n]; else delete process.env[n];
  }
}

/* For the admin screen: where each key comes from, never the key itself. */
export async function keyStatus() {
  forgetSecretsCache(); const stored = await loadStored(); const out = {};
  for (const n of KEY_NAMES) {
    const v = stored[n] ? decrypt(stored[n]) : '';
    out[n] = v ? { source: 'admin', last4: v.slice(-4) } : stored[n] ? { source: 'broken' } : ORIGINAL[n] ?? process.env[n] ? { source: 'env' } : { source: 'none' };
  }
  return out;
}

export async function saveKey(name, value) {
  if (!KEY_NAMES.includes(name)) throw new Error('Unknown key.');
  if (!hasDB()) throw Object.assign(new Error('Connect MongoDB (set MONGODB_URI) to save keys in the admin. Until then, put the key in your environment.'), { status: 503 });
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set, so keys cannot be encrypted. Set it first.');
  await dbConnect();
  const doc = await Setting.findOne({ key: 'secrets' }).lean(); const data = { ...(doc?.data || {}) };
  const v = String(value || '').trim();
  if (!v) delete data[name]; else { if (v.length < 12 || /\s/.test(v)) throw new Error('That does not look like an API key. Paste the whole key without spaces.'); data[name] = encrypt(v); }
  await Setting.findOneAndUpdate({ key: 'secrets' }, { key: 'secrets', data }, { upsert: true });
  forgetSecretsCache(); await applySecrets();
}
