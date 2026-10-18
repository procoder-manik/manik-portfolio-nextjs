'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, Pencil, Trash2, ShieldCheck, Ban } from 'lucide-react';
import { api } from './api';
import { Notice } from './Editor';
import Dialog from './Dialog';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';
import { ROLES } from '@/lib/roles';
import { fmtDate, cn } from '@/lib/utils';

export default function UsersView() {
  const [items, setItems] = useState(null); const [err, setErr] = useState(''); const [edit, setEdit] = useState(null); const [saving, setSaving] = useState(false); const [msg, setMsg] = useState('');
  const load = useCallback(() => api('/api/admin/users').then((j) => { setItems(j.items); if (j.noDB) setErr('Connect MongoDB (set MONGODB_URI) to add more users. Without a database only the admin from your environment variables can sign in.'); }).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);

  async function save(e) {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      const b = { ...edit };
      if (edit._id) await api('/api/admin/users', { method: 'PUT', body: { id: edit._id, name: b.name, role: b.role, disabled: !!b.disabled, password: b.password || undefined } });
      else await api('/api/admin/users', { method: 'POST', body: b });
      setEdit(null); load();
    } catch (er) { setMsg(er.message); }
    setSaving(false);
  }
  async function remove(u) { if (!confirm(`Delete ${u.email}? They can no longer sign in. This cannot be undone.`)) return; try { await api(`/api/admin/users?id=${u._id}`, { method: 'DELETE' }); load(); } catch (er) { setErr(er.message); } }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">Users<InfoTip size={16} text={SECTION_INFO.users} /></h1>
        <button className="btn-primary btn-sm" onClick={() => { setMsg(''); setEdit({ role: 'editor', name: '', email: '', password: '' }); }}><Plus size={15} />Add user</button>
      </div>
      {err && <Notice bad>{err}</Notice>}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {Object.entries(ROLES).map(([k, r]) => <div key={k} className="rounded-xl border border-line bg-surface px-4 py-3"><p className="flex items-center gap-2 text-sm font-semibold text-ink"><ShieldCheck size={15} className="text-signal" />{r.label}</p><p className="mt-1 text-xs text-muted">{r.desc}</p></div>)}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-xs text-muted"><tr><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Last sign-in</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3" /></tr></thead>
          <tbody className="divide-y divide-line">
            {items === null && <tr><td colSpan={5} className="p-10 text-center text-muted"><Loader2 className="mx-auto animate-spin" /></td></tr>}
            {items?.map((u) => (
              <tr key={u._id}>
                <td className="px-4 py-3"><span className="block font-medium text-ink">{u.name || u.email}</span><span className="text-xs text-muted">{u.email}</span></td>
                <td className="px-4 py-3 text-body">{ROLES[u.role || 'administrator']?.label}</td>
                <td className="px-4 py-3 text-muted">{u.lastLoginAt ? fmtDate(u.lastLoginAt, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</td>
                <td className="px-4 py-3">{u.disabled ? <span className="inline-flex items-center gap-1 rounded-full bg-bad/15 px-2.5 py-0.5 text-xs text-bad"><Ban size={12} />Blocked</span> : <span className="rounded-full bg-good/15 px-2.5 py-0.5 text-xs text-good">Active</span>}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right"><button aria-label="Edit" onClick={() => { setMsg(''); setEdit({ ...u, password: '' }); }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-raised"><Pencil size={15} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!edit} onClose={() => setEdit(null)} title={edit?._id ? 'Edit user' : 'Add user'}>
        {edit && (
          <form onSubmit={save} className="space-y-4">
            <div><label className="label" htmlFor="u-name">Name</label><input id="u-name" className="field" value={edit.name || ''} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div><label className="label" htmlFor="u-email">Email</label><input id="u-email" type="email" required disabled={!!edit._id} className="field disabled:opacity-60" value={edit.email || ''} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></div>
            <div><div className="mb-1.5 flex items-center gap-1.5"><label className="text-sm font-medium text-ink" htmlFor="u-role">Role</label><InfoTip text="What this person can open and change. Administrators can do everything. Give people the smallest role that lets them do their job." /></div>
              <select id="u-role" className="field" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}>{Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}</select><p className="mt-1.5 text-xs text-muted">{ROLES[edit.role]?.desc}</p></div>
            <div><div className="mb-1.5 flex items-center gap-1.5"><label className="text-sm font-medium text-ink" htmlFor="u-pass">{edit._id ? 'New password (optional)' : 'Password'}</label><InfoTip text="At least 8 characters. Share it safely and ask the person to change it from Account after their first sign-in." /></div>
              <input id="u-pass" type="password" minLength={8} required={!edit._id} autoComplete="new-password" className="field" value={edit.password || ''} onChange={(e) => setEdit({ ...edit, password: e.target.value })} /></div>
            {edit._id && <label className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm"><span className="flex items-center gap-1.5 font-medium text-ink">Block sign-in<InfoTip text="Stops this person from signing in at once, even if they are signed in now. Their account is kept." /></span><input type="checkbox" checked={!!edit.disabled} onChange={(e) => setEdit({ ...edit, disabled: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--signal))]" /></label>}
            {msg && <p role="alert" className="text-sm text-bad">{msg}</p>}
            <div className="flex justify-between pt-1">{edit._id ? <button type="button" onClick={() => remove(edit).then(() => setEdit(null))} className="btn-ghost btn-sm text-bad"><Trash2 size={14} />Delete</button> : <span />}<button className="btn-primary btn-sm" disabled={saving}>{saving ? 'Saving' : 'Save user'}</button></div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
