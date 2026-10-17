'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, FolderPlus } from 'lucide-react';

/* Button on the private order page: adds the order to the signed-in account. */
export default function ClaimOrder({ number, token }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function claim() {
    setBusy(true); setErr('');
    const r = await fetch('/api/account/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number, t: token }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) router.push(`/account/orders/${number}`); else { setErr(j.error || 'That did not work.'); setBusy(false); }
  }
  return (
    <div>
      <button onClick={claim} disabled={busy} className="btn-primary btn-sm w-full">{busy ? <Loader2 size={15} className="animate-spin" /> : <FolderPlus size={15} />}Save to my account</button>
      {err && <p role="alert" className="mt-2 text-sm text-bad">{err}</p>}
    </div>
  );
}
