'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Loader2, Save, Trash2, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { DeleteDialog } from './Dialog';
import { STATUS, TRASHABLE } from '@/lib/trash';
import { FieldList, InfoScope } from './Fields';
import { SEO_RES } from '@/lib/admin-schema';
import { analyzeDoc } from '@/lib/seo-analysis';
import { getSeoTpl } from './seoTpl';
import { api } from './api';
import { RESOURCES, SETTINGS } from '@/lib/admin-schema';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';

export default function Editor({ resource, id, settingsKey }) {
  const router = useRouter();
  const conf = settingsKey ? SETTINGS[settingsKey] : RESOURCES[resource];
  const isNew = id === 'new';
  const endpoint = settingsKey ? `/api/admin/settings/${settingsKey}` : isNew ? `/api/admin/${resource}` : `/api/admin/${resource}/${id}`;
  const [doc, setDoc] = useState(isNew ? { ...(conf.defaults || {}) } : null);
  const [readOnly, setReadOnly] = useState(false);
  const [status, setStatus] = useState({ t: '', msg: '' });
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState(0);
  const [dlg, setDlg] = useState(false); const [trashDays, setTrashDays] = useState(30);
  useEffect(() => { if (typeof window !== 'undefined' && window.location.hash === '#seo' && conf?.sections) { const i = conf.sections.findIndex((x) => x.title === 'SEO'); if (i >= 0) setTab(i); } }, [doc ? 1 : 0]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!settingsKey) api('/api/admin/settings/site').then((j) => setTrashDays(j.item?.features?.trashDays ?? 30)).catch(() => {}); }, [settingsKey]);

  useEffect(() => { if (!isNew) api(endpoint).then((j) => { setDoc(j.item); setReadOnly(!!j.readOnly); }).catch((e) => setStatus({ t: 'err', msg: e.message })); }, [endpoint, isNew]);
  useEffect(() => { const h = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [dirty]);

  const save = useCallback(async () => {
    setStatus({ t: 'saving', msg: '' });
    try {
      const j = await api(endpoint, { method: isNew ? 'POST' : 'PUT', body: doc });
      setDoc(j.item); setDirty(false);
      let msg = 'Saved';
      const sc = SEO_RES[resource];
      if (sc && !settingsKey) { try { const r = analyzeDoc(j.item, { path: sc.path(j.item), titleFrom: sc.titleFrom, descFrom: sc.descFrom, template: await getSeoTpl(), contentAware: sc.contentAware !== false }); const weak = r.checks.filter((c) => c.status !== 'good')[0]; msg = `Saved. SEO score ${r.score}/100${weak ? `. Next: ${weak.label}` : '. All checks pass'}`; } catch {} }
      setStatus({ t: 'ok', msg });
      if (isNew) router.replace(`/admin/${resource}/${j.item._id}`);
      setTimeout(() => setStatus((s) => (s.t === 'ok' ? { t: '', msg: '' } : s)), 7000);
    } catch (e) { setStatus({ t: 'err', msg: e.message }); }
  }, [doc, endpoint, isNew, resource, router]);

  useEffect(() => { const h = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [save]);

  const done = () => { setDirty(false); router.push(`/admin/${resource}`); };
  const del = async (mode) => { try { await api(`${endpoint}?mode=${mode}`, { method: 'DELETE' }); done(); } catch (e) { setStatus({ t: 'err', msg: e.message }); setDlg(false); } };
  const patch = async (action) => { try { const j = await api(endpoint, { method: 'PATCH', body: { action } }); setDoc(j.item); setDlg(false); setStatus({ t: 'ok', msg: 'Done' }); setTimeout(() => setStatus({ t: '', msg: '' }), 2000); } catch (e) { setStatus({ t: 'err', msg: e.message }); setDlg(false); } };

  if (!doc) return <div className="grid h-64 place-items-center text-muted">{status.msg || <Loader2 className="animate-spin" />}</div>;
  const title = settingsKey ? conf.label : isNew ? `New ${conf.singular}` : doc.title || doc.name || conf.singular;
  const sections = conf.sections;
  const preview = !settingsKey && !isNew && conf.preview?.(doc);

  return (
    <InfoScope.Provider value={settingsKey || resource}>
    <div>
      <div className="sticky top-0 z-20 -mx-5 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-base/90 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {!settingsKey && <Link href={`/admin/${resource}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line hover:bg-raised" aria-label="Back"><ArrowLeft size={16} /></Link>}
          <h1 className="flex min-w-0 items-center gap-2 text-xl font-semibold"><span className="truncate">{title}</span><InfoTip size={15} text={SECTION_INFO[settingsKey || resource]} /></h1>
          {dirty && <span className="shrink-0 rounded-full bg-amber/15 px-2 py-0.5 text-xs text-amber">Unsaved</span>}
        </div>
        <div className="flex items-center gap-2">
          {status.t === 'ok' && <span className="inline-flex items-center gap-1.5 text-sm text-good"><CheckCircle2 size={15} />Saved</span>}
          {preview && <a href={preview} target="_blank" className="btn-ghost btn-sm"><ExternalLink size={14} />View</a>}
          {!settingsKey && !isNew && <button onClick={() => setDlg(true)} className="btn-ghost btn-sm text-bad"><Trash2 size={14} />{doc.trashedAt ? 'Trash options' : 'Delete'}</button>}
          <button onClick={save} disabled={status.t === 'saving' || readOnly} className="btn-primary btn-sm">{status.t === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{isNew ? 'Create' : 'Save changes'}</button>
        </div>
      </div>
      {doc.trashedAt && <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-body"><span className="flex items-center gap-2"><AlertTriangle size={16} className="text-amber" />This {conf.singular} is in the Trash and hidden from your site.</span><button onClick={() => patch('restore')} className="btn-ghost btn-sm"><RotateCcw size={14} />Restore</button></div>}
      {readOnly && <Notice>Showing the built-in starter content. Connect MongoDB and run the seed script to edit and save.</Notice>}
      {status.t === 'err' && <Notice bad>{status.msg}</Notice>}

      {sections.length > 3 && (
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
          {sections.map((s, i) => <button key={s.title} onClick={() => setTab(i)} className={`shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium transition ${tab === i ? 'border-signal text-ink' : 'border-transparent text-muted hover:text-ink'}`}>{s.title}</button>)}
        </div>
      )}
      <div className="grid gap-6">
        {sections.map((s, i) => (sections.length <= 3 || tab === i) && (
          <section key={s.title} className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
            <h2 className="mb-6 text-lg font-semibold">{s.title}</h2>
            <FieldList fields={s.fields} value={doc} slugFrom={conf.slugFrom} onChange={(v) => { setDoc(v); setDirty(true); }} />
          </section>
        ))}
      </div>
      {sections.length > 3 && (
        <div className="mt-6 flex justify-between">
          <button disabled={tab === 0} onClick={() => setTab(tab - 1)} className="btn-ghost btn-sm">Previous section</button>
          {tab < sections.length - 1 ? <button onClick={() => setTab(tab + 1)} className="btn-ghost btn-sm">Next: {sections[tab + 1].title}</button> : <button onClick={save} className="btn-primary btn-sm"><Save size={14} />{isNew ? 'Create' : 'Save changes'}</button>}
        </div>
      )}
      {!settingsKey && <DeleteDialog open={dlg} onClose={() => setDlg(false)} name={title} singular={conf.singular} canDraft={!!STATUS[resource] && !doc.trashedAt} inTrash={!!doc.trashedAt} trashDays={trashDays}
        onTrash={() => (TRASHABLE.includes(resource) ? del('trash') : del('permanent'))} onDraft={() => patch('draft')} onRestore={() => patch('restore')} onPermanent={() => del('permanent')} />}
    </div>
    </InfoScope.Provider>
  );
}

export function Notice({ children, bad }) {
  return <p className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${bad ? 'border-bad/40 bg-bad/10 text-bad' : 'border-amber/40 bg-amber/10 text-body'}`}><AlertTriangle size={16} className="mt-0.5 shrink-0" />{children}</p>;
}
