import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { getProjects, getPosts, getCategories, getServicesWithPackages, getApps, getSettings, getCaseStudies, getForm } from '@/lib/data';
import CaseStudyCard from '../CaseStudyCard';
import { caseStudiesOn } from '@/lib/features';
import { renderMarkdown } from '@/lib/markdown';
import { videoEmbed, cn } from '@/lib/utils';
import ProjectCard from '../ProjectCard';
import PostCard from '../PostCard';
import PricingTabs, { PackageGrid } from '../PricingTabs';
import CardLayout from '../cards/CardLayout';
import Faq from '../Faq';
import Marquee from '../Marquee';
import ContactForm from '../ContactForm';
import FormView from '../FormView';
import Cards from '../cards/Cards';
import Timeline from '../Timeline';
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
    case 'cards': case 'features': case 'steps': {
      const tmpl = b.template || (b.type === 'steps' ? 'numbered' : 'service');
      const items = (b.items || []).map((x) => ({ ...x, meta: x.meta || x.time }));
      return wrap(<>
        {b.eyebrow && <p className="mb-4 font-mono text-[0.78rem] uppercase tracking-[0.2em] text-signal">{b.eyebrow}</p>}
        <Head heading={b.heading} intro={b.intro} />
        <Cards cfg={{ ...b, template: tmpl, columns: b.columns || (b.type === 'steps' ? '4' : '3'), items }} /></>);
    }
    case 'timeline':
      return wrap(<><Head heading={b.heading} intro={b.intro} /><Timeline items={b.items || []} className="mx-auto max-w-3xl" /></>);
    case 'stats':
      return wrap(<>
        <Head heading={b.heading} />
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-line bg-line md:grid-cols-4">
          {(b.items || []).map((s, k) => <div key={k} className="bg-base p-7"><dd className="font-display text-4xl font-bold tracking-tight text-ink">{s.value}</dd><dt className="mt-2 text-sm text-muted">{s.label}</dt></div>)}
        </dl></>);
    case 'projects': {
      const all = await getProjects(b.source === 'featured' ? { featured: true } : {});
      return wrap(<>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6"><Head heading={b.heading} intro={b.intro} /><Link href="/portfolio" className="btn-ghost mb-12">All projects <ArrowRight size={16} /></Link></div>
        <CardLayout layout={b.layout} columns={b.columns || 3} autoplay={b.autoplay} interval={b.interval} label="Projects">{all.slice(0, b.count || 3).map((p) => <ProjectCard key={p.slug} project={p} />)}</CardLayout></>);
    }
    case 'posts': {
      const posts = await getPosts({ category: b.category || undefined, kind: b.category ? undefined : 'article', limit: b.count || 3 });
      return wrap(<><Head heading={b.heading} /><CardLayout layout={b.layout} columns={b.columns || 3} autoplay={b.autoplay} interval={b.interval} label="Posts">{posts.map((p) => <PostCard key={p.slug} post={p} cats={ctx.catMap} />)}</CardLayout></>);
    }
    case 'pricing': {
      const svc = b.service ? ctx.services.filter((s) => s.slug === b.service) : ctx.services;
      return wrap(<>
        <Head heading={b.heading} intro={b.intro} />
        {b.service && svc[0]
          ? <PackageGrid packages={svc[0].packages} lay={b} />
          : <PricingTabs services={svc} compact lay={b} />}</>);
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
        <CardLayout layout={b.layout} columns={b.columns || 3} autoplay={b.autoplay} interval={b.interval} label="Reviews">
          {items.map((t, k) => (
            <figure key={k} className="card flex h-full flex-col p-7">
              <Quote size={24} className="text-signal" />
              <blockquote className="mt-5 flex-1 text-[1.05rem] leading-relaxed text-ink">{t.quote}</blockquote>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">{t.avatar && <img src={t.avatar} alt="" className="h-10 w-10 rounded-full" loading="lazy" />}<span><span className="block font-semibold text-ink">{t.name}</span><span className="text-sm text-muted">{t.source}</span></span></figcaption>
            </figure>
          ))}
        </CardLayout></>);
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
    case 'form': {
      const form = await getForm(b.form);
      if (!form) return null;
      const stacked = b.layout === 'stacked';
      return wrap(<div className={cn('grid gap-12', !stacked && 'lg:grid-cols-[1fr_1.4fr]', stacked && 'mx-auto max-w-3xl')}>{(b.heading || b.intro) && <div>{b.heading && <h2 className="h-section">{b.heading}</h2>}{b.intro && <p className="lede mt-5">{b.intro}</p>}</div>}<FormView form={form} /></div>);
    }
    case 'spacer':
      return <div className={cn('shell', { sm: 'py-6', md: 'py-12', lg: 'py-20' }[b.size || 'md'])}>{b.divider && <hr className="border-line" />}</div>;
    case 'html':
      return <section className="shell py-8"><HtmlBlock code={b.code} /></section>;
    default:
      return null;
  }
}
