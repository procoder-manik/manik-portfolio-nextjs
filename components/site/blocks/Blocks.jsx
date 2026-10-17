import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { getProjects, getPosts, getCategories, getServicesWithPackages, getApps, getSettings, getCaseStudies } from '@/lib/data';
import CaseStudyCard from '../CaseStudyCard';
import { caseStudiesOn } from '@/lib/features';
import { renderMarkdown } from '@/lib/markdown';
import { videoEmbed, cn } from '@/lib/utils';
import ProjectCard from '../ProjectCard';
import PostCard from '../PostCard';
import PricingTabs, { PackageCard } from '../PricingTabs';
import Faq from '../Faq';
import Marquee from '../Marquee';
import ContactForm from '../ContactForm';
import AppCard from '../AppCard';
import Icon from '../Icon';
import HtmlBlock from '../HtmlBlock';
import Reveal from '../Reveal';

const BG = { surface: 'bg-surface/50 border-y border-line', grid: 'grid-paper', accent: '' };
const ext = (h = '') => /^https?:/.test(h);
const Btn = ({ b, primary, light }) => (b?.label && b?.href
  ? <Link href={b.href} target={ext(b.href) ? '_blank' : undefined} className={light ? (primary ? 'btn bg-white text-[#0C1526] hover:bg-white/90' : 'btn border border-white/40 text-white hover:bg-white/10') : primary ? 'btn-primary' : 'btn-ghost'}>{b.label}{primary && <ArrowRight size={16} />}</Link>
  : null);
const Head = ({ heading, intro, center }) => (heading || intro ? (
  <div className={cn('mb-12', center && 'text-center')}>
    {heading && <h2 className={cn('h-section max-w-[20ch]', center && 'mx-auto')}>{heading}</h2>}
    {intro && <p className={cn('lede mt-4', center && 'mx-auto')}>{intro}</p>}
  </div>) : null);

export default async function Blocks({ blocks = [] }) {
  const list = blocks.filter((b) => b && !b.hidden && b.type);
  if (!list.length) return null;
  const need = new Set(list.map((b) => b.type));
  const [cats, services, apps, home] = await Promise.all([
    need.has('posts') ? getCategories() : [], need.has('pricing') ? getServicesWithPackages() : [],
    need.has('apps') ? getApps() : [], need.has('faq') || need.has('testimonials') ? getSettings('home') : {},
  ]);
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c]));
  const ctx = { catMap, services, apps, home };
  return <>{list.map((b, i) => <Block key={i} b={b} first={i === 0} ctx={ctx} />)}</>;
}

