'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, Wand2, X, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';
import Dialog from './Dialog';
import { cn } from '@/lib/utils';
import { WORK_TYPES } from '@/lib/project-ai-options';
import { systemDef } from '@/lib/system-pages';

/* What the editor is working on, so any AI button can see the whole page or item. */
export const AiCtx = createContext({ scope: '', getDoc: () => ({}) });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/* Calls the AI. When the free AI is busy (429) it waits once and tries again. */
export async function aiCall(body, onWait = () => {}) {
  const go = async () => {
    const r = await fetch('/api/admin/ai/assist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || `The AI did not answer (${r.status}).`), { status: r.status });
    return j;
  };
  try { return await go(); } catch (e) {
    if (e.status !== 429) throw e;
    for (let s = 20; s > 0; s--) { onWait(s); await sleep(1000); }
    onWait(0); return go();
  }
}
const empty = (v) => v == null || v === '' || (Array.isArray(v) && !v.length);

/* ---------- Which fields get an AI button ---------- */
const NO_AI = /(slug|url|href|link$|email|phone|tel$|whatsapp|calendly|code|css|html|^id$|key$|token|secret|password|icon|colou?r|currency|sku|prefix|template|hex|path|domain|handle|username|placeholder|^name$|client|^value$|before$|after$|^when$|^phase$|^meta$|price|amount|number|date|time|source|label$|robots|canonical|location|address|city|country|area|team|duration|platform|company|business|customPath|font)/i;
const SEO_ONE = ['seoTitle', 'seoDescription', 'ogTitle', 'ogDescription', 'focusKeyword', 'breadcrumbTitle'];
export const aiable = (f) => ['text', 'textarea', 'markdown'].includes(f.type) && f.label && (SEO_ONE.includes(f.name) || !NO_AI.test(f.name.split('.').pop()));

/* ---------- The small AI button next to a field label ---------- */
export function AiFieldButton({ f, value, onChange, doc }) {
  const { scope, getDoc } = useContext(AiCtx);
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(''); const [err, setErr] = useState(''); const [say, setSay] = useState(''); const [wait, setWait] = useState(0);
  const box = useRef(null);
  useEffect(() => { if (!open) return; const h = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [open]);
  const run = async (mode) => {
    setBusy(mode); setErr('');
    try {
      const root = getDoc() || {};
      if (SEO_ONE.includes(f.name)) {
        const j = await aiCall({ task: 'seo', scope, fields: [f.name], doc: root, path: typeof f.path === 'function' ? f.path(root) : root.path, instruction: say }, setWait);
        if (j.seo?.[f.name]) onChange(j.seo[f.name]); else throw new Error('The AI returned nothing for this field. Try again.');
      } else {
        const j = await aiCall({ task: 'field', scope, mode, instruction: say, value, field: { name: f.name, label: f.label, type: f.type, hint: f.hint, placeholder: f.placeholder }, doc, parent: doc === root ? undefined : root }, setWait);
        if (!j.value) throw new Error('The AI returned nothing. Try again.');
        onChange(j.value);
      }
      setOpen(false); setSay('');
    } catch (e) { setErr(e.message); }
    setBusy(''); setWait(0);
  };
  return (
    <span className="relative" ref={box}>
      <button type="button" onClick={() => setOpen(!open)} title="Write with AI" aria-label={`Write ${f.label} with AI`} className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-signal transition hover:bg-signal/10', busy && 'opacity-70')}>
        {busy ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}AI
      </button>
      {open && (
        <div className="absolute left-0 top-7 z-40 w-[300px] rounded-xl border border-line bg-surface p-3 shadow-2xl">
          <input value={say} onChange={(e) => setSay(e.target.value)} placeholder="Optional: what to say or change" className="field py-2 text-sm" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); run(value ? 'improve' : 'write'); } }} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button type="button" disabled={!!busy} onClick={() => run('write')} className="btn-primary btn-sm">{busy === 'write' ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}{value ? 'Write new' : 'Write'}</button>
            {value && !SEO_ONE.includes(f.name) && <>
              <button type="button" disabled={!!busy} onClick={() => run('improve')} className="btn-ghost btn-sm">{busy === 'improve' && <Loader2 size={13} className="animate-spin" />}Improve</button>
              <button type="button" disabled={!!busy} onClick={() => run('shorter')} className="btn-ghost btn-sm">{busy === 'shorter' && <Loader2 size={13} className="animate-spin" />}Shorter</button>
            </>}
          </div>
          {wait > 0 && <p className="mt-2 text-xs text-amber">The free AI is busy. Trying again in {wait} s…</p>}
          {err && <p className="mt-2 text-xs text-bad">{err}</p>}
          <p className="mt-2 text-[11px] text-muted">Uses your site, services and prices. Check facts before saving.</p>
        </div>
      )}
    </span>
  );
}

