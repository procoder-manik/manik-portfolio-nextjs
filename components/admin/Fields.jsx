'use client';
import { useEffect, useRef, useState, createContext, useContext } from 'react';
import InfoTip from '@/components/site/InfoTip';
import { fieldInfo } from '@/lib/field-info';
import { Upload, X, Plus, ChevronUp, ChevronDown, Trash2, Image as ImageIcon, Bold, Italic, Heading2, Heading3, Link2, List, ListOrdered, Quote, Code, Eye, PenLine, Loader2, FolderOpen } from 'lucide-react';
import { get, set, slugify, cn } from '@/lib/utils';
import { renderMarkdown } from '@/lib/markdown';
import { api, upload } from './api';
import AiKeys from './AiKeys';
import RichLine from './RichLine';
import SchemaPanel from './SchemaPanel';
import { BLOCKS, BLOCK_DEFAULTS, blockFields } from '@/lib/blocks';
import * as Lucide from 'lucide-react';
import { analyzeDoc } from '@/lib/seo-analysis';
import { POPUP_TEMPLATES, POPUP_DEFAULTS } from '@/lib/popups';
import { deepMerge } from '@/lib/utils';
import PopupView from '@/components/site/PopupView';
import Cards, { Card } from '@/components/site/cards/Cards';
import { CARD_TEMPLATES, SAMPLE } from '@/lib/card-templates';
import { BannerBox } from './ProjectAi';
import { AiFieldButton, SeoAiPanel, BlockAiButton, aiable } from './AiAssist';
import CoverPrompts from './CoverPrompts';
import { PitchLink, PitchStats } from './PitchFields';
import ThemePreview from './ThemePreview';
import { AI_BLOCK_TYPES } from '@/lib/ai-blocks';
import { systemDef, partDef, pagePath } from '@/lib/system-pages';

const optList = (o = []) => o.map((x) => (typeof x === 'string' ? { value: x, label: x } : x));

export function FieldList({ fields, value, onChange, slugFrom }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-6">
      {fields.map((f, i) => {
        if (f.showIf && !f.showIf(value || {})) return null;
        return (
          <div key={`${f.name}-${i}`} className={f.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
            <Field f={f} value={get(value, f.name)} doc={value} slugFrom={slugFrom} setDoc={onChange} onChange={(v) => onChange(set(value, f.name, v))} />
          </div>
        );
      })}
    </div>
  );
}

/* The admin section (projects, payments, referrals...) so each field finds its own explanation. */
export const InfoScope = createContext('');

function Label({ f, htmlFor, extra }) {
  const info = fieldInfo(f, useContext(InfoScope));
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">{f.label}{f.required && <span className="text-bad"> *</span>}</label>
      <InfoTip text={info} label={`About ${f.label || 'this field'}`} />
      {extra}
    </div>
  );
}
const Hint = ({ f }) => (f.hint ? <p className="mt-1.5 text-xs text-muted">{f.hint}</p> : null);

