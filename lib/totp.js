import crypto from 'crypto';

/* Two-step verification with an authenticator app (RFC 6238: SHA-1, 6 digits, 30 seconds).
   Works with Google Authenticator, Microsoft Authenticator, Authy and 1Password. Pure functions, no database. */

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf) {
  let bits = 0; let value = 0; let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(str) {
  let bits = 0; let value = 0; const out = [];
  for (const ch of String(str).toUpperCase().replace(/=+$/, '')) {
    const i = B32.indexOf(ch); if (i < 0) continue;
    value = (value << 5) | i; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

export const newTotpSecret = () => base32Encode(crypto.randomBytes(20));
export const stepNow = (now = Date.now()) => Math.floor(now / 30000);

export function totpAt(secret, step, digits = 6) {
  const msg = Buffer.alloc(8); msg.writeBigUInt64BE(BigInt(step));
  const h = crypto.createHmac('sha1', base32Decode(secret)).update(msg).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 10 ** digits).padStart(digits, '0');
}

/* Returns the 30-second step the code belongs to, or null. A code is accepted one step early or late (clock drift),
   and never twice: lastStep is the newest step already used, so a code seen once cannot be replayed. */
export function verifyTotp(secret, code, { now = Date.now(), lastStep = 0, window = 1 } = {}) {
  const c = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(c)) return null;
  const cur = stepNow(now); let hit = null;
  for (let s = cur - window; s <= cur + window; s++) {
    const same = crypto.timingSafeEqual(Buffer.from(totpAt(secret, s)), Buffer.from(c));
    if (same && s > lastStep) hit = s;
  }
  return hit;
}

export const otpauthUri = ({ secret, email, issuer }) =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

/* One-time codes for when the phone is lost. Shown once; only their hashes are stored. */
const ALPHA = 'abcdefghjkmnpqrstuvwxyz23456789';
export function newBackupCodes(n = 8) {
  return Array.from({ length: n }, () => {
    let s = ''; for (const b of crypto.randomBytes(10)) s += ALPHA[b % ALPHA.length];
    return `${s.slice(0, 5)}-${s.slice(5)}`;
  });
}
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
export const hashBackup = (s) => crypto.createHash('sha256').update(norm(s)).digest('hex');

/* The list without the used code, or null when the code is not in the list. */
export function takeBackupCode(hashes = [], input) {
  if (norm(input).length !== 10) return null;
  const h = hashBackup(input); const i = hashes.indexOf(h);
  return i < 0 ? null : hashes.filter((_, k) => k !== i);
}
