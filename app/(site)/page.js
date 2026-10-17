import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Download, MapPin, MessageCircle, Clock3, Quote } from 'lucide-react';
import { getAllSettings, getProjects, getPosts, getCategories, getServicesWithPackages, getApps, getCaseStudies } from '@/lib/data';
import AppCard from '@/components/site/AppCard';
import CaseStudyCard from '@/components/site/CaseStudyCard';
import { caseStudiesOn } from '@/lib/features';
import CountUp from '@/components/site/CountUp';
import SkillBars from '@/components/site/SkillBars';
import HeroShowcase from '@/components/site/HeroShowcase';
import ProjectCard from '@/components/site/ProjectCard';
import SectionHead from '@/components/site/SectionHead';
import Marquee from '@/components/site/Marquee';
import Faq from '@/components/site/Faq';
import PostCard from '@/components/site/PostCard';
import PricingTabs from '@/components/site/PricingTabs';
import Reveal from '@/components/site/Reveal';
import SplitText from '@/components/site/SplitText';
import JsonLd from '@/components/site/JsonLd';
import { renderMarkdown } from '@/lib/markdown';
import { buildGraph, faqNode, catalogNode } from '@/lib/schema';
import { fmtDate } from '@/lib/utils';

export default async function Home() {
  const [{ site, home, resume }, featured, all, posts, updates, cats, services] = await Promise.all([
    getAllSettings(), getProjects({ featured: true }), getProjects({ limit: 8 }), getPosts({ kind: 'article', limit: home_count() }),
    getPosts({ kind: 'update', limit: 4 }), getCategories(), getServicesWithPackages(),
  ]);
  const apps = home.sections?.apps ? await getApps({ featured: true }) : [];
  const cases = caseStudiesOn(site) && home.sections?.caseStudies ? (await getCaseStudies({ featured: true })).slice(0, home.caseStudies?.count || 3) : [];
  const S = home.sections || {};
  const work = (featured.length ? featured : all).slice(0, home.work?.count || 6);
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c]));
  const about = renderMarkdown(home.about?.body).html;

  return (
    <>
      <JsonLd data={buildGraph(site, [S.faq && faqNode(home.faq?.items), S.pricing && catalogNode(services)])} />

      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-32 sm:pt-40">
        <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_30%,#000,transparent)]" />
        <div className="orb-a parallax-slow pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-signal/20 blur-[120px]" />
        <div className="orb-b parallax-fast pointer-events-none absolute -bottom-40 left-[-10%] h-[420px] w-[420px] rounded-full bg-amber/10 blur-[120px]" />
        <div className="shell relative grid items-center gap-16 lg:grid-cols-[1.15fr_1fr]">
          <div className="hero-in">
            {site.available && (
              <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 text-sm text-body backdrop-blur">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-60" /><span className="relative h-2 w-2 rounded-full bg-good" /></span>
                {site.availabilityText}
              </p>
            )}
            <h1 className="h-display mt-7" data-split="now"><SplitText text={home.hero.headline} /></h1>
            <p className="mt-7 max-w-xl text-lg text-muted sm:text-xl">{home.hero.intro}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={site.calendly} target="_blank" rel="noopener noreferrer" className="btn-primary">{home.hero.primaryLabel} <ArrowUpRight size={17} /></a>
              <Link href="#work" className="btn-ghost">{home.hero.secondaryLabel}</Link>
            </div>
            <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-8 sm:grid-cols-4">
              {(home.stats || []).map((s) => (
                <div key={s.label}><dt className="sr-only">{s.label}</dt>
                  <dd><span className="block font-display text-3xl font-bold tracking-tight text-ink sm:text-[2.1rem]"><CountUp value={s.value} /></span><span className="mt-1 block text-sm leading-snug text-muted">{s.label}</span></dd></div>
              ))}
            </dl>
          </div>
          <HeroShowcase projects={work} />
        </div>
        {home.tools?.length > 0 && (
          <div className="mt-20 border-y border-line py-5">
            <Marquee>{home.tools.map((t) => <span key={t} className="whitespace-nowrap px-5 font-display text-lg font-medium text-muted">{t}</span>)}</Marquee>
          </div>
        )}
      </section>

      {/* About */}
      {S.about && (
        <section id="about" className="section">
          <div className="shell grid items-center gap-14 lg:grid-cols-[.9fr_1.1fr]">
            <Reveal className="relative">
              <div className="relative overflow-hidden rounded-[28px] border border-line bg-raised">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={home.about.image || site.avatar} alt={`${site.name}, portrait`} className="aspect-[4/5] w-full object-cover" loading="lazy" />
              </div>
              <div className="absolute -bottom-6 -right-2 rounded-2xl border border-line bg-surface/90 p-5 backdrop-blur sm:-right-6">
                <p className="font-display text-4xl font-bold text-ink">{home.stats?.[0]?.value}</p>
                <p className="text-sm text-muted">{home.stats?.[0]?.label}</p>
              </div>
            </Reveal>
            <div>
              <h2 className="h-section max-w-[18ch]" data-split=""><SplitText text={home.about.heading} /></h2>
              <div className="prose-site mt-7" dangerouslySetInnerHTML={{ __html: about }} />
              {home.about.quote && (
                <blockquote className="mt-8 flex gap-4 rounded-2xl border border-line bg-surface p-6">
                  <Quote className="shrink-0 text-signal" size={22} />
                  <p className="font-display text-xl leading-snug text-ink">{home.about.quote}</p>
                </blockquote>
              )}
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[0.95rem]">
                <span className="inline-flex items-center gap-2 text-body"><MapPin size={16} className="text-signal" />{site.location}</span>
                <span className="inline-flex items-center gap-2 text-body"><Clock3 size={16} className="text-signal" />Replies {site.replyTime.toLowerCase()}</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {site.cvFile && <a href={site.cvFile} download className="btn-ghost"><Download size={16} />Download CV</a>}
                <Link href="/contact" className="btn-primary">Let&apos;s talk <ArrowRight size={16} /></Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {S.services && (
        <section id="services" className="section border-t border-line">
          <div className="shell">
            <SectionHead title={home.services.heading} intro={home.services.intro} />
            <div className="divide-y divide-line border-y border-line">
              {(home.services.groups || []).map((g) => (
                <div key={g.title} className="grid gap-8 py-10 lg:grid-cols-[1fr_2.4fr]">
                  <h3 className="text-2xl font-semibold">{g.title}</h3>
                  <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-3">
                    {(g.items || []).map((it) => (
                      <li key={it.title}>
                        <p className="font-display text-[1.1rem] font-semibold text-ink">{it.title}</p>
                        <p className="mt-2 text-[0.95rem] text-muted">{it.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Work */}
      {S.work && (
        <section id="work" className="section border-t border-line">
          <div className="shell">
            <SectionHead title={home.work.heading} intro={home.work.intro}>
              <Link href="/portfolio" className="btn-ghost">View all projects <ArrowRight size={16} /></Link>
            </SectionHead>
            <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
              {work.map((p, i) => <ProjectCard key={p.slug} project={p} priority={i < 3} />)}
            </div>
            <div className="mt-16 flex justify-center"><Link href="/portfolio" className="btn-primary">View more projects <ArrowRight size={16} /></Link></div>
          </div>
        </section>
      )}

      {/* Case studies */}
      {cases.length > 0 && (
        <section id="case-studies" className="section border-t border-line bg-surface/30">
          <div className="shell">
            <SectionHead title={home.caseStudies?.heading} intro={home.caseStudies?.intro}>
              <Link href="/case-studies" className="btn-ghost">All case studies <ArrowRight size={16} /></Link>
            </SectionHead>
            <div className="space-y-6">
              <Reveal><CaseStudyCard c={cases[0]} variant="feature" /></Reveal>
              {cases.length > 1 && <div className="grid gap-6 md:grid-cols-2">{cases.slice(1).map((c, i) => <Reveal key={c.slug} delay={i * .06}><CaseStudyCard c={c} /></Reveal>)}</div>}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      {S.apps && apps.length > 0 && (
        <section id="apps" className="section border-t border-line">
          <div className="shell">
            <SectionHead title={home.apps?.heading} intro={home.apps?.intro}>
              <Link href="/apps" className="btn-ghost">All products <ArrowRight size={16} /></Link>
            </SectionHead>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{apps.map((a, i) => <Reveal key={a.slug} delay={i * .06}><AppCard app={a} /></Reveal>)}</div>
          </div>
        </section>
      )}

      {/* Process */}
      {S.process && (
        <section className="section border-t border-line bg-surface/40">
          <div className="shell">
            <SectionHead title={home.process.heading} />
            <ol className="grid gap-px overflow-hidden rounded-[22px] border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
              {(home.process.steps || []).map((s, i) => (
                <li key={s.title} className="flex flex-col bg-base p-7">
                  <span className="font-display text-5xl font-bold text-signal/80">{i + 1}</span>
                  <h3 className="mt-8 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-3 flex-1 text-[0.95rem] text-muted">{s.body}</p>
                  <p className="mt-6 text-sm font-medium text-amber">{s.time}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Resume */}
      {S.resume && (
        <section id="resume" className="section border-t border-line">
          <div className="shell">
            <SectionHead title={home.resume.heading} intro={home.resume.intro}>
              <Link href="/resume" className="btn-ghost">Full resume <ArrowRight size={16} /></Link>
            </SectionHead>
            <div className="grid gap-12 lg:grid-cols-2">
              <Timeline title="Experience" items={(resume.experience || []).slice(0, 5).map((e) => ({ when: range(e.start, e.end), title: e.role, sub: e.company }))} />
              <div>
                <Timeline title="Education" items={(resume.education || []).map((e) => ({ when: range(e.start, e.end), title: e.degree, sub: e.school }))} />
                <div className="mt-12"><h3 className="mb-6 text-lg font-semibold">Core skills</h3><SkillBars items={(resume.topSkills?.length ? resume.topSkills : (resume.skills || []).map((x) => ({ name: x.group, level: x.level }))).slice(0, 6)} compact /></div>              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      {S.pricing && services.length > 0 && (
        <section id="pricing" className="section border-t border-line bg-surface/40">
          <div className="shell">
            <SectionHead title={home.pricing.heading} intro={home.pricing.intro}>
              <Link href="/pricing" className="btn-ghost">Full pricing <ArrowRight size={16} /></Link>
            </SectionHead>
            <PricingTabs services={services} compact />
          </div>
        </section>
      )}

      {/* Testimonials */}
      {S.testimonials && (
        <section className="section border-t border-line">
          <div className="shell">
            <SectionHead title={home.testimonials.heading} />
            <div className="grid gap-5 md:grid-cols-3">
              {(home.testimonials.items || []).map((t, i) => (
                <figure key={i} className="card flex h-full flex-col p-7">
                    <Quote size={24} className="text-signal" />
                    <blockquote className="mt-5 flex-1 text-[1.05rem] leading-relaxed text-ink">{t.quote}</blockquote>
                    <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {t.avatar && <img src={t.avatar} alt="" className="h-10 w-10 rounded-full" loading="lazy" />}
                      <span><span className="block font-semibold text-ink">{t.name}</span><span className="text-sm text-muted">{t.source}</span></span>
                    </figcaption>
                </figure>
              ))}
            </div>
            {home.testimonials.logos?.length > 0 && (
              <Marquee className="mt-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {home.testimonials.logos.map((l) => <img key={l} src={l} alt="" className="h-12 w-auto opacity-70" loading="lazy" />)}
              </Marquee>
            )}
          </div>
        </section>
      )}

      {/* Blog */}
      {S.blog && (
        <section id="blog" className="section border-t border-line">
          <div className="shell">
            <SectionHead title={home.blog.heading} intro={home.blog.intro}>
              <Link href="/blog" className="btn-ghost">All posts <ArrowRight size={16} /></Link>
            </SectionHead>
            <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
                {posts.slice(0, home.blog.count || 3).map((p, i) => <div key={p.slug} className={i === 0 ? 'sm:col-span-2' : ''}><PostCard post={p} cats={catMap} large={i === 0} /></div>)}
              </div>
              {updates.length > 0 && (
                <aside className="lg:border-l lg:border-line lg:pl-10">
                  <h3 className="text-lg font-semibold">Daily updates</h3>
                  <ol className="mt-6 space-y-7">
                    {updates.map((u) => (
                      <li key={u.slug} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-amber">
                        <p className="text-sm text-muted">{fmtDate(u.publishedAt, { month: 'short', day: 'numeric' })}</p>
                        <Link href={`/blog/${u.slug}`} className="mt-1 block font-medium text-ink hover:text-signal">{u.title}</Link>
                      </li>
                    ))}
                  </ol>
                </aside>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {S.faq && (
        <section id="faq" className="section border-t border-line">
          <div className="shell grid gap-12 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <h2 className="h-section max-w-[12ch]" data-split=""><SplitText text={home.faq.heading} /></h2>
              <Link href="/contact" className="btn-ghost mt-8">Ask something else</Link>
            </div>
            <Faq items={home.faq.items} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section id="contact" className="px-3 pb-24 sm:px-5">
        <div className="relative mx-auto max-w-shell overflow-hidden rounded-[32px] bg-signal px-6 py-16 text-white sm:px-14 sm:py-24">
          <div className="grid-paper pointer-events-none absolute inset-0 opacity-60 [--grid:255_255_255]" />
          <div className="relative grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="h-section max-w-[14ch] text-white" data-split=""><SplitText text={home.cta.heading} /></h2>
              <p className="mt-5 max-w-lg text-lg text-white/80">{home.cta.body}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/contact" className="btn bg-white text-[#0C1526] hover:bg-white/90">Start a project <ArrowRight size={16} /></Link>
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="btn border border-white/40 text-white hover:bg-white/10"><MessageCircle size={16} />WhatsApp</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function home_count() { return 6; }
const range = (a, b) => (!b || a === b ? a : `${a} to ${b}`);

function Timeline({ title, items }) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <ol className="mt-6 border-l border-line">
        {items.map((it, i) => (
          <li key={i} className="relative pb-8 pl-7 last:pb-0">
            <span className={`absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-signal ring-4 ring-signal/20' : 'bg-line'}`} />
            <p className="text-sm text-muted">{it.when}</p>
            <p className="mt-1 font-display text-lg font-semibold text-ink">{it.title}</p>
            <p className="text-[0.95rem] text-muted">{it.sub}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
