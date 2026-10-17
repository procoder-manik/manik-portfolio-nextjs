'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Check, X, Pause, Settings, Copy } from 'lucide-react';
import { api } from '@/components/admin/api';
import { money, fmtDate, cn } from '@/lib/utils';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';

const TONE = { approved: 'bg-good/15 text-good', pending: 'bg-amber/15 text-amber', requested: 'bg-amber/15 text-amber', rejected: 'bg-bad/15 text-bad', paused: 'bg-raised text-muted', paid: 'bg-good/15 text-good', credited: 'bg-signal/15 text-signal', void: 'bg-raised text-muted' };
const Pill = ({ s }) => <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', TONE[s] || 'bg-raised text-muted')}>{s}</span>;
const d = (x) => fmtDate(x, { month: 'short', day: 'numeric', year: 'numeric' });

export default function Affiliates() {
  const [data, setData] = useState(null); const [tab, setTab] = useState('affiliates'); const [busy, setBusy] = useState(''); const [msg, setMsg] = useState({});
  const load = () => api('/api/admin/affiliates').then(setData).catch((e) => setMsg({ t: 'err', m: e.message }));
  useEffect(() => { load(); }, []);
  if (!data) return <div className="grid h-64 place-items-center"><Loader2 className="animate-spin text-muted" /></div>;
  const s = data.settings || {}; const cur = s.base || 'USD';
  const act = async (body, id) => {
    setBusy(id); setMsg({});
    try { await api('/api/admin/affiliates', { method: 'POST', body }); await load(); setMsg({ t: 'ok', m: 'Done.' }); } catch (e) { setMsg({ t: 'err', m: e.message }); }
    setBusy('');
  };
  const waiting = data.payouts.filter((p) => p.status === 'requested').length;
  const pendingApps = data.affiliates.filter((a) => a.affiliate?.status === 'pending').length;
  const B = ({ id, onClick, children, danger }) => <button onClick={onClick} disabled={!!busy} className={cn('btn-ghost btn-sm', danger && 'text-bad')}>{busy === id ? <Loader2 size={13} className="animate-spin" /> : null}{children}</button>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">Referrals and affiliates<InfoTip size={16} text="Approve affiliates, pay their payout requests and see every reward earned through referral and affiliate links." /></h1>
        <Link href="/admin/settings/referrals" className="btn-ghost btn-sm"><Settings size={14} />Program settings</Link>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[['Referral program', s.referral?.enabled, s.referral?.rewardMode === 'coupon' ? `Reward: coupon ${s.referral?.rewardCoupon || '(not chosen)'}` : `Reward: ${s.referral?.rate}% as store credit`, 'Customers share a link. When a friend orders and pays, the customer gets store credit or a coupon for their next order. Good for happy clients who are not marketers.'],
          ['Affiliate program', s.affiliate?.enabled, `${s.affiliate?.rate}% commission, ${s.affiliate?.holdDays} day hold`, 'Approved partners share a link and earn cash commission on paid orders, paid out on request. Good for agencies, bloggers and freelancers who send clients regularly.'],
          ['Coupons at checkout', s.coupons?.enabled !== false, 'Manage codes in Shop > Coupons', 'Shows a coupon box at checkout so buyers can use codes you create.']].map(([k, on, sub, tip]) => (
          <div key={k} className="rounded-2xl border border-line bg-surface p-4">
            <p className="flex items-center justify-between text-sm font-medium"><span className="flex items-center gap-1.5">{k}<InfoTip text={tip} /></span><span className={cn('rounded-full px-2 py-0.5 text-xs', on ? 'bg-good/15 text-good' : 'bg-raised text-muted')}>{on ? 'On' : 'Off'}</span></p>
            <p className="mt-1 text-xs text-muted">{sub}</p>
          </div>
        ))}
      </div>
      {msg.m && <p className={`mb-4 rounded-xl border px-4 py-3 text-sm ${msg.t === 'ok' ? 'border-good/40 bg-good/10 text-good' : 'border-bad/40 bg-bad/10 text-bad'}`}>{msg.m}</p>}
      <div className="mb-4 flex items-center gap-2">
        {[['affiliates', `Affiliates${pendingApps ? ` (${pendingApps} new)` : ''}`], ['payouts', `Payout requests${waiting ? ` (${waiting})` : ''}`], ['ledger', 'Rewards ledger']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cn('rounded-full px-4 py-2 text-sm font-medium', tab === k ? 'bg-signal/15 text-ink' : 'text-muted hover:text-ink')}>{l}</button>
        ))}
        <InfoTip className="ml-1" text={tab === 'affiliates' ? 'People who applied to or joined the affiliate program. Approve to activate their link, Pause to stop new earnings for a while, Reject to decline.' : tab === 'payouts' ? 'Affiliates ask to be paid once their available balance reaches the minimum payout. Send the money by their chosen method, then press Mark paid and add the transaction ID. Reject puts the amount back in their balance.' : 'Every reward ever earned. Pending: affiliate commission still on hold or available. Requested: in a payout request. Paid: sent. Credited: referral credit or coupon given. Void: cancelled because the order was cancelled or you voided it.'} />
      </div>

      {tab === 'affiliates' && (
        <div className="space-y-3">
          {!data.affiliates.length && <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">No affiliates yet. Customers apply from their account once the program is on.</p>}
          {data.affiliates.map((a) => {
            const st = a.affiliate?.status; const link = a.refCode ? `${location.origin}/?ref=${a.refCode}` : '';
            return (
              <div key={a._id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {a.avatar ? <img src={a.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-raised font-semibold">{(a.name || a.email)[0]?.toUpperCase()}</span>}
                    <div><p className="font-medium text-ink">{a.name} <Pill s={st} /></p><p className="text-sm text-muted">{a.email} · applied {d(a.affiliate?.appliedAt)}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {st !== 'approved' && <B id={`ap${a._id}`} onClick={() => act({ action: 'approve', customerId: a._id }, `ap${a._id}`)}><Check size={13} />Approve</B>}
                    {st === 'approved' && <B id={`pa${a._id}`} onClick={() => act({ action: 'pause', customerId: a._id }, `pa${a._id}`)}><Pause size={13} />Pause</B>}
                    {st !== 'rejected' && <B id={`rj${a._id}`} danger onClick={() => { const note = prompt('Reason (sent to them, optional)'); if (note !== null) act({ action: 'reject', customerId: a._id, note }, `rj${a._id}`); }}><X size={13} />Reject</B>}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                  <div><p className="flex items-center gap-1 text-muted">Clicks / sign-ups / orders<InfoTip size={12} text="Clicks: visits through their link (once per visitor per day). Sign-ups: accounts created after clicking. Orders: paid orders that earned a reward." /></p><p className="text-ink">{a.refStats?.clicks || 0} / {a.refStats?.signups || 0} / {a.refStats?.orders || 0}</p></div>
                  <div><p className="flex items-center gap-1 text-muted">Earned / paid<InfoTip size={12} text="Earned: all commission not cancelled, including what is still on hold. Paid: what you have already sent them." /></p><p className="text-ink">{money(a.totals.earned, cur)} / {money(a.totals.paid, cur)}</p></div>
                  <div><p className="flex items-center gap-1 text-muted">Payout to<InfoTip size={12} text="The method and account the affiliate gave for payouts." /></p><p className="truncate text-ink">{a.affiliate?.payoutMethod || '-'}: {a.affiliate?.payoutDetails || '-'}</p></div>
                  <div><p className="flex items-center gap-1 text-muted">Rate (empty = {s.affiliate?.rate}%)<InfoTip size={12} text="A personal commission % for this affiliate. Type a number and click outside the box to save. Empty uses the program rate." /></p>
                    <input type="number" min={0} max={90} defaultValue={a.affiliate?.rate ?? ''} onBlur={(e) => { const v = e.target.value; if (String(v) !== String(a.affiliate?.rate ?? '')) act({ action: 'rate', customerId: a._id, rate: v }, `rt${a._id}`); }} className="field mt-1 w-24 py-1.5 text-sm" /></div>
                </div>
                {(a.affiliate?.website || a.affiliate?.about) && <p className="mt-3 rounded-xl bg-raised/60 p-3 text-sm">{a.affiliate.website && <a href={a.affiliate.website} target="_blank" rel="noopener noreferrer" className="text-signal">{a.affiliate.website}</a>}{a.affiliate.about && <span className="mt-1 block text-body">{a.affiliate.about}</span>}</p>}
                {link && st === 'approved' && <button onClick={() => navigator.clipboard?.writeText(link)} className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-ink"><Copy size={12} />{link}</button>}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'payouts' && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs text-muted"><tr><th className="px-4 py-3">Affiliate</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Send to</th><th className="px-4 py-3">Requested</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
            <tbody className="divide-y divide-line">
              {!data.payouts.length && <tr><td colSpan={6} className="p-8 text-center text-muted">No payout requests yet.</td></tr>}
              {data.payouts.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3"><p className="font-medium text-ink">{p.name}</p><p className="text-xs text-muted">{p.email}</p></td>
                  <td className="px-4 py-3 font-semibold text-ink">{money(p.amount, p.currency)}</td>
                  <td className="px-4 py-3">{p.method}<p className="text-xs text-muted">{p.details}</p></td>
                  <td className="px-4 py-3">{d(p.createdAt)}{p.paidAt && <p className="text-xs text-muted">Paid {d(p.paidAt)}{p.reference ? `, ${p.reference}` : ''}</p>}</td>
                  <td className="px-4 py-3"><Pill s={p.status} /></td>
                  <td className="px-4 py-3 text-right">{p.status === 'requested' && <span className="flex justify-end gap-2">
                    <B id={`pp${p._id}`} onClick={() => { const reference = prompt('Transaction ID or reference (optional)'); if (reference !== null) act({ action: 'payout-paid', payoutId: p._id, reference }, `pp${p._id}`); }}><Check size={13} />Mark paid</B>
                    <B id={`pr${p._id}`} danger onClick={() => { const note = prompt('Why? (sent to them)'); if (note !== null) act({ action: 'payout-reject', payoutId: p._id, note }, `pr${p._id}`); }}><X size={13} />Reject</B></span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'ledger' && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs text-muted"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Earned by</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Reward</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
            <tbody className="divide-y divide-line">
              {!data.commissions.length && <tr><td colSpan={7} className="p-8 text-center text-muted">Rewards appear here when a referred order is paid.</td></tr>}
              {data.commissions.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3">{d(c.createdAt)}</td>
                  <td className="px-4 py-3 text-ink">{c.earner}</td>
                  <td className="px-4 py-3 capitalize">{c.kind}</td>
                  <td className="px-4 py-3">{c.orderNumber}<p className="text-xs text-muted">{c.buyerName}, {money(c.base, c.currency)}</p></td>
                  <td className="px-4 py-3 font-medium text-ink">{c.couponCode ? `Coupon ${c.couponCode}` : `${money(c.amount, c.currency)}${c.rate ? ` (${c.rate}%)` : ''}`}</td>
                  <td className="px-4 py-3"><Pill s={c.status} />{c.status === 'pending' && c.availableAt && new Date(c.availableAt) > new Date() && <p className="mt-1 text-xs text-muted">Available {d(c.availableAt)}</p>}</td>
                  <td className="px-4 py-3 text-right">{['pending', 'credited'].includes(c.status) && !c.couponCode && <B id={`v${c._id}`} danger onClick={() => { if (confirm('Void this reward?')) act({ action: 'void', commissionId: c._id }, `v${c._id}`); }}>Void</B>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
