import 'server-only';
import { User } from './models';
import { decrypt } from './secrets';
import { verifyTotp, takeBackupCode, hashBackup } from './totp';

/* Checks the second step for a user: a code from the authenticator app, or one unused backup code.
   Loads the secret fields itself (they are hidden from normal queries). Returns { ok, via } and saves what it used up,
   so the same app code or backup code never works twice, even when two requests arrive together. */
export async function checkSecondFactor(userId, code) {
  const u = await User.findById(userId).select('+totpSecret +backupCodes totpEnabled totpLastStep');
  if (!u?.totpEnabled || !u.totpSecret) return { ok: false };
  const secret = decrypt(u.totpSecret);
  if (secret) {
    const step = verifyTotp(secret, code, { lastStep: u.totpLastStep || 0 });
    if (step) {
      const r = await User.updateOne({ _id: u._id, $or: [{ totpLastStep: { $lt: step } }, { totpLastStep: null }, { totpLastStep: { $exists: false } }] }, { $set: { totpLastStep: step } });
      return r.modifiedCount ? { ok: true, via: 'app' } : { ok: false };
    }
  }
  const left = takeBackupCode(u.backupCodes || [], code);
  if (left) {
    const used = hashBackup(code);
    const r = await User.updateOne({ _id: u._id, backupCodes: used }, { $pull: { backupCodes: used } });
    return r.modifiedCount ? { ok: true, via: 'backup', remaining: left.length } : { ok: false };
  }
  return { ok: false };
}
