'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, Copy, Download, KeyRound, Loader2 } from 'lucide-react';
import { api } from '@/components/admin/api';

const Card = ({ children }) => <div className="mt-8 rounded-2xl border border-line bg-surface p-6">{children}</div>;
const Err = ({ msg }) => (msg ? <p role="alert" className="text-sm text-bad">{msg}</p> : null);
const Pass = () => <div><label className="label" htmlFor="tf-pass">Current password</label><input id="tf-pass" name="password" type="password" required autoComplete="current-password" className="field" /></div>;
const Code = ({ label = 'Code from the app (or a backup code)' }) => <div><label className="label" htmlFor="tf-code">{label}</label><input id="tf-code" name="code" required autoComplete="one-time-code" spellCheck={false} className="field font-mono tracking-widest" /></div>;

/* Account > Two-step verification: turn it on with an authenticator app, see backup codes once, turn it off. */
export default function TwoFactor() {
  const [st, setSt] = useState(null);
  const [mode, setMode] = useState('idle'); // idle | password | scan | codes | off | renew
  const [setup, setSetup] = useState(null);
  const [codes, setCodes] = useState([]);
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const load = () => api('/api/admin/2fa').then(setSt).catch((e) => setSt({ error: e.message }));
  useEffect(() => { load(); }, []);

  async function run(body, after) {
    setBusy(true); setMsg('');
    try { after(await api('/api/admin/2fa', { method: 'POST', body })); } catch (e) { setMsg(e.message); }
    setBusy(false);
  }
  const form = (e) => { e.preventDefault(); return Object.fromEntries(new FormData(e.currentTarget)); };
  const start = (e) => { const f = form(e); run({ action: 'start', password: f.password }, (j) => { setSetup(j); setMode('scan'); }); };
  const enable = (e) => { const f = form(e); run({ action: 'enable', password: f.password, code: f.code }, (j) => { setCodes(j.codes); setSaved(false); setMode('codes'); load(); }); };
  const disable = (e) => { const f = form(e); run({ action: 'disable', password: f.password, code: f.code }, () => { setMode('idle'); load(); }); };
  const renew = (e) => { const f = form(e); run({ action: 'backup', password: f.password, code: f.code }, (j) => { setCodes(j.codes); setSaved(false); setMode('codes'); load(); }); };
  const text = codes.join('\n');
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([`Backup codes. Each works once.\n\n${text}\n`], { type: 'text/plain' })); a.download = 'admin-backup-codes.txt'; a.click(); URL.revokeObjectURL(a.href); };

  if (!st) return <Card><Loader2 className="animate-spin text-muted" /></Card>;
  if (st.noDB) return <Card><h2 className="font-semibold text-ink">Two-step verification</h2><p className="mt-2 text-sm text-muted">Needs the database. Add MONGODB_URI to your environment first.</p></Card>;
  if (st.error) return <Card><p className="text-sm text-bad">{st.error}</p></Card>;

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${st.enabled ? 'bg-good/15 text-good' : 'bg-raised text-muted'}`}>{st.enabled ? <ShieldCheck size={20} /> : <ShieldOff size={20} />}</span>
        <div>
          <h2 className="font-semibold text-ink">Two-step verification {st.enabled ? <span className="ml-1 rounded-full bg-good/15 px-2 py-0.5 text-xs font-medium text-good">On</span> : <span className="ml-1 rounded-full bg-raised px-2 py-0.5 text-xs font-medium text-muted">Off</span>}</h2>
          <p className="mt-1 text-sm text-muted">{st.enabled ? `Signing in needs your password and a 6-digit code from your phone. ${st.backupLeft} backup code${st.backupLeft === 1 ? '' : 's'} left.` : 'Add a 6-digit code from your phone (Google Authenticator or similar) to your password, so a stolen password alone cannot open the admin.'}</p>
        </div>
      </div>

      {mode === 'idle' && (st.enabled
        ? <div className="mt-5 flex flex-wrap gap-2"><button className="btn-ghost btn-sm" onClick={() => { setMsg(''); setMode('renew'); }}><KeyRound size={14} />New backup codes</button><button className="btn-ghost btn-sm text-bad" onClick={() => { setMsg(''); setMode('off'); }}>Turn off</button></div>
        : <button className="btn-primary btn-sm mt-5" onClick={() => { setMsg(''); setMode('password'); }}>Set up</button>)}

      {mode === 'password' && <form onSubmit={start} className="mt-5 space-y-4"><Pass /><Err msg={msg} /><div className="flex gap-2"><button className="btn-primary btn-sm" disabled={busy}>Continue</button><button type="button" className="btn-ghost btn-sm" onClick={() => setMode('idle')}>Cancel</button></div></form>}

      {mode === 'scan' && setup && (
        <form onSubmit={enable} className="mt-5 space-y-4">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-body"><li>Open your authenticator app and add an account.</li><li>Scan this QR code (or type the key below).</li><li>Enter the 6-digit code the app shows.</li></ol>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qr} alt="QR code for your authenticator app" width={224} height={224} className="rounded-xl border border-line bg-white p-1" />
          <p className="break-all font-mono text-xs text-muted">Key: {setup.secret}</p>
          <Pass /><Code label="6-digit code from the app" /><Err msg={msg} />
          <div className="flex gap-2"><button className="btn-primary btn-sm" disabled={busy}>Turn on</button><button type="button" className="btn-ghost btn-sm" onClick={() => setMode('idle')}>Cancel</button></div>
        </form>
      )}

      {mode === 'codes' && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-body"><b className="text-ink">Save these backup codes now.</b> They are shown only once. Each works one time if you lose your phone. Keep them somewhere safe, away from your phone.</p>
          <ul className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-base/50 p-4 font-mono text-sm text-ink">{codes.map((c) => <li key={c}>{c}</li>)}</ul>
          <div className="flex flex-wrap gap-2"><button type="button" className="btn-ghost btn-sm" onClick={() => navigator.clipboard?.writeText(text)}><Copy size={14} />Copy</button><button type="button" className="btn-ghost btn-sm" onClick={download}><Download size={14} />Download</button></div>
          <label className="flex items-center gap-2 text-sm text-body"><input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--signal))]" />I saved these codes</label>
          <button className="btn-primary btn-sm" disabled={!saved} onClick={() => { setCodes([]); setMode('idle'); }}>Done</button>
        </div>
      )}

      {mode === 'off' && <form onSubmit={disable} className="mt-5 space-y-4"><p className="text-sm text-muted">Other devices will be signed out.</p><Pass /><Code /><Err msg={msg} /><div className="flex gap-2"><button className="btn-primary btn-sm" disabled={busy}>Turn off</button><button type="button" className="btn-ghost btn-sm" onClick={() => setMode('idle')}>Cancel</button></div></form>}
      {mode === 'renew' && <form onSubmit={renew} className="mt-5 space-y-4"><p className="text-sm text-muted">The old backup codes stop working.</p><Pass /><Code /><Err msg={msg} /><div className="flex gap-2"><button className="btn-primary btn-sm" disabled={busy}>Make new codes</button><button type="button" className="btn-ghost btn-sm" onClick={() => setMode('idle')}>Cancel</button></div></form>}
    </Card>
  );
}
