import Link from 'next/link';
import { seoMeta } from '@/lib/seo';
import { Download, Mail, Phone, MapPin, ArrowRight, Briefcase, GraduationCap, Award, Languages, Wrench, Sparkles } from 'lucide-react';
import { getAllSettings, getSettings , getPageSeo } from '@/lib/data';
import PrintButton from '@/components/site/PrintButton';
import SkillBars from '@/components/site/SkillBars';
import SocialIcon from '@/components/site/SocialIcon';
import JsonLd from '@/components/site/JsonLd';
import Timeline from '@/components/site/Timeline';
import { buildGraph, crumbs } from '@/lib/schema';
import { siteUrl } from '@/lib/utils';

export async function generateMetadata() {
  return seoMeta(await getPageSeo('resume'), { title: 'Resume', description: 'Experience, education and skills of Manik Hossain, web designer, WordPress expert and SEO specialist.', path: '/resume' });
}

const range = (a, b) => (!b || a === b ? a : `${a} to ${b}`);

export default async function ResumePage() {
  const { site, resume: r } = await getAllSettings();
  const person = { '@id': `${siteUrl()}/#person` };
  return (
    <>
      <JsonLd builtin="resume" data={buildGraph(site, [crumbs([['Home', '/'], ['Resume', '/resume']]), { '@type': 'ProfilePage', url: `${siteUrl()}/resume`, mainEntity: person },
        ...(r.education || []).map((e) => ({ '@type': 'EducationalOccupationalCredential', name: e.degree, recognizedBy: { '@type': 'Organization', name: e.school }, about: person }))])} />

      <section className="relative overflow-hidden pb-14 pt-32 sm:pt-40 print:pb-6 print:pt-0">
        <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_30%_10%,#000,transparent)] print:hidden" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-signal/20 blur-[120px] print:hidden" />
        <div className="shell relative max-w-6xl">
          <div className="grid items-end gap-10 lg:grid-cols-[auto_1fr_auto]">
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={site.avatar} alt={site.name} className="h-40 w-40 rounded-[28px] border border-line object-cover sm:h-48 sm:w-48 print:h-28 print:w-28" />
              {site.available && <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink print:hidden"><span className="h-2 w-2 animate-pulse rounded-full bg-good" />Available</span>}
            </div>
            <div>
              <p className="text-sm font-medium text-signal">Resume</p>
              <h1 className="mt-2 font-display text-[clamp(2.4rem,5.5vw,4.4rem)] font-bold leading-[.98] tracking-[-0.035em]">{site.name}</h1>
              <p className="mt-3 text-xl text-body">{r.headline}</p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 hover:text-ink"><Mail size={14} />{site.email}</a>
                <a href={`tel:${site.phoneTel}`} className="inline-flex items-center gap-2 hover:text-ink"><Phone size={14} />{site.phone}</a>
                <span className="inline-flex items-center gap-2"><MapPin size={14} />{site.location}</span>
              </div>
            </div>
            <div className="no-print flex flex-wrap gap-2 lg:flex-col">
              {site.cvFile && <a href={site.cvFile} download className="btn-primary btn-sm"><Download size={15} />Download PDF</a>}
              <PrintButton />
            </div>
          </div>
          {r.highlights?.length > 0 && (
            <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-line bg-line sm:grid-cols-4 print:mt-6">
              {r.highlights.map((h) => <div key={h.label} className="bg-surface px-6 py-5"><dd className="font-display text-3xl font-bold tracking-tight text-ink">{h.value}</dd><dt className="text-sm text-muted">{h.label}</dt></div>)}
            </dl>
          )}
        </div>
      </section>

      <section className="pb-24 print:pb-0">
        <div className="shell grid max-w-6xl gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-14 print:space-y-8">
            <Block icon={Sparkles} title="Profile">
              <p className="text-[1.08rem] leading-relaxed text-body">{r.summary}</p>
              {r.availability && <p className="mt-4 inline-flex rounded-full bg-good/10 px-3 py-1.5 text-sm text-good">{r.availability}</p>}
            </Block>

            <Block icon={Briefcase} title="Experience">
              <Timeline items={(r.experience || []).map((e) => ({ when: range(e.start, e.end), title: e.role, sub: e.company, bullets: e.bullets }))} />
            </Block>

            <Block icon={GraduationCap} title="Education">
              <Timeline items={(r.education || []).map((e) => ({ when: range(e.start, e.end), title: e.degree, sub: e.school }))} />
            </Block>

            {r.certifications?.length > 0 && (
              <Block icon={Award} title="Certifications">
                <ul className="grid gap-3 sm:grid-cols-2">{r.certifications.map((c) => <li key={c.name} className="card p-4"><p className="font-medium text-ink">{c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-signal">{c.name}</a> : c.name}</p><p className="text-sm text-muted">{[c.issuer, c.year].filter(Boolean).join(', ')}</p></li>)}</ul>
              </Block>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {r.topSkills?.length > 0 && (
              <Side icon={Sparkles} title="Core skills"><SkillBars items={r.topSkills} compact /></Side>
            )}
            <Side icon={Wrench} title="Skill areas">
              <div className="space-y-5">
                {(r.skills || []).map((s) => (
                  <div key={s.group}>
                    <p className="text-sm font-semibold text-ink">{s.group}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">{(s.items || []).map((it) => <span key={it} className="rounded-full bg-raised px-2.5 py-1 text-xs text-body">{it}</span>)}</div>
                  </div>
                ))}
              </div>
            </Side>
            {r.tools?.length > 0 && <Side icon={Wrench} title="Tools"><div className="flex flex-wrap gap-1.5">{r.tools.map((t) => <span key={t} className="chip">{t}</span>)}</div></Side>}
            {r.languages?.length > 0 && (
              <Side icon={Languages} title="Languages">
                <ul className="space-y-3">{r.languages.map((l) => { const lv = /native/i.test(l.level) ? 5 : /fluent|professional/i.test(l.level) ? 4 : 3; return (
                  <li key={l.name} className="flex items-center justify-between gap-3 text-sm"><span className="text-ink">{l.name} <span className="text-muted">({l.level})</span></span><span className="flex gap-1">{[1, 2, 3, 4, 5].map((d) => <span key={d} className={`h-2 w-2 rounded-full ${d <= lv ? 'bg-signal' : 'bg-line'}`} />)}</span></li>); })}</ul>
              </Side>
            )}
            <div className="no-print flex flex-wrap gap-2">
              {(site.socials || []).map((s) => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="grid h-10 w-10 place-items-center rounded-full border border-line text-body transition hover:border-signal hover:bg-signal hover:text-white"><SocialIcon label={s.label} url={s.url} /></a>)}
            </div>
            <Link href="/contact" className="btn-primary no-print w-full">Hire me <ArrowRight size={16} /></Link>
          </aside>
        </div>
      </section>
    </>
  );
}

function Block({ icon: I, title, children }) {
  return <section><h2 className="mb-6 flex items-center gap-3 text-2xl font-semibold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-signal/15 text-signal print:hidden"><I size={18} /></span>{title}</h2>{children}</section>;
}
function Side({ icon: I, title, children }) {
  return <div className="card p-6 print:border-0 print:p-0"><h2 className="mb-5 flex items-center gap-2 text-[1rem] font-semibold"><I size={16} className="text-signal" />{title}</h2>{children}</div>;
}
