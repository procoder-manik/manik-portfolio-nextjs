'use client';
import { useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, Circle, Copy, Check, Image as ImageIcon, RefreshCw, ChevronDown, ExternalLink, Wand2 } from 'lucide-react';
import Dialog from './Dialog';
import { MediaInput } from './Fields';
import { WORK_TYPES, WORK_STATUS } from '@/lib/project-ai-options';
import { CMS_OPTIONS } from '@/lib/options';
import { cn } from '@/lib/utils';

/* ---------- helpers ---------- */
async function call(path, body) {
  const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || `Request failed (${r.status})`), { status: r.status });
  return j;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Shrinks the screenshot in the browser (max 1024 px wide, JPG) so it travels fast and fits every AI.
   Returns null when the browser cannot read it (then the server opens the image itself). */
async function shrink(src) {
  try {
    const img = new Image(); img.crossOrigin = 'anonymous';
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
    const nw = img.naturalWidth || 1280; const nh = img.naturalHeight || 2400;
    const make = (maxW, maxH, q) => {
      const w = Math.min(maxW, nw); const sc = w / nw; const h = Math.max(1, Math.min(Math.round(nh * sc), maxH));
      const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, nw, h / sc, 0, 0, w, h);
      return c.toDataURL('image/jpeg', q).split(',')[1];
    };
    let data = make(1024, 5200, 0.72);
    if (data.length > 3_000_000) data = make(900, 4000, 0.6);
    return { mime: 'image/jpeg', data };
  } catch { return null; }
}

/* Calls a step; when the free AI is busy (429) it waits once with a countdown, then tries again. */
async function step(fn, onWait) {
  try { return await fn(); } catch (e) {
    if (e.status !== 429) throw e;
    for (let s = 25; s > 0; s--) { onWait(s); await sleep(1000); }
    onWait(0); return fn();
  }
}

const empty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0);
const Chip = ({ children }) => <span className="rounded-full border border-line bg-base/60 px-2.5 py-0.5 text-xs text-body">{children}</span>;
function CopyBtn({ text, label = 'Copy' }) {
  const [ok, setOk] = useState(false);
  return <button type="button" onClick={() => { navigator.clipboard?.writeText(text).catch(() => {}); setOk(true); setTimeout(() => setOk(false), 1500); }} className="btn-ghost btn-sm shrink-0">{ok ? <Check size={14} /> : <Copy size={14} />}{ok ? 'Copied' : label}</button>;
}
function Meter({ n, min, max }) {
  const good = n >= min && n <= max;
  return <span className={cn('text-xs', good ? 'text-good' : 'text-amber')}>{n} characters{good ? '' : ` (aim for ${min} to ${max})`}</span>;
}

