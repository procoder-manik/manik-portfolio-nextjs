'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Star, Trash2, ShieldAlert, Download, Loader2, Inbox, RotateCcw, MailOpen, Table2, BarChart3 } from 'lucide-react';
import { api } from './api';
import { Notice } from './Editor';
import Dialog, { DeleteDialog } from './Dialog';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';
import { display, FIELD_TYPES } from '@/lib/forms';
import { fmtDate, money, cn } from '@/lib/utils';

const TABS = [['all', 'All'], ['new', 'New'], ['starred', 'Starred'], ['spam', 'Spam'], ['trash', 'Trash']];

export default function EntriesView() {
  const sp = useSearchParams(); const router = useRouter();
  const formId = sp.get('form') || '';
  const [status, setStatus] = useState('all'); const [q, setQ] = useState(''); const [data, setData] = useState(null); const [err, setErr] = useState('');
  const [sel, setSel] = useState([]); const [open, setOpen] = useState(null); const [mode, setMode] = useState('table'); const [dlg, setDlg] = useState(null);
  const load = useCallback(() => {
    const p = new URLSearchParams(); if (formId) p.set('form', formId); if (status !== 'all') p.set('status', status);
    api(`/api/admin/entries?${p}`).then((j) => { setData(j); setSel([]); }).catch((e) => setErr(e.message));
  }, [formId, status]);
  useEffect(() => { setData(null); load(); }, [load]);

  const form = data?.forms?.find((f) => String(f._id) === formId);
  const items = (data?.items || []).filter((e) => !q || JSON.stringify([e.data, e.name, e.email]).toLowerCase().includes(q.toLowerCase()));
  const act = async (ids, s) => { try { await api('/api/admin/entries', { method: 'PATCH', body: { ids, status: s } }); load(); setOpen((o) => (o && ids.includes(o._id) ? { ...o, status: s } : o)); } catch (e) { setErr(e.message); } };
  const del = async (body) => { try { await api('/api/admin/entries', { method: 'DELETE', body }); setDlg(null); setOpen(null); load(); } catch (e) { setErr(e.message); setDlg(null); } };
  const csv = `/api/admin/entries?format=csv${formId ? `&form=${formId}` : ''}${status !== 'all' ? `&status=${status}` : ''}`;
  const cols = useMemo(() => (form ? (form.fields || []).filter((f) => f.key && FIELD_TYPES[f.type]?.input && !['hidden'].includes(f.type)).slice(0, 3) : []), [form]);
  const tone = { new: 'bg-signal/15 text-signal', read: 'bg-raised text-muted', starred: 'bg-amber/15 text-amber', spam: 'bg-bad/15 text-bad', trash: 'bg-raised text-muted' };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">Form answers<InfoTip size={16} text={SECTION_INFO.entries} /></h1>
        <div className="flex flex-wrap gap-2">
          <select value={formId} onChange={(e) => router.replace(e.target.value ? `/admin/entries?form=${e.target.value}` : '/admin/entries')} className="field w-56 py-2 text-sm" aria-label="Form">
            <option value="">All forms</option>{(data?.forms || []).map((f) => <option key={f._id} value={f._id}>{f.name} ({f.entries || 0})</option>)}
          </select>
          <label className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="field w-44 py-2 pl-9 text-sm" aria-label="Search" /></label>
          <a href={csv} className="btn-ghost btn-sm"><Download size={14} />Export CSV</a>
        </div>
      </div>
      {err && <Notice bad>{err}</Notice>}
      {data?.noDB && <Notice>Connect MongoDB to receive and store answers.</Notice>}
      <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-line">
        {TABS.map(([k, l]) => <button key={k} onClick={() => setStatus(k)} className={cn('-mb-px border-b-2 px-3.5 py-2.5 text-sm font-medium transition', status === k ? 'border-signal text-ink' : 'border-transparent text-muted hover:text-ink')}>{l}</button>)}
        <div className="ml-auto inline-flex gap-1 rounded-lg border border-line p-0.5">
          <button onClick={() => setMode('table')} className={cn('inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium', mode === 'table' ? 'bg-signal text-white' : 'text-body')}><Table2 size={13} />Answers</button>
          <button onClick={() => setMode('summary')} disabled={!form} title={form ? '' : 'Pick one form to see its summary'} className={cn('inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium disabled:opacity-40', mode === 'summary' ? 'bg-signal text-white' : 'text-body')}><BarChart3 size={13} />Summary</button>
        </div>
        {status === 'trash' && items.length > 0 && <button onClick={() => setDlg({ empty: true })} className="ml-3 text-sm text-bad hover:underline">Empty Trash</button>}
      </div>

      {sel.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/10 px-4 py-2.5 text-sm">
          <span className="font-medium text-ink">{sel.length} selected</span>
          {status === 'trash' ? <><button className="btn-ghost btn-sm" onClick={() => act(sel, 'read')}><RotateCcw size={14} />Restore</button><button className="btn-ghost btn-sm text-bad" onClick={() => setDlg({ ids: sel })}><Trash2 size={14} />Delete permanently</button></>
            : <><button className="btn-ghost btn-sm" onClick={() => act(sel, 'read')}><MailOpen size={14} />Mark read</button><button className="btn-ghost btn-sm" onClick={() => act(sel, 'starred')}><Star size={14} />Star</button><button className="btn-ghost btn-sm" onClick={() => act(sel, 'spam')}><ShieldAlert size={14} />Spam</button><button className="btn-ghost btn-sm text-bad" onClick={() => act(sel, 'trash')}><Trash2 size={14} />Trash</button></>}
        </div>
      )}

      {data === null && <div className="grid h-40 place-items-center text-muted"><Loader2 className="animate-spin" /></div>}
      {data && mode === 'summary' && form && <Summary form={form} items={items} />}
      {data && mode === 'table' && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-line text-xs text-muted"><tr><th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all" checked={items.length > 0 && items.every((e) => sel.includes(e._id))} onChange={() => setSel(items.every((e) => sel.includes(e._id)) ? [] : items.map((e) => e._id))} className="accent-[rgb(var(--signal))]" /></th><th className="px-4 py-3 font-medium">Date</th>{!formId && <th className="px-4 py-3 font-medium">Form</th>}<th className="px-4 py-3 font-medium">From</th>{cols.map((c) => <th key={c.id} className="px-4 py-3 font-medium">{c.label}</th>)}<th className="px-4 py-3 font-medium">Status</th></tr></thead>
            <tbody className="divide-y divide-line">
              {!items.length && <tr><td colSpan={9} className="p-10 text-center text-muted"><Inbox className="mx-auto mb-2" size={22} />No answers here yet.</td></tr>}
              {items.map((e) => (
                <tr key={e._id} onClick={() => { setOpen(e); if (e.status === 'new') act([e._id], 'read'); }} className="cursor-pointer transition hover:bg-raised/50">
                  <td className="px-4 py-3" onClick={(ev) => ev.stopPropagation()}><input type="checkbox" aria-label="Select" checked={sel.includes(e._id)} onChange={() => setSel(sel.includes(e._id) ? sel.filter((i) => i !== e._id) : [...sel, e._id])} className="accent-[rgb(var(--signal))]" /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtDate(e.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  {!formId && <td className="px-4 py-3 text-body">{e.formName}</td>}
                  <td className={cn('px-4 py-3', e.status === 'new' ? 'font-semibold text-ink' : 'text-body')}>{e.name || e.email || 'Anonymous'}{e.payment?.orderNumber && <span className="ml-2 rounded-full bg-good/15 px-2 py-0.5 text-[11px] font-normal text-good">{money(e.payment.amount, e.payment.currency)}</span>}</td>
                  {cols.map((c) => <td key={c.id} className="max-w-[220px] truncate px-4 py-3 text-body">{display(c, e.data?.[c.key])}</td>)}
                  <td className="px-4 py-3"><span className={cn('rounded-full px-2.5 py-0.5 text-xs', tone[e.status])}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!open} onClose={() => setOpen(null)} title={open ? `${open.formName}: ${open.name || open.email || 'Answer'}` : ''} wide>
        {open && (
          <div>
            <dl className="divide-y divide-line rounded-xl border border-line">
              {Object.entries(open.data || {}).filter(([k]) => !k.endsWith('__qty')).map(([k, v]) => {
                const f = data?.forms?.find((x) => String(x._id) === String(open.formId))?.fields?.find((x) => x.key === k);
                const val = display(f || { type: Array.isArray(v) ? 'checkbox' : typeof v === 'object' ? 'grid' : 'text' }, v);
                return <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[200px_1fr]"><dt className="text-sm text-muted">{open.labels?.[k] || f?.label || k}</dt><dd className="whitespace-pre-wrap break-words text-sm text-ink">{f?.type === 'file' ? (Array.isArray(v) ? v : []).map((x) => <a key={x.url} href={x.url} target="_blank" rel="noopener" className="mr-3 text-signal underline">{x.name}</a>) : val}</dd></div>;
              })}
              {open.payment?.orderNumber && <div className="grid gap-1 px-4 py-3 sm:grid-cols-[200px_1fr]"><dt className="text-sm text-muted">Payment</dt><dd className="text-sm text-ink">{money(open.payment.amount, open.payment.currency)} by {open.payment.method}. <a className="text-signal underline" href="/admin/orders">Open Orders</a> and search {open.payment.orderNumber}</dd></div>}
            </dl>
            <p className="mt-3 text-xs text-muted">Sent {fmtDate(open.createdAt, { month: 'long', day: 'numeric', year: 'numeric' })}{open.page ? ` from ${open.page}` : ''}{open.referrer ? `, came from ${open.referrer}` : ''}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {open.email && <a href={`mailto:${open.email}`} className="btn-primary btn-sm">Reply by email</a>}
              <button className="btn-ghost btn-sm" onClick={() => act([open._id], open.status === 'starred' ? 'read' : 'starred')}><Star size={14} />{open.status === 'starred' ? 'Unstar' : 'Star'}</button>
              <button className="btn-ghost btn-sm" onClick={() => act([open._id], open.status === 'spam' ? 'read' : 'spam')}><ShieldAlert size={14} />{open.status === 'spam' ? 'Not spam' : 'Spam'}</button>
              {open.status === 'trash' ? <><button className="btn-ghost btn-sm" onClick={() => act([open._id], 'read')}><RotateCcw size={14} />Restore</button><button className="btn-ghost btn-sm text-bad" onClick={() => setDlg({ ids: [open._id] })}><Trash2 size={14} />Delete permanently</button></> : <button className="btn-ghost btn-sm text-bad" onClick={() => act([open._id], 'trash')}><Trash2 size={14} />Move to Trash</button>}
            </div>
          </div>
        )}
      </Dialog>
      <DeleteDialog open={!!dlg} onClose={() => setDlg(null)} singular="answer" count={dlg?.ids?.length || items.length} inTrash onRestore={async () => { await act(dlg?.ids || items.map((e) => e._id), 'read'); setDlg(null); }} onPermanent={() => del(dlg?.empty ? { emptyTrash: true } : { ids: dlg.ids })} />
    </div>
  );
}

/* Google Forms style summary: counts and bars for choices, averages for ratings, latest text answers. */
function Summary({ form, items }) {
  const rows = (form.fields || []).filter((f) => f.key && FIELD_TYPES[f.type]?.input && f.type !== 'hidden');
  const total = items.length;
  const answers = (f) => items.map((e) => e.data?.[f.key]).filter((v) => v != null && v !== '' && !(Array.isArray(v) && !v.length));
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-surface p-5"><p className="text-sm text-muted">Responses</p><p className="font-display text-4xl font-bold text-ink">{total}</p></div>
      {rows.map((f) => {
        const a = answers(f);
        let body;
        if (['radio', 'select', 'checkbox', 'product'].includes(f.type)) {
          const c = {}; a.flat().forEach((v) => { c[v] = (c[v] || 0) + 1; });
          const entries = Object.entries(c).sort((x, y) => y[1] - x[1]);
          body = <div className="space-y-2">{entries.map(([k, n]) => <Bar key={k} label={k} n={n} of={a.length} />)}{!entries.length && <p className="text-sm text-muted">No answers yet.</p>}</div>;
        } else if (['rating', 'scale'].includes(f.type)) {
          const nums = a.map(Number).filter(Number.isFinite); const avg = nums.length ? nums.reduce((x, y) => x + y, 0) / nums.length : 0; const c = {}; nums.forEach((n) => { c[n] = (c[n] || 0) + 1; });
          body = <div><p className="mb-3 text-sm text-muted">Average <span className="font-display text-2xl font-bold text-ink">{avg.toFixed(1)}</span> from {nums.length} answers</p><div className="space-y-2">{Object.entries(c).sort((x, y) => Number(y[0]) - Number(x[0])).map(([k, n]) => <Bar key={k} label={String(k)} n={n} of={nums.length} />)}</div></div>;
        } else if (f.type === 'grid') {
          body = <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th /> {(f.columns || []).map((c) => <th key={c} className="px-2 py-1.5 text-xs font-medium text-muted">{c}</th>)}</tr></thead><tbody>{(f.rows || []).map((r) => <tr key={r} className="border-t border-line"><th className="py-2 pr-3 text-left font-medium text-ink">{r}</th>{(f.columns || []).map((c) => <td key={c} className="px-2 py-2 text-center tabular-nums text-body">{a.filter((v) => v?.[r] === c).length}</td>)}</tr>)}</tbody></table></div>;
        } else {
          body = <ul className="space-y-1.5">{a.slice(0, 6).map((v, i) => <li key={i} className="rounded-lg bg-base/50 px-3 py-2 text-sm text-body">{display(f, v)}</li>)}{a.length > 6 && <li className="text-xs text-muted">and {a.length - 6} more. Export the CSV to read them all.</li>}{!a.length && <li className="text-sm text-muted">No answers yet.</li>}</ul>;
        }
        return <div key={f.id} className="rounded-2xl border border-line bg-surface p-5"><p className="mb-3 font-semibold text-ink">{f.label}<span className="ml-2 text-xs font-normal text-muted">{a.length} answers</span></p>{body}</div>;
      })}
    </div>
  );
}
const Bar = ({ label, n, of }) => (
  <div><div className="mb-1 flex justify-between text-sm"><span className="text-body">{label}</span><span className="tabular-nums text-muted">{n} ({of ? Math.round((n / of) * 100) : 0}%)</span></div><div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-signal" style={{ width: `${of ? (n / of) * 100 : 0}%` }} /></div></div>
);