export function Field({ f, value, onChange, doc, slugFrom, setDoc }) {
  const scope = useContext(InfoScope);
  const id = `f-${f.name.replace(/\W/g, '-')}`;
  const T = f.type;
  if (T === 'seo') return <SerpPreview f={f} doc={doc || {}} />;
  if (T === 'seoAnalysis') return <SeoAnalysis f={f} doc={doc || {}} />;
  if (T === 'socialPreview') return <SocialPreview f={f} doc={doc || {}} />;
  if (T === 'popupTemplates') return <PopupTemplates doc={doc || {}} setDoc={setDoc} />;
  if (T === 'popupPreview') return <PopupPreviewBox doc={doc || {}} />;
  if (T === 'cardsPreview') return <CardsPreview doc={doc || {}} />;
  if (T === 'aiPlan') return <AiPlanView doc={doc || {}} />;
  if (T === 'aiBanner') return <BannerBox doc={doc || {}} setDoc={setDoc} />;
  if (T === 'themePreview') return <ThemePreview doc={doc || {}} />;
  if (T === 'pitchLink') return <PitchLink doc={doc || {}} />;
  if (T === 'pitchStats') return <PitchStats doc={doc || {}} />;
  if (T === 'aiCover') return <CoverPrompts f={f} doc={doc || {}} setDoc={setDoc} />;
  if (T === 'aiSeo') return <SeoAiPanel f={f} doc={doc || {}} setDoc={setDoc} />;
  if (T === 'builtinNote') return <BuiltinNote doc={doc || {}} />;
  if (T === 'menuPlacement') return <MenuPlacement doc={doc || {}} value={value || {}} onChange={onChange} />;
  if (T === 'aiKeys') return <AiKeys />;
  if (T === 'schemaPanel') return <SchemaPanel doc={doc || {}} />;
  if (T === 'note') return <p className="rounded-xl border border-line bg-base/50 px-4 py-3 text-sm text-body [&_a]:font-medium [&_a]:text-signal" dangerouslySetInnerHTML={{ __html: f.html }} />;
  if (T === 'switch') return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-base/50 px-4 py-3">
        <span className="flex items-center gap-1.5 text-sm font-medium text-ink">{f.label}<InfoTip text={fieldInfo(f, scope)} label={`About ${f.label || 'this switch'}`} /></span>
        <button id={id} type="button" role="switch" aria-checked={!!value} onClick={() => onChange(!value)} className={cn('relative h-6 w-11 shrink-0 rounded-full transition', value ? 'bg-signal' : 'bg-line')}>
          <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition', value ? 'left-[22px]' : 'left-0.5')} />
        </button>
      </label>
      <Hint f={f} />
    </div>
  );
  return (
    <div>
      {T !== 'repeater' && <Label f={f} htmlFor={id} extra={aiable(f) ? <AiFieldButton f={f} value={value} onChange={onChange} doc={doc} /> : null} />}
      {T === 'text' || T === 'url' || T === 'email' ? <input id={id} type={T === 'text' ? 'text' : T} value={value || ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className="field" required={f.required} />
        : T === 'number' ? <input id={id} type="number" step="any" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} className="field" required={f.required} />
        : T === 'date' ? <input id={id} type="date" value={value ? String(value).slice(0, 10) : ''} onChange={(e) => onChange(e.target.value || null)} className="field" />
        : T === 'textarea' ? <textarea id={id} rows={3} value={value || ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className="field resize-y" />
        : T === 'slug' ? <SlugInput id={id} value={value} onChange={onChange} source={doc?.[slugFrom]} />
        : T === 'select' ? (
          <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="field">
            <option value="">Choose…</option>{optList(f.options).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>)
        : T === 'segmented' ? (
          <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-base/50 p-1">
            {optList(f.options).map((o) => <button type="button" key={o.value} onClick={() => onChange(o.value)} className={cn('rounded-lg px-3.5 py-2 text-sm font-medium transition', value === o.value ? 'bg-signal text-white' : 'text-body hover:bg-raised')}>{o.label}</button>)}
          </div>)
        : T === 'color' ? (
          <div className="flex items-center gap-3"><input type="color" value={value || '#5B8CFF'} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-transparent" /><input id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} className="field" /></div>)
        : T === 'multiselect' ? <MultiSelect value={value || []} options={f.options} onChange={onChange} />
        : T === 'tags' ? <Tags value={value || []} onChange={onChange} />
        : T === 'list' ? <ListInput value={value || []} onChange={onChange} />
        : T === 'image' ? <MediaInput value={value} onChange={onChange} accept="image/*" />
        : T === 'file' ? <MediaInput value={value} onChange={onChange} accept={f.accept} file />
        : T === 'images' ? <Images value={value || []} onChange={onChange} />
        : T === 'richline' ? <RichLine id={id} value={value} onChange={onChange} f={f} />
        : T === 'markdown' ? <Markdown value={value || ''} onChange={onChange} />
        : T === 'ref' ? <RefSelect id={id} f={f} value={value} onChange={onChange} />
        : T === 'refs' ? <RefMulti f={f} value={value || []} onChange={onChange} />
        : T === 'repeater' ? <Repeater f={f} value={value || []} onChange={onChange} />
        : T === 'blocks' ? <BlocksField value={value || []} onChange={onChange} builtin={doc?.builtin} />
        : T === 'cardTemplate' ? <CardTemplatePicker value={value || 'service'} onChange={onChange} />
        : T === 'datetime' ? <input id={id} type="datetime-local" value={value ? String(value).slice(0, 16) : ''} onChange={(e) => onChange(e.target.value || null)} className="field" />
        : T === 'code' ? <textarea id={id} rows={8} spellCheck={false} value={value || ''} placeholder={f.placeholder || ''} onChange={(e) => onChange(e.target.value)} className="field resize-y font-mono text-[0.85rem] leading-relaxed" />
        : T === 'json' ? <JsonInput id={id} value={value} onChange={onChange} />
        : <input id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} className="field" />}
      {T !== 'repeater' && <Hint f={f} />}
    </div>
  );
}

function SlugInput({ id, value, onChange, source }) {
  return (
    <div className="flex gap-2">
      <input id={id} value={value || ''} onChange={(e) => onChange(slugify(e.target.value))} placeholder="auto from the title" className="field font-mono text-sm" />
      <button type="button" onClick={() => onChange(slugify(source || ''))} className="btn-ghost btn-sm shrink-0">From title</button>
    </div>
  );
}

function MultiSelect({ value, options = [], onChange }) {
  const [add, setAdd] = useState('');
  const all = [...new Set([...options, ...value])];
  const toggle = (o) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <div className="rounded-xl border border-line bg-base/50 p-3">
      <div className="flex flex-wrap gap-1.5">
        {all.map((o) => <button type="button" key={o} onClick={() => toggle(o)} className={cn('rounded-full border px-3 py-1 text-xs font-medium transition', value.includes(o) ? 'border-signal bg-signal text-white' : 'border-line text-body hover:border-ink/40')}>{o}</button>)}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={add} onChange={(e) => setAdd(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (add.trim()) { onChange([...new Set([...value, add.trim()])]); setAdd(''); } } }} placeholder="Add another and press Enter" className="field py-2 text-sm" />
      </div>
    </div>
  );
}

function Tags({ value, onChange }) {
  const [t, setT] = useState('');
  const push = () => { const v = t.trim(); if (v && !value.includes(v)) onChange([...value, v]); setT(''); };
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-base/50 p-2">
      {value.map((v) => <span key={v} className="inline-flex items-center gap-1 rounded-full bg-raised px-2.5 py-1 text-xs text-ink">{v}<button type="button" onClick={() => onChange(value.filter((x) => x !== v))} aria-label={`Remove ${v}`}><X size={12} /></button></span>)}
      <input value={t} onChange={(e) => setT(e.target.value)} onBlur={push} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); push(); } else if (e.key === 'Backspace' && !t && value.length) onChange(value.slice(0, -1)); }}
        placeholder={value.length ? '' : 'Type and press Enter'} className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-sm text-ink outline-none" />
    </div>
  );
}

const move = (arr, i, d) => { const a = [...arr]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; };

function ListInput({ value, onChange }) {
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input value={v} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} className="field py-2.5" />
          <div className="flex shrink-0">
            <IconBtn label="Move up" onClick={() => onChange(move(value, i, -1))}><ChevronUp size={15} /></IconBtn>
            <IconBtn label="Move down" onClick={() => onChange(move(value, i, 1))}><ChevronDown size={15} /></IconBtn>
            <IconBtn label="Remove" onClick={() => onChange(value.filter((_, k) => k !== i))}><X size={15} /></IconBtn>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ''])} className="btn-ghost btn-sm"><Plus size={14} />Add line</button>
    </div>
  );
}

