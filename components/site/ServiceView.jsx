import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, ChevronRight } from 'lucide-react';
import Icon from './Icon';
import Reveal from './Reveal';
import Faq from './Faq';
import ProjectCard from './ProjectCard';
import CaseStudyCard from './CaseStudyCard';
import PitchSiteCard from './PitchSiteCard';
import ContactForm from './ContactForm';
import { PackageGrid } from './PricingTabs';
import { renderMarkdown } from '@/lib/markdown';
import { cn, money, BILLING } from '@/lib/utils';

const MONO = 'font-mono text-[0.74rem] uppercase tracking-[0.2em]';
const full = (h) => /^#[0-9a-f]{6}$/i.test(h || '');

/* "From $300 one time" from a service's lowest package. */
export function fromPrice(f) {
  if (!f) return '';
  const per = BILLING[f.billing] || f.billing || '';
  return `From ${money(f.price, f.currency)}${per && f.billing !== 'one-time' ? ` ${per}` : ''}`;
}

/* A service card (Home and /services). The whole card opens the service page. */
export function ServiceCard({ s, i = 0 }) {
  const accent = full(s.accent) ? s.accent : null;
  const tint = accent ? { '--sa': accent } : undefined;
  return (
    <Link href={`/services/${s.slug}`} style={tint}
      className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-line bg-surface p-7 transition duration-500 hover:-translate-y-1.5 hover:border-[color:var(--sa,rgb(var(--signal)))] hover:shadow-[0_40px_80px_-40px_var(--sa,rgb(var(--signal)))] sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-0 blur-3xl transition duration-700 group-hover:opacity-40" style={{ background: accent || 'rgb(var(--signal))' }} />
      <div className="relative flex items-start justify-between gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-[0_14px_30px_-12px_var(--sa,rgb(var(--signal)))] transition duration-500 group-hover:scale-105"
          style={{ background: accent ? `linear-gradient(135deg, ${accent}, ${accent}b3)` : 'linear-gradient(135deg, rgb(var(--signal)), #7c5cff)' }}>
          <Icon name={s.icon || 'Layout'} size={24} />
        </span>
        <span className={cn('pt-1 text-muted/70', MONO)}>{String(i + 1).padStart(2, '0')}</span>
      </div>
      <h3 className="relative mt-7 font-display text-[1.65rem] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[1.8rem]">{s.name}</h3>
      {s.summary && <p className="relative mt-3 text-[1.02rem] leading-relaxed text-muted">{s.summary}</p>}
      {(s.homePoints || []).length > 0 && (
        <ul className="relative mt-5 space-y-2">
          {s.homePoints.slice(0, 3).map((p) => <li key={p} className="flex gap-2.5 text-[0.95rem] text-body"><Check size={17} className="mt-0.5 shrink-0" style={{ color: accent || 'rgb(var(--signal))' }} />{p}</li>)}
        </ul>
      )}
      <div className="relative mt-auto pt-7" />
      <div className="relative flex items-center justify-between gap-3 border-t border-line pt-5">
        <span className="text-sm font-medium text-muted">{fromPrice(s.from) || 'Custom quote'}</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition group-hover:text-[color:var(--sa,rgb(var(--signal)))]">Details <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}

/* Service cards grouped under small headings (Websites, Care and growth...). */
export function ServiceGroups({ services = [] }) {
  const groups = [];
  services.forEach((s) => { const g = s.group || ''; const hit = groups.find((x) => x.name === g); if (hit) hit.items.push(s); else groups.push({ name: g, items: [s] }); });
  let n = 0;
  return (
    <div className="space-y-16">
      {groups.map((g) => (
        <div key={g.name || 'all'}>
          {g.name && <div className="mb-7 flex items-center gap-4"><p className={cn('text-signal', MONO)}>{g.name}</p><span className="h-px flex-1 bg-line" /></div>}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {g.items.map((s) => { const i = n; n += 1; return <Reveal key={s.slug} delay={(i % 3) * 0.07} className="h-full"><ServiceCard s={s} i={i} /></Reveal>; })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ eyebrow, title, intro, children }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        {eyebrow && <p className={cn('mb-4 text-[color:var(--a)]', MONO)}>{eyebrow}</p>}
        <h2 className="h-section">{title}</h2>
        {intro && <p className="lede mt-4">{intro}</p>}
      </div>
      {children}
    </div>
  );
}

/* /services/<slug>: everything about one service, its packages with Buy buttons, related work, questions and a contact form. */
export default function ServiceView({ s, projects = [], cases = [], pitch = [], others = [] }) {
  const accent = full(s.accent) ? s.accent : '#6391FF';
  const html = s.content?.trim() ? renderMarkdown(s.content).html : '';
  const pts = (s.highlights || []).filter((h) => h.title);
  const steps = (s.process || []).filter((p) => p.title);
  const faqs = (s.faqs || []).filter((f) => f.q && f.a);
  const stats = (s.stats || []).filter((x) => x.value && x.label).slice(0, 4);
  const packages = s.packages || [];
  const hasWork = projects.length + cases.length + pitch.length > 0;

  return (
    <article style={{ '--a': accent }}>
      {/* Top */}
      <header className="relative overflow-hidden pb-16 pt-32 sm:pt-40">
        <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_65%_70%_at_30%_0%,#000,transparent)]" />
        <div className="pointer-events-none absolute -left-32 top-0 h-[520px] w-[720px] rounded-full blur-[150px]" style={{ background: `${accent}3d` }} />
        <div className="pointer-events-none absolute -right-24 top-48 h-[320px] w-[320px] rounded-full blur-[120px]" style={{ background: `${accent}26` }} />
        <div className={cn('shell relative grid items-center gap-12', s.cover ? 'lg:grid-cols-[1.1fr_1fr]' : '')}>
          <div className={cn('space-y-7', !s.cover && 'max-w-4xl')}>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              <Link href="/" className="hover:text-ink">Home</Link><ChevronRight size={13} className="opacity-60" />
              <Link href="/services" className="hover:text-ink">Services</Link><ChevronRight size={13} className="opacity-60" />
              <span className="text-ink">{s.name}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-[0_14px_30px_-12px_var(--a)]" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}b3)` }}><Icon name={s.icon || 'Layout'} size={22} /></span>
              {s.group && <span className={cn('text-muted', MONO)}>{s.group}</span>}
            </div>
            <h1 className="font-display text-[clamp(2.4rem,5.6vw,4.8rem)] font-bold leading-[1.02] tracking-[-0.04em] text-ink">{s.headline || s.name}</h1>
            {(s.tagline || s.summary) && <p className="max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{s.tagline || s.summary}</p>}
            <div className="flex flex-wrap items-center gap-3">
              {packages.length > 0 && <a href="#packages" className="btn-primary">See packages and prices <ArrowRight size={16} /></a>}
              <Link href={s.ctaHref || `/contact?service=${encodeURIComponent(s.name)}`} className={packages.length ? 'btn-ghost' : 'btn-primary'}>{s.ctaLabel || 'Talk about your project'}</Link>
            </div>
            {(s.idealFor || []).length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="mr-1 text-sm text-muted">Good for</span>
                {s.idealFor.map((x) => <span key={x} className="chip">{x}</span>)}
              </div>
            )}
          </div>
          {s.cover && (/* eslint-disable-next-line @next/next/no-img-element */
            <img src={s.cover} alt="" className="aspect-[16/11] w-full rounded-[28px] border border-line object-cover shadow-[0_50px_100px_-50px_var(--a)]" />)}
        </div>
        {stats.length > 0 && (
          <div className="shell relative mt-14">
            <dl className={cn('grid gap-px overflow-hidden rounded-[22px] border border-line bg-line', stats.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : stats.length === 3 ? 'sm:grid-cols-3' : 'grid-cols-2')}>
              {stats.map((x) => <div key={x.label} className="bg-surface/90 px-6 py-6 backdrop-blur"><dd className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{x.value}</dd><dt className="mt-1.5 text-sm text-muted">{x.label}</dt></div>)}
            </dl>
          </div>
        )}
      </header>

      {/* What you get */}
      {pts.length > 0 && (
        <section className="section border-t border-line">
          <div className="shell">
            <SectionTitle eyebrow="What you get" title={`What ${s.name.toLowerCase()} includes`} />
            <div className={cn('grid gap-5 sm:grid-cols-2', pts.length % 3 === 0 || pts.length > 4 ? 'lg:grid-cols-3' : '')}>
              {pts.map((h, i) => (
                <Reveal key={h.title} delay={(i % 3) * 0.07} className="h-full">
                  <div className="group h-full rounded-[24px] border border-line bg-surface/60 p-7 transition duration-500 hover:-translate-y-1 hover:border-[color:var(--a)]">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-raised text-[color:var(--a)] transition duration-500 group-hover:border-transparent group-hover:bg-[color:var(--a)] group-hover:text-white"><Icon name={h.icon || 'Sparkles'} size={21} /></span>
                    <h3 className="mt-6 font-display text-xl font-bold text-ink">{h.title}</h3>
                    {h.body && <p className="mt-2.5 leading-relaxed text-muted">{h.body}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Included + how it works */}
      {((s.deliverables || []).length > 0 || steps.length > 0) && (
        <section className="section border-t border-line bg-surface/30">
          <div className="shell grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className={cn('mb-4 text-[color:var(--a)]', MONO)}>Included</p>
              <h2 className="h-section">Every project comes with</h2>
              <ul className="mt-8 grid gap-3">
                {(s.deliverables || []).map((d) => <li key={d} className="flex gap-3 text-[1.02rem] text-body"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-white" style={{ background: accent }}><Check size={14} /></span>{d}</li>)}
              </ul>
              {(s.tools || []).length > 0 && (
                <div className="mt-10">
                  <p className="mb-3 text-sm font-medium text-muted">Tools and platforms</p>
                  <div className="flex flex-wrap gap-2">{s.tools.map((t) => <span key={t} className="chip">{t}</span>)}</div>
                </div>
              )}
            </div>
            {steps.length > 0 && (
              <div>
                <p className={cn('mb-4 text-[color:var(--a)]', MONO)}>How it works</p>
                <ol className="relative space-y-4 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-px before:bg-line">
                  {steps.map((p, i) => (
                    <Reveal key={p.title} delay={i * 0.06}>
                      <li className="relative flex gap-5 rounded-[22px] border border-line bg-base/60 p-5 backdrop-blur transition duration-500 hover:border-[color:var(--a)] sm:p-6">
                        <span className="relative z-[1] grid h-[54px] w-[54px] shrink-0 place-items-center rounded-2xl font-display text-lg font-bold text-white" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}>{String(i + 1).padStart(2, '0')}</span>
                        <span className="pt-1"><span className="block font-display text-lg font-bold text-ink">{p.title}</span>{p.body && <span className="mt-1.5 block leading-relaxed text-muted">{p.body}</span>}</span>
                      </li>
                    </Reveal>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {html && <section className="section border-t border-line"><div className="shell"><div className="prose-site mx-auto max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} /></div></section>}

      {/* Packages with Buy buttons */}
      {packages.length > 0 && (
        <section id="packages" className="section scroll-mt-24 border-t border-line">
          <div className="shell">
            <SectionTitle eyebrow="Packages" title="Pick a package" intro="Clear prices up front. Buy online and I start within two working days, or ask for a quote if your project is bigger.">
              <Link href="/pricing" className="btn-ghost btn-sm">All prices <ArrowRight size={15} /></Link>
            </SectionTitle>
            <PackageGrid packages={packages} />
          </div>
        </section>
      )}

      {/* Related work */}
      {hasWork && (
        <section id="work" className="section scroll-mt-24 border-t border-line bg-surface/30">
          <div className="shell space-y-16">
            {projects.length > 0 && (
              <div>
                <SectionTitle eyebrow="Proof" title="Work I have done like this"><Link href="/portfolio" className="btn-ghost btn-sm">All projects <ArrowRight size={15} /></Link></SectionTitle>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{projects.map((p, i) => <ProjectCard key={p.slug} project={p} priority={i < 2} />)}</div>
              </div>
            )}
            {pitch.length > 0 && (
              <div>
                <SectionTitle eyebrow="Recent concepts" title="Websites I made for local businesses" intro="One-page websites designed for real businesses. Open any of them to see it live."><Link href="/portfolio#websites" className="btn-ghost btn-sm">See all <ArrowRight size={15} /></Link></SectionTitle>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{pitch.map((x) => <PitchSiteCard key={x.slug} site={x} />)}</div>
              </div>
            )}
            {cases.length > 0 && (
              <div>
                <SectionTitle eyebrow="Results" title="Results for clients" />
                <div className="grid gap-6 md:grid-cols-2">{cases.map((c) => <CaseStudyCard key={c.slug} c={c} />)}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Questions */}
      {faqs.length > 0 && (
        <section className="section border-t border-line">
          <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div><p className={cn('mb-4 text-[color:var(--a)]', MONO)}>Questions</p><h2 className="h-section">Asked before you start</h2><p className="lede mt-4">Something else on your mind? <Link href="/contact" className="text-ink underline decoration-[color:var(--a)] underline-offset-4">Ask me directly</Link>.</p></div>
            <Faq items={faqs} />
          </div>
        </section>
      )}

      {/* Other services */}
      {others.length > 0 && (
        <section className="section border-t border-line">
          <div className="shell">
            <SectionTitle eyebrow="More services" title="Often paired with this"><Link href="/services" className="btn-ghost btn-sm">All services <ArrowRight size={15} /></Link></SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((o) => (
                <Link key={o.slug} href={`/services/${o.slug}`} className="group flex items-center gap-4 rounded-[20px] border border-line bg-surface/60 p-5 transition duration-500 hover:-translate-y-0.5 hover:border-signal/60">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-signal/10 text-signal transition group-hover:bg-signal group-hover:text-white"><Icon name={o.icon || 'Layout'} size={19} /></span>
                  <span className="min-w-0 flex-1 font-display font-bold leading-snug text-ink">{o.name}</span>
                  <ArrowUpRight size={17} className="shrink-0 text-muted transition group-hover:text-signal" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="px-3 pb-20 pt-6 sm:px-5">
        <div className="relative mx-auto max-w-shell overflow-hidden rounded-[32px] px-6 py-14 text-white sm:px-14" style={{ background: `linear-gradient(135deg, ${accent}, #0C1526 120%)` }}>
          <div className="grid-paper pointer-events-none absolute inset-0 opacity-40 [--grid:255_255_255]" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="space-y-5">
              <h2 className="h-section max-w-[18ch] text-white">{s.ctaHeading || 'Ready to start?'}</h2>
              <p className="max-w-xl text-white/80">{s.ctaText || `Tell me what you need. I reply within one working day with a clear plan and a fixed price for your ${s.name.toLowerCase()} project.`}</p>
            </div>
            <div className="text-ink"><ContactForm services={[]} defaultService={s.name} subject={`Enquiry: ${s.name}`} /></div>
          </div>
        </div>
      </section>
    </article>
  );
}
