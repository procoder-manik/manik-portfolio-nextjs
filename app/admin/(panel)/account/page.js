'use client';
import { useState } from 'react';
import { Save } from 'lucide-react';
import { api } from '@/components/admin/api';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';

export default function Account() {
  const [msg, setMsg] = useState({ t: '', m: '' });
  async function submit(e) {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget));
    if (f.next && f.next !== f.confirm) return setMsg({ t: 'err', m: 'The new passwords do not match.' });
    try { await api('/api/admin/account', { method: 'PUT', body: f }); setMsg({ t: 'ok', m: 'Account updated.' }); e.target.reset(); } catch (err) { setMsg({ t: 'err', m: err.message }); }
  }
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold">Account<InfoTip size={16} text={SECTION_INFO.account} /></h1>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-surface p-6">
        <div><label className="label" htmlFor="name">Display name</label><input id="name" name="name" className="field" /></div>
        <div><label className="label" htmlFor="current">Current password</label><input id="current" name="current" type="password" required className="field" autoComplete="current-password" /></div>
        <div><label className="label" htmlFor="next">New password</label><input id="next" name="next" type="password" minLength={8} className="field" autoComplete="new-password" /></div>
        <div><label className="label" htmlFor="confirm">Repeat new password</label><input id="confirm" name="confirm" type="password" className="field" autoComplete="new-password" /></div>
        {msg.m && <p className={`text-sm ${msg.t === 'ok' ? 'text-good' : 'text-bad'}`}>{msg.m}</p>}
        <button className="btn-primary btn-sm"><Save size={14} />Save account</button>
      </form>
    </div>
  );
}
