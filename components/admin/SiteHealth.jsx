'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '@/components/admin/api';
import { Notice } from '@/components/admin/Editor';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';
import { deviceOf } from '@/lib/device';
import { ROLES } from '@/lib/roles';

const when = (d) => (d ? new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Never');
const REASON = {
  password: 'Password', 'password+app': 'Password + app code', 'password+backup_code': 'Password + backup code', first_setup: 'First setup',
  wrong_password: 'Wrong password', wrong_code: 'Wrong code', locked: 'Account locked', blocked: 'Blocked account', unknown_account: 'No such account', rate_limited: 'Too many tries',
  '2fa_enabled': 'Two-step verification turned on', '2fa_disabled': 'Two-step verification turned off', backup_codes_renewed: 'New backup codes',
};
const reasonText = (r = '') => REASON[r] || (r.startsWith('2fa_reset_by_') ? `Two-step verification reset by ${r.slice(13)}` : r);

export default function SiteHealth() {
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  const [days, setDays] = useState('30'); const [view, setView] = useState('all');
  useEffect(() => { api(`/api/admin/site-health?days=${days}&view=${view}`).then(setD).catch((e) => setErr(e.message)); }, [days, view]);
  if (err) return <Notice>{err}</Notice>;
  if (!d) return <div className="grid place-items-center p-20"><Loader2 className="animate-spin text-muted" /></div>;
  if (d.noDB) return <Notice>Sign-in activity needs the database. Add MONGODB_URI to your environment first.</Notice>;
  const stat = (label, n, bad) => <div className="rounded-2xl border border-line bg-surface p-5"><p className={`font-display text-3xl font-bold ${bad ? 'text-bad' : 'text-ink'}`}>{n}</p><p className="text-sm text-muted">{label}</p></div>;
  const withApp = d.users.filter((u) => u.totp).length;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="flex items-center gap-2 text-2xl font-semibold"><ShieldCheck size={22} className="text-signal" />Site health<InfoTip size={16} text={SECTION_INFO['site-health']} /></h1><p className="mt-1 text-muted">Who signed in to the admin, when, and from where. Kept for 180 days.</p></div>
        <select aria-label="Period" value={days} onChange={(e) => { setD(null); setDays(e.target.value); }} className="field w-auto"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="180">Last 180 days</option></select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat('Sign-ins', d.totals.signIns)}
        {stat('Failed attempts', d.totals.failed, d.totals.failed >= 20)}
        {stat('Different networks (IP)', d.totals.uniqueIps)}
        {stat('Users with two-step', `${withApp} of ${d.users.length}`, withApp < d.users.length)}
      </div>

      <section className="mt-8 rounded-2xl border border-line bg-surface">
        <h2 className="border-b border-line px-5 py-3 font-semibold text-ink">Security checklist</h2>
        <ul className="divide-y divide-line">
          {d.checks.map((c) => (
            <li key={c.id} className="flex items-start gap-3 px-5 py-3">
              {c.ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-good" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber" />}
              <div><p className="text-sm font-medium text-ink">{c.label}</p><p className="text-sm text-muted">{c.detail}</p></div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-semibold text-ink">By person</h2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs text-muted"><tr><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Two-step</th><th className="px-4 py-3 font-medium">Last sign-in</th><th className="px-4 py-3 font-medium">From</th><th className="px-4 py-3 font-medium">Sign-ins</th><th className="px-4 py-3 font-medium">Failed</th></tr></thead>
            <tbody className="divide-y divide-line">
              {d.users.map((u) => (
                <tr key={u.email}>
                  <td className="px-4 py-3"><span className="block font-medium text-ink">{u.name || u.email}{u.disabled && <span className="ml-2 rounded-full bg-bad/15 px-2 py-0.5 text-xs text-bad">Blocked</span>}{u.locked && <span className="ml-2 rounded-full bg-amber/15 px-2 py-0.5 text-xs text-amber">Locked</span>}</span><span className="text-xs text-muted">{u.email} · {ROLES[u.role]?.label || u.role}</span></td>
                  <td className="px-4 py-3">{u.totp ? <span className="rounded-full bg-good/15 px-2.5 py-0.5 text-xs text-good">On</span> : <span className="rounded-full bg-amber/15 px-2.5 py-0.5 text-xs text-amber">Off</span>}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{when(u.lastAt)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{u.lastIp || '-'}</td>
                  <td className="px-4 py-3 text-body">{u.signIns}</td>
                  <td className={`px-4 py-3 ${u.failed ? 'font-medium text-bad' : 'text-body'}`}>{u.failed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {d.topFailedIps.length > 0 && (
        <section className="mt-8 rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-semibold text-ink">Networks with the most failed attempts</h2>
          <ul className="mt-3 flex flex-wrap gap-2">{d.topFailedIps.map((x) => <li key={x.ip} className="rounded-full border border-line px-3 py-1 font-mono text-xs text-body">{x.ip} · {x.n}</li>)}</ul>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-ink">Recent activity</h2>
          <div className="inline-flex gap-1 rounded-xl border border-line bg-base/50 p-1">
            {[['all', 'All'], ['success', 'Sign-ins'], ['failed', 'Failed']].map(([v, l]) => <button key={v} type="button" onClick={() => { setD(null); setView(v); }} className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${view === v ? 'bg-signal text-white' : 'text-body hover:bg-raised'}`}>{l}</button>)}
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs text-muted"><tr><th className="px-4 py-3 font-medium">When</th><th className="px-4 py-3 font-medium">Account</th><th className="px-4 py-3 font-medium">Result</th><th className="px-4 py-3 font-medium">Network (IP)</th><th className="px-4 py-3 font-medium">Device</th></tr></thead>
            <tbody className="divide-y divide-line">
              {d.events.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted">Nothing here yet.</td></tr>}
              {d.events.map((e) => (
                <tr key={e._id}>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{when(e.at)}</td>
                  <td className="px-4 py-3 text-ink">{e.email || '-'}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs ${e.event === 'failed' ? 'bg-bad/15 text-bad' : e.event === 'security' ? 'bg-signal/15 text-signal' : 'bg-good/15 text-good'}`}>{e.event === 'failed' ? 'Failed' : e.event === 'security' ? 'Security change' : 'Signed in'}</span><span className="ml-2 text-xs text-muted">{reasonText(e.reason)}</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{e.ip || '-'}</td>
                  <td className="px-4 py-3 text-muted">{deviceOf(e.ua)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">Showing up to 150 of the newest entries. Activity starts from the day this page was added.</p>
      </section>
    </div>
  );
}
