'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check } from 'lucide-react';

export function CopyValue({ value }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard?.writeText(value); setOk(true); setTimeout(() => setOk(false), 1500); }} className="inline-flex items-center gap-2 font-mono text-[0.95rem] font-medium text-ink hover:text-signal" aria-label={`Copy ${value}`}>
      {value}{ok ? <Check size={14} className="text-good" /> : <Copy size={14} className="text-muted" />}
    </button>
  );
}

export default function PaymentProof({ number, token, wallet }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch(`/api/orders/${number}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, t: token }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) router.refresh(); else { setError(j.error || 'That did not save. Try again.'); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="mt-8 border-t border-line pt-6">
      <h3 className="font-semibold text-ink">Already paid? Confirm it here</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="p-trx">Transaction ID</label><input id="p-trx" name="transactionId" required className="field" placeholder="e.g. 9BD7XK2L1Q" /></div>
        <div><label className="label" htmlFor="p-from">{wallet ? 'Sent from number' : 'Sender name or email'}</label><input id="p-from" name="senderNumber" className="field" /></div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-bad">{error}</p>}
      <button className="btn-primary mt-5" disabled={busy}>{busy ? 'Saving…' : 'Submit payment details'}</button>
    </form>
  );
}
