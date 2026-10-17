import Link from 'next/link';
import { ArrowRight, CalendarClock } from 'lucide-react';
import Status from '@/components/admin/Status';
import { money, fmtDate } from '@/lib/utils';
import InfoTip from '@/components/site/InfoTip';

export const STEPS = [['pending_payment', 'Order placed'], ['verifying', 'Payment sent'], ['paid', 'Payment confirmed'], ['in_progress', 'In progress'], ['completed', 'Delivered']];
export const needsPayment = (o) => ['pending_payment', 'failed'].includes(o.status);

/* Progress shown to the buyer: the admin's number while work is running, otherwise derived from the status. */
export function progressOf(o) {
  if (o.status === 'completed') return 100;
  if (o.status === 'in_progress') return Math.max(5, Math.min(99, o.progress || 0));
  if (o.status === 'paid') return Math.max(o.progress || 0, 0);
  return 0;
}

export function ProgressBar({ value, className = '' }) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 text-muted">Progress<InfoTip text="How far along your project is, updated by Manik as work moves forward. It reaches 100% when the project is delivered." /></span><span className="font-display font-semibold text-ink">{value}%</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-signal transition-[width] duration-700" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Steps({ status }) {
  const idx = Math.max(0, STEPS.findIndex(([k]) => k === status));
  const off = ['cancelled'].includes(status);
  return (
    <ol className="grid grid-cols-5 gap-2">
      {STEPS.map(([k, label], i) => (
        <li key={k} className="text-center">
          <div className={`h-1.5 rounded-full ${i <= idx && !off ? 'bg-signal' : 'bg-line'}`} />
          <p className={`mt-2.5 text-[11px] leading-tight sm:text-sm ${i <= idx && !off ? 'text-ink' : 'text-muted'}`}>{label}</p>
        </li>
      ))}
    </ol>
  );
}

export function OrderCard({ o }) {
  const last = [...(o.updates || [])].sort((a, b) => new Date(b.at) - new Date(a.at))[0];
  const showBar = ['paid', 'in_progress', 'completed'].includes(o.status);
  return (
    <Link href={`/account/orders/${o.number}`} className="card group block p-5 transition hover:border-signal/50 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted">{o.number} · {fmtDate(o.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          <h3 className="mt-1 truncate text-lg font-semibold text-ink">{o.package?.name}</h3>
        </div>
        <Status s={o.status} />
      </div>
      {showBar && <ProgressBar value={progressOf(o)} className="mt-5" />}
      {last && <p className="mt-4 line-clamp-2 text-sm text-body"><span className="text-muted">Latest: </span>{last.text}</p>}
      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted">{o.dueDate && o.status !== 'completed' ? <><CalendarClock size={15} />Due {fmtDate(o.dueDate, { month: 'short', day: 'numeric' })}</> : money(o.amount, o.currency)}</span>
        <span className="flex items-center gap-1 font-medium text-signal">{needsPayment(o) ? 'Complete payment' : 'Open'}<ArrowRight size={15} className="transition group-hover:translate-x-0.5" /></span>
      </div>
    </Link>
  );
}
