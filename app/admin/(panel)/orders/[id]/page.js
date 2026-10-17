'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, ExternalLink, FileText, Send, CheckCircle2, XCircle, Mail, PenLine } from 'lucide-react';
import { api } from '@/components/admin/api';
import Status from '@/components/admin/Status';
import EmailComposer from '@/components/admin/EmailComposer';
import OrderPortal from '@/components/admin/OrderPortal';
import { money, fmtDate } from '@/lib/utils';
import { ORDER_STATUS, PAYMENT_METHODS } from '@/lib/options';
import InfoTip from '@/components/site/InfoTip';

export default function OrderDetail(props) {
  const params = use(props.params);
  const [o, setO] = useState(null);const [status, setStatus] = useState('');const [notes, setNotes] = useState('');
  const [notify, setNotify] = useState(true);const [msg, setMsg] = useState({ t: '', m: '' });const [busy, setBusy] = useState('');const [compose, setCompose] = useState(false);
  const load = () => api(`/api/admin/orders/${params.id}`).then((j) => { setO(j.item); setStatus(j.item.status); setNotes(j.item.notes || ''); });
  useEffect(() => { load(); }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!o) return <div className="grid h-64 place-items-center"><Loader2 className="animate-spin text-muted" /></div>;

  const say = (t, m) => setMsg({ t, m });
  const save = async (next = status) => {
    setBusy('save'); say('', '');
    try {
      const j = await api(`/api/admin/orders/${params.id}`, { method: 'PUT', body: { status: next, notes, notify } });
      setO(j.item); setStatus(j.item.status);
      say('ok', j.mail ? (j.mail.ok ? 'Saved and the customer was emailed.' : j.mail.skipped ? 'Saved. That email type is switched off in Settings > Emails.' : `Saved, but the email failed: ${j.mail.error}`) : 'Saved.');
    } catch (e) { say('err', e.message); }
    setBusy('');
  };
  const mail = async (body, label) => {
    setBusy(label); say('', '');
    try { const j = await api('/api/admin/mail', { method: 'POST', body: { orderId: o._id, ...body } }); if (j.item) setO(j.item); say('ok', 'Email sent.'); }
    catch (e) { say('err', e.message); }
    setBusy('');
  };
  const m = PAYMENT_METHODS.find((x) => x.id === o.method);
  const invoiceUrl = `/invoice/${o.number}?t=${o.token}`;
  const Row = ({ k, v }) => (v ? <div className="flex justify-between gap-4 py-2.5"><dt className="text-muted">{k}</dt><dd className="text-right text-ink">{v}</dd></div> : null);
  const B = ({ id, onClick, children, primary, danger }) => <button onClick={onClick} disabled={!!busy} className={`${primary ? 'btn-primary' : 'btn-ghost'} btn-sm justify-start ${danger ? 'text-bad' : ''}`}>{busy === id ? <Loader2 size={14} className="animate-spin" /> : null}{children}</button>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><Link href="/admin/orders" className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:bg-raised" aria-label="Back"><ArrowLeft size={16} /></Link><h1 className="text-xl font-semibold">{o.number}</h1><Status s={o.status} /></div>
        <div className="flex gap-2">
          <a href={invoiceUrl} target="_blank" className="btn-ghost btn-sm"><FileText size={14} />Invoice</a>
          <a href={`/order/${o.number}?t=${o.token}`} target="_blank" className="btn-ghost btn-sm"><ExternalLink size={14} />Customer view</a>
        </div>
      </div>
      {msg.m && <p className={`mb-5 rounded-xl border px-4 py-3 text-sm ${msg.t === 'ok' ? 'border-good/40 bg-good/10 text-good' : 'border-bad/40 bg-bad/10 text-bad'}`}>{msg.m}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="flex items-center gap-1.5 font-semibold">Quick actions<InfoTip text="One-click steps for the usual order flow: approve the payment, start work, mark it delivered. Each one updates the status and, if switched on in Settings > Emails, emails the customer." /></h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {!['paid', 'in_progress', 'completed'].includes(o.status) && <B id="save" primary onClick={() => { setStatus('paid'); save('paid'); }}><CheckCircle2 size={14} />Approve payment</B>}
              {o.status === 'paid' && <B id="save" primary onClick={() => { setStatus('in_progress'); save('in_progress'); }}><PenLine size={14} />Start work</B>}
              {o.status === 'in_progress' && <B id="save" primary onClick={() => { setStatus('completed'); save('completed'); }}><CheckCircle2 size={14} />Mark delivered</B>}
              <B id="invoice" onClick={() => mail({ kind: 'invoice' }, 'invoice')}><Send size={14} />Email invoice</B>
              <B id="status" onClick={() => mail({ kind: 'status', status: o.status === 'pending_payment' || o.status === 'verifying' ? 'placed' : o.status }, 'status')}><Mail size={14} />Resend status email</B>
              <B id="compose" onClick={() => setCompose(!compose)}><PenLine size={14} />Write an email</B>
              {!['cancelled', 'completed'].includes(o.status) && <B id="save" danger onClick={() => { if (confirm('Cancel this order? The customer will be emailed.')) { setStatus('cancelled'); save('cancelled'); } }}><XCircle size={14} />Cancel order</B>}
            </div>
            {compose && <div className="mt-4"><EmailComposer target={{ orderId: o._id }} defaultSubject={`About your order ${o.number}`} attachOptions onSent={() => { load(); setCompose(false); say('ok', 'Email sent.'); }} onClose={() => setCompose(false)} /></div>}
          </section>
          <OrderPortal key={o.updatedAt} o={o} onChange={setO} say={say} />
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="flex items-center gap-1.5 font-semibold">Payment<InfoTip text="How the buyer paid and the transaction details they sent. For bKash, Nagad, Rocket and bank, check the transaction ID in your account before approving." /></h2>
            <dl className="mt-3 divide-y divide-line text-sm">
              <Row k="Method" v={m?.name} />{(o.discount > 0 || o.creditUsed > 0) && <Row k="Price" v={money(o.subtotal, o.currency)} />}<Row k="Coupon" v={o.discount > 0 ? `${o.coupon?.code}: -${money(o.discount, o.currency)}` : ''} /><Row k="Referral credit used" v={o.creditUsed > 0 ? `-${money(o.creditUsed, o.currency)}` : ''} /><Row k="Amount" v={money(o.amount, o.currency)} /><Row k="Referred by" v={o.referral?.code ? `${o.referral.code} (${o.referral.kind}${o.referral.rewarded ? ', rewarded' : ''})` : ''} /><Row k="Amount in taka" v={o.payment?.amountLocal ? `৳${o.payment.amountLocal.toLocaleString()}` : ''} />
              <Row k="Transaction ID" v={o.payment?.transactionId} /><Row k="Sent from" v={o.payment?.senderNumber} /><Row k="Reference" v={o.payment?.reference} /><Row k="Invoice" v={o.invoiceNumber} />
              <Row k="Paid" v={fmtDate(o.payment?.paidAt, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })} />
            </dl>
            {o.status === 'verifying' && <p className="mt-4 rounded-xl bg-amber/10 px-4 py-3 text-sm">Check your {m?.name} account for this transaction ID, then press Approve payment.</p>}
          </section>
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="flex items-center gap-1.5 font-semibold">Customer<InfoTip text="The buyer's details and the brief they wrote at checkout." /></h2>
            <dl className="mt-3 divide-y divide-line text-sm">
              <Row k="Name" v={o.customer?.name} /><Row k="Email" v={o.customer?.email && <a href={`mailto:${o.customer.email}`} className="text-signal">{o.customer.email}</a>} />
              <Row k="Phone" v={o.customer?.phone} /><Row k="Country" v={o.customer?.country} /><Row k="Business" v={o.customer?.company} />
            </dl>
            {o.requirements && <><h3 className="mt-5 text-sm font-medium">Brief</h3><p className="mt-2 whitespace-pre-wrap rounded-xl bg-raised p-4 text-sm">{o.requirements}</p></>}
          </section>
        </div>
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="flex items-center gap-1.5 font-semibold">Status<InfoTip text="Where the order is: Awaiting payment, Verifying payment, Paid, In progress, Completed, Cancelled or Payment failed. Setting Paid also triggers referral and affiliate rewards. Cancelling gives back the coupon use and referral credit and voids rewards." /></h2>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="field mt-4" aria-label="Status">{Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-[rgb(var(--signal))]" />Email the customer about this change<InfoTip text="On: the matching status email from Settings > Emails is sent when you save a new status." /></label>
            <label className="label mt-4 flex items-center gap-1.5" htmlFor="nt">Private notes<InfoTip text="Notes for you only. The customer never sees them." /></label>
            <textarea id="nt" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="field" />
            <button onClick={() => save()} disabled={!!busy} className="btn-primary btn-sm mt-4"><Save size={14} />Save</button>
          </section>
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="flex items-center gap-1.5 font-semibold">Emails sent<InfoTip text="Every email sent for this order. A red dot means it failed, usually because email sending is not set up yet." /></h2>
            {(o.emails || []).length ? (
              <ul className="mt-4 space-y-3 text-sm">
                {[...o.emails].reverse().map((e, i) => <li key={i} className="flex gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.ok ? 'bg-good' : 'bg-bad'}`} /><span><span className="text-ink">{e.subject}</span><span className="block text-xs text-muted">{fmtDate(e.at, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}{e.ok ? '' : `, failed: ${e.error}`}</span></span></li>)}
              </ul>) : <p className="mt-3 text-sm text-muted">No emails yet.</p>}
          </section>
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="flex items-center gap-1.5 font-semibold">History<InfoTip text="Every status change with its time, so you can see exactly what happened and when." /></h2>
            <ol className="mt-4 space-y-3 border-l border-line">
              {(o.history || []).map((h, i) => <li key={i} className="relative pl-4 text-sm"><span className="absolute -left-[4px] top-1.5 h-2 w-2 rounded-full bg-signal" /><p className="text-ink">{ORDER_STATUS[h.status]?.label || h.status}</p><p className="text-xs text-muted">{fmtDate(h.at, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}{h.note ? `, ${h.note}` : ''}</p></li>)}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
