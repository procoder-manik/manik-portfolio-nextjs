'use client';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Lucide from 'lucide-react';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Copy, ChevronUp, ChevronDown, GripVertical, CheckCircle2, Eye, ExternalLink, X, Trash } from 'lucide-react';
import { FIELD_TYPES, GROUPS, FORM_TEMPLATES, FORM_DEFAULTS, newField, keyOf, uid } from '@/lib/forms';
import { deepMerge, cn } from '@/lib/utils';
import { api } from './api';
import { Notice } from './Editor';
import InfoTip from '@/components/site/InfoTip';
import FormView from '@/components/site/FormView';
import { PAYMENT_METHODS } from '@/lib/options';

const Icon = ({ name, size = 16 }) => { const C = Lucide[name] || Lucide.Square; return <C size={size} />; };
const OPS = [['is', 'is'], ['not', 'is not'], ['contains', 'contains'], ['filled', 'has an answer'], ['empty', 'is empty'], ['gt', 'is greater than'], ['lt', 'is less than']];
const TABS = [['build', 'Build'], ['settings', 'Settings'], ['notify', 'Emails'], ['payment', 'Payment'], ['style', 'Look'], ['share', 'Share']];

function Row({ label, info, children, className }) {
  return <div className={className}><div className="mb-1.5 flex items-center gap-1.5"><span className="text-[13px] font-medium text-ink">{label}</span>{info && <InfoTip size={13} text={info} />}</div>{children}</div>;
}
const Sw = ({ label, info, value, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-base/50 px-3.5 py-2.5">
    <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">{label}{info && <InfoTip size={13} text={info} />}</span>
    <button type="button" role="switch" aria-checked={!!value} onClick={() => onChange(!value)} className={cn('relative h-6 w-11 shrink-0 rounded-full transition', value ? 'bg-signal' : 'bg-line')}><span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition', value ? 'left-[22px]' : 'left-0.5')} /></button>
  </label>
);
const Txt = ({ value, onChange, ...p }) => <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="field py-2.5 text-sm" {...p} />;
const Num = ({ value, onChange, ...p }) => <input type="number" step="any" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} className="field py-2.5 text-sm" {...p} />;
const Sel = ({ value, onChange, options, empty }) => <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="field py-2.5 text-sm">{empty && <option value="">{empty}</option>}{options.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>))}</select>;
function Seg({ value, onChange, options }) {
  return <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-base/50 p-1">{options.map(([v, l]) => <button type="button" key={v} onClick={() => onChange(v)} className={cn('rounded-lg px-3 py-1.5 text-[13px] font-medium transition', value === v ? 'bg-signal text-white' : 'text-body hover:bg-raised')}>{l}</button>)}</div>;
}
function Tags({ value = [], onChange, placeholder }) {
  const [t, setT] = useState('');
  const push = () => { const v = t.trim(); if (v && !value.includes(v)) onChange([...value, v]); setT(''); };
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-base/50 p-2">
      {value.map((v) => <span key={v} className="inline-flex items-center gap-1 rounded-full bg-raised px-2.5 py-1 text-xs text-ink">{v}<button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(value.filter((x) => x !== v))}><X size={12} /></button></span>)}
      <input value={t} onChange={(e) => setT(e.target.value)} onBlur={push} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); push(); } }} placeholder={value.length ? '' : placeholder} className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-sm text-ink outline-none" />
    </div>
  );
}