const IconBtn = ({ label, onClick, children }) => <button type="button" aria-label={label} title={label} onClick={onClick} className="grid h-10 w-9 place-items-center rounded-lg text-muted hover:bg-raised hover:text-ink">{children}</button>;

export function MediaLibrary({ open, onClose, onPick, accept }) {
  const [items, setItems] = useState(null);
  useEffect(() => { if (open) api('/api/admin/media').then((j) => setItems(j.items)).catch(() => setItems([])); }, [open]);
  if (!open) return null;
  const isImg = (t) => t?.startsWith('image');
  const list = (items || []).filter((m) => !accept || accept === '*' || (accept.startsWith('image') ? isImg(m.type) : accept.startsWith('video') ? m.type?.startsWith('video') : true));
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-surface" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4"><h3 className="font-semibold">Media library</h3><button onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-5 sm:grid-cols-5">
          {items === null && <p className="col-span-full text-sm text-muted">Loading…</p>}
          {items && !list.length && <p className="col-span-full text-sm text-muted">Nothing uploaded yet. Use the Upload button instead.</p>}
          {list.map((m) => (
            <button key={m._id} type="button" onClick={() => { onPick(m.url); onClose(); }} className="group overflow-hidden rounded-xl border border-line bg-raised text-left hover:border-signal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {isImg(m.type) ? <img src={m.url} alt="" className="aspect-square w-full object-cover object-top" /> : <div className="grid aspect-square place-items-center text-xs text-muted">{m.type}</div>}
              <p className="truncate px-2 py-1.5 text-xs text-muted">{m.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MediaInput({ value, onChange, accept = 'image/*', file }) {
  const ref = useRef(); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [lib, setLib] = useState(false);
  const go = async (files) => { if (!files?.length) return; setBusy(true); setErr(''); try { const [r] = await upload(files); onChange(r.url); } catch (e) { setErr(e.message); } setBusy(false); };
  const isImg = !file || /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(value || '');
  return (
    <div className="rounded-xl border border-dashed border-line bg-base/40 p-3" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); go(e.dataTransfer.files); }}>
      <div className="flex gap-4">
        {!file && (
          <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-raised">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {value && isImg ? <img src={value} alt="" className="h-full w-full object-cover object-top" /> : <div className="grid h-full place-items-center text-muted"><ImageIcon size={22} /></div>}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Paste a link, or upload" className="field py-2 text-sm" />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => ref.current?.click()} className="btn-ghost btn-sm" disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}{busy ? 'Uploading…' : 'Upload'}</button>
            <button type="button" onClick={() => setLib(true)} className="btn-ghost btn-sm"><FolderOpen size={14} />Library</button>
            {value && <button type="button" onClick={() => onChange('')} className="btn-ghost btn-sm text-bad"><X size={14} />Remove</button>}
          </div>
          {err && <p className="text-xs text-bad">{err}</p>}
          <p className="text-xs text-muted">You can also drop a file here.</p>
        </div>
      </div>
      <input ref={ref} type="file" accept={accept} hidden onChange={(e) => go(e.target.files)} />
      <MediaLibrary open={lib} onClose={() => setLib(false)} onPick={onChange} accept={accept} />
    </div>
  );
}

function Images({ value, onChange }) {
  const ref = useRef(); const [busy, setBusy] = useState(false); const [lib, setLib] = useState(false);
  const go = async (files) => { if (!files?.length) return; setBusy(true); try { const r = await upload(files); onChange([...value, ...r.map((x) => x.url)]); } catch (e) { alert(e.message); } setBusy(false); };
  return (
    <div className="rounded-xl border border-dashed border-line bg-base/40 p-3" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); go(e.dataTransfer.files); }}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {value.map((v, i) => (
          <div key={v + i} className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-raised">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v} alt="" className="h-full w-full object-cover object-top" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 opacity-0 transition group-hover:opacity-100">
              <IconBtn label="Move left" onClick={() => onChange(move(value, i, -1))}><ChevronUp size={14} className="-rotate-90 text-white" /></IconBtn>
              <IconBtn label="Remove" onClick={() => onChange(value.filter((_, k) => k !== i))}><Trash2 size={14} className="text-white" /></IconBtn>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => ref.current?.click()} className="grid aspect-square place-items-center rounded-lg border border-line text-muted hover:border-signal hover:text-ink">{busy ? <Loader2 className="animate-spin" size={18} /> : <Plus size={20} />}</button>
      </div>
      <button type="button" onClick={() => setLib(true)} className="btn-ghost btn-sm mt-3"><FolderOpen size={14} />Pick from library</button>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => go(e.target.files)} />
      <MediaLibrary open={lib} onClose={() => setLib(false)} onPick={(u) => onChange([...value, u])} accept="image/*" />
    </div>
  );
}

