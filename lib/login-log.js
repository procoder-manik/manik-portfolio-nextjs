import 'server-only';
import { headers } from 'next/headers';
import { dbConnect, hasDB } from './db';
import { LoginLog } from './models';

/* One row per sign-in attempt or security change, shown in Admin > Site health. Never throws: a logging problem must not block a sign-in.
   event: signed_in | failed | security. reason says why (wrong_password, wrong_code, locked, blocked, unknown_account, rate_limited, 2fa_enabled...). */
export async function logLogin({ email, userId, ok, event, reason, ip }) {
  try {
    if (!hasDB()) return;
    await dbConnect();
    const ua = ((await headers()).get('user-agent') || '').slice(0, 300);
    await LoginLog.create({ email: String(email || '').slice(0, 160), userId, ok: !!ok, event, reason, ip: String(ip || '').slice(0, 64), ua });
  } catch (e) { console.error('[login log]', e.message); }
}
