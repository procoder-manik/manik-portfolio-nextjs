import { Noto_Sans_Bengali } from 'next/font/google';
import { Download, Check, ArrowRight, Github, Smartphone, Globe2, Terminal, Apple, Play } from 'lucide-react';
import Reveal from '@/components/site/Reveal';
import Icon from '@/components/site/Icon';
import LandingVideo from './LandingVideo';
import LandingBar from './LandingBar';
import LandingFaq from './LandingFaq';
import StepsTimeline from './StepsTimeline';
import HeroFx from './HeroFx';
import HeroDemo from './HeroDemo';
import LpCount from './LpCount';
import Spot from './Spot';
import Tilt from './Tilt';
import MeetingDemo from './MeetingDemo';
import { cn } from '@/lib/utils';

const bengali = Noto_Sans_Bengali({ subsets: ['bengali', 'latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-bn' });

const T = {
  en: { download: 'Download', watch: 'Watch the intro', features: 'Why {name}', steps: 'How it works', dl: 'Download', dlIntro: 'Pick the version that suits you.', needs: 'What you need', soon: 'Coming soon', recommended: 'Recommended', faq: 'Questions, answered', step: 'Step', madeBy: 'Made by', video: 'Watch the intro', listening: 'Listening…', recording: 'Recording', notesReady: 'Notes ready' },
  bn: { download: 'ডাউনলোড করুন', watch: 'ভিডিও দেখুন', features: 'কেন {name}', steps: 'কীভাবে শুরু করবেন', dl: 'ডাউনলোড', dlIntro: 'আপনার কাজের সংস্করণটি বেছে নিন।', needs: 'যা লাগবে', soon: 'শীঘ্রই আসছে', recommended: 'সুপারিশ করা', faq: 'প্রশ্ন ও উত্তর', step: 'ধাপ', madeBy: 'নির্মাতা', video: 'ইন্ট্রো ভিডিও', listening: 'শুনছি…', recording: 'রেকর্ড হচ্ছে', notesReady: 'নোট তৈরি' },
};

const Win = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M3 5.6 10.6 4.5v7H3V5.6Zm8.8-1.3L21 3v8.5h-9.2V4.3ZM3 12.6h7.6v7L3 18.4v-5.8Zm8.8 0H21V21l-9.2-1.3v-7.1Z" /></svg>;
const PLATFORM = { windows: Win, mac: Apple, linux: Terminal, android: Smartphone, ios: Smartphone, web: Globe2 };
const STEP_ICONS = ['Download', 'AppWindow', 'KeyRound', 'Save', 'Mic'];

const lines = (s) => String(s || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
const rgb = (hex = '') => { const m = String(hex).trim().match(/^#?([0-9a-f]{6})$/i); if (!m) return null; const n = parseInt(m[1], 16); return `${n >> 16} ${(n >> 8) & 255} ${n & 255}`; };

/* Each word rises out of a blur, one after another. */
function Words({ text, start = 0 }) {
  return String(text || '').split(/\s+/).filter(Boolean).map((w, i) => <span key={i}><span className="lp-w" style={{ '--i': start + i }}>{w}</span>{' '}</span>);
}

function Check2({ children, dark }) {
  return (
    <li className="flex items-start gap-3">
      <span className={cn('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full', dark ? 'lp-glass text-white' : 'bg-signal/15 text-signal')}><Check size={14} strokeWidth={3} /></span>
      <span className={dark ? 'text-white/85' : 'text-body'}>{children}</span>
    </li>
  );
}

const H2 = 'text-[clamp(1.9rem,4.2vw,3.3rem)] font-semibold leading-[1.1] tracking-[-0.035em]';

export default function LandingPage({ l }) {
  const base = T[l.lang === 'bn' ? 'bn' : 'en'];
  const custom = Object.fromEntries(Object.entries(l.labels || {}).filter(([, v]) => String(v || '').trim()));
  const t = { ...base, ...custom };
  const mode = l.template === 'night' ? 'dark' : 'light';
  const accent = rgb(l.accent);
  // Downloads switched off with "Hide on the page" stay in the admin but are not shown.
  // Windows first, then Mac, then the rest, whatever order they were typed in: with two columns that puts the Windows pair on the top row and the Mac pair below.
  const RANK = { windows: 0, mac: 1, linux: 2 };
  const dls = (l.downloads || []).filter((d) => d && (d.label || d.url) && !d.hidden).map((d, i) => [d, i]).sort((x, y) => (RANK[x[0].platform] ?? 9) - (RANK[y[0].platform] ?? 9) || x[1] - y[1]).map(([d]) => d);
  const primary = dls.find((d) => d.recommended && !d.soon && d.url) || dls.find((d) => !d.soon && d.url);
  const facts = String(l.heroNote || '').split('·').map((x) => x.trim()).filter(Boolean);
  const hasVideo = !!l.video?.url?.trim();
  const stats = (l.stats || []).filter((s) => s?.value);
  const features = (l.features || []).filter((f) => f?.title);
  const steps = (l.steps || []).filter((s) => s?.title).map((s, i) => ({ ...s, art: <Icon name={s.icon || STEP_ICONS[i % STEP_ICONS.length]} size={30} /> }));
  const faqs = (l.faq || []).filter((f) => f?.q && f?.a);
  const panels = (l.showcases || []).filter((s) => s?.title);
  const needs = lines(l.requirements);
  const phrases = lines(l.heroPhrases);
  const strip = lines(l.marquee);
  const heroStyle = l.heroStyle === 'demo' && phrases.length ? 'demo' : l.heroStyle === 'none' ? 'none' : l.heroImage ? 'image' : 'none';
  const nHead = String(l.headline || '').split(/\s+/).filter(Boolean).length;
  const keys = String(l.heroKeys || 'Ctrl + Win').split('+').map((k) => k.trim()).filter(Boolean);

  return (
    <div className={cn('lp', l.lang === 'bn' && 'lp-bn', bengali.variable)} data-mode={mode} data-palette={l.palette || 'sunset'} style={accent ? { '--lp-accent': accent } : undefined}>
      {/* Hero */}
      <section className="relative overflow-x-clip pb-16 pt-28 sm:pt-36">
        <div aria-hidden="true" className="lp-aurora" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[640px]" style={{ background: 'radial-gradient(55% 60% at 50% 0%, rgb(var(--lp-c) / .18), transparent 70%), radial-gradient(35% 40% at 85% 10%, rgb(var(--lp-a) / .14), transparent 70%)' }} />
        {l.heroEffect !== 'none' && <HeroFx />}
        <div className="shell relative text-center">
          {l.logo && (
            <div className="lp-in" style={{ '--d': '0ms' }}>
              <div className="lp-orb">
                <span className="lp-orb-halo" aria-hidden="true" />
                <span className="lp-orb-ring" aria-hidden="true" /><span className="lp-orb-ring" aria-hidden="true" style={{ animationDelay: '-1.27s', borderColor: 'rgb(var(--lp-c) / .5)' }} /><span className="lp-orb-ring" aria-hidden="true" style={{ animationDelay: '-2.53s', borderColor: 'rgb(var(--lp-a) / .5)' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.logo} alt={`${l.name} logo`} width={84} height={84} className="lp-orb-img" />
              </div>
            </div>
          )}
          {l.badge && <p className="lp-in mx-auto inline-flex items-center gap-2 rounded-full bg-raised/90 px-4 py-1.5 text-[13px] font-medium text-ink backdrop-blur" style={{ '--d': '180ms' }}><span className="h-1.5 w-1.5 rounded-full bg-signal" />{l.badge}</p>}
          <h1 className="mx-auto mt-6 max-w-4xl text-[clamp(2.7rem,7.2vw,5.9rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-ink">
            <Words text={l.headline} />
            {l.headlineAccent && <><br /><span className="lp-grad lp-grad-live" style={{ '--d': `${nHead * 85 + 260}ms` }}>{l.headlineAccent}</span></>}
          </h1>
          {l.subheadline && <p className="lp-in mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-[1.3rem]" style={{ '--d': '700ms' }}>{l.subheadline}</p>}
          <div className="lp-in mt-9 flex flex-wrap items-center justify-center gap-3" style={{ '--d': '860ms' }}>
            {primary && <a href="#download" className="lp-btn inline-flex items-center gap-2.5 whitespace-nowrap rounded-full px-7 py-3.5 text-[1rem] font-semibold">{(() => { const P = PLATFORM[primary.platform] || Download; return <P size={19} />; })()}{t.download}</a>}
            {hasVideo && <a href="#video" className="lp-soft inline-flex items-center gap-2 whitespace-nowrap rounded-full px-6 py-3.5 text-[1rem] font-semibold"><Play size={16} fill="currentColor" />{t.watch}</a>}
          </div>
          {facts.length > 0 && <p className="lp-in mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted" style={{ '--d': '980ms' }}>{facts.map((f, i) => <span key={i} className="inline-flex items-center gap-4">{i > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-muted/50" />}{f}</span>)}</p>}
        </div>

        {heroStyle === 'demo' && (
          <div className="shell lp-in relative mt-14 sm:mt-16" style={{ '--d': '1100ms' }}>
            <Tilt max={3} className="lp-panel lp-pop mx-auto max-w-5xl overflow-hidden rounded-[30px] p-3 sm:rounded-[46px] sm:p-8">
              <HeroDemo phrases={phrases} keys={keys} chips={lines(l.heroChips)} app={l.heroApp || 'Notes'} listening={t.listening} />
            </Tilt>
          </div>
        )}
        {heroStyle === 'image' && (
          <Reveal className="shell relative mt-12 sm:mt-16" y={40}>
            <Tilt max={3} className="lp-panel lp-pop mx-auto max-w-5xl overflow-hidden rounded-[30px] p-2.5 sm:rounded-[46px] sm:p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.heroImage} alt={`${l.name} in use`} className="w-full rounded-[22px] sm:rounded-[34px]" fetchPriority="high" />
            </Tilt>
          </Reveal>
        )}
      </section>

      {/* Numbers */}
      {stats.length > 0 && (
        <section className="py-10 sm:py-14">
          <div className="shell">
            <div className={cn('mx-auto grid max-w-5xl gap-y-8 text-center', stats.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3')}>
              {stats.map((s, i) => (
                <Reveal key={i} delay={i * 0.07} className="px-2">
                  <p className="text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-none tracking-[-0.04em]"><LpCount value={s.value} className="lp-grad" /></p>
                  <p className="mt-2 text-sm font-medium text-muted">{s.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Scrolling strip */}
      {strip.length > 0 && (
        <section className="pb-10 sm:pb-14" aria-label={l.marqueeLabel || undefined}>
          {l.marqueeLabel && <p className="mb-5 text-center text-sm font-semibold uppercase tracking-[0.14em] text-muted">{l.marqueeLabel}</p>}
          <div className="lp-marquee">
            <div className="lp-marquee-track">
              {[...strip, ...strip].map((x, i) => <span key={i} aria-hidden={i >= strip.length} className="shrink-0 rounded-full bg-raised px-5 py-2.5 text-[0.95rem] font-medium text-ink">{x}</span>)}
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
                      <h2 className={cn('mt-3', H2, dark ? 'text-white' : 'text-ink')}>{p.title}</h2>
                      {p.body && <p className={cn('mt-5 text-lg leading-relaxed', dark ? 'text-white/70' : 'text-muted')}>{p.body}</p>}
                      {pts.length > 0 && <ul className="mt-7 space-y-3.5 text-[1rem]">{pts.map((x, k) => <Check2 key={k} dark={dark}>{x}</Check2>)}</ul>}
                    </div>
                    {p.visual === 'meeting' && (
                      <div className={p.reverse ? 'lg:order-1' : ''}>
                        <MeetingDemo title={p.meetingTitle || p.title} items={lines(p.meetingItems)} live={t.recording} done={t.notesReady} />
                      </div>
                    )}
                    {p.visual !== 'meeting' && p.image && (
                      <div className={p.reverse ? 'lg:order-1' : ''}>
                        <Tilt max={4}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image} alt={p.title} loading="lazy" decoding="async" className={cn('w-full rounded-[22px] sm:rounded-[30px]', dark ? 'shadow-[0_30px_70px_-30px_rgba(0,0,0,.8)] ring-1 ring-white/15' : 'shadow-[0_24px_60px_-30px_rgba(0,0,0,.35)] ring-1 ring-black/5')} />
                        </Tilt>
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
              <h2 className={cn(H2, 'text-ink')}>{l.video.title || t.video}</h2>
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
            <Reveal><h2 className={cn('mx-auto max-w-3xl text-center', H2, 'text-ink')}>{String(t.features).replace('{name}', l.name)}</h2></Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <Reveal key={i} delay={(i % 3) * 0.08} className="h-full">
                  <Spot className="group h-full rounded-[28px] bg-raised p-7 transition duration-500 hover:-translate-y-1.5 sm:p-8">
                    <span className="lp-btn grid h-12 w-12 place-items-center rounded-2xl transition duration-500 group-hover:rotate-[-6deg] group-hover:scale-110"><Icon name={f.icon} size={22} /></span>
                    <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-ink">{f.title}</h3>
                    <p className="mt-2.5 leading-relaxed text-muted">{f.body}</p>
                  </Spot>
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
              <h2 className={cn(H2, 'text-ink')}>{l.stepsHeading || t.steps}</h2>
              {l.stepsIntro && <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{l.stepsIntro}</p>}
            </Reveal>
            <div className="mt-14"><StepsTimeline steps={steps} label={t.step} /></div>
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
                  <h2 className="text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.04em]"><span className="lp-grad lp-grad-live" style={{ '--d': '0ms' }}>{l.ctaHeading || t.dl}</span></h2>
                  <p className="mt-4 text-lg text-white/70">{l.ctaText || t.dlIntro}</p>
                </div>
                <div className={cn('mx-auto mt-12 grid max-w-4xl gap-5', dls.length > 1 && 'md:grid-cols-2')}>
                  {dls.map((d, i) => {
                    const P = PLATFORM[d.platform] || Download;
                    const off = d.soon || !d.url;
                    return (
                      <Reveal key={i} delay={i * 0.1} className="h-full">
                        <div className={cn('lp-glass relative flex h-full flex-col rounded-[28px] p-7 transition duration-500 hover:-translate-y-1.5 sm:p-8', d.recommended && 'lp-shine')}>
                          {(d.recommended || d.sub) && <span className={cn('absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-semibold', d.recommended ? 'bg-white text-[#1d1d1f]' : 'bg-white/15 text-white')}>{d.soon ? t.soon : d.recommended ? (d.sub || t.recommended) : d.sub}</span>}
                          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/12 text-white"><P size={28} /></span>
                          <h3 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-white">{d.label}</h3>
                          {d.size && <p className="mt-1 text-sm font-medium text-white/60">{d.size}</p>}
                          {d.note && <p className="mt-4 flex-1 leading-relaxed text-white/75">{d.note}</p>}
                          {off
                            ? <span className="mt-7 inline-flex cursor-not-allowed items-center justify-center rounded-full bg-white/15 px-6 py-3.5 text-[1rem] font-semibold text-white/60">{t.soon}</span>
                            : <a href={d.url} download rel="noopener" className="mt-7 inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-[1rem] font-semibold text-[#1d1d1f] transition hover:scale-[1.03] active:scale-[0.98]"><Download size={18} />{t.download}</a>}
                        </div>
                      </Reveal>
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
            <Reveal><h2 className={cn('text-center', H2, 'text-ink')}>{t.faq}</h2></Reveal>
            <Reveal className="mt-10"><LandingFaq items={faqs} /></Reveal>
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