export function Markdown({ value, onChange }) {
  const ta = useRef(); const file = useRef(); const [preview, setPreview] = useState(false); const [busy, setBusy] = useState(false);
  const wrap = (before, after = before, ph = 'text') => {
    const el = ta.current; const s = el.selectionStart, e = el.selectionEnd; const sel = value.slice(s, e) || ph;
    onChange(value.slice(0, s) + before + sel + after + value.slice(e));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + sel.length); });
  };
  const line = (prefix) => {
    const el = ta.current; const s = el.selectionStart; const start = value.lastIndexOf('\n', s - 1) + 1;
    onChange(value.slice(0, start) + prefix + value.slice(start));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + prefix.length, s + prefix.length); });
  };
  const img = async (files) => { if (!files?.length) return; setBusy(true); try { const [r] = await upload(files); wrap('![', `](${r.url})`, 'image description'); } catch (e) { alert(e.message); } setBusy(false); };
  const tools = [[Bold, 'Bold', () => wrap('**')], [Italic, 'Italic', () => wrap('_')], [Heading2, 'Heading', () => line('## ')], [Heading3, 'Subheading', () => line('### ')],
    [Link2, 'Link', () => wrap('[', '](https://)', 'link text')], [List, 'Bullet list', () => line('- ')], [ListOrdered, 'Numbered list', () => line('1. ')], [Quote, 'Quote', () => line('> ')], [Code, 'Code', () => wrap('`')]];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-base/50 focus-within:border-signal">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface px-2 py-1.5">
        {tools.map(([I, l, fn]) => <button key={l} type="button" title={l} aria-label={l} onClick={fn} disabled={preview} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-raised hover:text-ink disabled:opacity-40"><I size={15} /></button>)}
        <button type="button" title="Insert image" onClick={() => file.current?.click()} disabled={preview || busy} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-raised hover:text-ink">{busy ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}</button>
        <span className="flex-1" />
        <button type="button" onClick={() => setPreview(!preview)} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-body hover:bg-raised">{preview ? <><PenLine size={13} />Write</> : <><Eye size={13} />Preview</>}</button>
      </div>
      {preview
        ? <div className="prose-site min-h-[320px] p-5" dangerouslySetInnerHTML={{ __html: renderMarkdown(value).html }} />
        : <textarea ref={ta} value={value} onChange={(e) => onChange(e.target.value)} rows={16} className="block w-full resize-y bg-transparent p-4 font-mono text-[0.9rem] leading-relaxed text-ink outline-none" placeholder="Write here. Use ## for headings, - for lists." />}
      <input ref={file} type="file" accept="image/*" hidden onChange={(e) => img(e.target.files)} />
    </div>
  );
}

/* Pick several items from another list (for example the projects to show on a service area page). Shown as chips. */
function RefMulti({ f, value, onChange }) {
  const [opts, setOpts] = useState(null);
  useEffect(() => { api(`/api/admin/${f.source}`).then((j) => setOpts(j.items || [])).catch(() => setOpts([])); }, [f.source]);
  const toggle = (k) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  if (opts === null) return <p className="text-sm text-muted">Loading…</p>;
  if (!opts.length) return <p className="text-sm text-muted">Nothing to pick yet. Add some in {f.source} first.</p>;
  return (
    <div className="rounded-xl border border-line bg-base/50 p-3">
      <div className="flex flex-wrap gap-1.5">
        {opts.map((o) => { const k = o[f.valueKey]; const on = value.includes(k); return <button type="button" key={o._id} onClick={() => toggle(k)} aria-pressed={on} className={cn('rounded-full border px-3 py-1 text-xs font-medium transition', on ? 'border-signal bg-signal text-white' : 'border-line text-body hover:border-signal/60')}>{o[f.labelKey]}</button>; })}
      </div>
      <p className="mt-2 text-xs text-muted">{value.length ? `${value.length} selected` : 'None selected: the site picks the latest matching work for you.'}</p>
    </div>
  );
}

function RefSelect({ id, f, value, onChange }) {
  const [opts, setOpts] = useState([]);
  useEffect(() => { api(`/api/admin/${f.source}`).then((j) => setOpts(j.items)).catch(() => {}); }, [f.source]);
  return (
    <select id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} className="field" required={f.required}>
      <option value="">Choose…</option>
      {opts.map((o) => <option key={o._id} value={o[f.valueKey]}>{o[f.labelKey]}</option>)}
    </select>
  );
}

function Repeater({ f, value, onChange }) {
  const [open, setOpen] = useState(() => (value.length <= 3 ? value.map((_, i) => i) : []));
  const titleOf = (item) => { const k = f.fields.find((x) => ['text', 'textarea'].includes(x.type))?.name; return (k && item?.[k]) || `Item`; };
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">{f.label} <span className="font-normal text-muted">({value.length})</span></p>
      <div className="space-y-2">
        {value.map((item, i) => {
          const isOpen = open.includes(i);
          return (
            <div key={i} className="rounded-xl border border-line bg-base/40">
              <div className="flex items-center gap-1 px-3 py-2">
                <button type="button" onClick={() => setOpen(isOpen ? open.filter((x) => x !== i) : [...open, i])} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium text-ink">
                  <ChevronDown size={15} className={cn('shrink-0 text-muted transition', isOpen ? '' : '-rotate-90')} /><span className="truncate">{String(titleOf(item)).slice(0, 80)}</span>
                </button>
                <IconBtn label="Move up" onClick={() => onChange(move(value, i, -1))}><ChevronUp size={15} /></IconBtn>
                <IconBtn label="Move down" onClick={() => onChange(move(value, i, 1))}><ChevronDown size={15} /></IconBtn>
                <IconBtn label="Remove" onClick={() => { if (confirm('Remove this item?')) onChange(value.filter((_, k) => k !== i)); }}><Trash2 size={15} /></IconBtn>
              </div>
              {isOpen && <div className="border-t border-line p-4"><FieldList fields={f.fields} value={item || {}} onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))} /></div>}
            </div>
          );
        })}
      </div>
      <button type="button" onClick={() => { onChange([...value, {}]); setOpen([...open, value.length]); }} className="btn-ghost btn-sm mt-3"><Plus size={14} />Add {f.label.toLowerCase().replace(/s$/, '')}</button>
      {f.hint && <p className="mt-1.5 text-xs text-muted">{f.hint}</p>}
    </div>
  );
}

