'use client';
import { useState } from 'react';
import { Loader2, Save, Ban, RefreshCw, CalendarClock } from 'lucide-react';
import { api } from './api';
import { fmtDate } from '@/lib/utils';
import InfoTip from '@/components/site/InfoTip';

const TONE = { active: 'bg-good/15 text-good', pending: 'bg-amber/15 text-amber', expired: 'bg-bad/15 text-bad', renewed: 'bg-signal/15 text-signal', cancelled: 'bg-raised text-muted', none: 'bg-raised text-muted' };
const LABEL = { active: 'Active', pending: 'Starts when paid', expired: 'Ended (switched off)', renewed: 'Renewed', cancelled: 'Cancelled', none: 'Not started' };
const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

/* Start and end dates for monthly and yearly plans. The daily check uses them to send reminders and to switch the plan off. */
export default function SubscriptionBox({ o, onChange, say }) {
  const sub = o.subscription || {};
  const [start, setStart] = useState(day(sub.startsAt)); const [end, setEnd] = useState(day(sub.endsAt));
  const [busy, setBusy] = useState('');
  const status = sub.status || 'none';
  const put = async (subscriptionEdit, ok) => {
    setBusy(ok); say('', '');
    try { const j = await api(`/api/admin/orders/${o._id}`, { method: 'PUT', body: { subscriptionEdit } }); onChange(j.item); say('ok', ok); }
    catch (e) { say('err', e.message); }
    setBusy('');
  };
  const fill = (months) => { if (!start) return; const d = new Date(start); d.setMonth(d.getMonth() + months); setEnd(day(d)); };

  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold"><CalendarClock size={17} className="text-signal" />Subscription<InfoTip text="For monthly and yearly plans. The service runs from the start date to the end date. A daily check emails the customer before the end date and again when it has ended, and shows the plan as switched off. Leave the dates empty and they are filled in automatically when you approve the payment." /></h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TONE[status]}`}>{LABEL[status]}</span>
      </div>
      <p className="mt-2 text-sm text-muted">{sub.period === 'yearly' ? 'Yearly' : 'Monthly'} plan{sub.endsAt ? `, ends ${fmtDate(sub.endsAt, { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}.{(sub.reminders || []).length ? ` Reminders sent: ${sub.reminders.join(', ')} days before.` : ''}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="ss">Start date</label><input id="ss" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="field" /></div>
        <div><label className="label" htmlFor="se">End date</label><input id="se" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="field" /></div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <span className="text-muted">Set the end date from the start:</span>
        <button type="button" onClick={() => fill(1)} className="text-signal hover:underline">+1 month</button>
        <button type="button" onClick={() => fill(3)} className="text-signal hover:underline">+3 months</button>
        <button type="button" onClick={() => fill(12)} className="text-signal hover:underline">+1 year</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button disabled={!!busy} onClick={() => put({ startsAt: start || null, endsAt: end || null }, 'Dates saved.')} className="btn-primary btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save dates</button>
        {['expired', 'cancelled'].includes(status) && <button disabled={!!busy} onClick={() => end ? put({ startsAt: start || null, endsAt: end }, 'Plan switched back on.') : say('err', 'Pick a new end date first.')} className="btn-ghost btn-sm"><RefreshCw size={14} />Switch back on with these dates</button>}
        {!['cancelled', 'expired'].includes(status) && <button disabled={!!busy} onClick={() => confirm('Cancel this plan now? No more reminders are sent.') && put({ action: 'cancel' }, 'Plan cancelled.')} className="btn-ghost btn-sm text-bad"><Ban size={14} />Cancel plan</button>}
      </div>
    </section>
  );
}
