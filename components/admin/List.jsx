'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Check, Minus, Loader2 } from 'lucide-react';
import { RESOURCES } from '@/lib/admin-schema';
import { api } from './api';
import { Notice } from './Editor';
import { money, fmtDate } from '@/lib/utils';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';

export default function List({ resource }) {
  const conf = RESOURCES[resource];
  const [items, setItems] = useState(null); const [q, setQ] = useState(''); const [ro, setRo] = useState(false); const [err, setErr] = useState('');
  useEffect(() => { api(`/api/admin/${resource}`).then((j) => { setItems(j.items); setRo(!!j.readOnly); }).catch((e) => setErr(e.message)); }, [resource]);
  if (!conf) return <p>Unknown section.</p>;
  const list = (items || []).filter((x) => !q || JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));
  const cell = (c, x) => {
    if (c.key === 'platform') return x.platformType === 'custom' ? 'Custom code' : x.cms;
    const v = x[c.key];
    if (c.type === 'bool') return v ? <Check size={16} className="text-good" /> : <Minus size={16} className="text-muted" />;
    if (c.type === 'thumb') return v ? <img src={v} alt="" className="h-12 w-16 rounded-md border border-line object-cover object-top" /> : <div className="h-12 w-16 rounded-md bg-raised" />; // eslint-disable-line
    if (c.type === 'swatch') return <span className="block h-5 w-5 rounded-full" style={{ background: v }} />;
    if (c.type === 'money') return money(v, x.currency);
    if (c.type === 'date') return fmtDate(v, { month: 'short', day: 'numeric', year: 'numeric' });
    return v;
  };
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">{conf.label}<InfoTip size={16} text={SECTION_INFO[resource]} /></h1>
        <div className="flex gap-2">
          <label className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="field w-48 py-2 pl-9 text-sm" /></label>
          <Link href={`/admin/${resource}/new`} className="btn-primary btn-sm"><Plus size={15} />Add {conf.singular}</Link>
        </div>
      </div>
      {ro && <Notice>Showing the built-in starter content. Connect MongoDB and run the seed script to edit and save.</Notice>}
      {err && <Notice bad>{err}</Notice>}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-xs text-muted"><tr>{conf.columns.map((c) => <th key={c.key} className="px-4 py-3 font-medium">{c.label || ''}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {items === null && <tr><td colSpan={9} className="p-10 text-center text-muted"><Loader2 className="mx-auto animate-spin" /></td></tr>}
            {items && !list.length && <tr><td colSpan={9} className="p-10 text-center text-muted">Nothing here yet. Add your first {conf.singular}.</td></tr>}
            {list.map((x) => (
              <tr key={x._id} className="transition hover:bg-raised/50">
                {conf.columns.map((c, i) => (
                  <td key={c.key} className="px-4 py-3">
                    {i === (['thumb', 'swatch'].includes(conf.columns[0].type) ? 1 : 0)
                      ? <Link href={`/admin/${resource}/${x._id}`} className="font-medium text-ink hover:text-signal">{cell(c, x)}</Link> : cell(c, x)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