async function Block({ b, first, ctx }) {
  const wrap = (children, cls = '') => (
    <section id={b.anchor || undefined} className={cn('relative', first && b.type === 'hero' ? 'pb-20 pt-36 sm:pt-44' : 'py-16 sm:py-24', BG[b.background], cls)}>
      <div className="shell relative">{children}</div>
    </section>
  );
  switch (b.type) {
    case 'hero': {
      const c = b.align === 'center';
      return wrap(
        <div className={cn('grid items-center gap-12', b.image && !c && 'lg:grid-cols-[1.2fr_1fr]')}>
          <div className={cn(c && 'mx-auto max-w-4xl text-center')}>
            {first ? <h1 className="h-display">{b.heading}</h1> : <h2 className="h-display">{b.heading}</h2>}
            {b.text && <p className={cn('mt-6 max-w-2xl text-lg text-muted sm:text-xl', c && 'mx-auto')}>{b.text}</p>}
            <div className={cn('mt-9 flex flex-wrap gap-3', c && 'justify-center')}><Btn b={b.primary} primary /><Btn b={b.secondary} /></div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {b.image && <img src={b.image} alt="" className={cn('w-full rounded-[24px] border border-line object-cover', c && 'mx-auto mt-12 max-w-5xl')} />}
        </div>);
    }
    case 'richText':
      return wrap(<div className={cn('prose-site', b.width !== 'wide' && 'mx-auto max-w-[70ch]')} dangerouslySetInnerHTML={{ __html: renderMarkdown(b.content).html }} />);
    case 'split':
      return wrap(
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {b.image && <Reveal className={b.imageSide === 'left' ? '' : 'lg:order-2'}><img src={b.image} alt="" loading="lazy" className="w-full rounded-[24px] border border-line object-cover" /></Reveal>}
          <div>
            {b.heading && <h2 className="h-section">{b.heading}</h2>}
            <div className="prose-site mt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(b.body).html }} />
            <div className="mt-8"><Btn b={b.button} primary /></div>
          </div>
        </div>);
    case 'features':
      return wrap(<>
        <Head heading={b.heading} intro={b.intro} />
        <div className={cn('grid gap-5 sm:grid-cols-2', { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' }[b.columns || '3'])}>
          {(b.items || []).map((it, k) => (
            <Reveal key={k} delay={k * 0.05}>
              <div className="card group h-full p-7 transition duration-500 hover:-translate-y-1 hover:border-signal/50">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-signal/15 text-signal transition group-hover:bg-signal group-hover:text-white"><Icon name={it.icon} size={21} /></span>
                <h3 className="mt-6 text-xl font-semibold">{it.title}</h3>
                <p className="mt-2 text-[0.95rem] text-muted">{it.body}</p>
              </div>
            </Reveal>
          ))}
        </div></>);
    case 'stats':
      return wrap(<>
        <Head heading={b.heading} />
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-line bg-line md:grid-cols-4">
          {(b.items || []).map((s, k) => <div key={k} className="bg-base p-7"><dd className="font-display text-4xl font-bold tracking-tight text-ink">{s.value}</dd><dt className="mt-2 text-sm text-muted">{s.label}</dt></div>)}
        </dl></>);
    case 'steps':
      return wrap(<>
        <Head heading={b.heading} />
        <ol className="grid gap-px overflow-hidden rounded-[22px] border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
          {(b.items || []).map((s, k) => <li key={k} className="flex flex-col bg-base p-7"><span className="font-display text-5xl font-bold text-signal/80">{k + 1}</span><h3 className="mt-8 text-xl font-semibold">{s.title}</h3><p className="mt-3 flex-1 text-[0.95rem] text-muted">{s.body}</p>{s.time && <p className="mt-6 text-sm font-medium text-amber">{s.time}</p>}</li>)}
        </ol></>);
    case 'projects': {
      const all = await getProjects(b.source === 'featured' ? { featured: true } : {});
      return wrap(<>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6"><Head heading={b.heading} intro={b.intro} /><Link href="/portfolio" className="btn-ghost mb-12">All projects <ArrowRight size={16} /></Link></div>
        <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">{all.slice(0, b.count || 3).map((p) => <ProjectCard key={p.slug} project={p} />)}</div></>);
    }
    case 'posts': {
      const posts = await getPosts({ category: b.category || undefined, kind: b.category ? undefined : 'article', limit: b.count || 3 });
      return wrap(<><Head heading={b.heading} /><div className="grid gap-x-8 gap-y-14 md:grid-cols-3">{posts.map((p) => <PostCard key={p.slug} post={p} cats={ctx.catMap} />)}</div></>);
    }
    case 'pricing': {
      const svc = b.service ? ctx.services.filter((s) => s.slug === b.service) : ctx.services;
      return wrap(<>
        <Head heading={b.heading} intro={b.intro} />
        {b.service && svc[0]
          ? <div className={cn('grid gap-5', svc[0].packages.length >= 4 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3')}>{svc[0].packages.map((p) => <PackageCard key={p.slug} p={p} />)}</div>
          : <PricingTabs services={svc} compact />}</>);
    }
    case 'caseStudies': {
      if (!caseStudiesOn(await getSettings('site'))) return null;
      const cs = (await getCaseStudies()).slice(0, b.count || 3);
      return cs.length ? wrap(<><Head heading={b.heading} intro={b.intro} /><div className="space-y-6"><CaseStudyCard c={cs[0]} variant="feature" />{cs.length > 1 && <div className="grid gap-6 md:grid-cols-2">{cs.slice(1).map((c) => <CaseStudyCard key={c.slug} c={c} />)}</div>}</div></>) : null;
    }
    case 'apps':
      return ctx.apps.length ? wrap(<><Head heading={b.heading} intro={b.intro} /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{ctx.apps.map((a) => <AppCard key={a.slug} app={a} />)}</div></>) : null;
    case 'testimonials': {
      const items = b.useSite ? ctx.home.testimonials?.items || [] : b.items || [];
      return wrap(<>
        <Head heading={b.heading} />
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((t, k) => (
            <figure key={k} className="card flex h-full flex-col p-7">
              <Quote size={24} className="text-signal" />
              <blockquote className="mt-5 flex-1 text-[1.05rem] leading-relaxed text-ink">{t.quote}</blockquote>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">{t.avatar && <img src={t.avatar} alt="" className="h-10 w-10 rounded-full" loading="lazy" />}<span><span className="block font-semibold text-ink">{t.name}</span><span className="text-sm text-muted">{t.source}</span></span></figcaption>
            </figure>
          ))}
        </div></>);
    }
    case 'logos':
      return wrap(<>{b.heading && <p className="mb-8 text-center text-sm text-muted">{b.heading}</p>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Marquee>{(b.images || []).map((l, k) => <img key={k} src={l} alt="" className="h-12 w-auto opacity-70" loading="lazy" />)}</Marquee></>);
    case 'gallery':
      return wrap(<><Head heading={b.heading} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className={cn('grid gap-5 sm:grid-cols-2', b.columns === '3' && 'lg:grid-cols-3')}>{(b.images || []).map((g, k) => <img key={k} src={g} alt="" loading="lazy" className="w-full rounded-2xl border border-line object-cover" />)}</div></>);
    case 'video': {
      const v = videoEmbed({ provider: 'other', url: b.url });
      return v ? wrap(<div className="mx-auto max-w-5xl"><Head heading={b.heading} />
        <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-raised">
          {v.type === 'iframe' ? <iframe src={v.src} title={b.heading || 'Video'} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" /> : <video src={v.src} controls preload="metadata" className="h-full w-full" />}
        </div>{b.caption && <p className="mt-3 text-center text-sm text-muted">{b.caption}</p>}</div>) : null;
    }
    case 'faq': {
      const items = b.useSite ? ctx.home.faq?.items || [] : b.items || [];
      return wrap(<div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]"><h2 className="h-section max-w-[12ch]">{b.heading}</h2><Faq items={items} /></div>);
    }
    case 'cta':
      return (
        <section id={b.anchor || undefined} className="px-3 py-12 sm:px-5">
          <div className="relative mx-auto max-w-shell overflow-hidden rounded-[32px] bg-signal px-6 py-16 text-white sm:px-14 sm:py-20">
            <div className="grid-paper pointer-events-none absolute inset-0 opacity-60 [--grid:255_255_255]" />
            <div className="relative grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
              <div><h2 className="h-section max-w-[16ch] text-white">{b.heading}</h2>{b.body && <p className="mt-5 max-w-lg text-lg text-white/80">{b.body}</p>}</div>
              <div className="flex flex-wrap gap-3 lg:justify-end"><Btn b={b.primary} primary light /><Btn b={b.secondary} light /></div>
            </div>
          </div>
        </section>);
    case 'contactForm': {
      const svcs = await getServicesWithPackages();
      return wrap(<div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]"><div><h2 className="h-section">{b.heading}</h2>{b.intro && <p className="lede mt-5">{b.intro}</p>}</div><ContactForm services={svcs.map((s) => s.name)} /></div>);
    }
    case 'spacer':
      return <div className={cn('shell', { sm: 'py-6', md: 'py-12', lg: 'py-20' }[b.size || 'md'])}>{b.divider && <hr className="border-line" />}</div>;
    case 'html':
      return <section className="shell py-8"><HtmlBlock code={b.code} /></section>;
    default:
      return null;
  }
}
