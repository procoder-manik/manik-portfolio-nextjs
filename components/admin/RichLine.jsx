'use client';
import { useEffect, useRef, useState } from 'react';
import { Link2, Unlink, Bold, Italic } from 'lucide-react';
import { sanitizeInline, SAFE_HREF } from '@/lib/rich-inline';
import { cn } from '@/lib/utils';

/* A small rich-text line: type your text, select any part, and link or unlink it. */
export default function RichLine({ id, value, onChange, f = {} }) {
  const ref = useRef(null);
  const last = useRef(null);
  const saved = useRef(null);
  const [dlg, setDlg] = useState(null);
  const [msg, setMsg] = useState('');
  const [inLink, setInLink] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el && (value || '') !== last.current) { el.innerHTML = sanitizeInline(value || ''); last.current = value || ''; }
  }, [value]);

  const getRange = () => {
    const s = window.getSelection();
    if (!s || !s.rangeCount) return null;
    const r = s.getRangeAt(0);
    return ref.current && ref.current.contains(r.commonAncestorContainer) ? r : null;
  };
  const anchorOf = (r) => {
    let n = r && r.commonAncestorContainer;
    while (n && n !== ref.current) { if (n.nodeType === 1 && n.tagName === 'A') return n; n = n.parentNode; }
    return null;
  };

  useEffect(() => {
    const on = () => { const r = getRange(); setInLink(!!(r && anchorOf(r))); };
    document.addEventListener('selectionchange', on);
    return () => document.removeEventListener('selectionchange', on);
  }, []);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    let html = sanitizeInline(el.innerHTML).replace(/(<br>)+$/, '');
    if (!el.textContent.trim()) { html = ''; if (el.innerHTML) el.innerHTML = ''; }
    last.current = html;
    onChange(html);
  };

  const fmt = (cmd) => { ref.current.focus(); document.execCommand(cmd); emit(); };

  const openLink = () => {
    const r = getRange();
    if (!r) { setMsg('Click inside the text first.'); return; }
    const a = anchorOf(r);
    if (!a && r.collapsed) { setMsg('Select the words you want to link first.'); return; }
    saved.current = r.cloneRange();
    setMsg('');
    setDlg({ href: a ? a.getAttribute('href') || '' : '', newTab: a ? a.getAttribute('target') === '_blank' : true, anchor: a });
  };

  const apply = () => {
    let url = (dlg.href || '').trim();
    if (!url) return;
    if (!SAFE_HREF.test(url) && /^[\w-]+(\.[\w-]+)+/.test(url)) url = `https://${url}`;
    if (!SAFE_HREF.test(url)) { setMsg('Use a full link like https://example.com or /contact'); return; }
    const el = ref.current;
    el.focus();
    let anchors = [];
    if (dlg.anchor && el.contains(dlg.anchor)) anchors = [dlg.anchor];
    else {
      const s = window.getSelection();
      s.removeAllRanges();
      if (saved.current) s.addRange(saved.current);
      document.execCommand('createLink', false, '#__rt__');
      anchors = [...el.querySelectorAll('a[href="#__rt__"]')];
    }
    anchors.forEach((a) => {
      a.setAttribute('href', url);
      if (dlg.newTab) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); }
      else { a.removeAttribute('target'); a.removeAttribute('rel'); }
    });
    setDlg(null); setMsg('');
    emit();
  };

  const unlink = () => {
    const r = getRange() || saved.current;
    const a = anchorOf(r);
    if (a) { while (a.firstChild) a.parentNode.insertBefore(a.firstChild, a); a.remove(); }
    else if (r && !r.collapsed) { ref.current.focus(); document.execCommand('unlink'); }
    else { setMsg('Place the cursor inside a link to remove it.'); return; }
    setMsg(''); setDlg(null);
    emit();
  };

  const fillDefault = () => { ref.current.textContent = f.defaultText; emit(); ref.current.focus(); };

  const Btn = ({ title, onClick, disabled, children }) => (
    <button type="button" title={title} aria-label={title} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-lg text-body transition hover:bg-raised hover:text-ink disabled:opacity-40">{children}</button>
  );

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-1 rounded-xl border border-line bg-base/50 p-1">
        <Btn title="Bold" onClick={() => fmt('bold')}><Bold size={15} /></Btn>
        <Btn title="Italic" onClick={() => fmt('italic')}><Italic size={15} /></Btn>
        <span className="mx-1 h-5 w-px bg-line" />
        <Btn title="Add or edit link (select text first)" onClick={openLink}><Link2 size={15} /></Btn>
        <Btn title="Remove link" onClick={unlink} disabled={!inLink}><Unlink size={15} /></Btn>
        {f.defaultText && !(value || '') && <button type="button" onClick={fillDefault} className="ml-auto rounded-lg px-2.5 py-1.5 text-xs font-medium text-signal hover:bg-raised">Edit default text</button>}
      </div>
      {dlg && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-base/50 p-2">
          <input autoFocus value={dlg.href} onChange={(e) => setDlg({ ...dlg, href: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply(); } if (e.key === 'Escape') setDlg(null); }}
            placeholder="https://example.com or /contact" className="field min-w-[200px] flex-1" />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-body"><input type="checkbox" checked={dlg.newTab} onChange={(e) => setDlg({ ...dlg, newTab: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--signal))]" />New tab</label>
          <button type="button" onClick={apply} className="btn-primary btn-sm">Apply</button>
          <button type="button" onClick={() => setDlg(null)} className="btn-ghost btn-sm">Cancel</button>
        </div>
      )}
      <div id={id} ref={ref} contentEditable suppressContentEditableWarning role="textbox" aria-label={f.label} spellCheck
        data-placeholder={f.defaultText ? `Default: ${f.defaultText}` : f.placeholder || ''}
        onInput={emit} onBlur={emit}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.execCommand('insertLineBreak'); } }}
        onPaste={(e) => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain').replace(/\s*\n\s*/g, ' ')); }}
        className="field min-h-[46px] cursor-text [&_a]:text-signal [&_a]:underline empty:before:pointer-events-none empty:before:text-muted empty:before:content-[attr(data-placeholder)]" />
      {msg && <p className="mt-1.5 text-xs text-bad">{msg}</p>}
      <p className="mt-1.5 text-xs text-muted">Select any words, then click the link button. Use {'{year}'} for the current year and {'{site}'} for your site name.</p>
    </div>
  );
}
