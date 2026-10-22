'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, FileEdit, AlertTriangle, RotateCcw } from 'lucide-react';

/* Simple modal used for the delete choices and other confirmations. Escape or a click outside closes it. */
export default function Dialog({ open, title, children, onClose, wide }) {
  // Drawn straight into <body>: a header with backdrop-blur (or any transform) would otherwise turn "fixed" into "inside the header".
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-line bg-surface shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4"><h3 className="font-semibold text-ink">{title}</h3><button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink"><X size={18} /></button></div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/* The delete flow: step 1 pick Trash, Draft or Delete permanently; step 2 (permanent only) type DELETE. */

export function DeleteDialog({ open, onClose, name, singular = 'item', canDraft, inTrash, trashDays = 30, count = 1, onTrash, onDraft, onRestore, onPermanent }) {
  const [step, setStep] = useState(1); const [typed, setTyped] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setStep(1); setTyped(''); setBusy(false); } }, [open]);
  const run = async (fn) => { setBusy(true); try { await fn(); } finally { setBusy(false); } };
  const what = count > 1 ? `${count} ${singular}s` : `"${name || singular}"`;
  const Opt = ({ icon: I, title, text, tone, onClick }) => (
    <button type="button" disabled={busy} onClick={onClick} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition hover:border-signal disabled:opacity-60 ${tone === 'bad' ? 'border-bad/40 hover:border-bad' : 'border-line'}`}>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone === 'bad' ? 'bg-bad/15 text-bad' : 'bg-signal/15 text-signal'}`}><I size={17} /></span>
      <span><span className="block text-sm font-semibold text-ink">{title}</span><span className="block text-xs text-muted">{text}</span></span>
    </button>
  );
  return (
    <Dialog open={open} onClose={onClose} title={step === 2 ? 'Delete permanently' : inTrash ? `This ${singular} is in the Trash` : `Remove ${what}?`}>
      {step === 1 ? (
        <div className="space-y-2.5">
          {inTrash
            ? <>
              <Opt icon={RotateCcw} title="Restore" text="Put it back exactly as it was before. Nothing is lost." onClick={() => run(onRestore)} />
              <Opt icon={Trash2} tone="bad" title="Delete permanently" text="Removes it for good. This cannot be undone." onClick={() => setStep(2)} />
            </>
            : <>
              <Opt icon={Trash2} title="Move to Trash" text={`Hidden from your site at once. Kept in the Trash${trashDays ? ` for ${trashDays} days` : ''} so you can restore it.`} onClick={() => run(onTrash)} />
              {canDraft && <Opt icon={FileEdit} title="Switch to draft" text="Hidden from visitors but stays in your list, ready to edit and publish again." onClick={() => run(onDraft)} />}
              <Opt icon={AlertTriangle} tone="bad" title="Delete permanently" text="Skips the Trash and removes it for good. This cannot be undone." onClick={() => setStep(2)} />
            </>}
        </div>
      ) : (
        <div>
          <p className="flex items-start gap-2.5 rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad"><AlertTriangle size={16} className="mt-0.5 shrink-0" />You are about to delete {what} forever. It cannot be restored.</p>
          <label className="label mt-4" htmlFor="del-type">Type DELETE to confirm</label>
          <input id="del-type" autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} className="field" placeholder="DELETE" autoComplete="off" />
          <div className="mt-5 flex justify-between"><button className="btn-ghost btn-sm" onClick={() => setStep(1)}>Back</button><button disabled={typed !== 'DELETE' || busy} onClick={() => run(onPermanent)} className="btn-sm inline-flex items-center gap-2 rounded-full bg-bad px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"><Trash2 size={14} />Delete permanently</button></div>
        </div>
      )}
    </Dialog>
  );
}
