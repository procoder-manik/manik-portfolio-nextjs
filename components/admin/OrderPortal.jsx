'use client';
import { useState } from 'react';
import { Loader2, Save, Send, Plus, Trash2, ExternalLink, UserRoundCheck } from 'lucide-react';
import { api } from './api';
import { fmtDate } from '@/lib/utils';
import InfoTip from '@/components/site/InfoTip';

/* What the buyer sees in /account: progress, due date, updates and files. */
export default function OrderPortal({ o, onChange, say }) {
  const [progress, setProgress] = useState(o.progress || 0);
  const [due, setDue] = useState(o.dueDate ? String(o.dueDate).slice(0, 10) : '');
  const [files, setFiles] = useState(o.deliverables || []);
  const [u, setU] = useState({ text: '', link: '', linkLabel: '' });
  const [mail, setMail] = useState(true);
  const [busy, setBusy] = useState('');

  const put = (body) => api(`/api/admin/orders/${o._id}`, { method: 'PUT', body }).then((j) => { onChange(j.item); return j.item; });

  const saveBasics = async () => {
    setBusy('basics');
    try { await put({ progress: Number(progress) || 0, dueDate: due || null, deliverables: files.filter((f) => f.url || f.label) }); say('ok', 'Saved. The customer sees it in their account now.'); }
    catch (e) { say('err', e.message); }
    setBusy('');
  };

  const postUpdate = async () => {
    if (!u.text.trim()) return say('err', 'Write the update first.');
    setBusy('update');
    try {
      await put({ updates: [...(o.updates || []), { text: u.text.trim(), link: u.link.trim() || undefined, linkLabel: u.linkLabel.trim() || undefined, at: new Date() }], progress: Number(progress) || 0 });
      let note = 'Update posted.';
      if (mail) {
        try { await api('/api/admin/mail', { method: 'POST', body: { kind: 'custom', orderId: o._id, attach: 'account', subject: `Update on your order ${o.number}`, message: u.text.trim() + (u.link ? `\n\n${u.linkLabel || 'Link'}: ${u.link}` : '') } }); note = 'Update posted and emailed to the customer.'; }
        catch (e) { note = `Update posted, but the email failed: ${e.message}`; }
      }
      setU({ text: '', link: '', linkLabel: '' }); say('ok', note);
    } catch (e) { say('err', e.message); }
    setBusy('');
  };

  const removeUpdate = async (i) => {
    if (!confirm('Delete this update? The customer will no longer see it.')) return;
    setBusy('del');
    try { await put({ updates: (o.updates || []).filter((_, k) => k !== i) }); } catch (e) { say('err', e.message); }
    setBusy('');
  };

  const setFile = (i, k, v) => setFiles(files.map((f, n) => (n === i ? { ...f, [k]: v } : f)));
  const updates = (o.updates || []).map((x, i) => ({ ...x, i })).reverse();

  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold"><UserRoundCheck size={17} className="text-signal" />Customer portal<InfoTip text="Everything in this box is what the customer sees on this order in their account (My account > Orders). Use it to keep them informed without long email threads." /></h2>
        <span className="text-xs text-muted">{o.customerId ? 'Linked to a customer account' : 'Not linked to an account yet. They still see it after confirming this email.'}</span>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label flex items-center gap-1.5" htmlFor="pp">Progress: {progress}%<InfoTip text="How far along the project is. The customer sees it as a progress bar. Completed orders always show 100%." /></label>
          <input id="pp" type="range" min={0} max={100} step={5} value={progress} onChange={(e) => setProgress(e.target.value)} className="w-full accent-[rgb(var(--signal))]" />
        </div>
        <div><label className="label flex items-center gap-1.5" htmlFor="pd">Expected delivery<InfoTip text="The date you plan to deliver. Shown in the customer account. Empty shows the package delivery time instead." /></label><input id="pd" type="date" value={due} onChange={(e) => setDue(e.target.value)} className="field" /></div>
      </div>

      <h3 className="mt-6 flex items-center gap-1.5 text-sm font-medium">Files and links for the customer<InfoTip text="Links the customer can open from their account: staging site, Figma, Google Drive folder, logins document, final files. Add a label so they know what each one is." /></h3>
      <div className="mt-2 space-y-2">
        {files.map((f, i) => (
          <div key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1fr_1.4fr_auto]">
            <input value={f.label || ''} onChange={(e) => setFile(i, 'label', e.target.value)} placeholder="Label, e.g. Design file" className="field py-2 text-sm" />
            <input value={f.url || ''} onChange={(e) => setFile(i, 'url', e.target.value)} placeholder="https://" className="field py-2 text-sm" />
            <button onClick={() => setFiles(files.filter((_, n) => n !== i))} className="grid h-10 w-10 place-items-center rounded-lg border border-line text-muted hover:text-bad" aria-label="Remove"><Trash2 size={14} /></button>
            <input value={f.note || ''} onChange={(e) => setFile(i, 'note', e.target.value)} placeholder="Note (optional)" className="field py-2 text-sm sm:col-span-3" />
          </div>
        ))}
        <button onClick={() => setFiles([...files, { label: '', url: '', note: '' }])} className="btn-ghost btn-sm"><Plus size={14} />Add file or link</button>
      </div>
      <button onClick={saveBasics} disabled={!!busy} className="btn-primary btn-sm mt-4">{busy === 'basics' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save progress and files</button>

      <div className="mt-8 border-t border-line pt-6">
        <h3 className="flex items-center gap-1.5 text-sm font-medium">Post an update<InfoTip text="A progress note added to the timeline on the customer's order page, newest first. Regular short updates build trust and cut down on 'any news?' messages." /></h3>
        <textarea rows={3} value={u.text} onChange={(e) => setU({ ...u, text: e.target.value })} placeholder="Homepage design is ready for your review. Comments welcome until Friday." className="field mt-2" />
        <div className="mt-2 grid gap-2 sm:grid-cols-[1.4fr_1fr]">
          <input value={u.link} onChange={(e) => setU({ ...u, link: e.target.value })} placeholder="Link (optional): staging site, Figma, Drive" className="field py-2 text-sm" />
          <input value={u.linkLabel} onChange={(e) => setU({ ...u, linkLabel: e.target.value })} placeholder="Link label, e.g. Preview the design" className="field py-2 text-sm" />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={mail} onChange={(e) => setMail(e.target.checked)} className="accent-[rgb(var(--signal))]" />Email this update to the customer<InfoTip text="On: the update is also emailed to the customer with a button to open their account. Off: it only appears in their account." /></label>
        <button onClick={postUpdate} disabled={!!busy} className="btn-primary btn-sm mt-3">{busy === 'update' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Post update</button>

        {updates.length > 0 && (
          <ol className="mt-6 space-y-3">
            {updates.map((x) => (
              <li key={x.i} className="flex gap-3 rounded-xl bg-raised/60 p-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted">{fmtDate(x.at, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-ink">{x.text}</p>
                  {x.link && <a href={x.link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-signal"><ExternalLink size={12} />{x.linkLabel || x.link}</a>}
                </div>
                <button onClick={() => removeUpdate(x.i)} disabled={!!busy} className="self-start text-muted hover:text-bad" aria-label="Delete update"><Trash2 size={14} /></button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