/* ---------- the "Write with AI" window ---------- */
export function ProjectAiWizard({ open, onClose, doc, isNew, onApply }) {
  const brief = doc?.aiMeta?.brief || {};
  const init = () => ({
    name: doc?.title || brief.name || '', url: doc?.liveUrl || brief.url || '', workTypes: brief.workTypes || [], status: doc?.workStatus || brief.status || 'completed',
    platform: brief.platform || '', client: doc?.client || '', industry: doc?.industry || '', startDate: String(doc?.startDate || '').slice(0, 10), endDate: String(doc?.endDate || '').slice(0, 10),
    notes: brief.notes || '', image: doc?.scrollImage || '', readImage: true,
  });
  const [f, setF] = useState(init);
  const [more, setMore] = useState(false);
  const [mode, setMode] = useState(isNew ? 'replace' : 'empty');
  const [st, setSt] = useState({});
  const [busy, setBusy] = useState(false); const [wait, setWait] = useState(0); const [err, setErr] = useState('');
  const [out, setOut] = useState(null); const [showStory, setShowStory] = useState(false);
  const cache = useRef({});
  useEffect(() => { if (open) { setF(init()); setOut(null); setErr(''); setSt({}); cache.current = {}; setMode(isNew ? 'replace' : 'empty'); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const up = (k, v) => { setF((x) => ({ ...x, [k]: v })); if (k === 'url') delete cache.current.facts; if (k === 'image' || k === 'name') delete cache.current.visual; };
  const toggle = (id) => up('workTypes', f.workTypes.includes(id) ? f.workTypes.filter((x) => x !== id) : [...f.workTypes, id]);
  const mark = (k, s, msg = '') => setSt((x) => ({ ...x, [k]: { s, msg } }));

  const run = async () => {
    setErr(''); setOut(null);
    if (f.name.trim().length < 2) { setErr('Type the website name.'); return; }
    if (!f.workTypes.length) { setErr('Pick at least one kind of work you did.'); return; }
    setBusy(true);
    try {
      // 1. Read the live website (free, no AI)
      if (!f.url.trim()) mark('read', 'skip', 'No website address, skipped.');
      else if (cache.current.facts) mark('read', 'ok', 'Already read.');
      else {
        mark('read', 'run');
        const r = await call('/api/admin/ai/project/research', { url: f.url });
        if (r.ok) { cache.current.facts = r.facts; const p = r.facts.platform || {}; mark('read', 'ok', [r.facts.title, p.cms && `Built with ${p.cms}`, p.techs?.length && p.techs.slice(0, 4).join(', ')].filter(Boolean).join(' · ')); }
        else mark('read', 'warn', r.error);
      }
      // 2. Read the screenshot (colours, alt text, banner prompts)
      if (!f.image || !f.readImage) mark('look', 'skip', f.image ? 'Turned off.' : 'No screenshot yet. You can add it later and press Read the screenshot in the Images tab.');
      else if (cache.current.visual) mark('look', 'ok', 'Already read.');
      else {
        mark('look', 'run');
        try {
          const image = await shrink(f.image);
          const r = await step(() => call('/api/admin/ai/project/visual', { name: f.name, url: f.url, workTypes: f.workTypes, ...(image ? { image } : { imageUrl: f.image }) }), setWait);
          cache.current.visual = r.visual; mark('look', 'ok', `${r.visual.prompts.length} banner prompts, ${r.visual.palette.length} colours`);
        } catch (e) { mark('look', 'warn', `${e.message} The project is still written without it.`); }
      }
      // 3. Write the project
      mark('write', 'run');
      const r = await step(() => call('/api/admin/ai/project/write', { ...f, image: undefined, id: doc?._id, facts: cache.current.facts, visual: cache.current.visual }), setWait);
      mark('write', 'ok', r.via ? `Written by ${r.via}` : '');
      setOut({ project: r.project, visual: cache.current.visual, facts: cache.current.facts, via: r.via });
    } catch (e) { setErr(e.message); setSt((x) => { const k = Object.keys(x).find((y) => x[y].s === 'run'); return k ? { ...x, [k]: { s: 'err', msg: '' } } : x; }); }
    setBusy(false); setWait(0);
  };

  const apply = () => {
    const p = { ...out.project };
    if (f.image) p.scrollImage = f.image;
    if (!isNew && doc?.slug) delete p.slug; // never change the address of a saved project
    const { image, readImage, ...briefOut } = f; // eslint-disable-line no-unused-vars
    const aiMeta = { ...(doc?.aiMeta || {}), brief: briefOut, ...(out.visual ? { visual: out.visual } : {}), via: out.via, at: new Date().toISOString() };
    onApply((d) => {
      const next = { ...d };
      const blank = (k) => empty(d[k]) || k === 'workStatus' || (k === 'accent' && String(d.accent).toUpperCase() === '#5B8CFF');
      for (const [k, v] of Object.entries(p)) { if (empty(v)) continue; if (mode === 'empty' && !blank(k)) continue; next[k] = v; }
      next.aiMeta = aiMeta;
      return next;
    }, out.via);
    onClose();
  };

  const S = ({ k, label }) => {
    const x = st[k] || {}; const I = { run: Loader2, ok: CheckCircle2, warn: AlertTriangle, err: AlertTriangle }[x.s] || Circle;
    return (
      <li className="flex gap-3 py-2">
        <I size={17} className={cn('mt-0.5 shrink-0', x.s === 'run' && 'animate-spin text-signal', x.s === 'ok' && 'text-good', x.s === 'warn' && 'text-amber', x.s === 'err' && 'text-bad', (!x.s || x.s === 'skip') && 'text-muted')} />
        <div className="min-w-0"><p className="text-sm font-medium text-ink">{label}</p>{x.msg && <p className="text-xs text-muted">{x.msg}</p>}{x.s === 'run' && wait > 0 && <p className="text-xs text-amber">The free AI is busy. Trying again in {wait} s…</p>}</div>
      </li>
    );
  };

  const P = out?.project;
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} title={isNew ? 'New project: tell the AI what you did' : 'Write this project with AI'} wide>
      {!out ? (
        <div className="space-y-5">
          <p className="text-sm text-muted">Give the website and the kind of work. The AI reads the live site and your screenshot, then writes the description, the story, the work tags, the meta title and description and banner prompts. Nothing is saved until you press {isNew ? 'Create' : 'Save changes'}.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Website name <span className="text-bad">*</span></span><input className="field" value={f.name} onChange={(e) => up('name', e.target.value)} placeholder="JS Law" autoFocus /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Website address</span><input className="field" value={f.url} onChange={(e) => up('url', e.target.value)} placeholder="https://jslaw.ca" /></label>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-ink">What did you do? <span className="text-bad">*</span> <span className="font-normal text-muted">Pick all that fit.</span></p>
            <div className="flex flex-wrap gap-2">
              {WORK_TYPES.map((w) => <button key={w.id} type="button" onClick={() => toggle(w.id)} aria-pressed={f.workTypes.includes(w.id)} className={cn('rounded-full border px-3.5 py-1.5 text-sm transition', f.workTypes.includes(w.id) ? 'border-signal bg-signal/15 text-ink' : 'border-line text-muted hover:border-signal/60 hover:text-ink')}>{w.label}</button>)}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Where is the work now?</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {WORK_STATUS.map((s) => <button key={s.value} type="button" onClick={() => up('status', s.value)} className={cn('rounded-xl border p-3 text-left transition', f.status === s.value ? 'border-signal bg-signal/10' : 'border-line hover:border-signal/60')}><span className="block text-sm font-semibold text-ink">{s.label}</span><span className="block text-xs text-muted">{s.hint}</span></button>)}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Full-page screenshot <span className="font-normal text-muted">(optional, for banner prompts, colours and alt text)</span></p>
            <MediaInput value={f.image} onChange={(v) => up('image', v)} />
            {f.image && <label className="mt-2 flex items-center gap-2 text-sm text-body"><input type="checkbox" checked={f.readImage} onChange={(e) => up('readImage', e.target.checked)} />Let the AI read the screenshot</label>}
          </div>
          <div className="rounded-xl border border-line">
            <button type="button" onClick={() => setMore(!more)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-ink">More details (optional, makes it better)<ChevronDown size={16} className={cn('transition', more && 'rotate-180')} /></button>
            {more && (
              <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-2">
                <label className="block"><span className="mb-1.5 block text-sm text-ink">Platform</span>
                  <select className="field" value={f.platform} onChange={(e) => up('platform', e.target.value)}><option value="">Detect it from the website</option>{CMS_OPTIONS.filter((c) => c !== 'Other').map((c) => <option key={c} value={c}>{c}</option>)}<option value="custom">Custom code</option></select></label>
                <label className="block"><span className="mb-1.5 block text-sm text-ink">Industry</span><input className="field" value={f.industry} onChange={(e) => up('industry', e.target.value)} placeholder="Found from the website if empty" /></label>
                <label className="block"><span className="mb-1.5 block text-sm text-ink">Client name</span><input className="field" value={f.client} onChange={(e) => up('client', e.target.value)} placeholder="Same as the website if empty" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><span className="mb-1.5 block text-sm text-ink">Started</span><input type="date" className="field" value={f.startDate} onChange={(e) => up('startDate', e.target.value)} /></label>
                  <label className="block"><span className="mb-1.5 block text-sm text-ink">Finished</span><input type="date" className="field" value={f.endDate} disabled={f.status !== 'completed'} onChange={(e) => up('endDate', e.target.value)} /></label>
                </div>
                <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm text-ink">Your notes</span>
                  <textarea rows={4} className="field" value={f.notes} onChange={(e) => up('notes', e.target.value)} placeholder="Real details only: the problem, pages you built, plugins, what the client asked for, results with numbers (for example: load time 6.1 s to 1.8 s). The AI never invents numbers; it only uses the ones you write here." /></label>
              </div>
            )}
          </div>
          {!isNew && (
            <div className="flex flex-wrap items-center gap-2 text-sm"><span className="text-muted">When filling the form:</span>
              {[['empty', 'Only fill empty fields'], ['replace', 'Replace what is there']].map(([v, l]) => <button key={v} type="button" onClick={() => setMode(v)} className={cn('rounded-full border px-3 py-1', mode === v ? 'border-signal bg-signal/15 text-ink' : 'border-line text-muted')}>{l}</button>)}
            </div>
          )}
          {Object.keys(st).length > 0 && (
            <ol className="divide-y divide-line rounded-xl border border-line px-4">
              <S k="read" label="Reading the website" /><S k="look" label="Reading the screenshot" /><S k="write" label="Writing the project, meta title and description" />
            </ol>
          )}
          {err && <p className="flex gap-2 rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad"><AlertTriangle size={16} className="mt-0.5 shrink-0" />{err}</p>}
          <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-4">
            <button type="button" onClick={onClose} disabled={busy} className="btn-ghost btn-sm">{isNew ? 'Skip, I will fill it in myself' : 'Cancel'}</button>
            <button type="button" onClick={run} disabled={busy} className="btn-primary btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{busy ? 'Working…' : err ? 'Try again' : 'Write it'}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="flex items-center gap-2 text-sm text-good"><CheckCircle2 size={16} />Ready. Check it, then put it in the form.{out.via && <span className="text-muted"> ({out.via})</span>}</p>
          <div className="rounded-xl border border-line bg-base/40 p-4">
            <div className="flex items-start gap-3">{P.accent && <span className="mt-1 h-5 w-5 shrink-0 rounded-md border border-line" style={{ background: P.accent }} title={`Accent ${P.accent}`} />}<div className="min-w-0"><p className="font-display text-xl font-semibold text-ink">{P.title}</p><p className="text-xs text-muted">/portfolio/{P.slug} · {P.industry || 'industry not found'} · {P.platformType === 'custom' ? 'Custom code' : P.cms}</p></div></div>
            <p className="mt-3 text-sm text-body">{P.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{P.services.map((s) => <Chip key={s}>{s}</Chip>)}{P.technologies.map((s) => <Chip key={s}>{s}</Chip>)}</div>
          </div>
          <div className="space-y-3 rounded-xl border border-line p-4">
            <p className="text-xs font-medium text-muted">Google preview</p>
            <div><p className="text-[1.05rem] text-[#8ab4f8]">{P.seoTitle}</p><p className="text-xs text-good">{typeof window !== 'undefined' ? window.location.host : 'your-site'} › portfolio › {P.slug}</p><p className="text-sm text-body">{P.seoDescription}</p></div>
            <div className="flex flex-wrap gap-x-4 gap-y-1"><span className="text-xs text-muted">Meta title: <Meter n={P.seoTitle.length} min={45} max={62} /></span><span className="text-xs text-muted">Description: <Meter n={P.seoDescription.length} min={120} max={160} /></span></div>
            <p className="text-xs text-muted">Focus keyword: <b className="text-ink">{P.focusKeyword || '-'}</b>{P.keywords?.length ? ` · related: ${P.keywords.join(', ')}` : ''}</p>
          </div>
          <div className="rounded-xl border border-line">
            <button type="button" onClick={() => setShowStory(!showStory)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-ink">Project story and deliverables<ChevronDown size={16} className={cn('transition', showStory && 'rotate-180')} /></button>
            {showStory && <div className="border-t border-line p-4"><pre className="whitespace-pre-wrap font-sans text-sm text-body">{P.content}</pre>{P.deliverables?.length > 0 && <ul className="mt-3 list-disc pl-5 text-sm text-body">{P.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>}{P.metrics?.length > 0 && <p className="mt-3 text-xs text-muted">Results from your notes: {P.metrics.map((m) => `${m.value} ${m.label}`).join(', ')}</p>}</div>}
          </div>
          {out.visual ? <p className="flex items-center gap-2 text-sm text-body"><ImageIcon size={15} className="text-signal" />{out.visual.prompts.length} banner prompts are ready in the <b className="text-ink">Images</b> tab.</p> : <p className="text-sm text-muted">No banner prompts yet: add the screenshot in the Images tab and press Read the screenshot.</p>}
          <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-4">
            <button type="button" onClick={() => { setOut(null); delete cache.current.visual; setSt({}); }} className="btn-ghost btn-sm"><RefreshCw size={14} />Change answers or write again</button>
            <button type="button" onClick={apply} className="btn-primary btn-sm"><Wand2 size={14} />Put it in the form</button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

/* ---------- Images tab: banner prompts made from the screenshot ---------- */
export function BannerBox({ doc, setDoc }) {
  const v = doc.aiMeta?.visual; const src = doc.scrollImage || doc.bannerImage || doc.gallery?.[0] || '';
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [wait, setWait] = useState(0);
  const read = async () => {
    setBusy(true); setErr('');
    try {
      const image = await shrink(src);
      const workTypes = doc.aiMeta?.brief?.workTypes?.length ? doc.aiMeta.brief.workTypes : WORK_TYPES.filter((w) => (doc.services || []).some((s) => s.toLowerCase() === w.tag.toLowerCase())).map((w) => w.id);
      const r = await step(() => call('/api/admin/ai/project/visual', { name: doc.title || 'Website', url: doc.liveUrl, workTypes, ...(image ? { image } : { imageUrl: src }) }), setWait);
      setDoc((d) => ({ ...d, aiMeta: { ...(d.aiMeta || {}), visual: r.visual }, ...(empty(d.imageAlt) && r.visual.altText ? { imageAlt: r.visual.altText } : {}) }));
    } catch (e) { setErr(e.message); }
    setBusy(false); setWait(0);
  };
  const setAccent = (c) => setDoc((d) => ({ ...d, accent: c }));
  return (
    <div className="rounded-2xl border border-signal/30 bg-gradient-to-br from-signal/10 to-transparent p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="flex items-center gap-2 font-semibold text-ink"><Sparkles size={16} className="text-signal" />Banner prompts from your screenshot</p>
          <p className="mt-1 max-w-xl text-sm text-muted">The AI looks at the screenshot and writes ready prompts for a 1600 x 840 banner (portfolio header and social share image) in the site&apos;s own colours. Paste a prompt into ChatGPT or Nano Banana with the screenshot attached.</p></div>
        <button type="button" onClick={read} disabled={busy || !src} className="btn-ghost btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : v ? <RefreshCw size={14} /> : <Sparkles size={14} />}{busy ? (wait ? `AI busy, retry in ${wait} s` : 'Reading…') : v ? 'Read again' : 'Read the screenshot'}</button>
      </div>
      {!src && <p className="mt-3 text-sm text-amber">Upload the full-page screenshot above first.</p>}
      {err && <p className="mt-3 text-sm text-bad">{err}</p>}
      {v && (
        <div className="mt-5 space-y-4">
          {v.palette?.length > 0 && (
            <div><p className="mb-2 text-xs text-muted">Colours from the site (click one to use it as the accent colour)</p>
              <div className="flex flex-wrap gap-2">{v.palette.map((c) => <button key={c} type="button" onClick={() => setAccent(c)} className={cn('flex items-center gap-2 rounded-lg border px-2 py-1 text-xs', doc.accent?.toUpperCase() === c ? 'border-signal text-ink' : 'border-line text-muted')}><span className="h-4 w-4 rounded" style={{ background: c }} />{c}{c === v.accent && ' (brand)'}</button>)}</div></div>
          )}
          {v.description && <p className="text-sm text-body"><b className="text-ink">What the AI sees:</b> {v.description}</p>}
          <p className="text-sm text-body"><b className="text-ink">Text on the banner:</b> {v.onImageText?.headline}{v.onImageText?.sub ? ` / ${v.onImageText.sub}` : ''} <span className="text-muted">· File name: {v.fileName || 'banner.jpg'} · Size: {v.size || '1600 x 840'}</span></p>
          {v.prompts.map((p, i) => (
            <div key={i} className="rounded-xl border border-line bg-base/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-ink">{i + 1}. {p.label} <span className="font-normal text-muted">· {p.tool}</span></p><CopyBtn text={p.prompt} label="Copy prompt" /></div>
              {p.attach && <p className="mt-1 text-xs text-amber">Attach your screenshot to the chat together with this prompt.</p>}
              <p className="mt-2 whitespace-pre-wrap text-sm text-body">{p.prompt}</p>
            </div>
          ))}
          {v.tips && <p className="text-xs text-muted">{v.tips}</p>}
          <div className="flex flex-wrap gap-2">{src && <a href={src} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm"><ExternalLink size={14} />Open the screenshot to attach</a>}</div>
          <div className="rounded-xl border border-line p-4">
            <p className="mb-2 text-sm font-medium text-ink">Finished banner</p>
            <MediaInput value={doc.bannerImage || ''} onChange={(url) => setDoc((d) => ({ ...d, bannerImage: url, useScrollAsBanner: url ? false : d.useScrollAsBanner }))} />
            <p className="mt-2 text-xs text-muted">Uploading it here also turns off &quot;Use the screenshot as the banner&quot;, so Facebook, LinkedIn and X show this banner. The page still shows the scrolling screenshot.</p>
          </div>
          {v.via && <p className="text-xs text-muted">Read by {v.via}</p>}
        </div>
      )}
    </div>
  );
}
