import { notFound } from 'next/navigation';
import { seoMeta } from '@/lib/seo';
import { getService, getServicePages, getProjects, getCaseStudies, getPitchSites, getSettings, getApps } from '@/lib/data';
import ServiceView from '@/components/site/ServiceView';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs, faqNode } from '@/lib/schema';
import { caseStudiesOn } from '@/lib/features';
import { siteUrl } from '@/lib/utils';

export const revalidate = 600;
export async function generateStaticParams() {
  return (await getServicePages()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return seoMeta(s, { title: s.headline || s.name, description: s.summary || s.tagline, image: s.cover, path: `/services/${s.slug}`, ogKind: 'page', ogSub: s.group || 'Service', ogAccent: s.accent });
}

const low = (x) => String(x || '').toLowerCase();

/* Projects chosen for the service, or else the ones whose work type, platform or industry contains a match word. */
function relatedProjects(s, all) {
  const chosen = (s.projects || []).map((x) => all.find((p) => p.slug === x)).filter(Boolean);
  if (chosen.length) return chosen;
  const words = (s.workMatch || []).map(low).filter(Boolean);
  if (!words.length) return [];
  return all.filter((p) => {
    const hay = [...(p.services || []), p.cms, p.industry, p.platformType === 'custom' ? 'custom code' : ''].map(low).join(' | ');
    return words.some((w) => hay.includes(w));
  }).slice(0, 6);
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) notFound();
  const [site, list, projects, cases, sites, apps] = await Promise.all([
    getSettings('site'), getServicePages(), getProjects(), getCaseStudies(), s.showPitch ? getPitchSites({ all: true, limit: 60 }) : [], s.showApps ? getApps() : [],
  ]);
  const cats = (s.pitchCategories || []).map(low).filter(Boolean);
  const pitch = sites.filter((x) => !cats.length || cats.includes(low(x.category))).slice(0, 6);
  const showCases = caseStudiesOn(site);
  const caseList = showCases ? (s.caseStudies || []).map((x) => cases.find((c) => c.slug === x)).filter(Boolean) : [];
  // Other services: the same group first, then the rest.
  const others = [...list.filter((x) => x.slug !== s.slug && x.group === s.group), ...list.filter((x) => x.slug !== s.slug && x.group !== s.group)].slice(0, 4);
  const url = `${siteUrl()}/services/${s.slug}`;

  return (
    <>
      <JsonLd item={s} data={buildGraph(site, [
        crumbs([['Home', '/'], ['Services', '/services'], [s.name, `/services/${s.slug}`]]),
        {
          '@type': 'Service', '@id': `${url}#service`, name: s.headline || s.name, serviceType: s.name, description: s.summary || s.tagline, url,
          provider: { '@id': `${siteUrl()}/#person` },
          ...(s.packages.length ? { offers: s.packages.map((p) => ({ '@type': 'Offer', name: p.name, price: p.price, priceCurrency: p.currency, url: `${siteUrl()}/checkout/${p.slug}` })) } : {}),
        },
        faqNode((s.faqs || []).filter((f) => f.q && f.a)),
      ])} />
      <ServiceView s={s} projects={relatedProjects(s, projects)} cases={caseList} pitch={pitch} apps={apps.slice(0, 6)} others={others} />
    </>
  );
}