/* Page builder: add pre-built sections, reorder, duplicate, hide and edit them. */
function BlocksField({ value, onChange, builtin }) {
  const [picker, setPicker] = useState(false);
  const [open, setOpen] = useState(null);
  const add = (type) => { onChange([...value, { type, ...(BLOCK_DEFAULTS[type] || {}) }]); setOpen(value.length); setPicker(false); };
  const addPart = (part) => { onChange([...value, { type: 'core', part }]); setPicker(false); };
  const sys = systemDef(builtin);
  const missing = sys ? sys.parts.filter((p) => !value.some((b) => b?.type === 'core' && b.part === p.id)) : [];
  const meta = (b) => (b.type === 'core' ? { ...(partDef(builtin, b.part) || { label: `Unknown part (${b.part})`, desc: 'This part no longer exists. You can delete it.' }), icon: 'LayoutTemplate' } : BLOCKS[b.type] || {});
  const upd = (i, v) => onChange(value.map((x, k) => (k === i ? v : x)));
  const BI = ({ name, size = 16 }) => { const C = Lucide[name] || Lucide.Square; return <C size={size} />; };
  const summary = (b) => b.heading || b.content?.slice(0, 60) || b.caption || meta(b).desc || '';
  return (
    <div>
      <div className="space-y-2">
        {value.map((b, i) => (
          <div key={i} className={cn('rounded-xl border bg-base/40', open === i ? 'border-signal' : 'border-line', b.hidden && 'opacity-60')}>
            <div className="flex items-center gap-1 px-3 py-2">
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg', b.type === 'core' ? 'bg-amber/15 text-amber' : 'bg-signal/15 text-signal')}><BI name={meta(b).icon} /></span>
                <span className="min-w-0"><span className="flex items-center gap-2 text-sm font-semibold text-ink">{meta(b).label || b.type}{b.hidden ? ' (hidden)' : ''}{b.type === 'core' && <span className="rounded-full bg-amber/15 px-1.5 py-px text-[10px] font-medium text-amber">Built-in</span>}</span><span className="block truncate text-xs text-muted">{String(summary(b)).slice(0, 80)}</span></span>
              </button>
              <IconBtn label="Move up" onClick={() => onChange(move(value, i, -1))}><ChevronUp size={15} /></IconBtn>
              <IconBtn label="Move down" onClick={() => onChange(move(value, i, 1))}><ChevronDown size={15} /></IconBtn>
              <IconBtn label={b.hidden ? 'Show' : 'Hide'} onClick={() => upd(i, { ...b, hidden: !b.hidden })}>{b.hidden ? <Lucide.EyeOff size={15} /> : <Eye size={15} />}</IconBtn>
              {(b.type === 'core' ? meta(b).fields?.length > 0 : AI_BLOCK_TYPES.includes(b.type)) && <BlockAiButton b={b} label={meta(b).label} partLabel={b.type === 'core' ? meta(b).label : undefined} outline={value.filter((x) => x && !x.hidden).map((x) => meta(x).label || x.type)} onChange={(v) => upd(i, v)} />}
              {b.type !== 'core' && <IconBtn label="Duplicate" onClick={() => { const a = [...value]; a.splice(i + 1, 0, JSON.parse(JSON.stringify(b))); onChange(a); }}><Lucide.Copy size={15} /></IconBtn>}
              <IconBtn label="Delete" onClick={() => { if (confirm(b.type === 'core' ? 'Remove this built-in part from the page? You can add it back with Add section.' : 'Delete this section?')) onChange(value.filter((_, k) => k !== i)); }}><Trash2 size={15} /></IconBtn>
            </div>
            {open === i && <div className="border-t border-line p-4">{b.type === 'core' ? <CorePart b={b} def={meta(b)} onChange={(v) => upd(i, v)} /> : <FieldList fields={blockFields(b.type)} value={b} onChange={(v) => upd(i, v)} />}</div>}
          </div>
        ))}
        {!value.length && <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">No sections yet. Add your first one.</p>}
      </div>
      {picker ? (
        <div className="mt-3 rounded-2xl border border-line bg-base/60 p-3">
          <div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold text-ink">Pick a section</p><button type="button" onClick={() => setPicker(false)} aria-label="Close"><X size={16} /></button></div>
          {missing.length > 0 && (<>
            <p className="mb-2 mt-1 text-xs font-medium text-amber">Built-in parts of this page you removed</p>
            <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {missing.map((p) => (
                <button type="button" key={p.id} onClick={() => addPart(p.id)} className="flex items-start gap-3 rounded-xl border border-amber/40 bg-surface p-3 text-left transition hover:border-amber">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber/15 text-amber"><BI name="LayoutTemplate" /></span>
                  <span><span className="block text-sm font-semibold text-ink">{p.label}</span><span className="block text-xs text-muted">{p.desc}</span></span>
                </button>
              ))}
            </div>
            <p className="mb-2 text-xs font-medium text-muted">Ready-made sections</p>
          </>)}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(BLOCKS).map(([k, d]) => (
              <button type="button" key={k} onClick={() => add(k)} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3 text-left transition hover:border-signal">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-signal/15 text-signal"><BI name={d.icon} /></span>
                <span><span className="block text-sm font-semibold text-ink">{d.label}</span><span className="block text-xs text-muted">{d.desc}</span></span>
              </button>
            ))}
          </div>
        </div>
      ) : <button type="button" onClick={() => setPicker(true)} className="btn-primary btn-sm mt-3"><Plus size={14} />Add section</button>}
    </div>
  );
}


/* A built-in part of a page (Portfolio grid, Blog posts...). Its content comes from elsewhere; some parts have their own heading and intro. */
function CorePart({ b, def, onChange }) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-line bg-base/50 px-4 py-3 text-sm text-body">{def.desc}.{def.editHref && <> The content comes from <a href={def.editHref} target="_blank" rel="noopener" className="font-medium text-signal">this admin screen</a>.</>} Use the arrows to move it, the eye to hide it, the bin to remove it.</p>
      {def.fields?.length > 0 && <FieldList fields={def.fields} value={b} onChange={onChange} />}
    </div>
  );
}

