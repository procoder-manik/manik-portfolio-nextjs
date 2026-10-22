import Link from 'next/link';
import { seoMeta, pageMeta } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { getProject, getProjects, getSettings } from '@/lib/data';
import ScrollShot from '@/components/site/ScrollShot';
import ProjectCard, { platformLabel } from '@/components/site/ProjectCard';
import JsonLd from '@/components/site/JsonLd';
import { renderMarkdown } from '@/lib/markdown';
import { buildGraph, crumbs, projectNode } from '@/lib/schema';
import { fmtDate, projectDuration, videoEmbed, hostOf } from '@/lib/utils';
import { statusLabel } from '@/lib/project-ai-options';

export const revalidate = 600;
export const dynamicParams = true;
export async function generateStaticParams() { return (await getProjects()).map((x) => ({ slug: x.slug })); }

export async function generateMetadata(props) {
  const params = await props.params;
  const p = await getProject(params.slug);
  if (!p) return {};
  const img = p.useScrollAsBanner ? p.scrollImage : p.bannerImage || p.scrollImage;
  return seoMeta(p, { title: `${p.title} | ${p.industry || 'Website'}`, description: p.summary, image: img, path: `/portfolio/${p.slug}`, ogKind: 'project', ogSub: p.industry });
}

export default async function ProjectPage(props) {
  const params = await props.params;
  const [p, all, site] = await Promise.all([getProject(params.slug), getProjects(), getSettings('site')]);
  if (!p) notFound();
  const idx = all.findIndex((x) => x.slug === p.slug);
  const next = all[(idx + 1) % all.length];const prev = all[(idx - 1 + all.length) % all.length];
  const more = all.filter((x) => x.slug !== p.slug).slice(0, 3);
  const { html } = renderMarkdown(p.content);
  const video = videoEmbed(p.video);
  const live = statusLabel(p.workStatus); // 'In progress' or 'Ongoing care' for unfinished work
  const dur = live ? '' : projectDuration(p);
  const facts = [
    ['Client', p.client], ['Industry', p.industry], ['Platform', platformLabel(p)], ['Status', live],
    ['Started', fmtDate(p.startDate, { month: 'long', day: 'numeric', year: 'numeric' })], ['Finished', live ? '' : fmtDate(p.endDate, { month: 'long', day: 'numeric', year: 'numeric' })], ['Duration', dur],
  ].filter(([, v]) => v);

  return (
    <article>
      <JsonLd item={p} data={buildGraph(site, [crumbs([['Home', '/'], ['Portfolio', '/portfolio'], [p.title, `/portfolio/${p.slug}`]]), projectNode(p)])} />
      <header className="relative overflow-hidden pb-12 pt-32 sm:pt-40">
        <div className="pointer-events-none absolute -top-40 left-1/3 h-[480px] w-[480px] rounded-full blur-[130px]" style={{ background: `${p.accent || '#5B8CFF'}33` }} />
        <div className="shell relative">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={15} />All projects</Link>
          <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="chip border-transparent font-semibold text-white" style={{ background: p.accent }}>{platformLabel(p)}</span>
                {live && <span className="chip border-amber/40 text-amber">{live}</span>}
                {(p.services || []).map((s) => <span key={s} className="chip">{s}</span>)}
              </div>
              <h1 className="mt-6 font-display text-[clamp(2.4rem,5.5vw,4.6rem)] font-bold leading-[1] tracking-[-0.035em]">{p.title}</h1>
              <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">{p.summary}</p>
            </div>
            {p.liveUrl && (
              <div className="flex lg:justify-end">
                <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">Visit live site <ArrowUpRight size={17} /></a>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="shell">
        <ScrollShot src={p.scrollImage || p.bannerImage} alt={p.imageAlt || `${p.title} full-page screenshot`} url={p.liveUrl} direction={p.scrollDirection} accent={p.accent} aspect="aspect-[16/10]" speed={260} eager
          className="shadow-[0_60px_120px_-60px_rgba(0,0,0,.8)]" />
        <p className="mt-3 text-center text-sm text-muted">Hover or tap the screenshot to scroll through the page.</p>
      </section>

      <section className="shell grid gap-14 py-20 lg:grid-cols-[1.7fr_1fr]">
        <div className="min-w-0">
          {video && (
            <div className="mb-14">
              <h2 className="mb-5 text-2xl font-semibold">Video walkthrough</h2>
              <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-raised">
                {video.type === 'iframe'
                  ? <iframe src={video.src} title={`${p.title} walkthrough`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
                  : <video src={video.src} controls preload="metadata" className="h-full w-full" />}
              </div>
            </div>
          )}
          {html && <div className="prose-site" dangerouslySetInnerHTML={{ __html: html }} />}
          {p.deliverables?.length > 0 && (
            <div className="mt-14">
              <h2 className="text-2xl font-semibold">{p.workStatus === 'maintenance' ? 'What I look after' : p.workStatus === 'ongoing' ? 'What I am delivering' : 'What I delivered'}</h2>
              <ul className="mt-6 grid gap-3">
                {p.deliverables.map((d) => <li key={d} className="flex gap-3 rounded-2xl border border-line bg-surface p-4"><CheckCircle2 size={20} className="mt-0.5 shrink-0" style={{ color: p.accent }} /><span>{d}</span></li>)}
              </ul>
            </div>
          )}
          {p.metrics?.filter((m) => m.value && m.value !== '--').length > 0 && (
            <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
              {p.metrics.filter((m) => m.value && m.value !== '--').map((m, i) => <div key={i} className="bg-surface p-6"><dt className="text-sm text-muted">{m.label}</dt><dd className="mt-1 font-display text-3xl font-bold text-ink">{m.value}</dd></div>)}
            </dl>
          )}
          {p.gallery?.length > 0 && (
            <div className="mt-14 grid gap-5 sm:grid-cols-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.gallery.map((g) => <img key={g} src={g} alt={`${p.title} detail`} loading="lazy" className="w-full rounded-2xl border border-line" />)}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card p-6">
            <h2 className="text-lg font-semibold">Project details</h2>
            <dl className="mt-5 divide-y divide-line text-[0.95rem]">
              {facts.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-3"><dt className="text-muted">{k}</dt><dd className="text-right font-medium text-ink">{v}</dd></div>)}
            </dl>
            {p.technologies?.length > 0 && (
              <div className="mt-5 border-t border-line pt-5">
                <p className="text-sm text-muted">Built with</p>
                <div className="mt-3 flex flex-wrap gap-2">{p.technologies.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              </div>
            )}
            {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-6 w-full">Open {hostOf(p.liveUrl)} <ArrowUpRight size={16} /></a>}
          </div>
          <div className="mt-5 rounded-[22px] border border-line bg-gradient-to-br from-signal/15 to-transparent p-6">
            <p className="font-display text-xl font-semibold text-ink">Want a site like this?</p>
            <p className="mt-2 text-[0.95rem] text-muted">Tell me about your project and get a scope and price within a day.</p>
            <Link href="/contact" className="btn-primary btn-sm mt-5">Start a project <ArrowRight size={15} /></Link>
          </div>
        </aside>
      </section>

      <nav className="shell grid gap-4 border-t border-line py-10 sm:grid-cols-2" aria-label="More projects">
        <Link href={`/portfolio/${prev.slug}`} className="group rounded-2xl p-4 transition hover:bg-surface"><span className="inline-flex items-center gap-2 text-sm text-muted"><ArrowLeft size={14} />Previous</span><span className="mt-1 block font-display text-2xl font-semibold text-ink group-hover:text-signal">{prev.title}</span></Link>
        <Link href={`/portfolio/${next.slug}`} className="group rounded-2xl p-4 text-right transition hover:bg-surface"><span className="inline-flex items-center gap-2 text-sm text-muted">Next<ArrowRight size={14} /></span><span className="mt-1 block font-display text-2xl font-semibold text-ink group-hover:text-signal">{next.title}</span></Link>
      </nav>

      <section className="section border-t border-line">
        <div className="shell">
          <h2 className="h-section mb-12">More work</h2>
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">{more.map((m) => <ProjectCard key={m.slug} project={m} />)}</div>
        </div>
      </section>
    </article>
  );
}
