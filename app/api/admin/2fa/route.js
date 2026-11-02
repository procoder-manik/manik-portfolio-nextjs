import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { dbConnect, hasDB } from '@/lib/db';
import { User } from '@/lib/models';
import { adminRoute, sessionResponse } from '@/lib/server-auth';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { encrypt, decrypt } from '@/lib/secrets';
import { newTotpSecret, otpauthUri, verifyTotp, newBackupCodes, hashBackup } from '@/lib/totp';
import { checkSecondFactor } from '@/lib/two-factor';
import { logLogin } from '@/lib/login-log';
import { getSettingsFresh } from '@/lib/data';

const fail = (message, status = 400) => Object.assign(new Error(message), { status });

/* Your own two-step verification. GET: status. POST { action: start | enable | disable | backup, password, code }.
   Every change asks for your current password first, so a stolen session cannot lock you out of your own account. */
export const GET = adminRoute(async (req, ctx, admin) => {
  if (!hasDB()) return NextResponse.json({ noDB: true });
  await dbConnect();
  const u = await User.findOne({ email: admin.email }).select('+backupCodes totpEnabled');
  return NextResponse.json({ enabled: !!u?.totpEnabled, backupLeft: u?.backupCodes?.length || 0 });
});

export const POST = adminRoute(async (req, ctx, admin) => {
  if (!hasDB()) throw fail('Two-step verification needs the database (MONGODB_URI).', 503);
  const b = await req.json().catch(() => ({}));
  if (!(await rateLimit(`2fa-setup:${admin.email}`, 10, 900)) || !(await rateLimit(`2fa-setup-ip:${await clientIp()}`, 20, 900))) throw fail('Too many tries. Wait 15 minutes and try again.', 429);
  await dbConnect();
  const u = await User.findOne({ email: admin.email }).select('+totpPending passwordHash tokenVersion totpEnabled email name');
  if (!u) throw fail('Account not found. Sign out and sign in again.');
  if (!(await bcrypt.compare(String(b.password || ''), u.passwordHash || ''))) throw fail('Your current password is not right.');
  const ip = await clientIp();

  if (b.action === 'start') {
    if (u.totpEnabled) throw fail('Two-step verification is already on. Turn it off first to set it up again.');
    const secret = newTotpSecret();
    u.totpPending = encrypt(secret); await u.save();
    const issuer = String((await getSettingsFresh('site').catch(() => ({}))).name || 'Admin').slice(0, 40);
    const uri = otpauthUri({ secret, email: u.email, issuer });
    return NextResponse.json({ secret, uri, qr: await QRCode.toDataURL(uri, { margin: 1, width: 224 }) });
  }

  if (b.action === 'enable') {
    const secret = u.totpPending ? decrypt(u.totpPending) : '';
    if (!secret) throw fail('Start the setup again to get a new QR code.');
    const step = verifyTotp(secret, b.code);
    if (!step) throw fail('That code is not right. Check the app, then try the new code.');
    const codes = newBackupCodes();
    u.set({ totpSecret: encrypt(secret), totpEnabled: true, totpLastStep: step, backupCodes: codes.map(hashBackup), tokenVersion: (u.tokenVersion || 0) + 1 });
    u.totpPending = undefined; await u.save(); // other devices are signed out; this one stays
    await logLogin({ email: u.email, userId: u._id, ok: true, event: 'security', reason: '2fa_enabled', ip });
    return sessionResponse(u, { codes });
  }

  if (b.action === 'disable' || b.action === 'backup') {
    if (!u.totpEnabled) throw fail('Two-step verification is not on.');
    if (!(await checkSecondFactor(u._id, b.code)).ok) throw fail('That code is not right. Use the app code or an unused backup code.');
    if (b.action === 'backup') {
      const codes = newBackupCodes();
      await User.updateOne({ _id: u._id }, { $set: { backupCodes: codes.map(hashBackup) } });
      await logLogin({ email: u.email, userId: u._id, ok: true, event: 'security', reason: 'backup_codes_renewed', ip });
      return NextResponse.json({ ok: true, codes });
    }
    await User.updateOne({ _id: u._id }, { $set: { totpEnabled: false, tokenVersion: (u.tokenVersion || 0) + 1 }, $unset: { totpSecret: 1, totpPending: 1, backupCodes: 1, totpLastStep: 1 } });
    await logLogin({ email: u.email, userId: u._id, ok: true, event: 'security', reason: '2fa_disabled', ip });
    return sessionResponse({ ...u.toObject(), tokenVersion: (u.tokenVersion || 0) + 1 });
  }
  throw fail('Unknown action.');
});