/* Top of a built-in page in the editor: what it is and where its content lives. */
function BuiltinNote({ doc }) {
  const def = systemDef(doc.builtin); if (!def) return null;
  return (
    <div className="rounded-xl border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-body">
      <p><b className="text-ink">Built-in page</b> at <a href={def.path} target="_blank" rel="noopener" className="font-mono text-signal">{def.path}</a>. Its address cannot change{def.key === 'home' ? ' and it is always on' : ', but you can switch it off'}. In the <b className="text-ink">Sections</b> tab you can reorder, hide or remove its parts and add your own sections between them.</p>
      {def.editHref && <p className="mt-1.5">Its content is edited in <a href={def.editHref} className="font-medium text-signal">{def.editLabel}</a>.</p>}
      {def.key === 'caseStudies' && <p className="mt-1.5">The page also needs Case studies switched on in <a href="/admin/settings/site" className="font-medium text-signal">Site and contact &gt; Features</a>.</p>}
    </div>
  );
}

/* Menu switches for a page. They write straight into Header and footer when you save, so that list stays the one source of truth. */
function MenuPlacement({ doc, value, onChange }) {
  const [cols, setCols] = useState(null);
  useEffect(() => { api('/api/admin/settings/navigation').then((j) => setCols((j.item?.footerColumns || []).map((c) => c.title || 'Untitled column'))).catch(() => setCols([])); }, []);
  const v = value || {}; const set = (k, x) => onChange({ ...v, [k]: x });
  const Sw = ({ k, label }) => (
    <button type="button" role="switch" aria-checked={!!v[k]} onClick={() => set(k, !v[k])} className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-base/50 px-4 py-3 text-left">
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition', v[k] ? 'bg-signal' : 'bg-line')}><span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition', v[k] ? 'left-[22px]' : 'left-0.5')} /></span>
    </button>
  );
  return (
    <div className="rounded-xl border border-line p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-1.5 text-sm font-semibold text-ink">Menus<InfoTip text="Adds or removes this page's link in the header menu and in a footer column when you save. The order of links is changed in Header and footer." /></p><a href="/admin/settings/navigation" className="text-xs font-medium text-signal">Reorder links in Header and footer</a></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Sw k="header" label="Show in the header menu" />
          {v.header && <input value={v.headerLabel || ''} onChange={(e) => set('headerLabel', e.target.value)} placeholder={`Link text (empty: ${doc.title || 'page title'})`} className="field py-2 text-sm" />}
        </div>
        <div className="space-y-2">
          <Sw k="footer" label="Show in the footer" />
          {v.footer && (<>
            <input value={v.footerLabel || ''} onChange={(e) => set('footerLabel', e.target.value)} placeholder={`Link text (empty: ${doc.title || 'page title'})`} className="field py-2 text-sm" />
            <select value={v.column ?? 0} onChange={(e) => set('column', Number(e.target.value))} className="field py-2 text-sm">
              {(cols?.length ? cols : ['First column']).map((t, i) => <option key={i} value={i}>Footer column: {t}</option>)}
            </select>
          </>)}
        </div>
      </div>
      {doc.published === false && doc.builtin !== 'home' && <p className="mt-3 text-xs text-amber">This page is switched off, so its links are hidden on the site until you publish it again.</p>}
      <p className="mt-3 text-xs text-muted">Address: <span className="font-mono">{pagePath(doc)}</span></p>
    </div>
  );
}

