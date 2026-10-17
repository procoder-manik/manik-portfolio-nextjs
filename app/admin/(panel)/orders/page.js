'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { api } from '@/components/admin/api';
import Status from '@/components/admin/Status';
import { money, fmtDate } from '@/lib/utils';
import { ORDER_STATUS, PAYMENT_METHODS } from '@/lib/options';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';

export default function Orders() {
  const [items, setItems] = useState(null); const [f, setF] = useState('');
  useEffect(() => { api('/api/admin/orders').then((j) => setItems(j.items)).catch(() => setItems([])); }, []);
  const list = (items || []).filter((o) => !f || o.status === f);
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">Orders<InfoTip size={16} text={SECTION_INFO.orders} /></h1>
        <select value={f} onChange={(e) => setF(e.target.value)} className="field w-auto py-2 text-sm"><option value="">All statuses</option>{Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs text-muted"><tr><th className="px-4 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Package</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Method</th><th className="px-4 py-3 font-medium">Status</th></tr></thead>
          <tbody className="divide-y divide-line">
            {items === null && <tr><td colSpan={6} className="p-10 text-center"><Loader2 className="mx-auto animate-spin text-muted" /></td></tr>}
            {items && !list.length && <tr><td colSpan={6} className="p-10 text-center text-muted">No orders yet. They appear here as soon as someone checks out.</td></tr>}
            {list.map((o) => (
              <tr key={o._id} className="hover:bg-raised/50">
                <td className="px-4 py-3"><Link href={`/admin/orders/${o._id}`} className="font-medium text-ink hover:text-signal">{o.number}</Link><p className="text-xs text-muted">{fmtDate(o.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</p></td>
                <td className="px-4 py-3">{o.customer?.name}<p className="text-xs text-muted">{o.customer?.email}</p></td>
                <td className="px-4 py-3">{o.package?.name}</td>
                <td className="px-4 py-3">{money(o.amount, o.currency)}</td>
                <td className="px-4 py-3">{PAYMENT_METHODS.find((m) => m.id === o.method)?.name}{o.payment?.transactionId && <p className="font-mono text-xs text-muted">{o.payment.transactionId}</p>}</td>
                <td className="px-4 py-3"><Status s={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
