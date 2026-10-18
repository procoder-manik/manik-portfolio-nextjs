'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Star, Upload, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { visibleFields, stepsOf, computeTotal, validate, FIELD_TYPES } from '@/lib/forms';
import { money, cn } from '@/lib/utils';
import { track } from '@/lib/track';

/* Public form. Give it a form (already loaded on the server) or just a slug (loaded in the browser, used by popups).
   Runs the same logic, totals and validation as the server, so what people see is what gets checked. */
export default function FormView({ form: given, slug, compact = false, onDone, preview = false, themeVars }) {
  const [form, setForm] = useState(given || null);
  const [loadErr, setLoadErr] = useState('');
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [state, setState] = useState({ status: 'idle', error: '' });
  const [method, setMethod] = useState('');
  const [done, setDone] = useState(null);
  const [uploading, setUploading] = useState('');
  const top = useRef(null);

  useEffect(() => { setForm(given || null); }, [given]);
  useEffect(() => {
    if (given || !slug) return;
    let live = true;
    fetch(`/api/forms/${encodeURIComponent(slug)}`).then((r) => r.json()).then((j) => { if (!live) return; if (j.form) setForm(j.form); else setLoadErr(j.error || 'This form could not be loaded.'); }).catch(() => live && setLoadErr('This form could not be loaded.'));
    return () => { live = false; };
  }, [slug, given]);

  // Default values: hidden fields, product quantity, prefilled from the address bar (?name=...).
  useEffect(() => {
    if (!form) return;
    const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const init = {};
    for (const f of form.fields || []) {
      if (!f.key) continue;
      const fromUrl = f.prefillParam ? q.get(f.prefillParam) : q.get(f.key);
      if (f.type === 'hidden') init[f.key] = fromUrl || f.defaultValue || '';
      else if (fromUrl) init[f.key] = fromUrl;
      else if (f.defaultValue) init[f.key] = f.defaultValue;
      if (f.type === 'product' && f.quantity) init[`${f.key}__qty`] = 1;
    }
    setValues((v) => ({ ...init, ...v }));
  }, [form?._id, form?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => (form ? visibleFields(form.fields || [], values) : []), [form, values]);
  const steps = useMemo(() => stepsOf(shown), [shown]);
  const cur = steps[Math.min(step, steps.length - 1)] || [];
  const pay = form?.payment?.enabled ? form.payment : null;
  const totals = useMemo(() => (form && pay ? computeTotal({ ...form, payment: { ...pay, enabled: true } }, values) : { total: 0, lines: [] }), [form, pay, values]);
  const set = (k, v) => { setValues((x) => ({ ...x, [k]: v })); setErrors((e) => (e && Object.keys(e).length ? {} : e)); };

  if (loadErr) return <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">{loadErr}</p>;
  if (!form) return <div className="grid h-32 place-items-center text-muted"><Loader2 className="animate-spin" /></div>;
  if (form.settings?.closed) return <div className="card p-8 text-center"><p className="text-lg font-semibold text-ink">{form.settings.closed}</p></div>;

  const style = form.style || {};
  const plain = style.theme === 'plain' || compact;
  const lastStep = step >= steps.length - 1;

  function checkStep() {
    const partial = { ...form, fields: cur };
    const { errors: er } = validate(partial, values);
    setErrors(er);
    if (Object.keys(er).length) { document.getElementById(`ff-${Object.keys(er)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return false; }
    return true;
  }

  async function upload(f, files) {
    const list = [...files]; if (!list.length) return;
    const max = (Number(f.maxSizeMB) || 5) * 1024 * 1024;
    for (const file of list) if (file.size > max) { setErrors({ [f.id]: `${file.name} is larger than ${f.maxSizeMB || 5} MB.` }); return; }
    setUploading(f.id);
    try {
      const out = f.multiple ? [...(values[f.key] || [])] : [];
      for (const file of list) {
        const fd = new FormData(); fd.append('file', file); fd.append('form', form.slug); fd.append('field', f.id);
        const r = await fetch('/api/forms/upload', { method: 'POST', body: fd }); const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || 'Upload failed.');
        out.push(j.file);
      }
      set(f.key, out);
    } catch (e) { setErrors({ [f.id]: e.message }); }
    setUploading('');
  }

  async function submit(e) {
    e.preventDefault();
    if (preview) return;
    if (!lastStep) { if (checkStep()) { setStep(step + 1); top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } return; }
    const { errors: er } = validate(form, values);
    if (Object.keys(er).length) {
      setErrors(er);
      const idx = steps.findIndex((s) => s.some((f) => er[f.id])); if (idx >= 0) setStep(idx);
      setTimeout(() => document.getElementById(`ff-${Object.keys(er)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
      return;
    }
    if (pay && totals.total > 0 && !method && (pay.methods || []).length) { setState({ status: 'idle', error: 'Choose how you want to pay.' }); return; }
    setState({ status: 'sending', error: '' });
    try {
      const hp = e.currentTarget.querySelector('input[name="website"]')?.value || '';
      const r = await fetch(`/api/forms/${encodeURIComponent(form.slug)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ values, method, website: hp, page: window.location.pathname }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { if (j.errors) setErrors(j.errors); setState({ status: 'idle', error: j.error || `The form did not send (error ${r.status}).` }); return; }
      track('generate_lead', { method: `form:${form.slug}` });
      onDone?.(j);
      if (j.redirect) { window.location.href = j.redirect; return; }
      if (form.settings?.successType === 'redirect' && form.settings.redirectUrl) { window.location.href = form.settings.redirectUrl; return; }
      setDone(j); setState({ status: 'sent', error: '' });
    } catch { setState({ status: 'idle', error: 'The form did not send. Check your connection and try again.' }); }
  }

  if (state.status === 'sent') return (
    <div className={cn('grid place-items-center text-center', !plain && 'card p-10')}>
      <CheckCircle2 size={44} className="text-good" />
      <h3 className="mt-4 text-2xl font-semibold">{done?.title || 'Thank you'}</h3>
      <p className="mt-2 max-w-sm whitespace-pre-line text-muted">{form.settings?.successMessage || 'Your answers were sent.'}</p>
      {!compact && <button className="btn-ghost btn-sm mt-6" onClick={() => { setState({ status: 'idle', error: '' }); setValues({}); setStep(0); setDone(null); }}>Send another response</button>}
    </div>
  );

  const labelTop = style.labels !== 'hidden';
  return (
    <form onSubmit={submit} noValidate ref={top} style={themeVars} className={cn('fv-accent scroll-mt-28', !plain && 'card p-6 sm:p-8')}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {!compact && (form.title || form.description) && (
        <div className="mb-6">
          {form.title && <h2 className="text-2xl font-semibold text-ink">{form.title}</h2>}
          {form.description && <p className="mt-2 whitespace-pre-line text-muted">{form.description}</p>}
        </div>
      )}
      {steps.length > 1 && (
        <div className="mb-6" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {style.progress === 'dots'
            ? <div className="flex gap-2">{steps.map((_, i) => <span key={i} className={cn('h-2 flex-1 rounded-full', i <= step ? 'bg-signal' : 'bg-line')} />)}</div>
            : <><div className="h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-signal transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><p className="mt-2 text-xs text-muted">Step {step + 1} of {steps.length}</p></>}
        </div>
      )}
      <div className="grid grid-cols-6 gap-x-5 gap-y-5">
        {cur.map((f) => <FieldView key={f.id} f={f} values={values} set={set} error={errors[f.id]} upload={upload} uploading={uploading === f.id} totals={totals} pay={pay} labelTop={labelTop} />)}
      </div>

      {pay && totals.total > 0 && (
        <div className="mt-7 rounded-2xl border border-line bg-base/50 p-5">
          <p className="text-sm font-semibold text-ink">Pay with</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(pay.methods || []).map((m) => (
              <label key={m.id} className="fv-option flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm">
                <input type="radio" name="__method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[rgb(var(--signal))]" />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} /><span className="font-medium text-ink">{m.name}</span>
              </label>
            ))}
            {!(pay.methods || []).length && <p className="text-sm text-muted">No payment method is switched on yet.</p>}
          </div>
          {pay.note && <p className="mt-3 text-xs text-muted">{pay.note}</p>}
        </div>
      )}

      {state.error && <p role="alert" className="mt-5 rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{state.error}</p>}
      <div className={cn('mt-7 flex flex-wrap items-center gap-3', style.buttonFull ? '' : style.buttonAlign === 'center' ? 'justify-center' : style.buttonAlign === 'right' ? 'justify-end' : 'justify-start')}>
        {step > 0 && <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}><ArrowLeft size={16} />Back</button>}
        <button className={cn('btn-primary fv-primary', style.buttonFull && 'w-full')} disabled={state.status === 'sending'}>
          {state.status === 'sending' ? <><Loader2 size={16} className="animate-spin" />Sending</> : lastStep ? <>{pay && totals.total > 0 ? `${form.settings?.submitLabel || 'Pay now'} (${money(totals.total, pay.currency)})` : form.settings?.submitLabel || 'Submit'}{!pay && <ArrowRight size={16} />}</> : <>Next<ArrowRight size={16} /></>}
        </button>
      </div>
    </form>
  );
}

const span = (w) => ({ full: 'col-span-6', half: 'col-span-6 sm:col-span-3', third: 'col-span-6 sm:col-span-2', twothirds: 'col-span-6 sm:col-span-4' }[w] || 'col-span-6');

function FieldView({ f, values, set, error, upload, uploading, totals, pay, labelTop }) {
  const id = `ff-${f.id}`; const v = values[f.key];
  const T = f.type;
  if (T === 'heading') return <div className="col-span-6 pt-2"><h3 className="text-lg font-semibold text-ink">{f.label}</h3>{f.help && <p className="mt-1 text-sm text-muted">{f.help}</p>}</div>;
  if (T === 'html') return <div className="prose-site col-span-6 text-sm" dangerouslySetInnerHTML={{ __html: String(f.html || '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+=("[^"]*"|'[^']*')/gi, '') }} />;
  if (T === 'divider') return <hr className="col-span-6 border-line" />;
  if (T === 'hidden') return null;
  if (T === 'total') return (
    <div className="col-span-6 rounded-2xl border border-line bg-base/50 p-5">
      {totals.lines.map((l, i) => <div key={i} className="flex justify-between py-1 text-sm text-body"><span>{l.label}</span><span className="tabular-nums">{money(l.amount, pay?.currency)}</span></div>)}
      <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3"><span className="font-semibold text-ink">{f.label || 'Total'}</span><span className="font-display text-2xl font-bold tabular-nums text-ink">{money(totals.total, pay?.currency || 'USD')}</span></div>
    </div>
  );

  const label = (
    <label htmlFor={id} className={cn('label', !labelTop && 'sr-only')}>{f.label}{f.required && <span className="text-bad"> *</span>}</label>
  );
  const common = { id, name: f.key, required: false, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-e` : undefined };
  const input = (type, extra = {}) => <input {...common} type={type} value={v ?? ''} placeholder={f.placeholder || ''} onChange={(e) => set(f.key, e.target.value)} className="field" {...extra} />;
  let body;
  switch (T) {
    case 'textarea': body = <textarea {...common} rows={f.rows || 5} value={v ?? ''} placeholder={f.placeholder || ''} onChange={(e) => set(f.key, e.target.value)} className="field resize-y" />; break;
    case 'email': body = input('email', { autoComplete: 'email' }); break;
    case 'phone': body = input('tel', { autoComplete: 'tel' }); break;
    case 'url': body = input('url', { placeholder: f.placeholder || 'https://' }); break;
    case 'number': body = input('number', { step: 'any', min: f.min ?? undefined, max: f.max ?? undefined }); break;
    case 'date': body = input('date'); break;
    case 'time': body = input('time'); break;
    case 'select': body = (
      <select {...common} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} className="field"><option value="">{f.placeholder || 'Choose...'}</option>{(f.options || []).map((o) => <option key={o.label} value={o.label}>{o.label}{o.price ? ` (${money(o.price, pay?.currency)})` : ''}</option>)}</select>); break;
    case 'radio': body = (
      <div className="grid gap-2" role="radiogroup" aria-labelledby={`${id}-l`}>
        {(f.options || []).map((o) => (
          <label key={o.label} className="fv-option flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm"><input type="radio" name={f.key} checked={v === o.label} onChange={() => set(f.key, o.label)} className="accent-[rgb(var(--signal))]" /><span className="flex-1 text-ink">{o.label}</span>{o.price ? <span className="text-muted">{money(o.price, pay?.currency)}</span> : null}</label>
        ))}
        {f.allowOther && <OtherInput f={f} v={v} set={set} radio />}
      </div>); break;
    case 'checkbox': {
      const arr = Array.isArray(v) ? v : [];
      body = (
        <div className="grid gap-2">
          {(f.options || []).map((o) => (
            <label key={o.label} className="fv-option flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm"><input type="checkbox" checked={arr.includes(o.label)} onChange={(e) => set(f.key, e.target.checked ? [...arr, o.label] : arr.filter((x) => x !== o.label))} className="accent-[rgb(var(--signal))]" /><span className="flex-1 text-ink">{o.label}</span>{o.price ? <span className="text-muted">+{money(o.price, pay?.currency)}</span> : null}</label>
          ))}
          {f.allowOther && <OtherInput f={f} v={arr} set={set} />}
        </div>); break;
    }
    case 'rating': body = (
      <div className="flex gap-1" role="radiogroup" aria-label={f.label}>
        {Array.from({ length: f.max || 5 }, (_, i) => i + 1).map((n) => <button type="button" key={n} onClick={() => set(f.key, n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} className="p-0.5"><Star size={30} className={cn('transition', n <= (v || 0) ? 'fill-amber text-amber' : 'text-line hover:text-amber/60')} /></button>)}
      </div>); break;
    case 'scale': {
      const lo = Number(f.min ?? 1); const hi = Number(f.max ?? 10); const nums = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
      body = (
        <div>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={f.label}>{nums.map((n) => <button type="button" key={n} onClick={() => set(f.key, n)} className={cn('h-10 min-w-10 flex-1 rounded-lg border text-sm font-medium transition', v === n ? 'border-signal bg-signal text-white' : 'border-line text-body hover:border-ink/40')}>{n}</button>)}</div>
          {(f.minLabel || f.maxLabel) && <div className="mt-1.5 flex justify-between text-xs text-muted"><span>{f.minLabel}</span><span>{f.maxLabel}</span></div>}
        </div>); break;
    }
    case 'grid': body = (
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[480px] text-sm">
          <thead><tr className="border-b border-line"><th /> {(f.columns || []).map((c) => <th key={c} className="px-2 py-2.5 text-center text-xs font-medium text-muted">{c}</th>)}</tr></thead>
          <tbody>{(f.rows || []).map((r) => (
            <tr key={r} className="border-b border-line last:border-0"><th className="px-3 py-2.5 text-left font-medium text-ink">{r}</th>
              {(f.columns || []).map((c) => <td key={c} className="px-2 py-2.5 text-center"><input type="radio" name={`${f.key}-${r}`} aria-label={`${r}: ${c}`} checked={v?.[r] === c} onChange={() => set(f.key, { ...(v || {}), [r]: c })} className="h-4 w-4 accent-[rgb(var(--signal))]" /></td>)}</tr>
          ))}</tbody>
        </table>
      </div>); break;
    case 'consent': return (
      <div className={span(f.width)}>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-body"><input id={id} type="checkbox" checked={v === true} onChange={(e) => set(f.key, e.target.checked)} className="mt-1 h-4 w-4 accent-[rgb(var(--signal))]" /><span dangerouslySetInnerHTML={{ __html: String(f.text || f.label).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-signal underline">$1</a>') }} />{f.required && <span className="text-bad">*</span>}</label>
        {error && <p id={`${id}-e`} className="mt-1.5 text-xs text-bad">{error}</p>}
      </div>);
    case 'file': {
      const files = Array.isArray(v) ? v : [];
      body = (
        <div className="rounded-xl border border-dashed border-line bg-base/40 p-4">
          {files.map((x, i) => <div key={i} className="mb-2 flex items-center justify-between rounded-lg bg-raised px-3 py-2 text-sm"><span className="truncate">{x.name}</span><button type="button" aria-label="Remove file" onClick={() => set(f.key, files.filter((_, k) => k !== i))}><X size={15} /></button></div>)}
          {(f.multiple || !files.length) && (
            <label className="btn-ghost btn-sm cursor-pointer">{uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}{uploading ? 'Uploading' : 'Choose file'}
              <input id={id} type="file" hidden accept={f.accept || undefined} multiple={!!f.multiple} onChange={(e) => { upload(f, e.target.files); e.target.value = ''; }} /></label>
          )}
          <p className="mt-2 text-xs text-muted">Up to {f.maxSizeMB || 5} MB{f.accept ? `. Allowed: ${f.accept}` : ''}</p>
        </div>); break;
    }
    case 'product': {
      const qtyKey = `${f.key}__qty`;
      body = (
        <div className="rounded-2xl border border-line bg-base/40 p-4">
          {f.choice === 'single' || !(f.options || []).length
            ? <div className="flex items-center justify-between"><span className="font-medium text-ink">{f.label}</span><span className="tabular-nums text-ink">{money(f.price, pay?.currency)}</span></div>
            : f.choice === 'radio'
              ? <div className="grid gap-2">{f.options.map((o) => <label key={o.label} className="fv-option flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm"><input type="radio" name={f.key} checked={v === o.label} onChange={() => set(f.key, o.label)} className="accent-[rgb(var(--signal))]" /><span className="flex-1 text-ink">{o.label}</span><span className="tabular-nums text-muted">{money(o.price, pay?.currency)}</span></label>)}</div>
              : <select {...common} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} className="field"><option value="">Choose...</option>{f.options.map((o) => <option key={o.label} value={o.label}>{o.label} ({money(o.price, pay?.currency)})</option>)}</select>}
          {f.quantity && <div className="mt-3 flex items-center gap-3 text-sm"><label htmlFor={`${id}-q`} className="text-muted">Quantity</label><input id={`${id}-q`} type="number" min={0} max={999} value={values[qtyKey] ?? 1} onChange={(e) => set(qtyKey, e.target.value === '' ? '' : Math.max(0, Math.min(999, Number(e.target.value))))} className="field w-24 py-2" /></div>}
        </div>); break;
    }
    default: body = input('text', { maxLength: f.maxLength || undefined, autoComplete: /name/i.test(f.label) ? 'name' : undefined });
  }
  return (
    <div className={span(f.width)} id={`${id}-wrap`}>
      <div id={`${id}-l`}>{label}</div>
      {f.help && <p className="-mt-1 mb-2 text-xs text-muted">{f.help}</p>}
      {body}
      {error && <p id={`${id}-e`} role="alert" className="mt-1.5 text-xs text-bad">{error}</p>}
    </div>
  );
}

function OtherInput({ f, v, set, radio }) {
  const known = (f.options || []).map((o) => o.label);
  const cur = radio ? (v && !known.includes(v) ? v : '') : (Array.isArray(v) ? v.find((x) => !known.includes(x)) || '' : '');
  const change = (t) => {
    if (radio) set(f.key, t);
    else { const rest = (Array.isArray(v) ? v : []).filter((x) => known.includes(x)); set(f.key, t ? [...rest, t] : rest); }
  };
  return <div className="flex items-center gap-3 rounded-xl border border-line px-4 py-2.5 text-sm"><span className="text-muted">Other</span><input value={cur} onChange={(e) => change(e.target.value)} className="flex-1 bg-transparent py-1 text-ink outline-none" placeholder="Type your answer" aria-label="Other answer" /></div>;
}
