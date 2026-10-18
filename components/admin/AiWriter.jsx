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

const BRIEF = { topic: '', primary: '', secondary: [], audience: '', tone: '', words: 1500, intent: '', language: 'English', notes: '' };
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
  const [cats, setCats] = useState([]); const [saved, setSaved] = useState(null); const [copied, setCopied] = useState(''); const stop = useRef(false);
  const top = useRef(null);

  useEffect(() => {
    api('/api/admin/settings/aiwriter').then((j) => { setCfg(j.item); setBrief((b) => ({ ...b, audience: j.item.audience || '', tone: j.item.tone || '', words: j.item.words || 1500, language: j.item.language || 'English' })); }).catch(() => {});
    api('/api/admin/categories').then((j) => setCats(j.items || [])).catch(() => {});
  }, []);

  const score = useMemo(() => post && scoreContent({ title: post.title, metaTitle: post.metaTitle, metaDescription: post.metaDescription, slug: post.slug, primary: post.primary, secondary: post.secondary, markdown: post.content, terms: post.terms, targetWords: brief.words, faq: post.faq?.length, brand: typeof window !== 'undefined' ? window.location.host : '' }), [post, brief.words]);
  const set = (v) => setPost((p) => ({ ...p, ...v }));
  const b = (v) => setBrief((x) => ({ ...x, ...v }));

  async function research() {
    setKwBusy(true); setErr(''); setKw(null);
    try { setKw(await api('/api/admin/ai/keywords', { method: 'POST', body: { topic: brief.topic, audience: brief.audience, language: brief.language } })); } catch (e) { setErr(e.message); }
    setKwBusy(false);
  }
  const addKw = (k, asPrimary) => {
    k = String(k).trim(); if (!k) return;
    if (asPrimary || !brief.primary) b({ primary: k, secondary: brief.secondary.filter((x) => x !== k) });
    else b({ secondary: brief.secondary.includes(k) ? brief.secondary.filter((x) => x !== k) : [...brief.secondary, k] });
  };

  function assemble(pieces, images) {
    const out = [];
    pieces.forEach((p, i) => { out.push(p); images.filter((im) => im.role !== 'featured' && im.slot !== 1 && Math.min(im.after, pieces.length - 2) === i).forEach((im) => out.push(`![${im.alt}](${im.url || `#image-${im.slot}`})`)); });
    return out.join('\n\n');
  }

  async function generate() {
    if (brief.topic.trim().length < 3) { setErr('Type a topic first.'); return; }
    stop.current = false; setErr(''); setSaved(null); setGen({ msg: 'Planning the post: title, meta, outline, FAQ, images', pct: 4 });
    try {
      const { plan } = await api('/api/admin/ai/plan', { method: 'POST', body: brief });
      const images = (plan.images || []).map((x) => ({ ...x, url: '' }));
      const existing = cats.find((c) => c.name.toLowerCase() === String(plan.category || '').toLowerCase());
      const p = { title: plan.title, metaTitle: plan.metaTitle, metaDescription: plan.metaDescription, slug: plan.slug, category: existing?.name || plan.category || '', excerpt: plan.excerpt, tags: plan.tags || [], primary: plan.primaryKeyword, secondary: plan.secondaryKeywords || [], terms: plan.terms || [], images, faq: plan.faq || [], outline: plan.outline, cta: plan.cta, angle: plan.angle, content: '', plan };
      setPost(p); setTab('article'); setTimeout(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      const total = plan.outline.length + 2; const pieces = []; const call = async (kind, index, n) => {
        setGen({ msg: kind === 'intro' ? 'Writing the introduction' : kind === 'faq' ? 'Writing the FAQ' : `Writing section ${index + 1} of ${plan.outline.length}: ${plan.outline[index].h2}`, pct: 8 + (n / total) * 90 });
        const j = await api('/api/admin/ai/section', { method: 'POST', body: { plan, kind, index, tail: pieces.join('\n\n'), brief } }); pieces.push(j.markdown);
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
        const j = await api('/api/admin/ai/rewrite', { method: 'POST', body: { text: chunks[i], mode, primary: post.primary, secondary: mine.slice(0, 4), terms: mine.slice(4), language: brief.language } });
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
  const aiReady = cfg && (cfg.provider !== 'off');

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold"><Sparkles size={24} className="text-signal" />AI writer<InfoTip size={16} text="Type a topic. The AI suggests keywords, then writes the title, meta, URL, headings, article, FAQ and image prompts, and scores the result. One click saves it as a blog post." /></h1>
        <div className="flex gap-2"><Link href="/admin/settings/aiwriter" className="btn-ghost btn-sm"><Settings size={14} />Settings</Link><Link href="/admin/posts" className="btn-ghost btn-sm">All posts</Link></div>
      </div>
      {err && <Notice bad>{err}</Notice>}
      {saved && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-good/40 bg-good/10 px-4 py-3 text-sm text-body"><span className="flex items-center gap-2"><Check size={16} className="text-good" />{saved.publish ? 'Published.' : 'Saved as a draft.'} Add the images, then publish.</span><span className="flex gap-2"><Link href={`/admin/posts/${saved.id}`} className="btn-primary btn-sm">Open the post</Link>{saved.publish && <a href={`/blog/${saved.slug}`} target="_blank" rel="noopener" className="btn-ghost btn-sm"><ExternalLink size={14} />View</a>}</span></div>}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <Row label="What is the post about?" info="A topic or a working title, for example How AI improves day by day. The AI turns it into a full SEO post. You can also click Write a post on any AI news item.">
              <input value={brief.topic} onChange={(e) => b({ topic: e.target.value })} placeholder="How AI improves day by day" className="field py-3.5 text-base" aria-label="Topic" />
            </Row>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={research} disabled={kwBusy || brief.topic.trim().length < 3} className="btn-ghost btn-sm">{kwBusy ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}Suggest keywords</button>
              <InfoTip text="Finds what people really search: Google suggestions (real), Semrush volume and difficulty (real, when SEMRUSH_API_KEY is set) and AI ideas (estimates). Click a suggestion to add it." />
            </div>
            {kw && <KeywordPanel kw={kw} brief={brief} onPick={addKw} />}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Row label="Primary keyword" info="The one phrase this post should rank for. It goes in the title, URL, first paragraph and a heading. It is saved as the post's focus keyword."><input value={brief.primary} onChange={(e) => b({ primary: e.target.value })} className="field py-2.5 text-sm" placeholder="ai improvements" /></Row>
              <Row label="Secondary keywords" info="Supporting phrases and related questions. They are woven into the text and saved on the post. Press Enter after each."><Tags value={brief.secondary} onChange={(v) => b({ secondary: v })} placeholder="Type and press Enter" /></Row>
              <Row label="Who is it for?" info="The reader. It decides the examples and the level of detail."><input value={brief.audience} onChange={(e) => b({ audience: e.target.value })} className="field py-2.5 text-sm" /></Row>
              <Row label="Tone" info="For example friendly and expert, or direct and technical."><input value={brief.tone} onChange={(e) => b({ tone: e.target.value })} className="field py-2.5 text-sm" /></Row>
              <Row label="Length (words)" info="The target. Longer is not always better; the AI covers what the topic needs."><input type="number" min={600} max={4000} step={100} value={brief.words} onChange={(e) => b({ words: Number(e.target.value) })} className="field py-2.5 text-sm" /></Row>
              <Row label="Language" info="The language of the post, for example English or Bengali."><input value={brief.language} onChange={(e) => b({ language: e.target.value })} className="field py-2.5 text-sm" /></Row>
            </div>
            <Row className="mt-4" label="Anything else the AI should know? (optional)" info="Your own angle, a case you handled, a product to mention, facts to include or things to avoid. Real experience here makes the post far more original."><textarea value={brief.notes} onChange={(e) => b({ notes: e.target.value })} rows={2} className="field text-sm" placeholder="Mention that I built a chatbot for a clinic last month, keep it practical" /></Row>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button onClick={generate} disabled={!!gen} className="btn-primary">{gen ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}{gen ? 'Writing' : post ? 'Write a new post' : 'Write the whole post'}</button>
              {gen && <button onClick={() => { stop.current = true; }} className="btn-ghost btn-sm">Stop after this part</button>}
              {cfg && cfg.provider === 'off' && <span className="flex items-center gap-1.5 text-sm text-amber"><AlertTriangle size={14} />AI is off. Pick a provider in Settings.</span>}
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
                  <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-body">Copy each prompt into ChatGPT, Nano Banana, Midjourney or any image AI. Save the picture, then press <b>Add image</b> to upload it. It is placed in the post at the right spot. Image 1 is the featured image (the cover).</p>
                  {post.images.map((im) => (
                    <div key={im.slot} className="rounded-2xl border border-line bg-surface p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-2 font-semibold text-ink"><ImageIcon size={16} className="text-signal" />Image {im.slot}<span className="rounded-full bg-raised px-2.5 py-0.5 text-xs font-normal text-muted">{im.slot === 1 ? 'featured' : im.role}</span>{im.ratio && <span className="text-xs font-normal text-muted">{im.ratio}</span>}</p>
                        <button onClick={() => copy(`p${im.slot}`, im.prompt)} className="btn-ghost btn-sm">{copied === `p${im.slot}` ? <Check size={13} /> : <Copy size={13} />}{copied === `p${im.slot}` ? 'Copied' : 'Copy prompt'}</button>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap rounded-xl bg-base/50 p-4 text-sm leading-relaxed text-body">{im.prompt}</p>
                      {im.textOnImage?.filter(Boolean).length > 0 && <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><span className="text-muted">Text on the image:</span>{im.textOnImage.filter(Boolean).map((t) => <button key={t} onClick={() => copy(`t${im.slot}${t}`, t)} className="rounded-full border border-line px-3 py-1 text-ink hover:border-signal">{copied === `t${im.slot}${t}` ? 'Copied' : t}</button>)}</div>}
                      <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2"><p>Alt text: <span className="text-body">{im.alt}</span></p><p>File name: <span className="text-body">{im.filename}</span></p>{im.caption && <p>Caption: <span className="text-body">{im.caption}</span></p>}</div>
                      <div className="mt-4"><MediaInput value={im.url} onChange={(u) => setImg(im.slot, u)} accept="image/*" /></div>
                    </div>
                  ))}
                  {!post.images.length && <p className="text-sm text-muted">No image plan yet.</p>}
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
          <AiNews compact onWrite={(t) => { b({ topic: t }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </aside>
      </div>
    </div>
  );
}

function KeywordPanel({ kw, brief, onPick }) {
  const chip = (k, extra) => { const on = brief.primary === k || brief.secondary.includes(k); return <button key={k} type="button" onClick={() => onPick(k)} className={cn('rounded-full border px-3 py-1.5 text-sm transition', on ? 'border-signal bg-signal text-white' : 'border-line text-body hover:border-signal')}>{k}{extra}</button>; };
  const ai = kw.ai;
  return (
    <div className="mt-4 space-y-4 rounded-xl border border-line bg-base/40 p-4">
      <p className="text-xs text-muted">Click to add as a secondary keyword. The first click fills the primary keyword. Use the small button next to a primary idea to set it directly.</p>
      {ai?.primary?.length > 0 && <div><p className="mb-2 text-xs font-medium text-muted">Primary keyword ideas <span className="font-normal">(AI estimate)</span></p><div className="space-y-2">{ai.primary.map((p) => <div key={p.keyword} className="flex flex-wrap items-center gap-2 text-sm"><button type="button" onClick={() => onPick(p.keyword, true)} className={cn('rounded-full border px-3 py-1.5 font-medium', brief.primary === p.keyword ? 'border-signal bg-signal text-white' : 'border-line text-ink hover:border-signal')}>{p.keyword}</button><span className="text-xs text-muted">{p.intent}, {p.competition} competition. {p.why}</span></div>)}</div></div>}
      {kw.semrush?.length > 0 && <div><p className="mb-2 text-xs font-medium text-muted">Semrush <span className="font-normal">(real volume and difficulty)</span></p><div className="flex flex-wrap gap-1.5">{kw.semrush.map((s) => chip(s.keyword, <span className="ml-1.5 text-[11px] opacity-70">{s.volume.toLocaleString()} / KD {s.difficulty}</span>))}</div></div>}
      {kw.google?.length > 0 && <div><p className="mb-2 text-xs font-medium text-muted">Google suggestions <span className="font-normal">(what people really type)</span></p><div className="flex flex-wrap gap-1.5">{kw.google.slice(0, 24).map((k) => chip(k))}</div></div>}
      {ai?.questions?.length > 0 && <div><p className="mb-2 text-xs font-medium text-muted">Questions people ask <span className="font-normal">(AI)</span></p><div className="flex flex-wrap gap-1.5">{ai.questions.map((k) => chip(k))}</div></div>}
      {(ai?.secondary?.length > 0 || ai?.longTail?.length > 0) && <div><p className="mb-2 text-xs font-medium text-muted">Secondary and long-tail ideas <span className="font-normal">(AI estimate)</span></p><div className="flex flex-wrap gap-1.5">{[...(ai.secondary || []).map((x) => x.keyword || x), ...(ai.longTail || [])].map((k) => chip(k))}</div></div>}
      {kw.notes?.length > 0 && <ul className="space-y-1 text-xs text-muted">{kw.notes.map((n) => <li key={n}>{n}</li>)}</ul>}
    </div>
  );
}