/* ---------- SEO, Social and Schema tabs: one click for everything ---------- */
const LABELS = { focusKeyword: 'Focus keyword', keywords: 'Related keywords', seoTitle: 'Meta title', seoDescription: 'Meta description', ogTitle: 'Social title', ogDescription: 'Social description', breadcrumbTitle: 'Breadcrumb title', schemaMarkup: 'Schema' };
export function SeoAiPanel({ f, doc, setDoc }) {
  const { scope } = useContext(AiCtx);
  const only = f.only;
  const [kw, setKw] = useState(''); const [fill, setFill] = useState('all'); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState(''); const [wait, setWait] = useState(0);
  const run = async () => {
    setBusy(true); setErr(''); setDone('');
    try {
      const j = await aiCall({ task: 'seo', scope, doc, keyword: kw || doc.focusKeyword, fields: only, path: typeof f.path === 'function' ? f.path(doc) : doc.path }, setWait);
      const got = j.seo || {}; const used = [];
      setDoc((d) => {
        const next = { ...d };
        for (const [k, v] of Object.entries(got)) {
          if (k === 'schemaMarkup') { if (fill === 'empty' && d.schemaMarkup?.type && d.schemaMarkup.type !== 'auto') continue; next.schemaMarkup = { ...(d.schemaMarkup || {}), ...v }; used.push(LABELS[k]); continue; }
          if (fill === 'empty' && !empty(d[k])) continue;
          next[k] = v; used.push(LABELS[k] || k);
        }
        return next;
      });
      setTimeout(() => setDone(used.length ? `Filled: ${[...new Set(used)].join(', ')}. Check it, then save.` : 'Everything already had text. Choose "Replace all" to write new versions.'), 0);
    } catch (e) { setErr(e.message); }
    setBusy(false); setWait(0);
  };
  const title = only?.includes('schema') ? 'Pick the schema with AI' : only ? 'Write the social texts with AI' : 'Write all SEO with AI';
  const desc = only?.includes('schema') ? 'Chooses the best schema type for this page and fills its fields from what is really on the page. Never adds prices, ratings or dates.' : only ? 'A friendlier headline and description for Facebook, LinkedIn, WhatsApp and X.' : 'Focus keyword, related keywords, meta title (with your brand), meta description, social texts, breadcrumb title and schema, in one click.';
  return (
    <div className="rounded-2xl border border-signal/30 bg-gradient-to-br from-signal/10 to-transparent p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><p className="flex items-center gap-2 text-sm font-semibold text-ink"><Sparkles size={15} className="text-signal" />{title}</p><p className="mt-1 max-w-xl text-xs text-muted">{desc}</p></div>
        <button type="button" onClick={run} disabled={busy} className="btn-primary btn-sm shrink-0">{busy ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}{busy ? (wait ? `Busy, retry in ${wait} s` : 'Writing…') : 'Write with AI'}</button>
      </div>
      {!only && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder={doc.focusKeyword ? `Keyword: ${doc.focusKeyword} (or type another)` : 'Optional: the search you want to rank for'} className="field max-w-sm py-2 text-sm" />
          {[['all', 'Replace all'], ['empty', 'Only empty fields']].map(([v, l]) => <button key={v} type="button" onClick={() => setFill(v)} className={cn('rounded-full border px-3 py-1 text-xs', fill === v ? 'border-signal bg-signal/15 text-ink' : 'border-line text-muted')}>{l}</button>)}
        </div>
      )}
      {done && <p className="mt-3 flex items-start gap-1.5 text-xs text-good"><CheckCircle2 size={14} className="mt-px shrink-0" />{done}</p>}
      {err && <p className="mt-3 flex items-start gap-1.5 text-xs text-bad"><AlertTriangle size={14} className="mt-px shrink-0" />{err}</p>}
    </div>
  );
}

