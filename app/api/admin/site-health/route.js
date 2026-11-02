import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { User, LoginLog } from '@/lib/models';
import { adminRoute as guard } from '@/lib/server-auth';
import { serialize } from '@/lib/utils';
const adminRoute = (h) => guard(h, 'system');

const DAY = 24 * 3600 * 1000;

/* Who signed in to the admin, when, from where, and which attempts failed. GET ?days=30&view=all|failed|success */
export const GET = adminRoute(async (req) => {
  if (!hasDB()) return NextResponse.json({ noDB: true });
  await dbConnect();
  const sp = req.nextUrl.searchParams;
  const days = Math.min(Math.max(Number(sp.get('days')) || 30, 1), 180);
  const view = ['failed', 'success'].includes(sp.get('view')) ? sp.get('view') : 'all';
  const since = new Date(Date.now() - days * DAY);
  const [users, rows] = await Promise.all([
    User.find().select('email name role disabled totpEnabled lastLoginAt lastLoginIp lockUntil').sort({ createdAt: 1 }).lean(),
    LoginLog.find({ at: { $gte: since } }).sort({ at: -1 }).limit(5000).lean(),
  ]);

  const signIns = rows.filter((r) => r.event === 'signed_in');
  const failed = rows.filter((r) => r.event === 'failed');
  const perUser = new Map();
  for (const r of rows) {
    const k = r.email; const s = perUser.get(k) || { signIns: 0, failed: 0, lastAt: null, lastIp: '' };
    if (r.event === 'signed_in') { s.signIns++; if (!s.lastAt) { s.lastAt = r.at; s.lastIp = r.ip; } } else if (r.event === 'failed') s.failed++;
    perUser.set(k, s);
  }
  const now = Date.now();
  const adminRows = users.map((u) => {
    const s = perUser.get(u.email) || { signIns: 0, failed: 0 };
    return { email: u.email, name: u.name, role: u.role || 'administrator', disabled: !!u.disabled, totp: !!u.totpEnabled, locked: !!(u.lockUntil && u.lockUntil > now), signIns: s.signIns, failed: s.failed, lastAt: s.lastAt || u.lastLoginAt || null, lastIp: s.lastIp || u.lastLoginIp || '' };
  });
  const failedByIp = new Map();
  for (const r of failed) failedByIp.set(r.ip || '?', (failedByIp.get(r.ip || '?') || 0) + 1);
  const failed24 = failed.filter((r) => now - new Date(r.at) < DAY).length;
  const noApp = adminRows.filter((u) => !u.totp && !u.disabled);
  const checks = [
    { id: '2fa', ok: noApp.length === 0, label: 'Two-step verification on for every active user', detail: noApp.length ? `Not on for: ${noApp.map((u) => u.email).join(', ')}` : 'Everyone uses an authenticator app.' },
    { id: 'jwt', ok: Boolean(process.env.JWT_SECRET), label: 'Session secret is set (JWT_SECRET)', detail: process.env.JWT_SECRET ? 'Set.' : 'Missing: nobody can sign in until you add it.' },
    { id: 'cron', ok: Boolean(process.env.CRON_SECRET), label: 'Daily job secret is set (CRON_SECRET)', detail: process.env.CRON_SECRET ? 'Set.' : 'Missing: the daily subscription check cannot run. Add a long random value in Vercel.' },
    { id: 'failed', ok: failed24 < 10, label: 'Failed sign-ins in the last 24 hours', detail: `${failed24} failed attempt${failed24 === 1 ? '' : 's'}.${failed24 >= 10 ? ' That is a lot: someone may be guessing passwords.' : ''}` },
    { id: 'locked', ok: !adminRows.some((u) => u.locked), label: 'No account is locked right now', detail: adminRows.some((u) => u.locked) ? `Locked: ${adminRows.filter((u) => u.locked).map((u) => u.email).join(', ')}` : 'None.' },
  ];

  const events = rows.filter((r) => view === 'all' || (view === 'failed' ? r.event === 'failed' : r.event === 'signed_in')).slice(0, 150);
  return NextResponse.json(serialize({
    days, checks, users: adminRows,
    totals: { signIns: signIns.length, failed: failed.length, uniqueIps: new Set(rows.map((r) => r.ip).filter(Boolean)).size },
    topFailedIps: [...failedByIp].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([ip, n]) => ({ ip, n })),
    events: events.map((r) => ({ _id: r._id, at: r.at, email: r.email, event: r.event, ok: r.ok, reason: r.reason, ip: r.ip, ua: r.ua })),
  }));
});
