import Link from 'next/link';
import { seoMeta, pageMeta } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Quote, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getCaseStudy, getCaseStudies, getAllSettings } from '@/lib/data';
import { renderMarkdown } from '@/lib/markdown';
import ScrollShot from '@/components/site/ScrollShot';
import ScrollSpy from '@/components/site/ScrollSpy';
import Blocks from '@/components/site/blocks/Blocks';
import CaseStudyCard, { Metric } from '@/components/site/CaseStudyCard';
import Reveal from '@/components/site/Reveal';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs, caseNode } from '@/lib/schema';
import { caseStudiesOn } from '@/lib/features';
import { siteUrl, hostOf, fmtDate } from '@/lib/utils';

export const revalidate = 600;
export async function generateStaticParams() { return (await getCaseStudies()).map((c) => ({ slug: c.slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = await getCaseStudy(slug);
  if (!c) return {};
  return seoMeta(c, { title: `${c.client} case study: ${c.title}`, description: c.summary, image: c.cover, path: `/case-studies/${c.slug}`, type: 'article' });
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const [{ site }, c, all] = await Promise.all([getAllSettings(), getCaseStudy(slug), getCaseStudies()]);
  if (!caseStudiesOn(site) || !c) notFound();
  const accent = c.accent || '#6391FF';
  const idx = all.findIndex((x) => x.slug === c.slug);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;
  const metrics = (c.metrics || []).filter((m) => m.label && (m.after || m.value));
  const challenges = (c.challenges || []).filter((x) => x.title || x.body);
  const approach = (c.approach || []).filter((x) => x.title || x.body);
  const hasQuote = c.testimonial?.quote?.trim();
  const toc = [
    c.overview && { id: 'overview', label: 'Overview' }, challenges.length && { id: 'challenge', label: 'The challenge' },
    approach.length && { id: 'approach', label: 'The approach' }, (c.results || metrics.length) && { id: 'results', label: 'The results' },
  ].filter(Boolean);
  const facts = [['Client', c.client], ['Industry', c.industry], ['Duration', c.duration], ['Platform', c.platform], ['Location', c.location], ['Team', c.team]].filter(([, v]) => v);
  const url = `${siteUrl()}/case-studies/${c.slug}`;

  return (
    <article style={{ '--a': accent }}>
      <JsonLd item={c} data={buildGraph(site, [crumbs([['Home', '/'], ['Case studies', '/case-studies'], [c.client || c.title, `/case-studies/${c.slug}`]]), caseNode(c)])} />

      <header className="relative overflow-hidden pb-14 pt-32 sm:pt-40">
        <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_30%_0%,#000,transparent)]" />
        <div className="pointer-events-none absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full blur-[140px]" style={{ background: `${accent}40` }} />
        <div className="shell relative">
          <Link href="/case-studies" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={15} />All case studies</Link>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="chip border-transparent font-semibold text-white" style={{ background: accent }}>Case study</span>
            {(c.services || []).map((s) => <span key={s} className="chip">{s}</span>)}
          </div>
          <h1 className="mt-6 max-w-5xl font-display text-[clamp(2.3rem,5.2vw,4.4rem)] font-bold leading-[1.02] tracking-[-0.035em]">{c.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-muted sm:text-xl">{c.summary}</p>
          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
            {facts.map(([k, v]) => <div key={k} className="bg-surface/90 px-5 py-4 backdrop-blur"><dt className="text-xs text-muted">{k}</dt><dd className="mt-1 font-medium text-ink">{v}</dd></div>)}
          </dl>
        </div>
      </header>

      {(c.scrollImage || c.cover) && (
        <section className="shell">
          {c.scrollImage
            ? <ScrollShot src={c.scrollImage} alt={`${c.client} website`} url={c.liveUrl} accent={accent} aspect="aspect-[16/9]" speed={260} eager className="shadow-[0_60px_120px_-60px_var(--a)]" />
            // eslint-disable-next-line @next/next/no-img-element
            : <img src={c.cover} alt="" className="aspect-[16/9] w-full rounded-[24px] border border-line object-cover" />}
          {c.liveUrl && <div className="mt-4 flex justify-center"><a href={c.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">Visit {hostOf(c.liveUrl)} <ArrowUpRight size={14} /></a></div>}
        </section>
      )}

      {metrics.length > 0 && (
        <section className="shell mt-16">
          <div className="relative overflow-hidden rounded-[28px] px-7 py-10 sm:px-12" style={{ background: accent }}>
            <div className="grid-paper pointer-events-none absolute inset-0 opacity-50 [--grid:255_255_255]" />
            <p className="relative text-sm font-medium text-white/80">At a glance</p>
            <div className={`relative mt-6 grid gap-8 sm:grid-cols-2 ${metrics.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
              {metrics.map((m, i) => <Reveal key={i} delay={i * .08}><Metric m={m} big light /></Reveal>)}
            </div>
          </div>
        </section>
      )}

      <div className="shell grid gap-12 py-20 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">{toc.length > 1 && <ScrollSpy items={toc} accent={accent} />}</aside>
        <div className="min-w-0 max-w-3xl space-y-20">
          {c.overview && (
            <section id="overview" className="scroll-mt-28">
              <h2 className="h-section text-[clamp(1.8rem,3.4vw,2.6rem)]">Overview</h2>
              <p className="mt-6 text-[1.1rem] leading-relaxed text-body">{c.overview}</p>
            </section>
          )}

          {challenges.length > 0 && (
            <section id="challenge" className="scroll-mt-28">
              <p className="text-sm font-medium text-amber">The challenge</p>
              <h2 className="mt-2 h-section text-[clamp(1.8rem,3.4vw,2.6rem)]">{c.challengeIntro || 'What stood in the way'}</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {challenges.map((x, i) => (
                  <Reveal key={i} delay={i * .06}>
                    <div className="card h-full p-6">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber/15 text-amber"><AlertTriangle size={18} /></span>
                      <h3 className="mt-5 text-lg font-semibold">{x.title}</h3>
                      <p className="mt-2 text-[0.95rem] text-muted">{x.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {approach.length > 0 && (
            <section id="approach" className="scroll-mt-28">
              <p className="text-sm font-medium" style={{ color: accent }}>The approach</p>
              <h2 className="mt-2 h-section text-[clamp(1.8rem,3.4vw,2.6rem)]">{c.approachIntro || 'How I solved it'}</h2>
              <ol className="relative mt-10 space-y-8 before:absolute before:bottom-3 before:left-[19px] before:top-3 before:w-px before:bg-line">
                {approach.map((x, i) => (
                  <li key={i} className="relative pl-16">
                    <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full font-display text-sm font-bold text-white ring-8 ring-base" style={{ background: accent }}>{i + 1}</span>
                    {x.phase && <p className="text-sm font-medium text-muted">{x.phase}</p>}
                    <h3 className="mt-1 text-xl font-semibold">{x.title}</h3>
                    <p className="mt-2 text-[0.98rem] leading-relaxed text-body">{x.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {(c.results || metrics.length > 0) && (
            <section id="results" className="scroll-mt-28">
              <p className="text-sm font-medium text-good">The results</p>
              <h2 className="mt-2 h-section text-[clamp(1.8rem,3.4vw,2.6rem)]">{c.resultsIntro || 'What changed'}</h2>
              {c.results && <div className="prose-site mt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(c.results).html }} />}
              {metrics.length > 0 && (
                <ul className="mt-8 grid gap-3">
                  {metrics.map((m, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-line bg-surface px-5 py-4">
                      <CheckCircle2 size={18} className="text-good" />
                      <span className="flex-1 font-medium text-ink">{m.label}</span>
                      {m.before && m.after ? <span className="text-sm text-muted">{m.before} <ArrowRight size={13} className="mx-1 inline" /> <strong className="text-ink">{m.after}</strong></span> : <strong className="text-ink">{m.value || m.after}</strong>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {hasQuote && (
            <figure className="relative overflow-hidden rounded-[28px] border border-line bg-surface p-8 sm:p-10">
              <Quote size={40} className="absolute right-6 top-6 opacity-20" style={{ color: accent }} />
              <blockquote className="font-display text-[1.45rem] leading-snug text-ink sm:text-[1.7rem]">{c.testimonial.quote}</blockquote>
              <figcaption className="mt-7 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {c.testimonial.avatar && <img src={c.testimonial.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />}
                <span><span className="block font-semibold text-ink">{c.testimonial.name}</span><span className="text-sm text-muted">{c.testimonial.role}</span></span>
              </figcaption>
            </figure>
          )}

          {c.gallery?.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {c.gallery.map((g) => <img key={g} src={g} alt={`${c.client} detail`} loading="lazy" className="w-full rounded-2xl border border-line" />)}
            </div>
          )}

          {(c.technologies?.length > 0 || c.project) && (
            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-8">
              {(c.technologies || []).map((t) => <span key={t} className="chip">{t}</span>)}
              {c.project && <Link href={`/portfolio/${c.project}`} className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-signal">See the project page <ArrowUpRight size={14} /></Link>}
            </div>
          )}
          {c.publishedAt && <p className="text-sm text-muted">Published {fmtDate(c.publishedAt, { month: 'long', year: 'numeric' })}</p>}
        </div>
      </div>

      <Blocks blocks={c.blocks} />

      {next && (
        <section className="border-t border-line py-20">
          <div className="shell">
            <p className="mb-6 text-sm text-muted">Next case study</p>
            <CaseStudyCard c={next} variant="feature" />
          </div>
        </section>
      )}

      <section className="px-3 pb-24 sm:px-5">
        <div className="relative mx-auto max-w-shell overflow-hidden rounded-[32px] px-6 py-14 text-white sm:px-14" style={{ background: accent }}>
          <div className="grid-paper pointer-events-none absolute inset-0 opacity-60 [--grid:255_255_255]" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <h2 className="h-section max-w-[18ch] text-white">Facing a similar problem?</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn bg-white text-[#0C1526] hover:bg-white/90">Start a project <ArrowRight size={16} /></Link>
              <a href={site.calendly} target="_blank" rel="noopener noreferrer" className="btn border border-white/40 text-white hover:bg-white/10">Book a call</a>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
