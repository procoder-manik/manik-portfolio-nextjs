'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Check, Minus, Loader2, Trash2, RotateCcw, FileEdit, Eye, Copy, Inbox } from 'lucide-react';
import { RESOURCES } from '@/lib/admin-schema';
import { STATUS, TRASHABLE } from '@/lib/trash';
import { api } from './api';
import { Notice } from './Editor';
import { DeleteDialog } from './Dialog';
import { money, fmtDate, get } from '@/lib/utils';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';

const TAB = (resource) => (resource === 'customers' ? { live: 'Active', draft: 'Blocked' } : resource === 'forms' || resource === 'redirects' || resource === 'popups' || resource === 'coupons' || resource === 'services' || resource === 'packages' ? { live: 'On', draft: 'Off' } : { live: 'Published', draft: 'Drafts' });

export default function List({ resource }) {
  const conf = RESOURCES[resource];
  const canTrash = TRASHABLE.includes(resource); const status = STATUS[resource];
  const [view, setView] = useState('all'); const [items, setItems] = useState(null); const [counts, setCounts] = useState(null);
  const [q, setQ] = useState(''); const [ro, setRo] = useState(false); const [err, setErr] = useState(''); const [sel, setSel] = useState([]); const [dlg, setDlg] = useState(null);
  const [trashDays, setTrashDays] = useState(30); const [flash, setFlash] = useState('');
  const load = useCallback(() => {
    setErr('');
    api(`/api/admin/${resource}${canTrash ? `?view=${view}` : ''}`).then((j) => { setItems(j.items); setCounts(j.counts); setRo(!!j.readOnly); setSel([]); }).catch((e) => setErr(e.message));
  }, [resource, view, canTrash]);
  useEffect(() => { setItems(null); load(); }, [load]);
  useEffect(() => { api('/api/admin/settings/site').then((j) => setTrashDays(j.item?.features?.trashDays ?? 30)).catch(() => {}); }, []);
  if (!conf) return <p>Unknown section.</p>;

  const labels = TAB(resource);
  const tabs = canTrash ? [['all', 'All', counts?.all], ...(status ? [['live', labels.live, counts?.live], ['draft', labels.draft, counts?.draft]] : []), ['trash', 'Trash', counts?.trash]] : [];
  const list = (items || []).filter((x) => !q || JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));
  const cell = (c, x) => {
    if (c.key === 'platform') return x.platformType === 'custom' ? 'Custom code' : x.cms;
    if (c.key === 'schemaType') return x.schemaMarkup?.type && x.schemaMarkup.type !== 'auto' ? x.schemaMarkup.type : 'Auto';
    const v = get(x, c.key);
    if (c.type === 'bool') return v ? <Check size={16} className="text-good" /> : <Minus size={16} className="text-muted" />;
    if (c.type === 'thumb') return v ? <img src={v} alt="" className="h-12 w-16 rounded-md border border-line object-cover object-top" /> : <div className="h-12 w-16 rounded-md bg-raised" />; // eslint-disable-line
    if (c.type === 'swatch') return <span className="block h-5 w-5 rounded-full" style={{ background: v }} />;
    if (c.type === 'money') return money(v, x.currency);
    if (c.type === 'date') return fmtDate(v, { month: 'short', day: 'numeric', year: 'numeric' });
    if (c.type === 'num') return v ?? 0;
    return v;
  };
  const say = (m) => { setFlash(m); setTimeout(() => setFlash(''), 2600); };
  const bulk = async (action, ids = sel) => { try { const j = await api(`/api/admin/${resource}/bulk`, { method: 'POST', body: { action, ids } }); say(`${j.count} done`); load(); } catch (e) { setErr(e.message); } };
  const one = async (x, action) => { try { if (action === 'permanent') await api(`/api/admin/${resource}/${x._id}?mode=permanent`, { method: 'DELETE' }); else if (action === 'trash') await api(`/api/admin/${resource}/${x._id}?mode=trash`, { method: 'DELETE' }); else await api(`/api/admin/${resource}/${x._id}`, { method: 'PATCH', body: { action } }); setDlg(null); load(); } catch (e) { setErr(e.message); setDlg(null); } };
  const dup = async (x) => {
    const { _id, slug, createdAt, updatedAt, entries, views, stats, trashedAt, trashState, ...rest } = x;
    try { const j = await api(`/api/admin/${resource}`, { method: 'POST', body: { ...rest, name: `${x.name || x.title} (copy)`, ...(x.title ? { title: x.title } : {}), ...(resource === 'popups' ? { active: false } : {}) } }); say('Duplicated'); load(); return j; } catch (e) { setErr(e.message); }
  };
  const allSel = list.length > 0 && list.every((x) => sel.includes(x._id));
  const first = ['thumb', 'swatch'].includes(conf.columns[0].type) ? 1 : 0;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">{conf.label}<InfoTip size={16} text={SECTION_INFO[resource]} /></h1>
        <div className="flex gap-2">
          <label className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="field w-48 py-2 pl-9 text-sm" aria-label="Search" /></label>
          <Link href={`/admin/${resource}/new`} className="btn-primary btn-sm"><Plus size={15} />Add {conf.singular}</Link>
        </div>
      </div>
      {resource === 'forms' && <p className="mb-4 flex flex-wrap gap-x-4 text-sm text-muted"><Link href="/admin/entries" className="text-signal hover:underline">See all answers</Link></p>}
      {tabs.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-line">
          {tabs.map(([k, l, n]) => <button key={k} onClick={() => setView(k)} className={`-mb-px border-b-2 px-3.5 py-2.5 text-sm font-medium transition ${view === k ? 'border-signal text-ink' : 'border-transparent text-muted hover:text-ink'}`}>{l}{n != null && <span className="ml-1.5 text-xs text-muted">{n}</span>}</button>)}
          {view === 'trash' && counts?.trash > 0 && <button onClick={() => setDlg({ kind: 'empty' })} className="ml-auto text-sm text-bad hover:underline">Empty Trash</button>}
        </div>
      )}
      {view === 'trash' && <p className="mb-4 text-sm text-muted">Items here are hidden from your site. {trashDays ? `They are deleted for good after ${trashDays} days.` : 'They stay until you delete them.'}</p>}
      {ro && <Notice>Showing the built-in starter content. Connect MongoDB and run the seed script to edit and save.</Notice>}
      {err && <Notice bad>{err}</Notice>}
      {flash && <p className="mb-3 text-sm text-good">{flash}</p>}
      {sel.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/10 px-4 py-2.5 text-sm">
          <span className="font-medium text-ink">{sel.length} selected</span>
          {view === 'trash' ? <>
            <button className="btn-ghost btn-sm" onClick={() => bulk('restore')}><RotateCcw size={14} />Restore</button>
            <button className="btn-ghost btn-sm text-bad" onClick={() => setDlg({ kind: 'bulkPermanent' })}><Trash2 size={14} />Delete permanently</button>
          </> : <>
            {status && <button className="btn-ghost btn-sm" onClick={() => bulk('publish')}><Eye size={14} />{labels.live === 'Published' ? 'Publish' : 'Switch on'}</button>}
            {status && <button className="btn-ghost btn-sm" onClick={() => bulk('draft')}><FileEdit size={14} />{labels.live === 'Published' ? 'Draft' : 'Switch off'}</button>}
            {canTrash && <button className="btn-ghost btn-sm text-bad" onClick={() => bulk('trash')}><Trash2 size={14} />Move to Trash</button>}
          </>}
          <button className="ml-auto text-xs text-muted hover:text-ink" onClick={() => setSel([])}>Clear</button>
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-line text-xs text-muted"><tr>
            {canTrash && <th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all" checked={allSel} onChange={() => setSel(allSel ? [] : list.map((x) => x._id))} className="accent-[rgb(var(--signal))]" /></th>}
            {conf.columns.map((c) => <th key={c.key} className="px-4 py-3 font-medium">{c.label || ''}</th>)}{canTrash && <th className="px-4 py-3" />}
          </tr></thead>
          <tbody className="divide-y divide-line">
            {items === null && <tr><td colSpan={12} className="p-10 text-center text-muted"><Loader2 className="mx-auto animate-spin" /></td></tr>}
            {items && !list.length && <tr><td colSpan={12} className="p-10 text-center text-muted"><Inbox className="mx-auto mb-2" size={22} />{view === 'trash' ? 'The Trash is empty.' : `Nothing here yet. Add your first ${conf.singular}.`}</td></tr>}
            {list.map((x) => (
              <tr key={x._id} className="group transition hover:bg-raised/50">
                {canTrash && <td className="px-4 py-3"><input type="checkbox" aria-label="Select" checked={sel.includes(x._id)} onChange={() => setSel(sel.includes(x._id) ? sel.filter((i) => i !== x._id) : [...sel, x._id])} className="accent-[rgb(var(--signal))]" /></td>}
                {conf.columns.map((c, i) => (
                  <td key={c.key} className="px-4 py-3">
                    {i === first ? <Link href={`/admin/${resource}/${x._id}`} className="font-medium text-ink hover:text-signal">{cell(c, x)}{status && !view.startsWith('t') && x.trashedAt == null && x[status.field] === (status.invert ? true : false) && <span className="ml-2 rounded-full bg-amber/15 px-2 py-0.5 text-[11px] font-normal text-amber">{labels.draft === 'Drafts' ? 'Draft' : labels.draft}</span>}</Link> : cell(c, x)}
                  </td>
                ))}
                {canTrash && (
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <span className="inline-flex gap-0.5 opacity-60 transition group-hover:opacity-100">
                      {view === 'trash' || x.trashedAt
                        ? <><button title="Restore" aria-label="Restore" onClick={() => one(x, 'restore')} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-raised"><RotateCcw size={15} /></button><button title="Delete permanently" aria-label="Delete permanently" onClick={() => setDlg({ kind: 'one', x, inTrash: true })} className="grid h-8 w-8 place-items-center rounded-lg text-bad hover:bg-raised"><Trash2 size={15} /></button></>
                        : <>{['forms', 'popups'].includes(resource) && <button title="Duplicate" aria-label="Duplicate" onClick={() => dup(x)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-raised"><Copy size={15} /></button>}<button title="Remove" aria-label="Remove" onClick={() => setDlg({ kind: 'one', x })} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-raised hover:text-bad"><Trash2 size={15} /></button></>}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteDialog open={dlg?.kind === 'one'} onClose={() => setDlg(null)} name={dlg?.x?.title || dlg?.x?.name || dlg?.x?.code || dlg?.x?.from} singular={conf.singular} canDraft={!!status} inTrash={!!dlg?.inTrash} trashDays={trashDays}
        onTrash={() => one(dlg.x, 'trash')} onDraft={() => one(dlg.x, 'draft')} onRestore={() => one(dlg.x, 'restore')} onPermanent={() => one(dlg.x, 'permanent')} />
      <DeleteDialog open={dlg?.kind === 'bulkPermanent'} onClose={() => setDlg(null)} singular={conf.singular} count={sel.length} inTrash onRestore={async () => { await bulk('restore'); setDlg(null); }} onPermanent={async () => { await bulk('delete'); setDlg(null); }} />
      <DeleteDialog open={dlg?.kind === 'empty'} onClose={() => setDlg(null)} singular={conf.singular} count={counts?.trash || 0} inTrash onRestore={async () => { await bulk('restore', (items || []).map((x) => x._id)); setDlg(null); }} onPermanent={async () => { await bulk('empty', []); setDlg(null); }} />
    </div>
  );
}
