'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2, Search, Save, Rocket, Copy, Check, X, Settings, Image as ImageIcon, ExternalLink, AlertTriangle } from 'lucide-react';
import { api } from './api';
import { Notice } from './Editor';
import { Markdown, MediaInput } from './Fields';
import ContentScore from './ContentScore';
import AiNews from './AiNews';
import InfoTip from '@/components/site/InfoTip';
import { scoreContent } from '@/lib/content-score';
import { slugify, cn } from '@/lib/utils';
import { TONES, LANGS } from '@/lib/tones';

const BRIEF = { topic: '', primary: '', secondary: [], audience: '', tone: 'friendly', words: 1500, intent: '', language: 'English', notes: '' };
const TABS = [['article', 'Article'], ['seo', 'Title, meta and URL'], ['images', 'Images'], ['plan', 'Outline and FAQ']];

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
const Row = ({ label, info, children, className }) => <div className={className}><div className="mb-1.5 flex items-center gap-1.5"><span className="text-sm font-medium text-ink">{label}</span>{info && <InfoTip size={13} text={info} />}</div>{children}</div>;
const Meter = ({ n, lo, hi }) => <span className={cn('text-xs tabular-nums', !n ? 'text-muted' : n < lo ? 'text-amber' : n <= hi ? 'text-good' : 'text-bad')}>{n} / {hi}</span>;

