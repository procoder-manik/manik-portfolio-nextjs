import { Noto_Sans_Bengali } from 'next/font/google';
import { Download, Check, ArrowRight, Github, Smartphone, Globe2, Terminal, Apple, Play } from 'lucide-react';
import Reveal from '@/components/site/Reveal';
import Icon from '@/components/site/Icon';
import LandingVideo from './LandingVideo';
import LandingBar from './LandingBar';
import { cn } from '@/lib/utils';

const bengali = Noto_Sans_Bengali({ subsets: ['bengali', 'latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-bn' });

const T = {
  en: { download: 'Download', watch: 'Watch the intro', features: (n) => `Why ${n}`, steps: 'How it works', dl: 'Download', dlIntro: 'Pick the version that suits you.', needs: 'What you need', soon: 'Coming soon', recommended: 'Recommended', faq: 'Questions, answered', step: 'Step', free: 'Free', get: 'Get it', madeBy: 'Made by', video: 'Watch the intro' },
  bn: { download: 'ডাউনলোড করুন', watch: 'ভিডিও দেখুন', features: (n) => `কেন ${n}`, steps: 'কীভাবে শুরু করবেন', dl: 'ডাউনলোড', dlIntro: 'আপনার কাজের সংস্করণটি বেছে নিন।', needs: 'যা লাগবে', soon: 'শীঘ্রই আসছে', recommended: 'সুপারিশ করা', faq: 'প্রশ্ন ও উত্তর', step: 'ধাপ', free: 'ফ্রি', get: 'নামান', madeBy: 'নির্মাতা', video: 'ইন্ট্রো ভিডিও' },
};

const Win = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M3 5.6 10.6 4.5v7H3V5.6Zm8.8-1.3L21 3v8.5h-9.2V4.3ZM3 12.6h7.6v7L3 18.4v-5.8Zm8.8 0H21V21l-9.2-1.3v-7.1Z" /></svg>;
const PLATFORM = { windows: Win, mac: Apple, linux: Terminal, android: Smartphone, ios: Smartphone, web: Globe2 };

const lines = (s) => String(s || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
const rgb = (hex = '') => { const m = String(hex).trim().match(/^#?([0-9a-f]{6})$/i); if (!m) return null; const n = parseInt(m[1], 16); return `${n >> 16} ${(n >> 8) & 255} ${n & 255}`; };

function Check2({ children, dark }) {
  return (
    <li className="flex items-start gap-3">
      <span className={cn('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full', dark ? 'lp-glass text-white' : 'bg-signal/15 text-signal')}><Check size={14} strokeWidth={3} /></span>
      <span className={dark ? 'text-white/85' : 'text-body'}>{children}</span>
    </li>
  );
}

export default function LandingPage({ l }) {
  const t = T[l.lang === 'bn' ? 'bn' : 'en'];
  const mode = l.template === 'night' ? 'dark' : 'light';
  const accent = rgb(l.accent);
  const dls = (l.downloads || []).filter((d) => d && (d.label || d.url));
  const primary = dls.find((d) => d.recommended && !d.soon && d.url) || dls.find((d) => !d.soon && d.url);
  const facts = String(l.heroNote || '').split('·').map((x) => x.trim()).filter(Boolean);
  const hasVideo = !!l.video?.url?.trim();
  const stats = (l.stats || []).filter((s) => s?.value);
  const features = (l.features || []).filter((f) => f?.title);
  const steps = (l.steps || []).filter((s) => s?.title);
  const faqs = (l.faq || []).filter((f) => f?.q && f?.a);
  const panels = (l.showcases || []).filter((s) => s?.title);
  const needs = lines(l.requirements);

  return (
    <div className={cn('lp', l.lang === 'bn' && 'lp-bn', bengali.variable)} data-mode={mode} data-palette={l.palette || 'sunset'} style={accent ? { '--lp-accent': accent } : undefined}>
      {/* Hero */}
      <section className="relative overflow-hidden pb-6 pt-32 sm:pt-40">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[620px]" style={{ background: 'radial-gradient(55% 60% at 50% 0%, rgb(var(--lp-c) / .18), transparent 70%), radial-gradient(35% 40% at 85% 10%, rgb(var(--lp-a) / .14), transparent 70%)' }} />
        <div className="shell relative text-center">
          {l.logo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={l.logo} alt={`${l.name} logo`} width={84} height={84} className="mx-auto mb-6 h-[84px] w-[84px] rounded-[22px] shadow-[0_18px_40px_-16px_rgba(0,0,0,.45)]" />}
          {l.badge && <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-raised px-4 py-1.5 text-[13px] font-medium text-ink"><span className="h-1.5 w-1.5 rounded-full bg-signal" />{l.badge}</p>}
          <h1 className="mx-auto mt-6 max-w-4xl text-[clamp(2.7rem,7.2vw,5.9rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-ink">
            {l.headline}
            {l.headlineAccent && <><br /><span className="lp-grad">{l.headlineAccent}</span></>}
          </h1>
          {l.subheadline && <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-[1.3rem]">{l.subheadline}</p>}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {primary && <a href="#download" className="lp-btn inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-base font-semibold">{(() => { const P = PLATFORM[primary.platform] || Download; return <P size={19} />; })()}{t.download}</a>}
            {hasVideo && <a href="#video" className="lp-soft inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold"><Play size={16} fill="currentColor" />{t.watch}</a>}
          </div>
          {facts.length > 0 && <p className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted">{facts.map((f, i) => <span key={i} className="inline-flex items-center gap-4">{i > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-muted/50" />}{f}</span>)}</p>}
        </div>
        {l.heroImage && (
          <Reveal className="shell relative mt-12 sm:mt-16" y={40}>
            <div className="lp-panel lp-pop mx-auto max-w-5xl overflow-hidden rounded-[30px] p-2.5 sm:rounded-[46px] sm:p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.heroImage} alt={`${l.name} in use`} className="w-full rounded-[22px] sm:rounded-[34px]" fetchPriority="high" />
            </div>
          </Reveal>
        )}
      </section>

      {/* Numbers */}
      {stats.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="shell">
            <div className={cn('mx-auto grid max-w-5xl gap-y-8 text-center', stats.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3')}>
              {stats.map((s, i) => (
                <Reveal key={i} delay={i * 0.06} className="px-2">
                  <p className="lp-grad text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-none tracking-[-0.04em]">{s.value}</p>
                  <p className="mt-2 text-sm font-medium text-muted">{s.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Showcase panels */}
      {panels.map((p, i) => {
        const dark = p.tone !== 'light';
        const pts = lines(p.points);
        return (
          <section key={i} className="py-4 sm:py-6">
            <div className="shell">
              <Reveal>
                <div className={cn('overflow-hidden rounded-[32px] p-7 sm:rounded-[48px] sm:p-12 lg:p-16', dark ? 'lp-panel lp-pop' : 'bg-raised')}>
                  <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    <div className={p.reverse ? 'lg:order-2' : ''}>
                      {p.eyebrow && <p className={cn('text-sm font-semibold uppercase tracking-[0.12em]', dark ? 'lp-grad' : 'text-signal')}>{p.eyebrow}</p>}
                      <h2 className={cn('mt-3 text-[clamp(1.9rem,4.2vw,3.3rem)] font-semibold leading-[1.1] tracking-[-0.035em]', dark ? 'text-white' : 'text-ink')}>{p.title}</h2>
                      {p.body && <p className={cn('mt-5 text-lg leading-relaxed', dark ? 'text-white/70' : 'text-muted')}>{p.body}</p>}
                      {pts.length > 0 && <ul className="mt-7 space-y-3.5 text-base">{pts.map((x, k) => <Check2 key={k} dark={dark}>{x}</Check2>)}</ul>}
                    </div>
                    {p.image && (
                      <div className={p.reverse ? 'lg:order-1' : ''}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.title} loading="lazy" decoding="async" className={cn('w-full rounded-[22px] sm:rounded-[30px]', dark ? 'shadow-[0_30px_70px_-30px_rgba(0,0,0,.8)] ring-1 ring-white/15' : 'shadow-[0_24px_60px_-30px_rgba(0,0,0,.35)] ring-1 ring-black/5')} />
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* Video */}
      {hasVideo && (
        <section id="video" className="scroll-mt-24 py-16 sm:py-24">
          <div className="shell max-w-5xl text-center">
            <Reveal>
              <h2 className="text-[clamp(1.9rem,4.2vw,3.3rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-ink">{l.video.title || t.video}</h2>
              {l.video.text && <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{l.video.text}</p>}
              <div className="mt-10"><LandingVideo url={l.video.url} poster={l.video.poster} title={l.video.title || t.video} /></div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Features */}
      {features.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="shell">
            <Reveal><h2 className="mx-auto max-w-3xl text-center text-[clamp(1.9rem,4.2vw,3.3rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-ink">{t.features(l.name)}</h2></Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <Reveal key={i} delay={(i % 3) * 0.07} className="h-full">
                  <div className="h-full rounded-[28px] bg-raised p-7 transition duration-500 hover:-translate-y-1 sm:p-8">
                    <span className="lp-btn grid h-12 w-12 place-items-center rounded-2xl"><Icon name={f.icon} size={22} /></span>
                    <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-ink">{f.title}</h3>
                    <p className="mt-2.5 leading-relaxed text-muted">{f.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="shell">
            <Reveal className="text-center">
              <h2 className="text-[clamp(1.9rem,4.2vw,3.3rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-ink">{l.stepsHeading || t.steps}</h2>
              {l.stepsIntro && <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{l.stepsIntro}</p>}
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
              {steps.map((s, i) => (
                <Reveal key={i} delay={(i % 3) * 0.07} className={cn('h-full', i < 3 ? 'lg:col-span-2' : 'lg:col-span-3')}>
                  <article className="flex h-full flex-col overflow-hidden rounded-[28px] bg-raised">
                    {s.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.image} alt={s.title} loading="lazy" decoding="async" className="aspect-video w-full object-cover" />}
                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      <p className="flex items-center gap-2.5 text-sm font-semibold text-signal"><span className="lp-btn grid h-7 w-7 place-items-center rounded-full text-[13px]">{i + 1}</span>{t.step} {i + 1}</p>
                      <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-ink">{s.title}</h3>
                      <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Downloads */}
      {dls.length > 0 && (
        <section id="download" className="scroll-mt-24 py-16 sm:py-24">
          <div className="shell">
            <Reveal>
              <div className="lp-panel lp-pop overflow-hidden rounded-[32px] p-7 sm:rounded-[48px] sm:p-12 lg:p-16">
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-white"><span className="lp-grad">{l.ctaHeading || t.dl}</span></h2>
                  <p className="mt-4 text-lg text-white/70">{l.ctaText || t.dlIntro}</p>
                </div>
                <div className={cn('mx-auto mt-12 grid max-w-4xl gap-5', dls.length > 1 && 'md:grid-cols-2')}>
                  {dls.map((d, i) => {
                    const P = PLATFORM[d.platform] || Download;
                    const off = d.soon || !d.url;
                    return (
                      <div key={i} className={cn('lp-glass relative flex flex-col rounded-[28px] p-7 sm:p-8', d.recommended && 'ring-2 ring-white/50')}>
                        {(d.recommended || d.sub) && <span className={cn('absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-semibold', d.recommended ? 'bg-white text-[#1d1d1f]' : 'bg-white/15 text-white')}>{d.soon ? t.soon : d.recommended ? (d.sub || t.recommended) : d.sub}</span>}
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/12 text-white"><P size={28} /></span>
                        <h3 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-white">{d.label}</h3>
                        {d.size && <p className="mt-1 text-sm font-medium text-white/60">{d.size}</p>}
                        {d.note && <p className="mt-4 flex-1 leading-relaxed text-white/75">{d.note}</p>}
                        {off
                          ? <span className="mt-7 inline-flex cursor-not-allowed items-center justify-center rounded-full bg-white/15 px-6 py-3.5 text-base font-semibold text-white/60">{t.soon}</span>
                          : <a href={d.url} download rel="noopener" className="mt-7 inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-base font-semibold text-[#1d1d1f] transition hover:scale-[1.02] active:scale-[0.98]"><Download size={18} />{t.download}</a>}
                      </div>
                    );
                  })}
                </div>
                {(needs.length > 0 || l.repoUrl) && (
                  <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center justify-between gap-6 border-t border-white/15 pt-8 sm:flex-row sm:items-start">
                    {needs.length > 0 && <div><p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/60">{t.needs}</p><ul className="mt-3 space-y-2 text-white/85">{needs.map((x, k) => <li key={k} className="flex items-center gap-2.5"><Check size={16} className="shrink-0 text-white/60" />{x}</li>)}</ul></div>}
                    {l.repoUrl && <a href={l.repoUrl} target="_blank" rel="noopener noreferrer" className="lp-glass inline-flex items-center gap-2.5 rounded-full px-5 py-3 font-medium text-white transition hover:bg-white/15"><Github size={18} />{l.repoLabel || 'GitHub'}<ArrowRight size={16} /></a>}
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Questions */}
      {faqs.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="shell max-w-3xl">
            <Reveal><h2 className="text-center text-[clamp(1.9rem,4.2vw,3.3rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-ink">{t.faq}</h2></Reveal>
            <div className="mt-10 space-y-3">
              {faqs.map((f, i) => (
                <details key={i} className="group rounded-[22px] bg-raised px-6 py-5 transition open:bg-raised">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-base text-xl leading-none text-muted transition duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Maker */}
      {l.creator?.name && (
        <section className="pb-20 pt-6 sm:pb-28">
          <div className="shell max-w-5xl text-center">
            <Reveal>
              {l.creator.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={l.creator.image} alt={l.creator.name} loading="lazy" decoding="async" className="lp-pop mx-auto w-full rounded-[24px] sm:rounded-[36px]" />}
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.12em] text-muted">{t.madeBy}</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">{l.creator.url ? <a href={l.creator.url} className="hover:text-signal">{l.creator.name}</a> : l.creator.name}</p>
              {l.creator.role && <p className="mt-1 text-muted">{l.creator.role}</p>}
              {l.creator.text && <p className="mx-auto mt-4 max-w-xl text-muted">{l.creator.text}</p>}
            </Reveal>
          </div>
        </section>
      )}

      {primary && <LandingBar name={l.name} label={t.download} logo={l.logo} />}
    </div>
  );
}
