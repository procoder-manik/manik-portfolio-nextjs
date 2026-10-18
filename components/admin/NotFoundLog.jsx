'use client';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, Trash2, ArrowRightLeft, Inbox } from 'lucide-react';
import { api } from './api';
import { Notice } from './Editor';
import Dialog from './Dialog';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';
import { fmtDate } from '@/lib/utils';

export default function NotFoundLog() {
  const [items, setItems] = useState(null); const [err, setErr] = useState(''); const [to, setTo] = useState(null); const [dest, setDest] = useState('');
  const load = useCallback(() => api('/api/admin/not-found').then((j) => setItems(j.items)).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  async function create(e) {
    e.preventDefault();
    try { await api('/api/admin/redirects', { method: 'POST', body: { from: to.path, to: dest, code: 301, match: 'exact', keepQuery: true, active: true, note: 'Created from the 404 log' } }); await api(`/api/admin/not-found?id=${to._id}`, { method: 'DELETE' }); setTo(null); setDest(''); load(); } catch (er) { setErr(er.message); }
  }
  const drop = async (id) => { await api(`/api/admin/not-found?id=${id}`, { method: 'DELETE' }); load(); };
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">404 log<InfoTip size={16} text={SECTION_INFO['not-found-log']} /></h1>
        {items?.length > 0 && <button onClick={() => confirm('Clear the whole list?') && drop('all')} className="btn-ghost btn-sm text-bad"><Trash2 size={14} />Clear list</button>}
      </div>
      {err && <Notice bad>{err}</Notice>}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-xs text-muted"><tr><th className="px-4 py-3 font-medium">Address that was not found</th><th className="px-4 py-3 font-medium">Visits</th><th className="px-4 py-3 font-medium">Last seen</th><th className="px-4 py-3 font-medium">Came from</th><th className="px-4 py-3" /></tr></thead>
          <tbody className="divide-y divide-line">
            {items === null && <tr><td colSpan={5} className="p-10 text-center text-muted"><Loader2 className="mx-auto animate-spin" /></td></tr>}
            {items && !items.length && <tr><td colSpan={5} className="p-10 text-center text-muted"><Inbox className="mx-auto mb-2" size={22} />No broken addresses recorded. Great.</td></tr>}
            {items?.map((x) => (
              <tr key={x._id}><td className="px-4 py-3 font-mono text-[13px] text-ink">{x.path}</td><td className="px-4 py-3 tabular-nums text-body">{x.hits}</td><td className="px-4 py-3 text-muted">{fmtDate(x.lastAt, { month: 'short', day: 'numeric' })}</td><td className="max-w-[220px] truncate px-4 py-3 text-xs text-muted">{x.referrer || '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right"><button onClick={() => { setTo(x); setDest('/'); }} className="btn-ghost btn-sm"><ArrowRightLeft size={13} />Redirect</button><button aria-label="Ignore" title="Ignore" onClick={() => drop(x._id)} className="ml-1 grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-raised hover:text-bad"><Trash2 size={14} /></button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!to} onClose={() => setTo(null)} title="Redirect this address">
        {to && <form onSubmit={create} className="space-y-4"><p className="text-sm text-body">Visitors who open <code className="rounded bg-raised px-1.5 py-0.5">{to.path}</code> will go to:</p><div><label className="label" htmlFor="rd-to">New address</label><input id="rd-to" className="field" value={dest} onChange={(e) => setDest(e.target.value)} placeholder="/pricing" required /></div><p className="text-xs text-muted">A permanent (301) redirect is created. You can edit it later in Marketing &gt; Redirects.</p><button className="btn-primary btn-sm">Create redirect</button></form>}
      </Dialog>
    </div>
  );
}
