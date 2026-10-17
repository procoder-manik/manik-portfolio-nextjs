'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Search, Plus, Mail, LayoutGrid, Rows3 } from 'lucide-react';
import { api } from '@/components/admin/api';
import EmailComposer from '@/components/admin/EmailComposer';
import { fmtDate, money } from '@/lib/utils';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';

const STAGES = [['new', 'New'], ['contacted', 'Contacted'], ['proposal', 'Proposal'], ['won', 'Won'], ['lost', 'Lost']];
const TONE = { new: 'bg-signal', contacted: 'bg-amber', proposal: 'bg-[#A78BFA]', won: 'bg-good', lost: 'bg-bad' };

export default function CRM() {
  const [items, setItems] = useState(null); const [q, setQ] = useState(''); const [view, setView] = useState('board'); const [mailTo, setMailTo] = useState(null);
  useEffect(() => { api('/api/admin/contacts').then((j) => setItems(j.items)).catch(() => setItems([])); }, []);
  const list = useMemo(() => (items || []).filter((c) => !q || `${c.name} ${c.email} ${c.company} ${(c.tags || []).join(' ')}`.toLowerCase().includes(q.toLowerCase())), [items, q]);
  const move = async (c, stage) => { const j = await api(`/api/admin/contacts/${c._id}`, { method: 'PUT', body: { stage } }); setItems((a) => a.map((x) => (x._id === c._id ? j.item : x))); };
  const pipeline = list.filter((c) => !['won', 'lost'].includes(c.stage)).reduce((n, c) => n + (c.value || 0), 0);
  const won = list.filter((c) => c.stage === 'won').reduce((n, c) => n + (c.value || c.spent || 0), 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="flex items-center gap-2 text-2xl font-semibold">CRM<InfoTip size={16} text={SECTION_INFO.crm} /></h1><p className="mt-1 text-sm text-muted">Every message, chat and order adds or updates a contact here automatically.</p></div>
        <div className="flex flex-wrap gap-2">
          <label className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="field w-44 py-2 pl-9 text-sm" /></label>
          <div className="flex rounded-full border border-line p-0.5">
            <button onClick={() => setView('board')} className={`grid h-8 w-8 place-items-center rounded-full ${view === 'board' ? 'bg-raised text-ink' : 'text-muted'}`} aria-label="Board view"><LayoutGrid size={15} /></button>
            <button onClick={() => setView('table')} className={`grid h-8 w-8 place-items-center rounded-full ${view === 'table' ? 'bg-raised text-ink' : 'text-muted'}`} aria-label="Table view"><Rows3 size={15} /></button>
          </div>
          <Link href="/admin/contacts/new" className="btn-primary btn-sm"><Plus size={15} />Add contact</Link>
        </div>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[['Contacts', list.length], ['Open pipeline', money(pipeline)], ['Won', money(won)]].map(([k, v]) => <div key={k} className="rounded-2xl border border-line bg-surface p-4"><p className="text-sm text-muted">{k}</p><p className="mt-1 font-display text-2xl font-bold text-ink">{v}</p></div>)}
      </div>
      {mailTo && <div className="mb-6"><EmailComposer target={{ contactId: mailTo._id }} defaultSubject={`Hi ${mailTo.name?.split(' ')[0] || ''}`} onSent={() => setMailTo(null)} onClose={() => setMailTo(null)} /></div>}
      {items === null ? <Loader2 className="animate-spin text-muted" /> : view === 'board' ? (
        <div className="grid gap-4 overflow-x-auto pb-4 md:grid-cols-5">
          {STAGES.map(([k, l]) => {
            const col = list.filter((c) => (c.stage || 'new') === k);
            return (
              <div key={k} className="min-w-[220px] rounded-2xl border border-line bg-surface/60 p-3"
                onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const c = list.find((x) => x._id === e.dataTransfer.getData('id')); if (c && c.stage !== k) move(c, k); }}>
                <p className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold text-ink"><span className={`h-2 w-2 rounded-full ${TONE[k]}`} />{l}<span className="text-muted">{col.length}</span></p>
                <div className="space-y-2">
                  {col.map((c) => (
                    <div key={c._id} draggable onDragStart={(e) => e.dataTransfer.setData('id', c._id)} className="cursor-grab rounded-xl border border-line bg-base p-3 active:cursor-grabbing">
                      <Link href={`/admin/contacts/${c._id}`} className="block truncate font-medium text-ink hover:text-signal">{c.name || c.email}</Link>
                      <p className="truncate text-xs text-muted">{c.email}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted">
                        <span>{c.orders ? `${c.orders} order${c.orders > 1 ? 's' : ''}` : c.source}</span>
                        <button onClick={() => setMailTo(c)} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-raised hover:text-ink" aria-label="Email"><Mail size={13} /></button>
                      </div>
                      <select value={c.stage || 'new'} onChange={(e) => move(c, e.target.value)} className="mt-2 w-full rounded-lg border border-line bg-surface px-2 py-1 text-xs text-body md:hidden" aria-label="Stage">{STAGES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs text-muted"><tr>{['Name', 'Stage', 'Source', 'Orders', 'Spent', 'Last contact', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {list.map((c) => (
                <tr key={c._id} className="hover:bg-raised/50">
                  <td className="px-4 py-3"><Link href={`/admin/contacts/${c._id}`} className="font-medium text-ink hover:text-signal">{c.name || '-'}</Link><p className="text-xs text-muted">{c.email}</p></td>
                  <td className="px-4 py-3"><select value={c.stage || 'new'} onChange={(e) => move(c, e.target.value)} className="rounded-lg border border-line bg-base px-2 py-1 text-xs">{STAGES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></td>
                  <td className="px-4 py-3 text-muted">{c.source}</td><td className="px-4 py-3">{c.orders || 0}</td><td className="px-4 py-3">{money(c.spent || 0)}</td>
                  <td className="px-4 py-3 text-muted">{fmtDate(c.lastContactAt, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-4 py-3"><button onClick={() => setMailTo(c)} className="btn-ghost btn-sm"><Mail size={13} />Email</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {items && !items.length && <p className="mt-6 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">No contacts yet. They appear when someone messages you, chats or orders.</p>}
    </div>
  );
}
