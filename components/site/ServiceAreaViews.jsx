import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, MapPin, ChevronRight } from 'lucide-react';
import Icon from './Icon';
import Reveal from './Reveal';
import Blocks from './blocks/Blocks';
import ProjectCard from './ProjectCard';
import CaseStudyCard from './CaseStudyCard';
import ContactForm from './ContactForm';
import { renderMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';

export const DESIGNS = ['aurora', 'split', 'spotlight', 'minimal'];
const href = (slug) => `/service-areas/${slug}`;

/* Place name with its flag or emoji. */
export const PlaceName = ({ area }) => <>{area?.flag ? `${area.flag} ` : ''}{area?.name}</>;

/* A card for one landing page (a service in a place). */
export function ServiceAreaCard({ sa, area, design = 'aurora', showArea = true }) {
  const accent = sa.accent || '#6391FF';
  return (
    <Link href={href(sa.slug)} className={cn('group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-surface/60 p-6 transition duration-300 hover:-translate-y-1 hover:border-[color:var(--a)]', design === 'minimal' && 'rounded-xl bg-transparent')} style={{ '--a': accent }}>
      <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" style={{ background: `${accent}55` }} />
      <div className="relative flex flex-wrap items-center gap-2 text-xs">
        {showArea && area && <span className="chip"><MapPin size={12} /> <PlaceName area={area} /></span>}
        {sa.niche && <span className="chip">{sa.niche}</span>}
      </div>
      <h3 className="relative mt-4 font-display text-xl font-semibold leading-snug tracking-tight text-ink">{sa.title}</h3>
      {sa.summary && <p className="relative mt-2 line-clamp-3 text-sm text-muted">{sa.summary}</p>}
      <span className="relative mt-auto flex items-center gap-1.5 pt-5 text-sm font-medium text-ink">See the page <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
    </Link>
  );
}

/* A card for one place with its pages listed inside. */
export function AreaCard({ area, pages = [], children = [] }) {
  const accent = area.accent || '#6391FF';
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-surface/60 p-7" style={{ '--a': accent }}>
      <span className="pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full blur-3xl" style={{ background: `${accent}30` }} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{area.kind || 'Place'}</p>
          <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink"><Link href={href(area.slug)} className="hover:text-[color:var(--a)]"><PlaceName area={area} /></Link></h3>
        </div>
        <span className="chip shrink-0">{pages.length} {pages.length === 1 ? 'page' : 'pages'}</span>
      </div>
      {area.summary && <p className="relative mt-3 line-clamp-2 text-sm text-muted">{area.summary}</p>}
      {children.length > 0 && <div className="relative mt-4 flex flex-wrap gap-1.5">{children.map((c) => <Link key={c.slug} href={href(c.slug)} className="chip hover:border-[color:var(--a)]"><PlaceName area={c} /></Link>)}</div>}
      <ul className="relative mt-5 space-y-1">
        {pages.slice(0, 6).map((p) => (
          <li key={p.slug}><Link href={href(p.slug)} className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-[0.95rem] text-body transition hover:bg-raised hover:text-ink"><span className="truncate">{p.title}</span><ChevronRight size={15} className="shrink-0 text-muted transition group-hover:translate-x-0.5" /></Link></li>
        ))}
        {!pages.length && <li className="px-3 py-2 text-sm text-muted">Pages are on the way.</li>}
      </ul>
      <Link href={href(area.slug)} className="relative mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-ink">All in {area.name} <ArrowUpRight size={15} /></Link>
    </div>
  );
}

function Crumbs({ items, light }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex flex-wrap items-center gap-1.5 text-sm', light ? 'text-white/70' : 'text-muted')}>
      {items.map(([label, to], i) => (
        <span key={to} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={13} className="opacity-60" />}
          {i === items.length - 1 ? <span className={light ? 'text-white' : 'text-ink'}>{label}</span> : <Link href={to} className={light ? 'hover:text-white' : 'hover:text-ink'}>{label}</Link>}
        </span>
      ))}
    </nav>
  );
}

