import Link from 'next/link';
import { ArrowUpRight, Mail, Phone, MapPin } from 'lucide-react';
import SocialIcon from './SocialIcon';

const ext = (h = '') => /^https?:/.test(h);
const STATUS = { live: null, beta: 'Beta', 'coming-soon': 'Soon' };

export default function Footer({ site, nav = {}, pages = [], apps = [] }) {
  const year = new Date().getFullYear();
  const cols = [...(nav.footerColumns || [])];
  if (pages.length) cols.push({ title: 'Legal', links: pages.map((p) => ({ label: p.title, href: `/${p.slug}` })) });
  return (
    <footer className="no-print relative overflow-hidden border-t border-line">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-signal/10 blur-[120px]" />
      <div className="shell relative grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-signal font-display text-[15px] font-bold text-white">MH</span>
            <span className="font-display text-lg font-semibold text-ink">{site.name}</span>
          </Link>
          <p className="mt-4 max-w-sm text-[0.95rem] text-muted">{site.footerNote}</p>
          <ul className="mt-6 space-y-2.5 text-[0.95rem]">
            <li><a href={`mailto:${site.email}`} className="inline-flex items-center gap-2.5 text-body hover:text-signal"><Mail size={15} className="text-muted" />{site.email}</a></li>
            <li><a href={`tel:${site.phoneTel}`} className="inline-flex items-center gap-2.5 text-body hover:text-signal"><Phone size={15} className="text-muted" />{site.phone}</a></li>
            <li className="inline-flex items-center gap-2.5 text-body"><MapPin size={15} className="text-muted" />{site.location}</li>
          </ul>
          <div className="mt-7 flex flex-wrap gap-2">
            {(site.socials || []).map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-line text-body transition duration-300 hover:-translate-y-0.5 hover:border-signal hover:bg-signal hover:text-white">
                <SocialIcon label={s.label} url={s.url} />
              </a>
            ))}
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {cols.map((c) => <FooterCol key={c.title} title={c.title} links={c.links || []} />)}
          {apps.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-ink">{nav.appsTitle || 'Products'}</h2>
              <ul className="mt-4 space-y-2.5 text-[0.95rem]">
                {apps.map((a) => (
                  <li key={a.slug}>
                    <a href={a.url || '/apps'} target={ext(a.url) ? '_blank' : undefined} rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-body hover:text-signal">
                      {a.name}{STATUS[a.status] && <span className="rounded-full bg-amber/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber">{STATUS[a.status]}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="shell relative flex flex-col gap-3 border-t border-line py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          {nav.copyrightText
            ? (nav.copyrightUrl
              ? <a href={nav.copyrightUrl} {...(nav.copyrightNewTab || ext(nav.copyrightUrl) ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="hover:text-signal">{nav.copyrightText.replace(/\{year\}/g, year)}</a>
              : nav.copyrightText.replace(/\{year\}/g, year))
            : <>© {year} {site.name}. All rights reserved.</>}
        </p>
        <div className="flex items-center gap-5">
          {nav.bottomText && <p>{nav.bottomText}</p>}
          <a href={site.calendly} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-ink hover:text-signal">Book a call <ArrowUpRight size={14} /></a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-[0.95rem]">
        {links.map((l) => (
          <li key={l.label + l.href}>
            {ext(l.href) || l.newTab
              ? <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-body transition hover:text-signal">{l.label}<ArrowUpRight size={12} className="opacity-50" /></a>
              : <Link href={l.href || '/'} className="text-body transition hover:text-signal">{l.label}</Link>}
          </li>
        ))}
      </ul>
    </div>
  );
}