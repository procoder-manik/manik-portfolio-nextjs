import { Mail, Phone, MessageCircle, CalendarDays, Clock3, MapPin } from 'lucide-react';
import { seoMeta } from '@/lib/seo';
import { getAllSettings, getServicesWithPackages, getPageSeo, getSystemPage } from '@/lib/data';
import { notFound } from 'next/navigation';
import SystemSections from '@/components/site/SystemSections';
import { layoutOf, pageLive } from '@/lib/system-pages';

import ContactForm from '@/components/site/ContactForm';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs } from '@/lib/schema';
import { siteUrl } from '@/lib/utils';

export async function generateMetadata() {
  return seoMeta(await getPageSeo('contact'), { title: 'Contact', description: 'Tell me about your website project. I reply within one working day.', path: '/contact' });
}

export default async function ContactPage(props) {
  const searchParams = await props.searchParams;
  const [{ site, home }, services, sp] = await Promise.all([getAllSettings(), getServicesWithPackages(), getSystemPage('contact')]);
  if (!pageLive(sp)) notFound();
  const list = services.flatMap((s) => [s.name]);
  const ways = [
    [Mail, 'Email', site.email, `mailto:${site.email}`], [Phone, 'Phone', site.phone, `tel:${site.phoneTel}`],
    [MessageCircle, 'WhatsApp', 'Message me on WhatsApp', site.whatsapp], [CalendarDays, 'Book a call', 'Free 30-minute session', site.calendly],
  ];
  return (
    <>
      <JsonLd builtin="contact" data={buildGraph(site, [crumbs([['Home', '/'], ['Contact', '/contact']]), { '@type': 'ContactPage', url: `${siteUrl()}/contact`, about: { '@id': `${siteUrl()}/#business` } }])} />
      <SystemSections layout={layoutOf('contact', sp)} tops={['main']} parts={{
        main: (b) => (
            <section className="relative overflow-hidden pb-24 pt-36 sm:pt-44">
              <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_20%_0%,#000,transparent)]" />
              <div className="shell relative grid gap-14 lg:grid-cols-[1fr_1.35fr]">
                <div>
                  <h1 className="h-display max-w-[10ch]">{b.heading || home.contact?.heading}</h1>
                  <p className="lede mt-6">{b.text || home.contact?.intro}</p>
                  <ul className="mt-10 divide-y divide-line border-y border-line">
                    {ways.map(([I, k, v, h]) => (
                      <li key={k}>
                        <a href={h} target={h?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="group flex items-center gap-4 py-4">
                          <span className="grid h-11 w-11 place-items-center rounded-xl border border-line text-signal transition group-hover:bg-signal group-hover:text-white"><I size={18} /></span>
                          <span><span className="block text-sm text-muted">{k}</span><span className="font-medium text-ink">{v}</span></span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
                    <span className="inline-flex items-center gap-2"><Clock3 size={15} />Replies {site.replyTime.toLowerCase()}</span>
                    <span className="inline-flex items-center gap-2"><MapPin size={15} />{site.location}</span>
                  </div>
                </div>
                <ContactForm services={list} defaultService={searchParams?.service || ''} />
              </div>
            </section>
        ),
      }} />
    </>
  );
}