function Buttons({ sa, service, light }) {
  const to = sa.ctaHref || '/contact';
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={to} className={cn('btn', light ? 'bg-white text-[#0C1526] hover:bg-white/90' : 'btn-primary')}>{sa.ctaLabel || 'Start a project'} <ArrowRight size={16} /></Link>
      {service ? <Link href={`/pricing#${service.slug}`} className={cn('btn', light ? 'border border-white/40 text-white hover:bg-white/10' : 'btn-ghost')}>See {service.name} pricing</Link> : <a href="#proof" className={cn('btn', light ? 'border border-white/40 text-white hover:bg-white/10' : 'btn-ghost')}>See the work</a>}
    </div>
  );
}

function Stats({ stats, light, className }) {
  const list = (stats || []).filter((s) => s.value && s.label);
  if (!list.length) return null;
  return (
    <dl className={cn('grid gap-px overflow-hidden rounded-[22px]', light ? 'bg-white/20' : 'border border-line bg-line', list.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2', className)}>
      {list.slice(0, 4).map((s, i) => <div key={i} className={cn('px-6 py-5', light ? 'bg-black/15 backdrop-blur' : 'bg-surface/90 backdrop-blur')}><dd className={cn('font-display text-3xl font-bold tracking-tight', light ? 'text-white' : 'text-ink')}>{s.value}</dd><dt className={cn('mt-1 text-sm', light ? 'text-white/75' : 'text-muted')}>{s.label}</dt></div>)}
    </dl>
  );
}

function Hero({ sa, area, service, crumbs }) {
  const design = DESIGNS.includes(sa.template) ? sa.template : 'aurora';
  const accent = sa.accent || '#6391FF';
  const h1 = sa.headline || sa.title;
  const chips = (
    <div className="flex flex-wrap items-center gap-2">
      {area && <Link href={href(area.slug)} className="chip border-transparent font-semibold text-white" style={{ background: accent }}><MapPin size={12} /> <PlaceName area={area} /></Link>}
      {sa.niche && <span className="chip">{sa.niche}</span>}
    </div>
  );
  const note = sa.heroNote && <p className="text-sm text-muted">{sa.heroNote}</p>;

  if (design === 'split') {
    const pts = (sa.highlights || []).filter((h) => h.title).slice(0, 4);
    return (
      <header className="relative overflow-hidden pb-16 pt-32 sm:pt-40">
        <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_20%_0%,#000,transparent)]" />
        <div className="pointer-events-none absolute -left-24 top-10 h-[420px] w-[420px] rounded-full blur-[130px]" style={{ background: `${accent}38` }} />
        <div className="shell relative grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-6">
            <Crumbs items={crumbs} />
            {chips}
            <h1 data-pitch-h="1" className="font-display text-[clamp(2.2rem,5vw,4.2rem)] font-bold leading-[1.03] tracking-[-0.035em] text-ink">{h1}</h1>
            {sa.summary && <p className="max-w-xl text-lg text-muted sm:text-xl">{sa.summary}</p>}
            <Buttons sa={sa} service={service} />
            {note}
          </div>
          <div className="relative">
            {sa.cover
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={sa.cover} alt="" className="aspect-[16/10] w-full rounded-[28px] border border-line object-cover shadow-[0_50px_100px_-50px_var(--a)]" />
              : (
                <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface/70 p-7 shadow-[0_50px_100px_-50px_var(--a)] backdrop-blur">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Why {sa.niche ? sa.niche.toLowerCase() : 'businesses'} {area ? `in ${area.name} ` : ''}work with me</p>
                  <ul className="mt-5 space-y-4">
                    {(pts.length ? pts : [{ title: 'Built to bring in customers' }, { title: 'Fast on every phone' }, { title: 'Clear pricing, no surprises' }]).map((p) => (
                      <li key={p.title} className="flex items-start gap-3"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-white" style={{ background: accent }}><Check size={14} /></span><span><span className="block font-medium text-ink">{p.title}</span>{p.body && <span className="mt-0.5 block text-sm text-muted">{p.body}</span>}</span></li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
        <div className="shell relative mt-12"><Stats stats={sa.stats} /></div>
      </header>
    );
  }

  if (design === 'spotlight') {
    return (
      <header className="relative px-3 pb-10 pt-28 sm:px-5 sm:pt-36">
        <div className="relative mx-auto max-w-shell overflow-hidden rounded-[36px] px-6 py-14 text-white sm:px-14 sm:py-20" style={{ background: `radial-gradient(120% 140% at 0% 0%, ${accent}, #0C1526 75%)` }}>
          <div className="grid-paper pointer-events-none absolute inset-0 opacity-40 [--grid:255_255_255]" />
          {sa.cover && (/* eslint-disable-next-line @next/next/no-img-element */ <img src={sa.cover} alt="" className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-30 [mask-image:linear-gradient(to_left,#000,transparent)] lg:block" />)}
          <div className="relative max-w-4xl space-y-6">
            <Crumbs items={crumbs} light />
            <div className="flex flex-wrap items-center gap-2">
              {area && <Link href={href(area.slug)} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur"><MapPin size={12} /> <PlaceName area={area} /></Link>}
              {sa.niche && <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{sa.niche}</span>}
            </div>
            <h1 data-pitch-h="1" className="font-display text-[clamp(2.4rem,5.6vw,4.8rem)] font-bold leading-[1.02] tracking-[-0.04em]">{h1}</h1>
            {sa.summary && <p className="max-w-2xl text-lg text-white/80 sm:text-xl">{sa.summary}</p>}
            <Buttons sa={sa} service={service} light />
            {sa.heroNote && <p className="text-sm text-white/70">{sa.heroNote}</p>}
          </div>
          <Stats stats={sa.stats} light className="relative mt-12" />
        </div>
      </header>
    );
  }

  if (design === 'minimal') {
    return (
      <header className="border-b border-line pb-14 pt-32 sm:pt-40">
        <div className="shell max-w-4xl space-y-6">
          <Crumbs items={crumbs} />
          {chips}
          <h1 data-pitch-h="1" className="font-display text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink">{h1}</h1>
          {sa.summary && <p className="max-w-2xl text-lg text-muted">{sa.summary}</p>}
          <Buttons sa={sa} service={service} />
          {note}
        </div>
      </header>
    );
  }

  // aurora (default): centred headline with a soft glow
  return (
    <header className="relative overflow-hidden pb-16 pt-32 sm:pt-40">
      <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_0%,#000,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-[150px]" style={{ background: `${accent}40` }} />
      <div className="pointer-events-none absolute -right-20 top-40 h-[300px] w-[300px] rounded-full blur-[120px]" style={{ background: `${accent}28` }} />
      <div className="shell relative flex max-w-5xl flex-col items-center space-y-7 text-center">
        <div className="flex w-full justify-center"><Crumbs items={crumbs} /></div>
        {chips}
        <h1 data-pitch-h="1" className="font-display text-[clamp(2.4rem,5.8vw,5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-ink">{h1}</h1>
        {sa.summary && <p className="max-w-2xl text-lg text-muted sm:text-xl">{sa.summary}</p>}
        <Buttons sa={sa} service={service} />
        {note}
        <Stats stats={sa.stats} className="mt-6 w-full text-left" />
      </div>
    </header>
  );
}

/* One landing page: a service (a niche) in a place. */
export default function ServiceAreaView({ sa, area, service, siblings = [], areas = [], projects = [], cases = [], showCases = true, subject }) {
  const design = DESIGNS.includes(sa.template) ? sa.template : 'aurora';
  const accent = sa.accent || '#6391FF';
  const crumbs = [['Home', '/'], ['Service areas', '/service-areas'], ...(area ? [[area.name, href(area.slug)]] : []), [sa.title, href(sa.slug)]];
  const pts = (sa.highlights || []).filter((h) => h.title || h.body);
  const html = sa.content?.trim() ? renderMarkdown(sa.content).html : '';
  const others = areas.filter((a) => a.slug !== sa.area).slice(0, 8);
  const showPts = pts.length > 0 && design !== 'split';

  return (
    <article style={{ '--a': accent }}>
      <Hero sa={sa} area={area} service={service} crumbs={crumbs} />

      {showPts && (
        <section className="shell py-10">
          <div className={cn('grid gap-5', pts.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : pts.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
            {pts.slice(0, 4).map((h, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div className={cn('h-full rounded-[22px] border border-line p-6', design === 'minimal' ? 'bg-transparent' : 'bg-surface/60')}>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl text-white" style={{ background: accent }}><Icon name={h.icon || 'Sparkles'} size={20} /></span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">{h.title}</h3>
                  {h.body && <p className="mt-2 text-sm text-muted">{h.body}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {html && <section className="shell py-14"><div className="prose-site mx-auto max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} /></section>}

      <Blocks blocks={sa.blocks || []} atTop={false} />

      {(projects.length > 0 || (showCases && cases.length > 0)) && (
        <section id="proof" className="section scroll-mt-24 border-t border-line bg-surface/30">
          <div className="shell space-y-14">
            {projects.length > 0 && (
              <div>
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><h2 className="h-section max-w-[18ch]">{sa.niche ? `${sa.niche} sites I have built` : 'Work I have built'}</h2><Link href="/portfolio" className="btn-ghost btn-sm">All work <ArrowRight size={15} /></Link></div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{projects.map((p, i) => <ProjectCard key={p.slug} project={p} priority={i < 2} />)}</div>
              </div>
            )}
            {showCases && cases.length > 0 && (
              <div>
                <h2 className="h-section mb-8 max-w-[18ch]">Results for clients</h2>
                <div className="grid gap-6 md:grid-cols-2">{cases.map((c) => <CaseStudyCard key={c.slug} c={c} />)}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="section border-t border-line">
          <div className="shell">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><h2 className="h-section max-w-[20ch]">More in {area?.name || 'this place'}</h2>{area && <Link href={href(area.slug)} className="btn-ghost btn-sm">All in {area.name} <ArrowRight size={15} /></Link>}</div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{siblings.map((x) => <ServiceAreaCard key={x.slug} sa={x} area={area} design={design} showArea={false} />)}</div>
          </div>
        </section>
      )}

      <section className="px-3 pb-20 pt-6 sm:px-5">
        <div className="relative mx-auto max-w-shell overflow-hidden rounded-[32px] px-6 py-14 text-white sm:px-14" style={{ background: `linear-gradient(135deg, ${accent}, #0C1526 120%)` }}>
          <div className="grid-paper pointer-events-none absolute inset-0 opacity-40 [--grid:255_255_255]" />
          <div className={cn('relative grid gap-10', sa.showForm !== false && 'lg:grid-cols-[1fr_1.1fr] lg:items-center')}>
            <div className="space-y-5">
              <h2 className="h-section max-w-[18ch] text-white">{sa.ctaHeading || (area ? `Ready for more customers in ${area.name}?` : 'Ready to talk?')}</h2>
              <p className="max-w-xl text-white/80">{sa.ctaText || `Tell me about your ${sa.niche ? sa.niche.toLowerCase() : 'business'}. I reply within one working day with a clear plan and price.`}</p>
              {sa.showForm === false && <Link href={sa.ctaHref || '/contact'} className="btn bg-white text-[#0C1526] hover:bg-white/90">{sa.ctaLabel || 'Start a project'} <ArrowRight size={16} /></Link>}
            </div>
            {sa.showForm !== false && <div className="text-ink"><ContactForm services={[]} defaultService={service?.name || ''} subject={subject} /></div>}
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="shell pb-24">
          <p className="mb-3 text-sm font-medium text-muted">Other places I work</p>
          <div className="flex flex-wrap gap-2">{others.map((a) => <Link key={a.slug} href={href(a.slug)} className="chip hover:border-signal"><PlaceName area={a} /></Link>)}</div>
        </section>
      )}
    </article>
  );
}

/* A place: its description and every landing page inside it (and inside the places within it). */
export function AreaView({ area, pages = [], children = [], childPages = {}, parent, areas = [] }) {
  const accent = area.accent || '#6391FF';
  const html = area.description?.trim() ? renderMarkdown(area.description).html : '';
  const crumbs = [['Home', '/'], ['Service areas', '/service-areas'], ...(parent ? [[parent.name, href(parent.slug)]] : []), [area.name, href(area.slug)]];
  const others = areas.filter((a) => a.slug !== area.slug).slice(0, 10);
  return (
    <article style={{ '--a': accent }}>
      <header className="relative overflow-hidden pb-14 pt-32 sm:pt-40">
        <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_30%_0%,#000,transparent)]" />
        <div className="pointer-events-none absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full blur-[140px]" style={{ background: `${accent}40` }} />
        {area.cover && (/* eslint-disable-next-line @next/next/no-img-element */ <img src={area.cover} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12] [mask-image:linear-gradient(to_bottom,#000,transparent)]" />)}
        <div className="shell relative space-y-6">
          <Crumbs items={crumbs} />
          <div className="flex flex-wrap items-center gap-2"><span className="chip border-transparent font-semibold text-white" style={{ background: accent }}><MapPin size={12} /> {area.kind || 'Place'}</span><span className="chip">{pages.length + Object.values(childPages).reduce((n, l) => n + l.length, 0)} service pages</span></div>
          <h1 className="max-w-5xl font-display text-[clamp(2.3rem,5.4vw,4.6rem)] font-bold leading-[1.02] tracking-[-0.04em] text-ink"><PlaceName area={area} /></h1>
          {area.summary && <p className="max-w-3xl text-lg text-muted sm:text-xl">{area.summary}</p>}
        </div>
      </header>

      {html && <section className="shell pb-6"><div className="prose-site max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} /></section>}

      <section className="section pt-10">
        <div className="shell space-y-14">
          <div>
            {pages.length > 0 && <h2 className="h-section mb-8 max-w-[20ch]">Services in {area.name}</h2>}
            {pages.length > 0
              ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{pages.map((p) => <ServiceAreaCard key={p.slug} sa={p} area={area} showArea={false} />)}</div>
              : children.length === 0 && <p className="rounded-2xl border border-dashed border-line p-12 text-center text-muted">Pages for this place are on the way.</p>}
          </div>
          {children.map((c) => (childPages[c.slug] || []).length > 0 && (
            <div key={c.slug}>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><h2 className="font-display text-2xl font-semibold tracking-tight text-ink"><Link href={href(c.slug)} className="hover:text-[color:var(--a)]"><PlaceName area={c} /></Link></h2><Link href={href(c.slug)} className="text-sm font-medium text-muted hover:text-ink">All in {c.name} <ArrowUpRight size={14} className="inline" /></Link></div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{childPages[c.slug].map((p) => <ServiceAreaCard key={p.slug} sa={p} area={c} showArea={false} />)}</div>
            </div>
          ))}
        </div>
      </section>

      <Blocks blocks={area.blocks || []} atTop={false} />

      <section className="px-3 pb-20 sm:px-5">
        <div className="relative mx-auto max-w-shell overflow-hidden rounded-[32px] px-6 py-12 text-white sm:px-14" style={{ background: `linear-gradient(135deg, ${accent}, #0C1526 120%)` }}>
          <div className="grid-paper pointer-events-none absolute inset-0 opacity-40 [--grid:255_255_255]" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <h2 className="h-section max-w-[20ch] text-white">Need a site for your business in {area.name}?</h2>
            <Link href="/contact" className="btn bg-white text-[#0C1526] hover:bg-white/90">Start a project <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="shell pb-24">
          <p className="mb-3 text-sm font-medium text-muted">Other places I work</p>
          <div className="flex flex-wrap gap-2">{others.map((a) => <Link key={a.slug} href={href(a.slug)} className="chip hover:border-signal"><PlaceName area={a} /></Link>)}</div>
        </section>
      )}
    </article>
  );
}