export default function FormBuilder({ id }) {
  const router = useRouter(); const isNew = id === 'new';
  const [form, setForm] = useState(null); const [tab, setTab] = useState('build'); const [sel, setSel] = useState(null);
  const [status, setStatus] = useState({ t: '', msg: '' }); const [dirty, setDirty] = useState(false); const [picker, setPicker] = useState(isNew);
  const [methods, setMethods] = useState([]); const drag = useRef(null); const [over, setOver] = useState(null);

  useEffect(() => {
    if (isNew) { setForm(deepMerge(FORM_DEFAULTS, {})); return; }
    api(`/api/admin/forms/${id}`).then((j) => { setForm(deepMerge(FORM_DEFAULTS, j.item)); setSel(j.item.fields?.[0]?.id || null); }).catch((e) => setStatus({ t: 'err', msg: e.message }));
  }, [id, isNew]);
  useEffect(() => { api('/api/admin/settings/payments').then((j) => setMethods(PAYMENT_METHODS.filter((m) => j.item?.[m.id]?.enabled).map((m) => ({ id: m.id, name: m.name, color: m.color, kind: m.kind })))).catch(() => {}); }, []);
  useEffect(() => { const h = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [dirty]);

  const patch = useCallback((fn) => { setForm((f) => (typeof fn === 'function' ? fn(f) : { ...f, ...fn })); setDirty(true); }, []);
  const sub = (k, v) => patch((f) => ({ ...f, [k]: { ...(f[k] || {}), ...v } }));
  const fields = form?.fields || [];
  const current = fields.find((f) => f.id === sel);
  const upd = (id2, v) => patch((f) => ({ ...f, fields: f.fields.map((x) => (x.id === id2 ? { ...x, ...v } : x)) }));
  const usedKeys = (exceptId) => fields.filter((f) => f.id !== exceptId).map((f) => f.key).filter(Boolean);

  const addField = (type, at) => {
    const nf = newField(type, usedKeys());
    patch((f) => { const a = [...f.fields]; a.splice(at ?? a.length, 0, nf); return { ...f, fields: a }; });
    setSel(nf.id);
  };
  const move = (i, d) => patch((f) => { const a = [...f.fields]; const j = i + d; if (j < 0 || j >= a.length) return f; [a[i], a[j]] = [a[j], a[i]]; return { ...f, fields: a }; });
  const dup = (fld) => { const c = JSON.parse(JSON.stringify(fld)); c.id = uid(); if (c.key) c.key = keyOf(c.label, usedKeys()); patch((f) => { const a = [...f.fields]; a.splice(a.findIndex((x) => x.id === fld.id) + 1, 0, c); return { ...f, fields: a }; }); setSel(c.id); };
  const remove = (fld) => { if (!confirm(`Remove "${fld.label}" from this form? Answers already received keep their data.`)) return; patch((f) => ({ ...f, fields: f.fields.filter((x) => x.id !== fld.id) })); setSel(null); };
  const dropAt = (index) => {
    const d = drag.current; setOver(null); drag.current = null; if (!d) return;
    if (d.type) addField(d.type, index);
    else patch((f) => { const a = [...f.fields]; const from = a.findIndex((x) => x.id === d.id); if (from < 0) return f; const [it] = a.splice(from, 1); a.splice(from < index ? index - 1 : index, 0, it); return { ...f, fields: a }; });
  };

  async function save() {
    if (!form.name?.trim()) { setStatus({ t: 'err', msg: 'Give the form a name.' }); return; }
    setStatus({ t: 'saving', msg: '' });
    try {
      const j = await api(isNew ? '/api/admin/forms' : `/api/admin/forms/${id}`, { method: isNew ? 'POST' : 'PUT', body: form });
      setForm(deepMerge(FORM_DEFAULTS, j.item)); setDirty(false); setStatus({ t: 'ok', msg: 'Saved' });
      if (isNew) router.replace(`/admin/forms/${j.item._id}`);
      setTimeout(() => setStatus((s) => (s.t === 'ok' ? { t: '', msg: '' } : s)), 2200);
    } catch (e) { setStatus({ t: 'err', msg: e.message }); }
  }
  useEffect(() => { const h = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 's' && form) { e.preventDefault(); save(); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); });

  const emailFields = useMemo(() => fields.filter((f) => f.type === 'email' && f.key), [fields]);
  const inputFields = useMemo(() => fields.filter((f) => FIELD_TYPES[f.type]?.input && f.key), [fields]);
  const previewForm = useMemo(() => form && ({ ...form, _id: 'preview', settings: { ...form.settings }, payment: form.payment?.enabled ? { ...form.payment, methods: methods.filter((m) => !(form.payment.methods || []).length || form.payment.methods.includes(m.id)) } : { enabled: false } }), [form, methods]);

  if (!form) return <div className="grid h-64 place-items-center text-muted">{status.msg ? <Notice bad>{status.msg}</Notice> : <Loader2 className="animate-spin" />}</div>;

  if (picker) return (
    <div>
      <div className="mb-6 flex items-center gap-3"><Link href="/admin/forms" className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:bg-raised" aria-label="Back"><ArrowLeft size={16} /></Link><h1 className="text-2xl font-semibold">New form</h1></div>
      <p className="mb-4 text-sm text-muted">Start from a ready-made form or from nothing. You can change every field afterwards.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FORM_TEMPLATES.map((t) => (
          <button key={t.id} onClick={() => { const base = deepMerge(FORM_DEFAULTS, JSON.parse(JSON.stringify(t.form))); setForm({ ...base, name: t.id === 'blank' ? 'Untitled form' : t.name }); setSel(base.fields?.[0]?.id || null); setPicker(false); setDirty(true); }} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-left transition hover:border-signal">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-signal/15 text-signal"><Icon name={t.icon} size={18} /></span>
            <span><span className="block font-semibold text-ink">{t.name}</span><span className="block text-xs text-muted">{t.desc}</span></span>
          </button>
        ))}
      </div>
    </div>
  );

  const pay = form.payment || {};
  return (
    <div>
      <div className="sticky top-0 z-20 -mx-5 mb-5 border-b border-line bg-base/90 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link href="/admin/forms" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line hover:bg-raised" aria-label="Back"><ArrowLeft size={16} /></Link>
            <input value={form.name} onChange={(e) => patch({ name: e.target.value })} aria-label="Form name" className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-ink outline-none" placeholder="Form name" />
            {dirty && <span className="shrink-0 rounded-full bg-amber/15 px-2 py-0.5 text-xs text-amber">Unsaved</span>}
          </div>
          <div className="flex items-center gap-2">
            {status.t === 'ok' && <span className="inline-flex items-center gap-1.5 text-sm text-good"><CheckCircle2 size={15} />Saved</span>}
            {!isNew && form.slug && <a href={`/forms/${form.slug}`} target="_blank" rel="noopener" className="btn-ghost btn-sm"><ExternalLink size={14} />View</a>}
            <button onClick={save} disabled={status.t === 'saving'} className="btn-primary btn-sm">{status.t === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{isNew ? 'Create' : 'Save changes'}</button>
          </div>
        </div>
        <div className="-mb-3 mt-3 flex gap-1 overflow-x-auto">
          {[...TABS, ['preview', 'Preview']].map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cn('shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium transition', tab === k ? 'border-signal text-ink' : 'border-transparent text-muted hover:text-ink')}>{l}</button>)}
        </div>
      </div>
      {status.t === 'err' && <Notice bad>{status.msg}</Notice>}

      {tab === 'build' && (
        <div className="grid gap-5 lg:grid-cols-[210px_1fr_300px]">
          <aside className="lg:sticky lg:top-36 lg:max-h-[calc(100vh-10rem)] lg:self-start lg:overflow-y-auto">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted">Add a field<InfoTip size={12} text="Click a field type to add it at the end, or drag it into the form where you want it." /></p>
            {GROUPS.map((g) => (
              <div key={g} className="mb-3">
                <p className="mb-1 px-1 text-[11px] font-medium text-muted">{g}</p>
                <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
                  {Object.entries(FIELD_TYPES).filter(([, t]) => t.group === g).map(([k, t]) => (
                    <button key={k} type="button" draggable onDragStart={(e) => { drag.current = { type: k }; e.dataTransfer.setData('text/plain', k); e.dataTransfer.effectAllowed = 'copy'; }} onDragEnd={() => setOver(null)} onClick={() => addField(k)} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-left text-[13px] text-body transition hover:border-signal hover:text-ink"><span className="text-signal"><Icon name={t.icon} size={15} /></span>{t.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          <section aria-label="Form fields" onDragOver={(e) => e.preventDefault()}>
            <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
              <input value={form.title || ''} onChange={(e) => patch({ title: e.target.value })} placeholder="Form title (shown above the form)" className="mb-2 w-full bg-transparent text-xl font-semibold text-ink outline-none placeholder:text-muted/60" />
              <textarea value={form.description || ''} onChange={(e) => patch({ description: e.target.value })} rows={2} placeholder="Short description (optional)" className="mb-5 w-full resize-none bg-transparent text-sm text-muted outline-none placeholder:text-muted/60" />
              <div className="space-y-2">
                {fields.map((f, i) => {
                  const t = FIELD_TYPES[f.type]; const active = sel === f.id;
                  return (
                    <div key={f.id}>
                      <div onDragOver={(e) => { e.preventDefault(); setOver(i); }} onDrop={() => dropAt(i)} className={cn('h-2 rounded transition-all', over === i && 'h-10 border-2 border-dashed border-signal bg-signal/10')} />
                      <div draggable onDragStart={(e) => { drag.current = { id: f.id }; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', f.id); }} onDragEnd={() => setOver(null)} onClick={() => setSel(f.id)}
                        className={cn('group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition', active ? 'border-signal bg-signal/10' : 'border-line bg-base/40 hover:border-ink/30')}>
                        <GripVertical size={16} className="shrink-0 cursor-grab text-muted" aria-hidden />
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-raised text-signal"><Icon name={t?.icon} size={15} /></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ink">{f.label}{f.required && <span className="text-bad"> *</span>}</span><span className="block truncate text-xs text-muted">{t?.label}{f.logic?.enabled ? ' | has logic' : ''}{f.width && f.width !== 'full' ? ` | ${f.width}` : ''}</span></span>
                        <span className="flex shrink-0 opacity-70 group-hover:opacity-100">
                          <button type="button" aria-label="Move up" onClick={(e) => { e.stopPropagation(); move(i, -1); }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-raised"><ChevronUp size={15} /></button>
                          <button type="button" aria-label="Move down" onClick={(e) => { e.stopPropagation(); move(i, 1); }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-raised"><ChevronDown size={15} /></button>
                          <button type="button" aria-label="Duplicate" onClick={(e) => { e.stopPropagation(); dup(f); }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-raised"><Copy size={14} /></button>
                          <button type="button" aria-label="Remove" onClick={(e) => { e.stopPropagation(); remove(f); }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-raised hover:text-bad"><Trash2 size={14} /></button>
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div onDragOver={(e) => { e.preventDefault(); setOver(fields.length); }} onDrop={() => dropAt(fields.length)} className={cn('grid place-items-center rounded-xl border-2 border-dashed text-sm text-muted transition', fields.length ? 'h-14' : 'h-40', over === fields.length ? 'border-signal bg-signal/10 text-ink' : 'border-line')}>
                  {fields.length ? 'Drop a field here' : 'Drag a field here or click one on the left'}
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-36 lg:max-h-[calc(100vh-10rem)] lg:self-start lg:overflow-y-auto">
            {current ? <Inspector f={current} fields={fields} upd={(v) => upd(current.id, v)} usedKeys={usedKeys(current.id)} payOn={pay.enabled} /> : <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">Select a field to change its label, options, rules and logic.</p>}
          </aside>
        </div>
      )}

      {tab === 'settings' && (
        <div className="grid max-w-3xl gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-7">
          <Sw label="Form is open" info="Off: the form shows a closed message and takes no answers. Use it to stop a survey or an event sign-up." value={form.active !== false} onChange={(v) => patch({ active: v })} />
          <Row label="Submit button text" info="The words on the final button, for example Send message."><Txt value={form.settings.submitLabel} onChange={(v) => sub('settings', { submitLabel: v })} /></Row>
          <Row label="After sending" info="Show a thank-you message, or send the visitor to another page such as a thank-you page where you can track conversions."><Seg value={form.settings.successType || 'message'} onChange={(v) => sub('settings', { successType: v })} options={[['message', 'Show a message'], ['redirect', 'Go to a page']]} /></Row>
          {form.settings.successType === 'redirect'
            ? <Row label="Page to open" info="A page like /thank-you or a full https:// address."><Txt value={form.settings.redirectUrl} onChange={(v) => sub('settings', { redirectUrl: v })} placeholder="/thank-you" /></Row>
            : <Row label="Thank-you message" info="Shown after a successful send."><textarea rows={3} className="field text-sm" value={form.settings.successMessage || ''} onChange={(e) => sub('settings', { successMessage: e.target.value })} /></Row>}
          <Sw label="Save answers in the admin" info="On: every answer is stored in Entries so you can read, search and export it. Off: answers are only emailed. Paid forms always keep their entries." value={form.settings.saveEntries !== false} onChange={(v) => sub('settings', { saveEntries: v })} />
          <Sw label="Give this form its own page" info="On: the form is also available at /forms/your-form-name, which you can share by link. Off: it only appears where you place it (a page section or a popup)." value={form.settings.publicPage !== false} onChange={(v) => sub('settings', { publicPage: v })} />
          <div className="grid gap-5 sm:grid-cols-3">
            <Row label="Close after (answers)" info="Stops the form after this many answers, handy for limited seats. Empty means no limit."><Num value={form.settings.limit} onChange={(v) => sub('settings', { limit: v })} /></Row>
            <Row label="Opens on" info="The form stays closed until this date and time."><input type="datetime-local" className="field py-2.5 text-sm" value={(form.settings.openAt || '').slice(0, 16)} onChange={(e) => sub('settings', { openAt: e.target.value })} /></Row>
            <Row label="Closes on" info="The form closes automatically at this date and time."><input type="datetime-local" className="field py-2.5 text-sm" value={(form.settings.closeAt || '').slice(0, 16)} onChange={(e) => sub('settings', { closeAt: e.target.value })} /></Row>
          </div>
          <Row label="Message when closed" info="Shown instead of the form when it is closed or full."><Txt value={form.settings.closedMessage} onChange={(v) => sub('settings', { closedMessage: v })} placeholder="This form is closed." /></Row>
        </div>
      )}

      {tab === 'notify' && (
        <div className="grid max-w-3xl gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-7">
          <h2 className="font-semibold text-ink">Email me when someone answers</h2>
          <Sw label="Send me an email" info="You get an email with all the answers each time the form is sent." value={form.notify.enabled !== false} onChange={(v) => sub('notify', { enabled: v })} />
          {form.notify.enabled !== false && <>
            <Row label="Send to" info="Email addresses that get each answer. Empty uses your general notification address."><Tags value={form.notify.to} onChange={(v) => sub('notify', { to: v })} placeholder="you@example.com, press Enter" /></Row>
            <Row label="Subject" info="Use {form} for the form name, {name} for the sender and {email} for their email."><Txt value={form.notify.subject} onChange={(v) => sub('notify', { subject: v })} /></Row>
            <Row label="Reply goes to" info="When you press Reply in your inbox, the answer goes to the email the visitor typed."><Sel value={form.notify.replyToField} onChange={(v) => sub('notify', { replyToField: v })} empty="The first email field" options={emailFields.map((f) => [f.key, f.label])} /></Row>
          </>}
          <hr className="border-line" />
          <h2 className="font-semibold text-ink">Thank-you email to the visitor</h2>
          <Sw label="Send an automatic reply" info="The person who filled in the form gets a friendly confirmation email. It needs an email field." value={!!form.autoReply.enabled} onChange={(v) => sub('autoReply', { enabled: v })} />
          {form.autoReply.enabled && <>
            <Row label="Which email field" info="Where to send the reply."><Sel value={form.autoReply.emailField} onChange={(v) => sub('autoReply', { emailField: v })} empty="The first email field" options={emailFields.map((f) => [f.key, f.label])} /></Row>
            <Row label="Subject" info="You can use {name}, {form} and {total}."><Txt value={form.autoReply.subject} onChange={(v) => sub('autoReply', { subject: v })} /></Row>
            <Row label="Message" info="The email text. Leave a blank line between paragraphs. {name} becomes their name."><textarea rows={5} className="field text-sm" value={form.autoReply.message || ''} onChange={(e) => sub('autoReply', { message: e.target.value })} /></Row>
          </>}
        </div>
      )}

      {tab === 'payment' && (
        <div className="grid max-w-3xl gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-7">
          <p className="rounded-xl border border-line bg-base/50 px-4 py-3 text-sm text-body">Take payments with this form using the methods you set up in <Link className="font-medium text-signal" href="/admin/settings/payments">Payments</Link>: bKash, Nagad, Rocket, bank transfer, cards (SSLCommerz), PayPal and Payoneer. Each payment becomes an order you can follow in Orders.</p>
          <Sw label="Take payment with this form" info="On: after the visitor fills in the form, they choose a payment method and pay the total. Add a Product field, choices with prices, or a fixed amount below." value={!!pay.enabled} onChange={(v) => sub('payment', { enabled: v })} />
          {pay.enabled && <>
            <div className="grid gap-5 sm:grid-cols-3">
              <Row label="Currency" info="The currency of the prices in this form."><Sel value={pay.currency} onChange={(v) => sub('payment', { currency: v })} options={['USD', 'BDT', 'EUR', 'GBP', 'CAD', 'AUD']} /></Row>
              <Row label="Fixed amount (optional)" info="A set price charged on top of any Product fields. Use it when the form sells one thing, for example a consultation."><Num value={pay.fixedAmount} onChange={(v) => sub('payment', { fixedAmount: v })} /></Row>
              <Row label="Name on the order" info="What this payment is called in Orders, invoices and emails."><Txt value={pay.productName} onChange={(v) => sub('payment', { productName: v })} placeholder={form.name} /></Row>
            </div>
            <Row label="Payment methods offered" info="Pick which of your switched-on methods this form offers. Leave all unselected to offer every one of them."><div className="flex flex-wrap gap-1.5">{methods.map((m) => { const on = (pay.methods || []).includes(m.id); return <button type="button" key={m.id} onClick={() => sub('payment', { methods: on ? pay.methods.filter((x) => x !== m.id) : [...(pay.methods || []), m.id] })} className={cn('rounded-full border px-3.5 py-1.5 text-sm font-medium transition', on ? 'border-signal bg-signal text-white' : 'border-line text-body hover:border-ink/40')}>{m.name}</button>; })}{!methods.length && <span className="text-sm text-muted">No payment method is switched on yet.</span>}</div></Row>
            <div className="grid gap-5 sm:grid-cols-3">
              <Row label="Name field" info="Which field holds the buyer's name. Empty finds a field called Name."><Sel value={pay.nameField} onChange={(v) => sub('payment', { nameField: v })} empty="Automatic" options={inputFields.filter((f) => ['text'].includes(f.type)).map((f) => [f.key, f.label])} /></Row>
              <Row label="Email field" info="Which field holds the buyer's email. Required for payment."><Sel value={pay.emailField} onChange={(v) => sub('payment', { emailField: v })} empty="First email field" options={emailFields.map((f) => [f.key, f.label])} /></Row>
              <Row label="Phone field" info="Optional. Used on the order."><Sel value={pay.phoneField} onChange={(v) => sub('payment', { phoneField: v })} empty="Automatic" options={inputFields.filter((f) => f.type === 'phone').map((f) => [f.key, f.label])} /></Row>
            </div>
            <Row label="Note shown near the payment buttons" info="For example a refund policy or what happens after paying."><Txt value={pay.note} onChange={(v) => sub('payment', { note: v })} /></Row>
            <p className="text-sm text-muted">Tip: add a <b>Product or ticket</b> field for things people can buy, give choice options a price, and add a <b>Total</b> field to show the live sum.</p>
          </>}
        </div>
      )}

      {tab === 'style' && (
        <div className="grid max-w-3xl gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-7">
          <Row label="Form style" info="Card puts the form in a bordered box. Plain has no box, which looks better inside popups and sections that already have a background."><Seg value={form.style.theme || 'card'} onChange={(v) => sub('style', { theme: v })} options={[['card', 'Card'], ['plain', 'Plain']]} /></Row>
          <Row label="Labels" info="Show the question above each field, or hide it and use only the placeholder text."><Seg value={form.style.labels || 'top'} onChange={(v) => sub('style', { labels: v })} options={[['top', 'Above fields'], ['hidden', 'Hidden (placeholder only)']]} /></Row>
          <Row label="Steps progress" info="How progress is shown on multi-step forms (forms with page breaks)."><Seg value={form.style.progress || 'bar'} onChange={(v) => sub('style', { progress: v })} options={[['bar', 'Bar'], ['dots', 'Segments']]} /></Row>
          <Row label="Button" info="Full width suits narrow forms and popups."><Seg value={form.style.buttonFull ? 'full' : form.style.buttonAlign || 'left'} onChange={(v) => sub('style', v === 'full' ? { buttonFull: true } : { buttonFull: false, buttonAlign: v })} options={[['left', 'Left'], ['center', 'Centre'], ['right', 'Right'], ['full', 'Full width']]} /></Row>
        </div>
      )}

      {tab === 'share' && (
        <div className="grid max-w-3xl gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-7">
          <Row label="Form name for links and blocks" info="A short id made from the name. It forms the form's own address. Changing it breaks old links to /forms/..."><Txt value={form.slug} onChange={(v) => patch({ slug: v.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })} placeholder="auto from the name" /></Row>
          <div className="rounded-xl border border-line bg-base/50 p-4 text-sm text-body">
            <p className="font-semibold text-ink">Where to use this form</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li><b>On a page:</b> in Pages, add the section <b>Form (form builder)</b> and pick this form. You can use a different form on every page.</li>
              <li><b>In a popup:</b> in Marketing &gt; Popups, choose this form under Content &gt; Form inside the popup.</li>
              {form.slug && form.settings.publicPage !== false && <li><b>Direct link:</b> <code className="rounded bg-raised px-1.5 py-0.5 text-xs">/forms/{form.slug}</code></li>}
              <li><b>Prefill:</b> add ?field_name=value to a link, for example /forms/{form.slug || 'my-form'}?email=a@b.com fills the field whose key is email.</li>
            </ul>
          </div>
          {!isNew && <Link href={`/admin/entries?form=${id}`} className="btn-ghost btn-sm w-fit">See answers</Link>}
        </div>
      )}

      {tab === 'preview' && (
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-sm text-muted">This is how visitors see the form. Nothing you type here is sent.</p>
          <FormView form={previewForm} preview />
        </div>
      )}
    </div>
  );
}

function Inspector({ f, fields, upd, usedKeys, payOn }) {
  const t = FIELD_TYPES[f.type]; const input = !!t?.input; const opts = !!t?.options;
  const idx = fields.findIndex((x) => x.id === f.id);
  const before = fields.slice(0, idx).filter((x) => FIELD_TYPES[x.type]?.input && x.key);
  const setOpt = (i, v) => upd({ options: f.options.map((o, k) => (k === i ? { ...o, ...v } : o)) });
  const lg = f.logic || { enabled: false, action: 'show', match: 'all', rules: [] };
  const setLg = (v) => upd({ logic: { ...lg, ...v } });
  const ruleField = (r) => fields.find((x) => x.key === r.field);
  const lines = (arr) => (arr || []).join('\n');

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-surface p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink"><span className="text-signal"><Icon name={t?.icon} size={15} /></span>{t?.label}</p>
      <Row label={f.type === 'html' ? 'Name (admin only)' : 'Label'} info="The question or title people see above the field."><Txt value={f.label} onChange={(v) => upd({ label: v, ...(input && f.keyAuto !== false ? { key: keyOf(v, usedKeys) } : {}) })} /></Row>
      {['text', 'textarea', 'email', 'phone', 'number', 'url', 'select'].includes(f.type) && <Row label="Placeholder" info="Grey example text shown inside the empty field."><Txt value={f.placeholder} onChange={(v) => upd({ placeholder: v })} /></Row>}
      {input && f.type !== 'hidden' && <Row label="Help text" info="A small line under the label that explains what to write."><Txt value={f.help} onChange={(v) => upd({ help: v })} /></Row>}
      {f.type === 'heading' && <Row label="Description" info="Optional small text under the section title."><Txt value={f.help} onChange={(v) => upd({ help: v })} /></Row>}
      {input && f.type !== 'hidden' && f.type !== 'consent' && <Sw label="Required" info="The form cannot be sent until this field is answered." value={!!f.required} onChange={(v) => upd({ required: v })} />}
      {(input || f.type === 'total') && f.type !== 'hidden' && <Row label="Width" info="Half and third widths put fields side by side on larger screens."><Seg value={f.width || 'full'} onChange={(v) => upd({ width: v })} options={[['full', 'Full'], ['twothirds', '2/3'], ['half', '1/2'], ['third', '1/3']]} /></Row>}

      {f.type === 'textarea' && <Row label="Height (rows)" info="How many lines tall the box is."><Num value={f.rows || 5} onChange={(v) => upd({ rows: v })} /></Row>}
      {['text', 'textarea'].includes(f.type) && <div className="grid grid-cols-2 gap-3"><Row label="Min length" info="The fewest characters allowed."><Num value={f.minLength} onChange={(v) => upd({ minLength: v })} /></Row><Row label="Max length" info="The most characters allowed."><Num value={f.maxLength} onChange={(v) => upd({ maxLength: v })} /></Row></div>}
      {f.type === 'number' && <div className="grid grid-cols-2 gap-3"><Row label="Lowest" info="The smallest number allowed."><Num value={f.min} onChange={(v) => upd({ min: v })} /></Row><Row label="Highest" info="The biggest number allowed."><Num value={f.max} onChange={(v) => upd({ max: v })} /></Row></div>}
      {f.type === 'hidden' && <Row label="Default value" info="A value saved with each answer without the visitor seeing it. Also filled from the web address, for example ?source=facebook."><Txt value={f.defaultValue} onChange={(v) => upd({ defaultValue: v })} /></Row>}
      {input && f.type !== 'hidden' && f.type !== 'product' && !opts && !['rating', 'scale', 'grid', 'file', 'consent'].includes(f.type) && <Row label="Default value" info="Pre-filled text. Visitors can change it."><Txt value={f.defaultValue} onChange={(v) => upd({ defaultValue: v })} /></Row>}

      {opts && (
        <Row label="Choices" info="The answers people can pick. Drag order with the arrows. Add a price to a choice if it should add to the total of a paid form.">
          <div className="space-y-2">
            {(f.options || []).map((o, i) => (
              <div key={i} className="flex gap-1.5">
                <input value={o.label} onChange={(e) => setOpt(i, { label: e.target.value })} className="field min-w-0 flex-1 py-2 text-sm" aria-label={`Choice ${i + 1}`} />
                {(payOn || o.price) ? <input type="number" step="any" value={o.price ?? ''} onChange={(e) => setOpt(i, { price: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="Price" aria-label="Price" className="field w-20 py-2 text-sm" /> : null}
                <button type="button" aria-label="Move up" onClick={() => { const a = [...f.options]; if (i > 0) { [a[i], a[i - 1]] = [a[i - 1], a[i]]; upd({ options: a }); } }} className="text-muted hover:text-ink"><ChevronUp size={15} /></button>
                <button type="button" aria-label="Remove choice" onClick={() => upd({ options: f.options.filter((_, k) => k !== i) })} className="text-muted hover:text-bad"><X size={15} /></button>
              </div>
            ))}
            <button type="button" className="btn-ghost btn-sm" onClick={() => upd({ options: [...(f.options || []), { label: `Option ${(f.options || []).length + 1}` }] })}><Plus size={13} />Add choice</button>
            {!payOn && <button type="button" className="ml-2 text-xs text-muted underline" onClick={() => setOpt(0, { price: f.options[0]?.price ?? 0 })}>Add prices</button>}
          </div>
        </Row>
      )}
      {['radio', 'checkbox'].includes(f.type) && <Sw label='Add an "Other" answer' info="Adds a line where people type their own answer, like Google Forms." value={!!f.allowOther} onChange={(v) => upd({ allowOther: v })} />}
      {f.type === 'checkbox' && <div className="grid grid-cols-2 gap-3"><Row label="Pick at least" info="Fewest choices a person must tick."><Num value={f.min} onChange={(v) => upd({ min: v })} /></Row><Row label="Pick at most" info="Most choices a person can tick."><Num value={f.max} onChange={(v) => upd({ max: v })} /></Row></div>}
      {f.type === 'rating' && <Row label="Number of stars" info="How many stars to show, 3 to 10."><Num value={f.max || 5} onChange={(v) => upd({ max: Math.max(3, Math.min(10, v || 5)) })} /></Row>}
      {f.type === 'scale' && <>
        <div className="grid grid-cols-2 gap-3"><Row label="From" info="First number of the scale."><Num value={f.min ?? 1} onChange={(v) => upd({ min: v })} /></Row><Row label="To" info="Last number of the scale, up to 10."><Num value={f.max ?? 10} onChange={(v) => upd({ max: Math.min(10, v ?? 10) })} /></Row></div>
        <Row label="Low end label" info="Words under the first number."><Txt value={f.minLabel} onChange={(v) => upd({ minLabel: v })} /></Row><Row label="High end label" info="Words under the last number."><Txt value={f.maxLabel} onChange={(v) => upd({ maxLabel: v })} /></Row>
      </>}
      {f.type === 'grid' && <>
        <Row label="Rows (one per line)" info="The things people rate, for example Quality, Speed."><textarea rows={4} className="field text-sm" value={lines(f.rows)} onChange={(e) => upd({ rows: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })} /></Row>
        <Row label="Columns (one per line)" info="The answers to pick for each row, for example Poor, Good, Excellent."><textarea rows={4} className="field text-sm" value={lines(f.columns)} onChange={(e) => upd({ columns: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })} /></Row>
        <Sw label="Every row required" info="The person must answer all rows." value={!!f.required} onChange={(v) => upd({ required: v })} />
      </>}
      {f.type === 'file' && <>
        <Row label="Allowed file types" info="Comma-separated extensions, for example .pdf,.jpg,.png,.docx. Executable and web files are always blocked."><Txt value={f.accept} onChange={(v) => upd({ accept: v })} /></Row>
        <div className="grid grid-cols-2 gap-3"><Row label="Max size (MB)" info="Largest file allowed. Up to 25 MB; on Vercel the host itself limits uploads to about 4.5 MB unless Cloudinary is used."><Num value={f.maxSizeMB} onChange={(v) => upd({ maxSizeMB: v })} /></Row></div>
        <Sw label="Allow several files" info="Let people upload more than one file." value={!!f.multiple} onChange={(v) => upd({ multiple: v })} />
        <Sw label="Required" info="A file must be attached." value={!!f.required} onChange={(v) => upd({ required: v })} />
      </>}
      {f.type === 'consent' && <>
        <Row label="Consent text" info="What the person agrees to. Write a link like [privacy policy](/privacy-policy)."><textarea rows={3} className="field text-sm" value={f.text || ''} onChange={(e) => upd({ text: e.target.value })} /></Row>
        <Sw label="Must be ticked" info="On: the form cannot be sent without ticking." value={f.required !== false} onChange={(v) => upd({ required: v })} />
      </>}
      {f.type === 'html' && <Row label="Text or HTML" info="Any text or simple HTML to show inside the form, such as a note or a link. Scripts are removed."><textarea rows={6} className="field font-mono text-xs" value={f.html || ''} onChange={(e) => upd({ html: e.target.value })} /></Row>}
      {f.type === 'page' && <p className="text-sm text-muted">Fields after this break appear on the next step. Visitors move forward with a Next button and see a progress bar.</p>}
      {f.type === 'product' && <>
        <Row label="How people choose" info="Single: one fixed item with one price. Radio buttons or Dropdown: pick one of several options, each with its own price."><Seg value={f.choice || 'single'} onChange={(v) => upd({ choice: v })} options={[['single', 'Single item'], ['radio', 'Radio buttons'], ['select', 'Dropdown']]} /></Row>
        {(f.choice || 'single') === 'single' && <Row label="Price" info="What one costs, in the currency set under Payment."><Num value={f.price} onChange={(v) => upd({ price: v })} /></Row>}
        <Sw label="Let people pick a quantity" info="Adds a quantity box, for example number of tickets or seats." value={!!f.quantity} onChange={(v) => upd({ quantity: v })} />
        {f.choice !== 'single' && <Sw label="Required" info="A choice must be picked." value={!!f.required} onChange={(v) => upd({ required: v })} />}
      </>}
      {f.type === 'total' && <p className="text-sm text-muted">Shows the live total of every priced field, with a line for each. Turn on Take payment in the Payment tab.</p>}

      {input && (
        <details className="rounded-xl border border-line">
          <summary className="cursor-pointer px-3.5 py-2.5 text-[13px] font-medium text-ink">Advanced</summary>
          <div className="space-y-3 border-t border-line p-3.5">
            <Row label="Field key" info="The short name used in emails, exports and links. Letters, numbers and underscores. It follows the label until you change it here."><Txt value={f.key} onChange={(v) => upd({ key: keyOf(v, usedKeys), keyAuto: false })} /></Row>
            <Row label="Prefill from link" info="A word in the web address that fills this field, for example ?plan=pro with the word plan."><Txt value={f.prefillParam} onChange={(v) => upd({ prefillParam: v })} /></Row>
            <Row label="Note for me" info="A private reminder that visitors never see."><Txt value={f.adminNote} onChange={(v) => upd({ adminNote: v })} /></Row>
          </div>
        </details>
      )}

      {!['page', 'divider'].includes(f.type) && (
        <div className="rounded-xl border border-line">
          <div className="flex items-center justify-between px-3.5 py-2.5"><span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">Conditional logic<InfoTip size={13} text="Show or hide this field depending on earlier answers. Example: show Current website only when What do you need is SEO. Hidden fields are not required and are not saved." /></span>
            <button type="button" role="switch" aria-checked={!!lg.enabled} onClick={() => setLg({ enabled: !lg.enabled, rules: lg.rules?.length ? lg.rules : [{ field: before[0]?.key || '', op: 'is', value: '' }] })} className={cn('relative h-6 w-11 rounded-full transition', lg.enabled ? 'bg-signal' : 'bg-line')}><span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition', lg.enabled ? 'left-[22px]' : 'left-0.5')} /></button></div>
          {lg.enabled && (
            <div className="space-y-2.5 border-t border-line p-3.5">
              {!before.length && <p className="text-xs text-muted">Add a question above this field first, then you can use it in a rule.</p>}
              <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-body"><Sel value={lg.action} onChange={(v) => setLg({ action: v })} options={[['show', 'Show'], ['hide', 'Hide']]} /> this field if <Sel value={lg.match} onChange={(v) => setLg({ match: v })} options={[['all', 'all'], ['any', 'any']]} /> of these match:</div>
              {(lg.rules || []).map((r, i) => {
                const rf = ruleField(r); const choices = rf?.options?.map((o) => o.label);
                const setRule = (v) => setLg({ rules: lg.rules.map((x, k) => (k === i ? { ...x, ...v } : x)) });
                return (
                  <div key={i} className="space-y-1.5 rounded-lg bg-base/50 p-2">
                    <Sel value={r.field} onChange={(v) => setRule({ field: v, value: '' })} empty="Pick a question" options={before.map((x) => [x.key, x.label])} />
                    <div className="flex gap-1.5">
                      <Sel value={r.op} onChange={(v) => setRule({ op: v })} options={OPS} />
                      {!['filled', 'empty'].includes(r.op) && (choices ? <Sel value={r.value} onChange={(v) => setRule({ value: v })} empty="Choose" options={choices} /> : <Txt value={r.value} onChange={(v) => setRule({ value: v })} placeholder="value" />)}
                      <button type="button" aria-label="Remove rule" onClick={() => setLg({ rules: lg.rules.filter((_, k) => k !== i) })} className="text-muted hover:text-bad"><X size={15} /></button>
                    </div>
                  </div>
                );
              })}
              <button type="button" className="btn-ghost btn-sm" onClick={() => setLg({ rules: [...(lg.rules || []), { field: before[0]?.key || '', op: 'is', value: '' }] })}><Plus size={13} />Add rule</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