/* ---------- A page section: write its texts ---------- */
export function BlockAiButton({ b, label, partLabel, outline, onChange }) {
  const { scope, getDoc } = useContext(AiCtx);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const run = async (e) => {
    e.stopPropagation(); setBusy(true); setErr('');
    try {
      const root = getDoc() || {};
      const j = await aiCall({ task: 'block', scope, block: b, label, part: partLabel, outline, pageTitle: root.title || root.name, parent: { title: root.title, summary: root.summary || root.excerpt, content: root.content } });
      const v = j.block || {};
      onChange({ ...b, ...Object.fromEntries(Object.entries(v).filter(([, x]) => !empty(x))), type: b.type, ...(b.part ? { part: b.part } : {}) });
    } catch (x) { setErr(x.message); alert(x.message); }
    setBusy(false);
  };
  return <button type="button" title={err || 'Write this section with AI'} aria-label="Write this section with AI" onClick={run} disabled={busy} className="grid h-8 w-8 place-items-center rounded-lg text-signal hover:bg-signal/10">{busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}</button>;
}

/* ---------- Pages: write a whole page (or a built-in page's texts) ---------- */
const PAGE_TYPES = [['service', 'Service page'], ['landing', 'Landing page'], ['about', 'About me'], ['location', 'Location page'], ['industry', 'Industry page'], ['resource', 'Guide or resource'], ['legal', 'Legal page'], ['other', 'Something else']];
export function PageAiWizard({ open, onClose, doc, onApply }) {
  const def = systemDef(doc?.builtin);
  const [f, setF] = useState({ type: 'service', topic: '', audience: '', keyword: '', notes: '' });
  const [mode, setMode] = useState('replace'); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [wait, setWait] = useState(0);
  useEffect(() => { if (open) { setErr(''); setF((x) => ({ ...x, topic: doc?.builtin ? '' : x.topic || (doc?.title && doc.title !== 'New page' ? doc.title : '') })); setMode(doc?.blocks?.length > 1 && !doc?.builtin ? 'add' : 'replace'); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const up = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const run = async () => {
    setBusy(true); setErr('');
    try {
      const j = await aiCall({ task: 'page', builtin: doc?.builtin, ...f }, setWait);
      onApply((d) => {
        const next = { ...d, ...(j.seo || {}) };
        if (def) next.blocks = (d.blocks || []).map((b) => (b.type === 'core' && j.parts?.[b.part] ? { ...b, ...j.parts[b.part] } : b));
        else {
          next.blocks = mode === 'add' ? [...(d.blocks || []), ...j.blocks] : j.blocks;
          if (!d.title || d.title === 'New page') next.title = j.title;
          if (!d._id && j.slug) next.slug = j.slug;
          if (j.blocks[0]?.type === 'hero') next.hideTitle = true;
        }
        return next;
      }, j.via);
      onClose();
    } catch (e) { setErr(e.message); }
    setBusy(false); setWait(0);
  };
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} title={def ? `Write the ${def.title} page with AI` : 'Write this page with AI'} wide>
      <div className="space-y-4">
        {def ? <p className="text-sm text-muted">Writes the headings and intros of this page&apos;s built-in parts, plus its meta title, description and the other SEO texts, in your site&apos;s voice. Projects, posts and prices still come from their own screens.</p>
          : <p className="text-sm text-muted">Builds the page from your own section types (hero, cards, steps, pricing, FAQ, call to action...), using your services, prices and pages, and writes its SEO. Nothing is saved until you press Save.</p>}
        {!def && (<>
          <div><p className="mb-2 text-sm font-medium text-ink">What kind of page?</p><div className="flex flex-wrap gap-2">{PAGE_TYPES.map(([v, l]) => <button key={v} type="button" onClick={() => up('type', v)} className={cn('rounded-full border px-3.5 py-1.5 text-sm', f.type === v ? 'border-signal bg-signal/15 text-ink' : 'border-line text-muted hover:text-ink')}>{l}</button>)}</div></div>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">What is it about? <span className="text-bad">*</span></span><input className="field" value={f.topic} onChange={(e) => up('topic', e.target.value)} placeholder="WordPress website design for law firms" autoFocus /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Who is it for?</span><input className="field" value={f.audience} onChange={(e) => up('audience', e.target.value)} placeholder="Small law firms in Canada and Australia" /></label>
        </>)}
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Search to rank for (optional)</span><input className="field" value={f.keyword} onChange={(e) => up('keyword', e.target.value)} placeholder="law firm web design" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Real details to use (optional)</span><textarea rows={3} className="field" value={f.notes} onChange={(e) => up('notes', e.target.value)} placeholder="Anything true the AI should mention. Numbers are used only if you write them here." /></label>
        {!def && <div className="flex flex-wrap items-center gap-2 text-sm"><span className="text-muted">Sections:</span>{[['replace', 'Replace the sections'], ['add', 'Add after the current ones']].map(([v, l]) => <button key={v} type="button" onClick={() => setMode(v)} className={cn('rounded-full border px-3 py-1', mode === v ? 'border-signal bg-signal/15 text-ink' : 'border-line text-muted')}>{l}</button>)}</div>}
        {wait > 0 && <p className="text-sm text-amber">The free AI is busy. Trying again in {wait} s…</p>}
        {err && <p className="rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{err}</p>}
        <div className="flex justify-between gap-2 border-t border-line pt-4">
          <button type="button" onClick={onClose} disabled={busy} className="btn-ghost btn-sm">Cancel</button>
          <button type="button" onClick={run} disabled={busy || (!def && f.topic.trim().length < 3)} className="btn-primary btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{busy ? 'Writing the page…' : 'Write it'}</button>
        </div>
      </div>
    </Dialog>
  );
}

/* ---------- Case studies: write the whole story ---------- */
export function CaseStudyAiWizard({ open, onClose, doc, isNew, onApply, projects = [] }) {
  const [f, setF] = useState({}); const [more, setMore] = useState(false);
  const [mode, setMode] = useState('replace'); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [wait, setWait] = useState(0);
  useEffect(() => { if (open) { setErr(''); setMode(isNew ? 'replace' : 'empty'); setF({ client: doc?.client || '', url: doc?.liveUrl || '', industry: doc?.industry || '', project: doc?.project || '', workTypes: [], problem: '', results: '', duration: doc?.duration || '' }); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const up = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const run = async () => {
    setBusy(true); setErr('');
    try {
      const j = await aiCall({ task: 'caseStudy', ...f }, setWait);
      const cs = j.caseStudy;
      onApply((d) => {
        const next = { ...d };
        for (const [k, v] of Object.entries(cs)) { if (empty(v)) continue; if (k === 'slug' && d._id) continue; if (mode === 'empty' && !empty(d[k])) continue; next[k] = v; }
        return next;
      }, j.via);
      onClose();
    } catch (e) { setErr(e.message); }
    setBusy(false); setWait(0);
  };
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} title={isNew ? 'New case study: tell the AI the story' : 'Write this case study with AI'} wide>
      <div className="space-y-4">
        <p className="text-sm text-muted">Writes the headline, summary, overview, challenges, approach, results and SEO in your site&apos;s voice. Numbers come only from what you type under Results. Nothing is saved until you press {isNew ? 'Create' : 'Save'}.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Client or website <span className="text-bad">*</span></span><input className="field" value={f.client || ''} onChange={(e) => up('client', e.target.value)} placeholder="JS Law" autoFocus /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Website address</span><input className="field" value={f.url || ''} onChange={(e) => up('url', e.target.value)} placeholder="https://jslaw.ca" /></label>
        </div>
        <div><p className="mb-2 text-sm font-medium text-ink">What did you do?</p><div className="flex flex-wrap gap-2">{WORK_TYPES.map((w) => { const on = (f.workTypes || []).includes(w.id); return <button key={w.id} type="button" onClick={() => up('workTypes', on ? f.workTypes.filter((x) => x !== w.id) : [...(f.workTypes || []), w.id])} className={cn('rounded-full border px-3.5 py-1.5 text-sm', on ? 'border-signal bg-signal/15 text-ink' : 'border-line text-muted hover:text-ink')}>{w.label}</button>; })}</div></div>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">The problem</span><textarea rows={2} className="field" value={f.problem || ''} onChange={(e) => up('problem', e.target.value)} placeholder="Old site, slow on phones, few enquiries from Google" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Results (real numbers only)</span><textarea rows={2} className="field" value={f.results || ''} onChange={(e) => up('results', e.target.value)} placeholder="Load time 6.1 s to 1.8 s. Enquiries doubled in 3 months." /></label>
        <div className="rounded-xl border border-line">
          <button type="button" onClick={() => setMore(!more)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-ink">More details (optional)<ChevronDown size={16} className={cn('transition', more && 'rotate-180')} /></button>
          {more && (
            <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-2">
              <label className="block"><span className="mb-1.5 block text-sm text-ink">Industry</span><input className="field" value={f.industry || ''} onChange={(e) => up('industry', e.target.value)} /></label>
              <label className="block"><span className="mb-1.5 block text-sm text-ink">How long it took</span><input className="field" value={f.duration || ''} onChange={(e) => up('duration', e.target.value)} placeholder="3 weeks" /></label>
              <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm text-ink">Use a portfolio project</span>
                <select className="field" value={f.project || ''} onChange={(e) => up('project', e.target.value)}><option value="">None</option>{projects.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}</select></label>
            </div>
          )}
        </div>
        {!isNew && <div className="flex flex-wrap items-center gap-2 text-sm"><span className="text-muted">When filling:</span>{[['empty', 'Only empty fields'], ['replace', 'Replace what is there']].map(([v, l]) => <button key={v} type="button" onClick={() => setMode(v)} className={cn('rounded-full border px-3 py-1', mode === v ? 'border-signal bg-signal/15 text-ink' : 'border-line text-muted')}>{l}</button>)}</div>}
        {wait > 0 && <p className="text-sm text-amber">The free AI is busy. Trying again in {wait} s…</p>}
        {err && <p className="rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{err}</p>}
        <div className="flex justify-between gap-2 border-t border-line pt-4">
          <button type="button" onClick={onClose} disabled={busy} className="btn-ghost btn-sm">{isNew ? 'Skip, I will write it myself' : 'Cancel'}</button>
          <button type="button" onClick={run} disabled={busy || String(f.client || '').trim().length < 2} className="btn-primary btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{busy ? 'Writing…' : 'Write it'}</button>
        </div>
      </div>
    </Dialog>
  );
}

export { X };


/* ---------- Service areas: write one landing page (a service for a niche in a place) ---------- */
export function AreaPageAiWizard({ open, onClose, doc, isNew, onApply }) {
  const [f, setF] = useState({ area: '', niche: '', service: '', notes: '', keyword: '' }); const [places, setPlaces] = useState([]); const [services, setServices] = useState([]);
  const [mode, setMode] = useState('replace'); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [wait, setWait] = useState(0);
  useEffect(() => {
    if (!open) return; setErr(''); setMode(isNew ? 'replace' : 'empty'); setF({ area: doc?.area || '', niche: doc?.niche || '', service: doc?.service || '', notes: '', keyword: '' });
    fetch('/api/admin/area-categories').then((r) => r.json()).then((j) => setPlaces(j.items || [])).catch(() => {});
    fetch('/api/admin/services').then((r) => r.json()).then((j) => setServices((j.items || []).filter((x) => x.active !== false))).catch(() => {});
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const up = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const run = async () => {
    setBusy(true); setErr('');
    try {
      const j = await aiCall({ task: 'areaPage', ...f }, setWait);
      onApply((d) => {
        const next = { ...d };
        for (const [k, v] of Object.entries(j.page)) { if (empty(v)) continue; if (k === 'slug' && d._id) continue; if (mode === 'empty' && !empty(d[k])) continue; next[k] = v; }
        return next;
      }, j.via);
      onClose();
    } catch (e) { setErr(e.message); }
    setBusy(false); setWait(0);
  };
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} title={isNew ? 'New service area page: pick the place and the niche' : 'Write this page with AI'} wide>
      <div className="space-y-4">
        <p className="text-sm text-muted">Writes the whole landing page: headline, intro, four key points, main text, call to action and SEO, for one service and one niche in one place. It never claims a local office or local clients, and uses only the facts you add. Nothing is saved until you press {isNew ? 'Create' : 'Save'}.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Place <span className="text-bad">*</span></span>
            <select className="field" value={f.area} onChange={(e) => up('area', e.target.value)}><option value="">Choose a place</option>{places.map((p) => <option key={p.slug} value={p.slug}>{p.flag ? `${p.flag} ` : ''}{p.name}</option>)}</select></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Niche or business type</span><input className="field" value={f.niche} onChange={(e) => up('niche', e.target.value)} placeholder="Dentists" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Your service</span>
            <select className="field" value={f.service} onChange={(e) => up('service', e.target.value)}><option value="">General website design</option>{services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Search to rank for (optional)</span><input className="field" value={f.keyword} onChange={(e) => up('keyword', e.target.value)} placeholder="dental website design new york" /></label>
        </div>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Real facts to use (optional)</span><textarea rows={3} className="field" value={f.notes} onChange={(e) => up('notes', e.target.value)} placeholder="For example: I built a clinic site in this city. Clients here usually ask for online booking." /></label>
        {!isNew && <div className="flex flex-wrap items-center gap-2 text-sm"><span className="text-muted">When filling:</span>{[['empty', 'Only empty fields'], ['replace', 'Replace what is there']].map(([v, l]) => <button key={v} type="button" onClick={() => setMode(v)} className={cn('rounded-full border px-3 py-1', mode === v ? 'border-signal bg-signal/15 text-ink' : 'border-line text-muted')}>{l}</button>)}</div>}
        {wait > 0 && <p className="text-sm text-amber">The free AI is busy. Trying again in {wait} s…</p>}
        {err && <p className="rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{err}</p>}
        <div className="flex justify-between gap-2 border-t border-line pt-4">
          <button type="button" onClick={onClose} disabled={busy} className="btn-ghost btn-sm">{isNew ? 'Skip, I will write it myself' : 'Cancel'}</button>
          <button type="button" onClick={run} disabled={busy || !f.area} className="btn-primary btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{busy ? 'Writing…' : 'Write it'}</button>
        </div>
      </div>
    </Dialog>
  );
}