/* Google-style preview with length meters for the SEO tab. */
let seoCtx = null;
function SerpPreview({ f, doc }) {
  const [ctx, setCtx] = useState(seoCtx); const [host, setHost] = useState('yoursite.com');
  useEffect(() => {
    setHost(window.location.host);
    if (seoCtx) return;
    Promise.all([api('/api/admin/settings/seo').catch(() => ({})), api('/api/admin/settings/site').catch(() => ({}))])
      .then(([i, s]) => { seoCtx = { template: i.item?.titleTemplate || '%s', name: s.item?.name || '', home: s.item?.seoTitle || '', homeDesc: s.item?.seoDescription || '' }; setCtx(seoCtx); });
  }, []);
  const base = f.base ? get(doc, f.base) || {} : doc;
  const own = String(base.seoTitle || '').trim();
  const fallbackTitle = f.titleFrom ? doc[f.titleFrom] : '';
  const title = own || (f.exact ? '' : fallbackTitle ? (ctx?.template || '%s').replace('%s', fallbackTitle) : '') || ctx?.home || 'Untitled';
  const desc = String(base.seoDescription || '').trim() || (f.descFrom ? doc[f.descFrom] : '') || '';
  let path = '/'; try { path = f.path ? f.path(doc) : '/'; } catch {}
  const Meter = ({ n, lo, hi, label }) => {
    const tone = !n ? 'bg-line' : n < lo ? 'bg-amber' : n <= hi ? 'bg-good' : 'bg-bad';
    return (
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="w-24">{label}</span>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"><span className={cn('block h-full rounded-full transition-all', tone)} style={{ width: `${Math.min(100, (n / (hi * 1.15)) * 100)}%` }} /></span>
        <span className={cn('w-20 text-right tabular-nums', n > hi && 'text-bad')}>{n} / {hi}</span>
      </div>
    );
  };
  return (
    <div>
      {f.label && <p className="mb-2 text-sm font-semibold text-ink">{f.label}</p>}
      <div className="rounded-2xl border border-line bg-white p-4 font-[arial,sans-serif] shadow-sm">
        <p className="truncate text-[13px] text-[#4d5156]">{host}{path === '/' ? '' : ` › ${path.replace(/^\//, '').split('/').filter(Boolean).join(' › ')}`}</p>
        <p className="mt-1 line-clamp-1 text-[19px] leading-snug text-[#1a0dab]">{title}</p>
        <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-[#4d5156]">{desc || <span className="italic text-[#9aa0a6]">No description yet. Google will pick text from the page.</span>}</p>
        {base.seoNoindex && <p className="mt-2 text-xs font-medium text-[#b3261e]">Hidden from Google (noindex)</p>}
      </div>
      <div className="mt-3 space-y-1.5">
        <Meter n={title.length} lo={30} hi={60} label="Title length" />
        <Meter n={desc.length} lo={70} hi={160} label="Description" />
      </div>
    </div>
  );
}


function JsonInput({ id, value, onChange }) {
  const text = typeof value === 'string' ? value : value ? JSON.stringify(value, null, 2) : '';
  let err = '';
  if (text.trim()) { try { JSON.parse(text); } catch (e) { err = 'This is not valid JSON yet: ' + e.message; } }
  return (
    <div>
      <textarea id={id} rows={9} spellCheck={false} value={text} onChange={(e) => onChange(e.target.value)} placeholder={'{ "@type": "Organization", "name": "..." }'} className="field resize-y font-mono text-[0.85rem] leading-relaxed" />
      {err ? <p className="mt-1.5 text-xs text-bad">{err}</p> : text.trim() ? <p className="mt-1.5 text-xs text-good">Valid JSON</p> : null}
    </div>
  );
}

let seoTpl = null;
/* Rank Math style checklist: score ring and grouped pass, warn, fail rows. Updates while you type. */
function SeoAnalysis({ f, doc }) {
  const [tpl, setTpl] = useState(seoTpl || '%s'); const [open, setOpen] = useState({});
  useEffect(() => { if (seoTpl) return; api('/api/admin/settings/seo').then((j) => { seoTpl = j.item?.titleTemplate || '%s'; setTpl(seoTpl); }).catch(() => {}); }, []);
  let path = '/'; try { path = f.path ? f.path(doc) : '/'; } catch {}
  const r = analyzeDoc(doc, { path, titleFrom: f.titleFrom, descFrom: f.descFrom, template: tpl, contentAware: f.contentAware });
  const tone = { good: 'text-good', ok: 'text-amber', bad: 'text-bad' };
  const bg = { good: 'bg-good', ok: 'bg-amber', bad: 'bg-bad' };
  const groups = [...new Set(r.checks.map((c) => c.group))];
  const circ = 2 * Math.PI * 26;
  return (
    <div className="rounded-2xl border border-line bg-base/40 p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90" aria-hidden>
          <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6" className="stroke-line" />
          <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(r.score / 100) * circ} ${circ}`} className={r.tone === 'good' ? 'stroke-good' : r.tone === 'ok' ? 'stroke-amber' : 'stroke-bad'} />
        </svg>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">SEO score <span className={cn('text-lg font-bold tabular-nums', tone[r.tone])}>{r.score}</span><span className="text-muted">/ 100</span>
            <InfoTip text="A guide, not a promise. It checks the page against the focus keyword and common on-page SEO rules, like Rank Math and Yoast. 80 and above is good. Writing for people first matters more than a perfect score." /></p>
          <p className="mt-0.5 text-xs text-muted">{r.checks.filter((c) => c.status === 'good').length} passed, {r.checks.filter((c) => c.status === 'ok').length} to improve, {r.checks.filter((c) => c.status === 'bad').length} to fix. {r.words ? `${r.words} words.` : ''}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {groups.map((g) => {
          const list = r.checks.filter((c) => c.group === g); const bad = list.filter((c) => c.status !== 'good').length; const isOpen = open[g] ?? bad > 0;
          return (
            <div key={g} className="rounded-xl border border-line bg-surface/60">
              <button type="button" onClick={() => setOpen({ ...open, [g]: !isOpen })} className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm font-medium text-ink">
                <span>{g}</span><span className="flex items-center gap-2 text-xs text-muted">{bad ? `${bad} to review` : 'All good'}<ChevronDown size={14} className={cn('transition', isOpen ? '' : '-rotate-90')} /></span>
              </button>
              {isOpen && (
                <ul className="space-y-1.5 border-t border-line px-3.5 py-3">
                  {list.map((c) => (
                    <li key={c.id} className="flex items-start gap-2.5 text-[0.84rem] text-body">
                      <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', bg[c.status])} />
                      <span>{c.label}<InfoTip className="ml-1 align-middle" size={12} text={c.tip} /></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SocialPreview({ f, doc }) {
  const [host, setHost] = useState('yoursite.com'); useEffect(() => setHost(window.location.host), []);
  const title = doc.ogTitle || doc.seoTitle || doc[f.titleFrom] || 'Untitled';
  const desc = doc.ogDescription || doc.seoDescription || (f.descFrom ? doc[f.descFrom] : '') || '';
  const img = doc.seoImage || doc.cover || doc.scrollImage || doc.bannerImage || doc.image;
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink">How it looks when shared</p>
      <div className="max-w-md overflow-hidden rounded-xl border border-[#dadde1] bg-white font-[arial,sans-serif] shadow-sm">
        <div className="aspect-[1.91/1] w-full bg-[#f0f2f5]">{img ? <img src={img} alt="" className="h-full w-full object-cover object-top" /> : <div className="grid h-full place-items-center text-xs text-[#65676b]">No share image yet</div>}</div>
        <div className="border-t border-[#dadde1] bg-[#f0f2f5] px-3 py-2.5">
          <p className="text-[11px] uppercase text-[#65676b]">{host}</p>
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#050505]">{title}</p>
          <p className="line-clamp-1 text-[13px] text-[#65676b]">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function PopupTemplates({ doc, setDoc }) {
  const apply = (t) => {
    if (doc._id && !confirm('Replace the design and content with this template? Your trigger and targeting rules stay the same.')) return;
    const base = deepMerge(POPUP_DEFAULTS, t.doc);
    setDoc({ ...doc, template: t.id, layout: base.layout, position: base.position, size: base.size, contentType: base.contentType, content: base.content, design: base.design, trigger: doc._id ? doc.trigger : base.trigger, frequency: doc._id ? doc.frequency : base.frequency });
  };
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">Start from a template<InfoTip text="Pick a ready-made design, then change the text, image, colours and rules. You can change everything afterwards, or write your own HTML." /></p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {POPUP_TEMPLATES.map((t) => (
          <button type="button" key={t.id} onClick={() => apply(t)} className={cn('rounded-xl border p-3 text-left transition hover:border-signal', doc.template === t.id ? 'border-signal bg-signal/10' : 'border-line bg-base/40')}>
            <span className="block text-sm font-semibold text-ink">{t.name}</span><span className="mt-0.5 block text-xs text-muted">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PopupPreviewBox({ doc }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">Live preview<InfoTip text="This is how the popup looks. It updates as you change the settings. Bars, slide-ins and drawers are shown inside this box instead of on the page edge." /></p>
      <div className="relative min-h-[420px] overflow-x-hidden rounded-2xl border border-line bg-[repeating-linear-gradient(45deg,rgb(var(--raised)/.5),rgb(var(--raised)/.5)_12px,transparent_12px,transparent_24px)]">
        <PopupView popup={{ ...POPUP_DEFAULTS, ...doc, content: { ...POPUP_DEFAULTS.content, ...(doc.content || {}) }, design: { ...POPUP_DEFAULTS.design, ...(doc.design || {}) } }} preview />
      </div>
    </div>
  );
}


function CardTemplatePicker({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {CARD_TEMPLATES.map((t) => (
        <button type="button" key={t.id} onClick={() => onChange(t.id)} aria-pressed={value === t.id} className={cn('overflow-hidden rounded-2xl border text-left transition hover:border-signal', value === t.id ? 'border-signal bg-signal/10 ring-2 ring-signal/30' : 'border-line bg-base/40')}>
          <div className="pointer-events-none relative h-44 overflow-hidden border-b border-line bg-base p-3" aria-hidden>
            <div style={{ width: '200%', transform: 'scale(.5)', transformOrigin: 'top left' }}>{t.id === 'custom' ? <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-line text-2xl text-muted">{'</>'}</div> : <Card t={t.id} it={SAMPLE[t.id]} i={0} />}</div>
          </div>
          <div className="p-3"><p className="flex items-center justify-between text-sm font-semibold text-ink">{t.name}{value === t.id && <span className="rounded-full bg-signal px-2 py-0.5 text-[10px] font-medium text-white">Selected</span>}</p><p className="mt-0.5 text-xs text-muted">{t.desc}</p></div>
        </button>
      ))}
    </div>
  );
}

function CardsPreview({ doc }) {
  const items = (doc.items || []).map((x) => ({ ...x, meta: x.meta || x.time }));
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">Live preview<InfoTip text="How the cards look on your page with the design, layout and cards you chose. It updates as you type." /></p>
      <div className="max-h-[520px] overflow-auto rounded-2xl border border-line bg-base p-5">
        <Cards cfg={{ ...doc, items: items.length ? items : [SAMPLE[doc.template || 'service'], SAMPLE[doc.template || 'service'], SAMPLE[doc.template || 'service']].map((x, i) => ({ ...x, title: `${x.title || 'Card'} ${i + 1}` })), columns: Math.min(Number(doc.columns) || 3, 3) }} />
      </div>
      {!items.length && <p className="mt-1.5 text-xs text-muted">Sample cards are shown until you add your own below.</p>}
    </div>
  );
}


/* Read-only view of what the AI writer prepared for a post: image prompts with copy buttons, outline and FAQ. */
function AiPlanView({ doc }) {
  const m = doc.aiMeta; const [copied, setCopied] = useState('');
  const copy = (k, t) => { navigator.clipboard?.writeText(t).catch(() => {}); setCopied(k); setTimeout(() => setCopied(''), 1500); };
  if (!m) return <p className="rounded-xl border border-dashed border-line p-6 text-sm text-muted">This post was not written with the AI writer, so there is no plan here. Open AI writer in the sidebar to create posts with image prompts and a content score.</p>;
  return (
    <div className="space-y-4">
      {doc.aiScore != null && <p className="text-sm text-body">Content score when saved: <b className="text-ink">{doc.aiScore} / 100</b>. Open it again in the AI writer to rescore.</p>}
      {(m.images || []).filter((im) => im.role !== 'table').map((im) => (
        <div key={im.slot} className="rounded-xl border border-line bg-base/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-ink">Image {im.slot}: {im.role}{im.title ? `, ${im.title}` : ''}{im.ratio ? ` (${im.ratio})` : ''}</p>{im.prompt && <button type="button" onClick={() => copy(`p${im.slot}`, im.prompt)} className="btn-ghost btn-sm">{copied === `p${im.slot}` ? 'Copied' : 'Copy prompt'}</button>}</div>
          {im.instructions && <p className="mt-2 text-sm text-body"><b className="text-ink">How to make it:</b> {im.instructions}{im.tool ? ` Tool: ${im.tool}.` : ''}</p>}
          {im.prompt && <p className="mt-2 whitespace-pre-wrap text-sm text-body">{im.prompt}</p>}
          {im.data && <pre className="mt-2 overflow-x-auto rounded-lg bg-base/60 p-3 text-xs text-body">{im.data}</pre>}
          {im.textOnImage?.filter(Boolean).length > 0 && <p className="mt-2 text-xs text-muted">Text on the image: {im.textOnImage.filter(Boolean).join(' | ')}</p>}
          <p className="mt-1 text-xs text-muted">Alt text: {im.alt}. File name: {im.filename}</p>
        </div>
      ))}
    </div>
  );
}
