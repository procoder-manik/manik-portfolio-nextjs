'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Loader2, Search, Pencil, AlertTriangle, CheckCircle2, EyeOff } from 'lucide-react';
import { api } from './api';
import { Notice } from './Editor';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';
import { cn } from '@/lib/utils';

const KINDS = ['All', 'Built-in', 'Page', 'Post', 'Project', 'Case study', 'Category'];
const tone = { good: 'bg-good/15 text-good', ok: 'bg-amber/15 text-amber', bad: 'bg-bad/15 text-bad' };

/* Every page on one screen: score, keyword, meta lengths, index state, schema and sitemap. Click Edit SEO to fix one. */
export default function SeoOverview() {
  const [data, setData] = useState(null); const [err, setErr] = useState(''); const [kind, setKind] = useState('All'); const [q, setQ] = useState(''); const [only, setOnly] = useState(''); const [lowFirst, setLowFirst] = useState(false);
  useEffect(() => { api('/api/admin/seo-overview').then(setData).catch((e) => setErr(e.message)); }, []);
  const rows = useMemo(() => [...(data?.rows || [])].sort((a, b) => (lowFirst ? a.score - b.score : 0)).filter((r) => (kind === 'All' || r.kind === kind) && (!q || `${r.title} ${r.path} ${r.keyword}`.toLowerCase().includes(q.toLowerCase())) && (!only || (only === 'noindex' ? r.noindex : only === 'nodesc' ? !r.metaDesc : only === 'nokw' ? !r.keyword : only === 'low' ? r.score < 70 : only === 'dup' ? r.dupKeyword : true))), [data, kind, q, only, lowFirst]);
  const all = data?.rows || [];
  const avg = all.length ? Math.round(all.reduce((a, r) => a + r.score, 0) / all.length) : 0;
  const stat = (label, n, key, info) => <button onClick={() => setOnly(only === key ? '' : key)} className={cn('rounded-xl border px-4 py-3 text-left transition', only === key ? 'border-signal bg-signal/10' : 'border-line bg-surface hover:border-ink/30')}><p className="flex items-center gap-1 text-xs text-muted">{label}<InfoTip size={12} text={info} /></p><p className="font-display text-2xl font-bold text-ink">{n}</p></button>;
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">SEO overview<InfoTip size={16} text={SECTION_INFO['seo-overview']} /></h1>
        <div className="flex gap-2"><Link href="/admin/settings/seo" className="btn-ghost btn-sm">SEO settings</Link></div>
      </div>
      {err && <Notice bad>{err}</Notice>}
      {data?.siteNoindex && <Notice bad>The whole site is hidden from search engines (staging mode). Turn it off in SEO settings when you go live.</Notice>}
      {!data && !err && <div className="grid h-40 place-items-center text-muted"><Loader2 className="animate-spin" /></div>}
      {data && (<>
        <div className="mb-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          <div className="rounded-xl border border-line bg-surface px-4 py-3"><p className="flex items-center gap-1 text-xs text-muted">Average score<InfoTip size={12} text="The average on-page SEO score of all pages. Built-in pages are checked for title and description only." /></p><p className={cn('font-display text-2xl font-bold', avg >= 80 ? 'text-good' : avg >= 50 ? 'text-amber' : 'text-bad')}>{avg}</p></div>
          {stat('Pages', all.length, '', 'Every page on your site that search engines can reach.')}
          {stat('Noindex', all.filter((r) => r.noindex).length, 'noindex', 'Pages hidden from Google on purpose. Check that none of your important pages is on this list.')}
          {stat('Needs work', all.filter((r) => r.score < 70).length, 'low', 'Pages scoring below 70. Start here: these have the most to gain. Click again to clear the filter.')}
          {stat('No description', all.filter((r) => !r.metaDesc).length, 'nodesc', 'Pages with no meta description. Google will pick random text instead.')}
          {stat('No focus keyword', all.filter((r) => !r.keyword).length, 'nokw', 'Pages without a focus keyword. Set one so the checklist can grade the page.')}
          {stat('Duplicate keyword', all.filter((r) => r.dupKeyword).length, 'dup', 'Pages that target the same focus keyword and may compete with each other in search.')}
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {KINDS.map((k) => <button key={k} onClick={() => setKind(k)} className={cn('rounded-full border px-3.5 py-1.5 text-sm transition', kind === k ? 'border-signal bg-signal text-white' : 'border-line text-body hover:border-ink/40')}>{k}</button>)}
          <button onClick={() => setLowFirst(!lowFirst)} aria-pressed={lowFirst} className={cn('ml-auto rounded-full border px-3.5 py-1.5 text-sm transition', lowFirst ? 'border-signal bg-signal text-white' : 'border-line text-body hover:border-ink/40')}>Lowest score first</button>
          <label className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages" className="field w-52 py-2 pl-9 text-sm" aria-label="Search pages" /></label>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-line text-xs text-muted"><tr><th className="px-4 py-3 font-medium">Page</th><th className="px-4 py-3 font-medium">Score</th><th className="px-4 py-3 font-medium">Focus keyword</th><th className="px-4 py-3 font-medium">Title / description</th><th className="px-4 py-3 font-medium">Index</th><th className="px-4 py-3 font-medium">Schema</th><th className="px-4 py-3 font-medium">Sitemap</th><th className="px-4 py-3" /></tr></thead>
            <tbody className="divide-y divide-line">
              {!rows.length && <tr><td colSpan={8} className="p-10 text-center text-muted">No pages match.</td></tr>}
              {rows.map((r) => (
                <tr key={r.kind + r.path} className={cn('align-top', !r.live && 'opacity-60')}>
                  <td className="max-w-[260px] px-4 py-3"><span className="block truncate font-medium text-ink">{r.title}</span><span className="block truncate text-xs text-muted">{r.kind} | {r.path}{!r.live && ' | draft'}</span>{r.score < 80 && r.missing?.length > 0 && <span className="mt-1 block truncate text-xs text-amber">Fix: {r.missing.slice(0, 2).join('; ')}</span>}</td>
                  <td className="px-4 py-3"><span title={r.missing.join('; ')} className={cn('inline-block min-w-10 rounded-full px-2.5 py-0.5 text-center text-xs font-semibold tabular-nums', tone[r.tone])}>{r.score}</span></td>
                  <td className="px-4 py-3 text-body">{r.keyword || <span className="text-muted">None</span>}{r.dupKeyword && <AlertTriangle size={13} className="ml-1.5 inline text-amber" aria-label="Duplicate keyword" />}</td>
                  <td className="px-4 py-3 text-xs text-muted"><span className={cn(r.metaTitle.length >= 30 && r.metaTitle.length <= 60 ? 'text-good' : 'text-amber')}>Title {r.metaTitle.length}</span> | <span className={cn(r.metaDesc.length >= 120 && r.metaDesc.length <= 160 ? 'text-good' : r.metaDesc.length ? 'text-amber' : 'text-bad')}>Description {r.metaDesc.length}</span></td>
                  <td className="px-4 py-3">{r.noindex ? <span className="inline-flex items-center gap-1 text-xs text-bad"><EyeOff size={13} />Noindex</span> : <span className="inline-flex items-center gap-1 text-xs text-good"><CheckCircle2 size={13} />Indexed</span>}{r.nofollow && <span className="ml-1 text-xs text-amber">nofollow</span>}</td>
                  <td className="px-4 py-3 text-xs text-body">{r.schema === 'auto' ? 'Auto' : r.schema}</td>
                  <td className="px-4 py-3 text-xs">{r.sitemap ? <span className="text-good">Listed</span> : <span className="text-muted">Left out</span>}</td>
                  <td className="px-4 py-3 text-right"><Link href={`${r.edit}#seo`} className="btn-ghost btn-sm"><Pencil size={13} />Edit SEO</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}
    </div>
  );
}
