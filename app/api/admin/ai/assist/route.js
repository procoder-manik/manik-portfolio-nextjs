import { NextResponse } from 'next/server';
import { adminRoute } from '@/lib/server-auth';
import { rateLimit } from '@/lib/ratelimit';
import { askAIx, parseJson, aiConfig } from '@/lib/ai';
import { cleanText } from '@/lib/humanize';
import { slugify } from '@/lib/utils';
import { BLOCK_DEFAULTS } from '@/lib/blocks';
import { WORK_TYPES } from '@/lib/project-ai-options';
import { siteContext, fieldPrompts, seoPrompts, blockPrompts, pagePrompts, caseStudyPrompts, coverPrompts, AI_BLOCKS, SCHEMA_FIELDS } from '@/lib/ai-assist';
import { arOf } from '@/lib/image-specs';
import { line, cutAt, cutTitle, list, deep, normSeo, ask } from '@/lib/ai-run';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/* POST { task: field | seo | block | page | caseStudy, ... } -> the written content, cleaned and ready to put in the form. */
export const POST = adminRoute(async (req, ctx, admin) => {
  if (!(await rateLimit(`ai-assist:${admin.email}`, 200, 3600))) throw new Error('Too many AI requests this hour. Try again later.');
  const b = await req.json();
  const site = await siteContext();

  if (b.task === 'field') {
    const r = await ask(fieldPrompts(b, site), { json: false, maxTokens: b.field?.type === 'markdown' ? 2200 : 700, temperature: 0.7 });
    let v = String(r.text || '').trim().replace(/^["'`]+|["'`]+$/g, '');
    if (b.field?.type === 'markdown') v = cleanText(v);
    else if (b.field?.type === 'textarea') v = cleanText(v).trim();
    else v = cutTitle(v.split('\n')[0], b.field?.max || 120);
    return NextResponse.json({ value: v, via: r.via });
  }

  if (b.task === 'seo') {
    const p = await seoPrompts(b, site);
    const r = await ask(p, { maxTokens: 1800 });
    return NextResponse.json({ seo: normSeo(r.data, site.seo, p.want), via: r.via });
  }

  if (b.task === 'block') {
    const r = await ask(blockPrompts(b, site), { maxTokens: 2400, temperature: 0.7 });
    const v = deep(r.data);
    if (Array.isArray(v.items)) v.items = v.items.filter((x) => x && Object.values(x).some(Boolean)).slice(0, 8);
    if (b.block?.type === 'faq' && v.items?.length) v.useSite = false;
    if (b.block?.type === 'richText' && r.data.content) v.content = cleanText(r.data.content);
    return NextResponse.json({ block: v, via: r.via });
  }

  if (b.task === 'page') {
    if (!b.builtin && String(b.topic || '').trim().length < 3) throw new Error('Say what the page is about.');
    const r = await ask(pagePrompts(b, site), { maxTokens: 5000, temperature: 0.7 });
    const j = r.data || {};
    if (b.builtin) return NextResponse.json({ parts: deep(j.parts || {}), seo: normSeo(j.seo || {}, site.seo), via: r.via });
    const blocks = (Array.isArray(j.blocks) ? j.blocks : []).filter((x) => x && AI_BLOCKS.includes(x.type)).slice(0, 9).map((x) => {
      const clean = deep(x); if (x.type === 'richText' && x.content) clean.content = cleanText(x.content);
      if (x.type === 'faq') clean.useSite = !(clean.items || []).length;
      return { ...(BLOCK_DEFAULTS[x.type] || {}), ...clean, type: x.type };
    });
    if (!blocks.length) throw Object.assign(new Error('The AI returned no sections. Press the button again.'), { status: 502 });
    return NextResponse.json({ title: line(j.title) || b.topic, slug: slugify(j.slug || j.title || b.topic).slice(0, 60), blocks, seo: normSeo(j.seo || {}, site.seo), via: r.via });
  }

  if (b.task === 'cover') {
    if (!String(b.doc?.title || b.doc?.name || '').trim()) throw new Error('Add the title first, so the AI knows what the image is about.');
    const p = coverPrompts(b, site); const sp = p.spec;
    const r = await ask({ system: p.system, user: p.user }, { maxTokens: 3000, temperature: 0.7 });
    const dash = (x) => String(x || '').replace(/\s*[\u2014\u2013]\s*/g, ', ').trim();
    // The size is added here, not left to the AI, so every prompt asks for the exact ratio.
    const tail = ` Final image: ${sp.w} x ${sp.h} pixels, ${sp.ratio} landscape. Keep every important element and all text inside the centre ${sp.safe[0]} x ${sp.safe[1]} pixels so nothing is lost when the site crops it. No watermark, no logos or brand names, and no text other than the exact text given.`;
    const prompts = (r.data.prompts || []).filter((x) => x?.prompt).slice(0, 4).map((x) => ({
      label: dash(x.label) || 'Cover', tool: dash(x.tool), attach: Boolean(x.attach && b.doc?.scrollImage),
      prompt: dash(x.prompt) + tail + (/midjourney/i.test(x.tool || '') ? ` --ar ${arOf(sp)} --style raw` : ''),
    }));
    if (!prompts.length) throw Object.assign(new Error('The AI returned no prompts. Press the button again.'), { status: 502 });
    return NextResponse.json({ cover: { headline: dash(r.data.headline), altText: dash(r.data.altText).slice(0, 140), fileName: String(r.data.fileName || '').toLowerCase().replace(/[^a-z0-9.-]+/g, '-').slice(0, 80), prompts, tips: dash(r.data.tips), size: `${sp.w} x ${sp.h}`, ratio: sp.ratio }, via: r.via });
  }

  if (b.task === 'caseStudy') {
    if (String(b.client || '').trim().length < 2) throw new Error('Add the client or website name.');
    const r = await ask(await caseStudyPrompts(b, site), { maxTokens: 4500, temperature: 0.6 });
    const j = r.data || {};
    const nums = (String(b.results || '').match(/\d[\d.,]*/g) || []).map((n) => n.replace(/[.,]+$/, ''));
    const okNum = (m) => [m.value, m.before, m.after].filter(Boolean).every((x) => nums.some((n) => String(x).includes(n)));
    const tags = WORK_TYPES.filter((w) => (b.workTypes || []).includes(w.id)).map((w) => w.tag);
    const cs = {
      title: cutTitle(j.title, 90), client: line(j.client) || b.client, industry: line(b.industry || j.industry), location: line(j.location), summary: cutAt(j.summary, 260),
      ...(b.url ? { liveUrl: /^https?:\/\//.test(b.url) ? b.url : `https://${b.url}` } : {}), ...(b.project ? { project: b.project } : {}),
      duration: b.duration ? line(b.duration) : '', platform: line(j.platform), services: list([...tags, ...list(j.services, 4)], 5), technologies: list(j.technologies, 8),
      overview: cleanText(j.overview || ''), challengeIntro: line(j.challengeIntro), challenges: (j.challenges || []).filter((x) => x?.title).slice(0, 5).map((x) => ({ title: line(x.title), body: line(x.body) })),
      approachIntro: line(j.approachIntro), approach: (j.approach || []).filter((x) => x?.title).slice(0, 6).map((x) => ({ phase: line(x.phase), title: line(x.title), body: line(x.body) })),
      resultsIntro: line(j.resultsIntro), metrics: (j.metrics || []).filter((m) => m?.label && (m.value || m.after) && nums.length && okNum(m)).slice(0, 4).map((m) => ({ label: line(m.label), before: line(m.before), after: line(m.after), value: line(m.value) })),
      results: cleanText(j.results || ''), slug: slugify(j.title || b.client).slice(0, 60),
      ...normSeo(j.seo || {}, site.seo),
    };
    return NextResponse.json({ caseStudy: cs, via: r.via });
  }

  throw new Error('Unknown AI task.');
});