export default function AiWriter() {
  const [brief, setBrief] = useState(BRIEF); const [cfg, setCfg] = useState(null);
  const [kw, setKw] = useState(null); const [kwBusy, setKwBusy] = useState(false);
  const [post, setPost] = useState(null); const [tab, setTab] = useState('article'); const [gen, setGen] = useState(null); const [busy, setBusy] = useState(''); const [err, setErr] = useState('');
  const [status, setStatus] = useState(null); const [vis, setVis] = useState({ busy: false, summary: '' }); const [via, setVia] = useState('');
  const [cats, setCats] = useState([]); const [saved, setSaved] = useState(null); const [copied, setCopied] = useState(''); const stop = useRef(false);
  const top = useRef(null);

  useEffect(() => {
    api('/api/admin/settings/aiwriter').then((j) => { setCfg(j.item); setBrief((b) => ({ ...b, audience: j.item.audience || '', tone: TONES.some((t) => t.id === j.item.tone) ? j.item.tone : 'friendly', words: j.item.words || 1500, language: j.item.language || 'English' })); }).catch(() => {});
    api('/api/admin/categories').then((j) => setCats(j.items || [])).catch(() => {});
    api('/api/admin/ai/status').then(setStatus).catch(() => {});
  }, []);

  const score = useMemo(() => post && scoreContent({ title: post.title, metaTitle: post.metaTitle, metaDescription: post.metaDescription, slug: post.slug, primary: post.primary, secondary: post.secondary, markdown: post.content, terms: post.terms, targetWords: brief.words, faq: post.faq?.length, brand: typeof window !== 'undefined' ? window.location.host : '' }), [post, brief.words]);
  const set = (v) => setPost((p) => ({ ...p, ...v }));
  const b = (v) => setBrief((x) => ({ ...x, ...v }));

  async function research(topic = brief.topic, auto = false) {
    setKwBusy(true); setErr(''); setKw(null);
    try {
      const j = await api('/api/admin/ai/keywords', { method: 'POST', body: { topic, audience: brief.audience, language: brief.language } });
      setKw(j);
      // Fill the keyword boxes for you when they are empty (always after picking a news item). You can change them.
      if (j.picked && (auto || !brief.primary)) b({ topic, primary: j.picked.primary, secondary: j.picked.secondary });
    } catch (e) { setErr(e.message); }
    setKwBusy(false);
  }
  function pickNews(t) {
    setBrief((x) => ({ ...x, topic: t, primary: '', secondary: [] })); setKw(null); setPost(null); setSaved(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    research(t, true);
  }
  const addKw = (k, asPrimary) => {
    k = String(k).trim(); if (!k || (k === brief.primary && !asPrimary)) return;
    if (asPrimary || !brief.primary) b({ primary: k, secondary: brief.secondary.filter((x) => x !== k) });
    else b({ secondary: brief.secondary.includes(k) ? brief.secondary.filter((x) => x !== k) : [...brief.secondary, k] });
  };

  function assemble(pieces, images) {
    const out = [];
    const block = (im) => (im.role === 'table' ? (im.data || '').trim() : `![${im.alt || im.title || ''}](${im.url || `#image-${im.slot}`})`);
    pieces.forEach((p, i) => { out.push(p); images.filter((im) => im.slot !== 1 && im.role !== 'featured' && !(im.role === 'table' && !im.data) && Math.min(im.after, pieces.length - 2) === i).forEach((im) => out.push(block(im))); });
    return out.join('\n\n');
  }

  async function callRetry(path, body, label) {
    for (let n = 0; n < 4; n++) {
      try { return await api(path, { method: 'POST', body }); }
      catch (e) {
        if (!/free limits|free ai is busy|at its free limit/i.test(e.message) || n === 3 || stop.current) throw e;
        for (let sec = 25; sec > 0; sec--) { if (stop.current) throw e; setGen((g) => ({ ...(g || {}), msg: `The free AI is resting (free limits). Trying again in ${sec}s. ${label}` })); await new Promise((r) => setTimeout(r, 1000)); }
      }
    }
  }

  async function makeVisuals(plan, keepUrls = []) {
    setVis({ busy: true, summary: '' });
    try {
      const j = await callRetry('/api/admin/ai/visuals', { plan, brief }, 'Image plan');
      const images = (j.images || []).map((x) => ({ ...x, url: keepUrls.find((k) => k.slot === x.slot)?.url || '' }));
      setPost((p) => ({ ...p, images }));
      setVis({ busy: false, summary: j.summary || '' });
      return images;
    } catch (e) { setVis({ busy: false, summary: '' }); setErr(`Image prompts: ${e.message}`); return []; }
  }

  async function generate() {
    if (brief.topic.trim().length < 3) { setErr('Type a topic first.'); return; }
    stop.current = false; setErr(''); setSaved(null); setVis({ busy: false, summary: '' }); setGen({ msg: 'Planning the post: title, meta, URL, outline and FAQ', pct: 4 });
    try {
      const { plan, via: v } = await callRetry('/api/admin/ai/plan', brief, 'Plan'); setVia(v || '');
      const existing = cats.find((c) => c.name.toLowerCase() === String(plan.category || '').toLowerCase());
      const p = { title: plan.title, metaTitle: plan.metaTitle, metaDescription: plan.metaDescription, slug: plan.slug, category: existing?.name || plan.category || '', excerpt: plan.excerpt, tags: plan.tags || [], primary: plan.primaryKeyword, secondary: plan.secondaryKeywords || [], terms: plan.terms || [], images: [], faq: plan.faq || [], outline: plan.outline, cta: plan.cta, angle: plan.angle, content: '', plan };
      setPost(p); setTab('article'); setTimeout(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      setGen({ msg: 'Planning the images, infographics, charts and tables', pct: 8 });
      const images = await makeVisuals(plan);
      const total = plan.outline.length + 2; const pieces = [];
      const call = async (kind, index, n) => {
        const label = kind === 'intro' ? 'Writing the introduction' : kind === 'faq' ? 'Writing the FAQ' : `Writing section ${index + 1} of ${plan.outline.length}: ${plan.outline[index].h2}`;
        setGen({ msg: label, pct: 10 + (n / total) * 88 });
        const j = await callRetry('/api/admin/ai/section', { plan, kind, index, tail: pieces.join('\n\n'), brief }, label); pieces.push(j.markdown); if (j.via) setVia(j.via);
        setPost((x) => ({ ...x, content: assemble(pieces.length > 1 ? [...pieces] : [...pieces, ''], images).replace(/\n\n$/, '') }));
      };
      await call('intro', 0, 0);
      for (let i = 0; i < plan.outline.length; i++) { if (stop.current) break; await call('section', i, i + 1); }
      if (!stop.current) await call('faq', 0, plan.outline.length + 1);
      setPost((x) => ({ ...x, content: assemble(pieces, images) }));
    } catch (e) { setErr(`${e.message} Your progress so far is kept below.`); }
    setGen(null);
  }

  async function fixAll(mode) {
    setBusy(mode); setErr('');
    try {
      const chunks = post.content.split(/\n(?=## )/); const missing = [...score.missingSecondary, ...score.missingTerms.slice(0, 10)];
      for (let i = 0; i < chunks.length; i++) {
        if (stop.current || chunks[i].length < 200 || /^## (frequently|faq)/i.test(chunks[i])) continue;
        if (mode === 'seo' && !missing.length) break;
        const mine = mode === 'seo' ? missing.filter((_, k) => k % Math.max(1, chunks.length - 1) === i % Math.max(1, chunks.length - 1)) : [];
        if (mode === 'seo' && !mine.length) continue;
        const j = await callRetry('/api/admin/ai/rewrite', { text: chunks[i], mode, primary: post.primary, secondary: mine.slice(0, 4), terms: mine.slice(4), language: brief.language }, 'Polishing');
        chunks[i] = j.markdown; setPost((x) => ({ ...x, content: chunks.join('\n') }));
      }
    } catch (e) { setErr(e.message); }
    setBusy('');
  }

  async function save(publish) {
    setBusy('save'); setErr('');
    try {
      let catSlug = '';
      if (post.category) {
        const ex = cats.find((c) => c.name.toLowerCase() === post.category.toLowerCase());
        if (ex) catSlug = ex.slug; else { const j = await api('/api/admin/categories', { method: 'POST', body: { name: post.category, color: '#5B8CFF' } }); catSlug = j.item.slug; setCats([...cats, j.item]); }
      }
      const cover = post.images.find((x) => x.slot === 1)?.url || '';
      const body = { title: post.title, kind: 'article', category: catSlug, excerpt: post.excerpt, cover, content: post.content, tags: post.tags, published: !!publish, publishedAt: new Date().toISOString().slice(0, 10), seoTitle: post.metaTitle, seoDescription: post.metaDescription, seoImage: cover || undefined, focusKeyword: post.primary, keywords: post.secondary, aiScore: score.score, aiMeta: { topic: brief.topic, images: post.images.map(({ url, ...x }) => x), outline: post.outline, faq: post.faq, terms: post.terms, cta: post.cta } };
      let slug = post.slug || slugify(post.title); let res;
      for (let n = 1; n <= 6; n++) { try { res = await api('/api/admin/posts', { method: 'POST', body: { ...body, slug: n === 1 ? slug : `${slug}-${n}` } }); break; } catch (e) { if (!/already used/i.test(e.message) || n === 6) throw e; } }
      setSaved({ id: res.item._id, publish, slug: res.item.slug });
    } catch (e) { setErr(e.message); }
    setBusy('');
  }

  const copy = (k, t) => { navigator.clipboard?.writeText(t).catch(() => {}); setCopied(k); setTimeout(() => setCopied(''), 1500); };
  const setImg = (slot, url) => setPost((p) => { const old = p.images.find((x) => x.slot === slot)?.url; let content = p.content; const ph = `#image-${slot}`; if (url) content = content.split(old || ph).join(url); else if (old) content = content.split(old).join(ph); return { ...p, images: p.images.map((x) => (x.slot === slot ? { ...x, url } : x)), content }; });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold"><Sparkles size={24} className="text-signal" />AI writer<InfoTip size={16} text="Type a topic. The AI suggests keywords, then writes the title, meta, URL, headings, article, FAQ and image prompts, and scores the result. One click saves it as a blog post." /></h1>
        <div className="flex gap-2"><Link href="/admin/settings/aiwriter" className="btn-ghost btn-sm"><Settings size={14} />Settings</Link><Link href="/admin/posts" className="btn-ghost btn-sm">All posts</Link></div>
      </div>
      {status && !status.ready && <Notice bad>No AI key yet. Open <Link href="/admin/settings/aiwriter" className="font-semibold underline">AI writer settings</Link> and paste one free key (Gemini, Groq or OpenRouter). It takes a minute, needs no card and works at once. Two or three keys give automatic backup when one is busy.</Notice>}
      {err && <Notice bad>{err}</Notice>}
      {saved && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-good/40 bg-good/10 px-4 py-3 text-sm text-body"><span className="flex items-center gap-2"><Check size={16} className="text-good" />{saved.publish ? 'Published.' : 'Saved as a draft.'} Add the images, then publish.</span><span className="flex gap-2"><Link href={`/admin/posts/${saved.id}`} className="btn-primary btn-sm">Open the post</Link>{saved.publish && <a href={`/blog/${saved.slug}`} target="_blank" rel="noopener" className="btn-ghost btn-sm"><ExternalLink size={14} />View</a>}</span></div>}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <Row label="What is the post about?" info="A topic or a working title, for example How AI improves day by day. The AI turns it into a full SEO post. You can also click Write a post on any AI news item.">
              <input value={brief.topic} onChange={(e) => b({ topic: e.target.value })} placeholder="How AI improves day by day" className="field py-3.5 text-base" aria-label="Topic" />
            </Row>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={() => research(brief.topic, true)} disabled={kwBusy || brief.topic.trim().length < 3} className="btn-ghost btn-sm">{kwBusy ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}Suggest keywords</button>
              <InfoTip text="Free and no account needed: real suggestions from Google, Bing, DuckDuckGo and YouTube (phrases several engines agree on rank first), plus related words and AI ideas. It also picks a primary and secondary set for you. Click any suggestion to add or remove it." />
            </div>
            {kw && <KeywordPanel kw={kw} brief={brief} onPick={addKw} />}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Row label="Primary keyword" info="The one phrase this post should rank for. It goes in the title, URL, first paragraph and a heading. It is saved as the post's focus keyword."><input value={brief.primary} onChange={(e) => b({ primary: e.target.value })} className="field py-2.5 text-sm" placeholder="ai improvements" /></Row>
              <Row label="Secondary keywords" info="Supporting phrases and related questions. They are woven into the text and saved on the post. Press Enter after each."><Tags value={brief.secondary} onChange={(v) => b({ secondary: v })} placeholder="Type and press Enter" /></Row>
              <Row label="Who is it for?" info="The reader. It decides the examples and the level of detail."><input value={brief.audience} onChange={(e) => b({ audience: e.target.value })} className="field py-2.5 text-sm" /></Row>
              <Row label="Tone" info="How the post sounds. Techy is a tech enthusiast, Developer is for other developers with code and detail, Professional is polished and calm, Beginner friendly explains everything simply. Pick Custom to describe your own."><div className="space-y-2"><select value={TONES.some((t) => t.id === brief.tone) ? brief.tone : 'custom'} onChange={(e) => b({ tone: e.target.value === 'custom' ? 'a custom tone' : e.target.value })} className="field py-2.5 text-sm">{TONES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}<option value="custom">Custom (describe it)</option></select>{!TONES.some((t) => t.id === brief.tone) && <input value={brief.tone === 'a custom tone' ? '' : brief.tone} onChange={(e) => b({ tone: e.target.value || 'a custom tone' })} placeholder="For example: witty but respectful, like a podcast host" className="field py-2.5 text-sm" />}</div></Row>
              <Row label="Length (words)" info="The target. Longer is not always better; the AI covers what the topic needs."><input type="number" min={600} max={4000} step={100} value={brief.words} onChange={(e) => b({ words: Number(e.target.value) })} className="field py-2.5 text-sm" /></Row>
              <Row label="Language" info="The language of the post. Bengali is written in natural everyday Bangla with common English tech words kept as they are. The URL slug and file names stay in English letters."><select value={LANGS.some((l) => l.id === brief.language) ? brief.language : 'English'} onChange={(e) => b({ language: e.target.value })} className="field py-2.5 text-sm">{LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select></Row>
            </div>
            <Row className="mt-4" label="Anything else the AI should know? (optional)" info="Your own angle, a case you handled, a product to mention, facts to include or things to avoid. Real experience here makes the post far more original."><textarea value={brief.notes} onChange={(e) => b({ notes: e.target.value })} rows={2} className="field text-sm" placeholder="Mention that I built a chatbot for a clinic last month, keep it practical" /></Row>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button onClick={generate} disabled={!!gen} className="btn-primary">{gen ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}{gen ? 'Writing' : post ? 'Write a new post' : 'Write the whole post'}</button>
              {gen && <button onClick={() => { stop.current = true; }} className="btn-ghost btn-sm">Stop after this part</button>}
              {via && !gen && <span className="text-xs text-muted">Written with {via}</span>}
            </div>
            {gen && <div className="mt-4"><div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-signal transition-all duration-700" style={{ width: `${gen.pct}%` }} /></div><p className="mt-2 text-sm text-muted">{gen.msg}</p></div>}
          </section>

          {post && (
            <div ref={top} className="scroll-mt-6">
              <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-line">
                {TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cn('-mb-px border-b-2 px-3.5 py-2.5 text-sm font-medium transition', tab === k ? 'border-signal text-ink' : 'border-transparent text-muted hover:text-ink')}>{l}</button>)}
                <span className="ml-auto flex gap-2 pb-1.5"><button onClick={() => save(false)} disabled={busy === 'save' || !!gen || !post.content} className="btn-ghost btn-sm">{busy === 'save' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save as draft</button><button onClick={() => save(true)} disabled={busy === 'save' || !!gen || !post.content} className="btn-primary btn-sm"><Rocket size={14} />Publish now</button></span>
              </div>

              {tab === 'article' && (
                <div className="space-y-3"><h2 className="font-display text-2xl font-bold text-ink">{post.title}</h2><Markdown value={post.content} onChange={(v) => set({ content: v })} /><p className="text-xs text-muted">The post title is the H1 on your site, so the text starts at H2. Image slots look like ![alt](#image-2): add the real pictures in the Images tab.</p></div>
              )}

              {tab === 'seo' && (
                <div className="grid gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
                  <Row label={<span>Post title (H1) <Meter n={post.title.length} lo={30} hi={60} /></span>} info="The main headline on the page. Aim for under 60 characters with the primary keyword near the start."><input value={post.title} onChange={(e) => set({ title: e.target.value })} className="field py-2.5 text-sm" /></Row>
                  <Row label={<span>Meta title <Meter n={post.metaTitle.length} lo={30} hi={60} /></span>} info="What Google shows as the blue link. Under 60 characters, with the primary keyword."><input value={post.metaTitle} onChange={(e) => set({ metaTitle: e.target.value })} className="field py-2.5 text-sm" /></Row>
                  <Row label={<span>Meta description <Meter n={post.metaDescription.length} lo={120} hi={160} /></span>} info="The grey text under the link. 120 to 160 characters. Say what the reader gets."><textarea value={post.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} rows={3} className="field text-sm" /></Row>
                  <div className="rounded-xl border border-line bg-white p-4 font-[arial,sans-serif]"><p className="truncate text-[13px] text-[#4d5156]">yoursite.com › blog › {post.slug}</p><p className="mt-1 text-[19px] leading-snug text-[#1a0dab]">{post.metaTitle}</p><p className="mt-1 line-clamp-2 text-[13.5px] text-[#4d5156]">{post.metaDescription}</p></div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Row label="URL slug" info="The address of the post: /blog/this-part. Short, lowercase, with the keyword."><div className="flex items-center rounded-xl border border-line bg-base/50 pl-3 text-sm text-muted">/blog/<input value={post.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-ink outline-none" /></div></Row>
                    <Row label="Category" info="The AI picks the best existing category or suggests a new one. A new category is created when you save."><input list="cat-list" value={post.category} onChange={(e) => set({ category: e.target.value })} className="field py-2.5 text-sm" /><datalist id="cat-list">{cats.map((c) => <option key={c._id} value={c.name} />)}</datalist></Row>
                  </div>
                  <Row label="Excerpt" info="The short teaser on the blog card."><textarea value={post.excerpt} onChange={(e) => set({ excerpt: e.target.value })} rows={2} className="field text-sm" /></Row>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Row label="Primary keyword" info="Saved as the post's focus keyword."><input value={post.primary} onChange={(e) => set({ primary: e.target.value })} className="field py-2.5 text-sm" /></Row>
                    <Row label="Tags" info="Short labels for the post."><Tags value={post.tags} onChange={(v) => set({ tags: v })} placeholder="Add a tag" /></Row>
                  </div>
                  <Row label="Secondary keywords" info="Saved on the post as related keywords. Add or remove any."><Tags value={post.secondary} onChange={(v) => set({ secondary: v })} placeholder="Add a keyword" /></Row>
                </div>
              )}

              {tab === 'images' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-body">
                    {vis.busy ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Planning the visuals</span> : post.images.length ? (
                      <><p className="font-medium text-ink">Use {post.images.filter((x) => x.role !== 'table').length} image{post.images.filter((x) => x.role !== 'table').length === 1 ? '' : 's'}{post.images.some((x) => x.role === 'table') ? ` and ${post.images.filter((x) => x.role === 'table').length} table` : ''}: {['featured', 'inline', 'infographic', 'chart', 'table'].map((r) => [r, post.images.filter((x) => x.role === r).length]).filter(([, n]) => n).map(([r, n]) => `${n} ${r}`).join(', ')}.</p>
                      {vis.summary && <p className="mt-1 text-muted">{vis.summary}</p>}
                      <p className="mt-2 text-muted">Copy each prompt into ChatGPT, Nano Banana (Gemini), Midjourney or any image AI. Save the picture, then press <b>Add image</b>. It lands in the post at the right spot. Image 1 is the featured image (the cover and the social share picture). Tables are already inside the article.</p></>
                    ) : <p className="text-muted">No image plan yet.</p>}
                    <button onClick={() => makeVisuals(post.plan)} disabled={vis.busy || !post.plan} className="btn-ghost btn-sm mt-3">{vis.busy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}{post.images.length ? 'Make new image prompts' : 'Make image prompts'}</button>
                  </div>
                  {post.images.map((im) => (
                    <div key={im.slot} className="rounded-2xl border border-line bg-surface p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-2 font-semibold text-ink"><ImageIcon size={16} className="text-signal" />{im.role === 'table' ? 'Table' : 'Image'} {im.slot}{im.title ? `: ${im.title}` : ''}<span className="rounded-full bg-raised px-2.5 py-0.5 text-xs font-normal text-muted">{im.role}</span>{im.ratio && im.role !== 'table' && <span className="text-xs font-normal text-muted">{im.ratio}</span>}{im.tool && <span className="text-xs font-normal text-muted">Tool: {im.tool}</span>}</p>
                        {im.prompt && <button onClick={() => copy(`p${im.slot}`, im.prompt)} className="btn-ghost btn-sm">{copied === `p${im.slot}` ? <Check size={13} /> : <Copy size={13} />}{copied === `p${im.slot}` ? 'Copied' : 'Copy prompt'}</button>}
                      </div>
                      {im.instructions && <p className="mt-3 rounded-xl border border-line px-4 py-3 text-sm text-body"><b className="text-ink">How to make it:</b> {im.instructions}</p>}
                      {im.prompt && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-base/50 p-4 text-sm leading-relaxed text-body">{im.prompt}</p>}
                      {im.data && <div className="mt-3"><div className="mb-1.5 flex items-center justify-between"><span className="text-xs font-medium text-muted">{im.role === 'table' ? 'Table (already in the article, editable there)' : `Data for the ${im.chartType && im.chartType !== 'none' ? im.chartType : ''} chart`}</span><button onClick={() => copy(`d${im.slot}`, im.data)} className="text-xs text-signal hover:underline">{copied === `d${im.slot}` ? 'Copied' : 'Copy data'}</button></div><pre className="overflow-x-auto whitespace-pre rounded-xl bg-base/50 p-4 text-xs text-body">{im.data}</pre>{im.dataNote && <p className="mt-1.5 text-xs text-amber">{im.dataNote}</p>}</div>}
                      {im.textOnImage?.filter(Boolean).length > 0 && <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><span className="text-muted">Text on the image:</span>{im.textOnImage.filter(Boolean).map((t) => <button key={t} onClick={() => copy(`t${im.slot}${t}`, t)} className="rounded-full border border-line px-3 py-1 text-ink hover:border-signal">{copied === `t${im.slot}${t}` ? 'Copied' : t}</button>)}</div>}
                      {im.role !== 'table' && <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2"><p>Alt text: <span className="text-body">{im.alt}</span></p><p>File name: <span className="text-body">{im.filename}</span></p>{im.caption && <p>Caption: <span className="text-body">{im.caption}</span></p>}</div>}
                      {im.role !== 'table' && <div className="mt-4"><MediaInput value={im.url} onChange={(u) => setImg(im.slot, u)} accept="image/*" /></div>}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'plan' && (
                <div className="space-y-5">
                  {post.angle && <p className="rounded-xl border border-line bg-surface p-4 text-sm text-body"><b className="text-ink">Angle:</b> {post.angle}</p>}
                  <div className="rounded-2xl border border-line bg-surface p-5"><h3 className="mb-3 font-semibold text-ink">Outline</h3><ol className="space-y-3">{(post.outline || []).map((s, i) => <li key={i}><p className="font-medium text-ink">H2: {s.h2} <span className="text-xs font-normal text-muted">about {s.words} words</span></p>{s.h3?.length > 0 && <ul className="ml-4 mt-1 list-disc text-sm text-body">{s.h3.map((h) => <li key={h}>H3: {h}</li>)}</ul>}</li>)}</ol></div>
                  <div className="rounded-2xl border border-line bg-surface p-5"><h3 className="mb-3 font-semibold text-ink">FAQ (also added to the post as FAQ schema)</h3><ul className="space-y-3">{(post.faq || []).map((f, i) => <li key={i}><p className="font-medium text-ink">{f.q}</p><p className="text-sm text-body">{f.a}</p></li>)}</ul></div>
                  <div className="rounded-2xl border border-line bg-surface p-5"><h3 className="mb-3 font-semibold text-ink">Related terms to cover</h3><div className="flex flex-wrap gap-1.5">{(post.terms || []).map((t) => <span key={t.term} className="rounded-full bg-raised px-2.5 py-1 text-xs text-body">{t.term}</span>)}</div></div>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          {score && <ContentScore r={score} busy={busy} canFix={!!post?.content && !gen} onHumanize={() => fixAll('humanize')} onFixSeo={() => fixAll('seo')} />}
          <AiNews compact onWrite={pickNews} />
        </aside>
      </div>
    </div>
  );
}

function KeywordPanel({ kw, brief, onPick }) {
  const on = (k) => brief.primary === k || brief.secondary.includes(k);
  const chip = (k, extra) => <button key={k} type="button" onClick={() => onPick(k)} className={cn('rounded-full border px-3 py-1.5 text-sm transition', on(k) ? 'border-signal bg-signal text-white' : 'border-line text-body hover:border-signal')}>{k}{extra}</button>;
  const ai = kw.ai;
  return (
    <div className="mt-4 space-y-4 rounded-xl border border-line bg-base/40 p-4">
      <p className="text-xs text-muted">Primary and secondary keywords were filled in for you below. Click any suggestion to add or remove it as a secondary keyword. The small <b>Set as primary</b> buttons change the main one.</p>
      {kw.picked && <div className="rounded-lg bg-signal/10 p-3 text-sm"><p><b className="text-ink">Primary:</b> {kw.picked.primary}</p><p className="mt-1 text-body"><b className="text-ink">Secondary:</b> {kw.picked.secondary.join(', ') || 'none found'}</p></div>}
      {ai?.primary?.length > 0 && <div><p className="mb-2 text-xs font-medium text-muted">Primary keyword ideas <span className="font-normal">(AI estimate)</span></p><div className="space-y-2">{ai.primary.map((p) => <div key={p.keyword} className="flex flex-wrap items-center gap-2 text-sm"><button type="button" onClick={() => onPick(p.keyword, true)} className={cn('rounded-full border px-3 py-1.5 font-medium', brief.primary === p.keyword ? 'border-signal bg-signal text-white' : 'border-line text-ink hover:border-signal')}>Set as primary: {p.keyword}</button><span className="text-xs text-muted">{p.intent}, {p.competition} competition. {p.why}</span></div>)}</div></div>}
      {kw.semrush?.length > 0 && <div><p className="mb-2 text-xs font-medium text-muted">Semrush <span className="font-normal">(optional paid data: real volume and difficulty)</span></p><div className="flex flex-wrap gap-1.5">{kw.semrush.map((s) => chip(s.keyword, <span className="ml-1.5 text-[11px] opacity-70">{s.volume.toLocaleString()} / KD {s.difficulty}</span>))}</div></div>}
      {kw.free?.length > 0 && <div><p className="mb-2 text-xs font-medium text-muted">Search suggestions <span className="font-normal">(free: Google, Bing, DuckDuckGo, YouTube. The number shows how many engines suggest it)</span></p><div className="flex flex-wrap gap-1.5">{kw.free.slice(0, 30).map((x) => chip(x.keyword, x.sources > 1 ? <span className="ml-1.5 text-[11px] opacity-70">{x.sources}</span> : null))}</div></div>}
      {kw.questions?.length > 0 && <div><p className="mb-2 text-xs font-medium text-muted">Questions people ask <span className="font-normal">(good for headings and the FAQ)</span></p><div className="flex flex-wrap gap-1.5">{kw.questions.map((k) => chip(k))}</div></div>}
      {ai?.questions?.length > 0 && <div><p className="mb-2 text-xs font-medium text-muted">More questions <span className="font-normal">(AI)</span></p><div className="flex flex-wrap gap-1.5">{ai.questions.map((k) => chip(k))}</div></div>}
      {(ai?.secondary?.length > 0 || ai?.longTail?.length > 0) && <div><p className="mb-2 text-xs font-medium text-muted">Secondary and long-tail ideas <span className="font-normal">(AI estimate)</span></p><div className="flex flex-wrap gap-1.5">{[...(ai.secondary || []).map((x) => x.keyword || x), ...(ai.longTail || [])].map((k) => chip(k))}</div></div>}
      {kw.related?.length > 0 && <div><p className="mb-2 text-xs font-medium text-muted">Related words to cover <span className="font-normal">(free, Datamuse)</span></p><div className="flex flex-wrap gap-1.5">{kw.related.map((k) => chip(k))}</div></div>}
      {kw.notes?.length > 0 && <ul className="space-y-1 text-xs text-muted">{kw.notes.map((n) => <li key={n}>{n}</li>)}</ul>}
    </div>
  );
}
