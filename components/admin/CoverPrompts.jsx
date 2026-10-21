'use client';
import { useContext, useState } from 'react';
import { Sparkles, Loader2, Copy, Check, ChevronDown, ImageIcon, ExternalLink } from 'lucide-react';
import { aiCall, AiCtx } from './AiAssist';
import { IMAGE_SPECS, OTHER_SIZES, specOf } from '@/lib/image-specs';
import { cn } from '@/lib/utils';

function Copy1({ text, label = 'Copy' }) {
  const [ok, setOk] = useState(false);
  return <button type="button" onClick={() => { navigator.clipboard?.writeText(text).catch(() => {}); setOk(true); setTimeout(() => setOk(false), 1500); }} className="btn-ghost btn-sm shrink-0">{ok ? <Check size={14} /> : <Copy size={14} />}{ok ? 'Copied' : label}</button>;
}

/* Shows the exact size of a cover or share image, where it is cropped, and writes image prompts for it. */
export default function CoverPrompts({ f, doc, setDoc }) {
  const { scope } = useContext(AiCtx);
  const kind = f.kind || 'page'; const sp = specOf(kind);
  const [res, setRes] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [wait, setWait] = useState(0); const [more, setMore] = useState(false);
  const shot = doc.scrollImage || '';
  const run = async () => {
    setBusy(true); setErr('');
    try { const j = await aiCall({ task: 'cover', kind, scope, doc }, setWait); setRes(j.cover); }
    catch (e) { setErr(e.message); }
    setBusy(false); setWait(0);
  };
  const [sw, sh] = sp.safe; const pw = (sw / sp.w) * 100; const ph = (sh / sp.h) * 100;
  return (
    <div className="rounded-2xl border border-signal/30 bg-gradient-to-br from-signal/10 to-transparent p-5">
      <div className="flex flex-wrap items-start gap-5">
        <div className="w-40 shrink-0">
          <div className="relative w-full overflow-hidden rounded-lg border border-line bg-base" style={{ aspectRatio: `${sp.w} / ${sp.h}` }}>
            <div className="absolute rounded border border-dashed border-signal" style={{ width: `${pw}%`, height: `${ph}%`, left: `${(100 - pw) / 2}%`, top: `${(100 - ph) / 2}%` }} />
            <span className="absolute inset-0 grid place-items-center text-[10px] font-medium text-muted">{sp.ratio.split(' ')[0]}</span>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted">Dashed: keep key content inside</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink"><ImageIcon size={15} className="text-signal" />{sp.label}: {sp.w} x {sp.h} px ({sp.ratio})</p>
          <p className="mt-1 text-sm text-body">Keep text and the main subject inside the centre <b className="text-ink">{sw} x {sh} px</b>. Save as JPG or WebP under {sp.max}.</p>
          <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-muted">{sp.shown.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <button type="button" onClick={run} disabled={busy} className="btn-primary btn-sm shrink-0">{busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{busy ? (wait ? `Busy, retry in ${wait} s` : 'Writing…') : res ? 'Write again' : 'Write image prompts'}</button>
      </div>
      {err && <p className="mt-3 text-sm text-bad">{err}</p>}
      {res && (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-body"><b className="text-ink">Text on the image:</b> {res.headline || 'none'} <span className="text-muted">· File name: {res.fileName || 'cover.jpg'} · Size: {res.size} ({res.ratio})</span></p>
          {res.altText && <p className="flex flex-wrap items-center gap-2 text-sm text-body"><span><b className="text-ink">Alt text:</b> {res.altText}</span><Copy1 text={res.altText} label="Copy alt text" /></p>}
          {res.prompts.map((p, i) => (
            <div key={i} className="rounded-xl border border-line bg-base/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-ink">{i + 1}. {p.label} <span className="font-normal text-muted">· {p.tool}</span></p><Copy1 text={p.prompt} label="Copy prompt" /></div>
              {p.attach && <p className="mt-1 text-xs text-amber">Attach your screenshot to the chat together with this prompt.</p>}
              <p className="mt-2 whitespace-pre-wrap text-sm text-body">{p.prompt}</p>
            </div>
          ))}
          {res.tips && <p className="text-xs text-muted">{res.tips}</p>}
          {shot && <a href={shot} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm"><ExternalLink size={14} />Open the screenshot to attach</a>}
        </div>
      )}
      <div className="mt-4 rounded-xl border border-line">
        <button type="button" onClick={() => setMore(!more)} className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-ink">All image sizes on this site<ChevronDown size={15} className={cn('transition', more && 'rotate-180')} /></button>
        {more && (
          <div className="overflow-x-auto border-t border-line px-4 py-3">
            <table className="w-full min-w-[420px] text-left text-xs">
              <thead className="text-muted"><tr><th className="py-1 pr-3 font-medium">Image</th><th className="py-1 pr-3 font-medium">Size</th><th className="py-1 font-medium">Ratio</th></tr></thead>
              <tbody className="text-body">
                {Object.values(IMAGE_SPECS).map((x) => <tr key={x.label} className="border-t border-line"><td className="py-1.5 pr-3">{x.label}</td><td className="py-1.5 pr-3 font-mono">{x.w} x {x.h}</td><td className="py-1.5">{x.ratio}</td></tr>)}
                {OTHER_SIZES.map(([a, b, c]) => <tr key={a} className="border-t border-line"><td className="py-1.5 pr-3">{a}</td><td className="py-1.5 pr-3 font-mono">{b}</td><td className="py-1.5">{c}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
