'use client';
import { useEffect, useRef, useState } from 'react';
import { Upload, Copy, Loader2, Check } from 'lucide-react';
import { api, upload } from '@/components/admin/api';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';

export default function MediaPage() {
  const [items, setItems] = useState(null); const [busy, setBusy] = useState(false); const [copied, setCopied] = useState(''); const ref = useRef();
  const load = () => api('/api/admin/media').then((j) => setItems(j.items)).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  const go = async (files) => { if (!files?.length) return; setBusy(true); try { await upload(files); await load(); } catch (e) { alert(e.message); } setBusy(false); };
  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); go(e.dataTransfer.files); }}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div><h1 className="flex items-center gap-2 text-2xl font-semibold">Media<InfoTip size={16} text={SECTION_INFO.media} /></h1><p className="mt-1 text-sm text-muted">Drop files anywhere on this page to upload. Images, PDFs and videos are fine.</p></div>
        <button onClick={() => ref.current?.click()} className="btn-primary btn-sm" disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}Upload</button>
        <input ref={ref} type="file" multiple hidden onChange={(e) => go(e.target.files)} />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items === null && <Loader2 className="animate-spin text-muted" />}
        {items && !items.length && <p className="col-span-full rounded-2xl border border-dashed border-line p-12 text-center text-muted">No uploads yet.</p>}
        {(items || []).map((m) => (
          <div key={m._id} className="overflow-hidden rounded-xl border border-line bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {m.type?.startsWith('image') ? <img src={m.url} alt="" className="aspect-[4/3] w-full object-cover object-top" /> : <div className="grid aspect-[4/3] place-items-center bg-raised text-sm text-muted">{m.type}</div>}
            <div className="flex items-center justify-between gap-2 p-2.5">
              <span className="truncate text-xs text-muted">{m.name}</span>
              <button onClick={() => { navigator.clipboard?.writeText(m.url); setCopied(m._id); setTimeout(() => setCopied(''), 1500); }} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-raised" aria-label="Copy link">{copied === m._id ? <Check size={14} className="text-good" /> : <Copy size={14} />}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
