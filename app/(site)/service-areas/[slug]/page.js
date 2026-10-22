import { notFound } from 'next/navigation';
import { seoMeta } from '@/lib/seo';
import { getServiceArea, getServiceAreas, getArea, getAreas, getProjects, getCaseStudies, getServicesWithPackages, getSettings } from '@/lib/data';
import ServiceAreaView, { AreaView } from '@/components/site/ServiceAreaViews';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs, faqNode, serviceAreaNode } from '@/lib/schema';
import { caseStudiesOn } from '@/lib/features';
import { siteUrl } from '@/lib/utils';

export const revalidate = 600;
export async function generateStaticParams() {
  const [pages, areas] = await Promise.all([getServiceAreas(), getAreas()]);
  return [...pages, ...areas].map((x) => ({ slug: x.slug }));
}

/* One address serves two kinds of page: a landing page (a service in a place) and a place (the list of its pages). */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const sa = await getServiceArea(slug);
  if (sa) {
    const area = await getArea(sa.area);
    return seoMeta(sa, { title: sa.title, description: sa.summary, image: sa.cover, path: `/service-areas/${sa.slug}`, type: 'article', ogKind: 'case', ogSub: area?.name || sa.niche, ogAccent: sa.accent });
  }
  const a = await getArea(slug);
  if (!a) return {};
  return seoMeta(a, { title: `Services in ${a.name}`, description: a.summary, image: a.cover, path: `/service-areas/${a.slug}`, ogKind: 'page', ogSub: a.kind, ogAccent: a.accent });
}

export default async function ServiceAreaPage({ params }) {
  const { slug } = await params;
  const sa = await getServiceArea(slug);

  if (sa) {
    const [site, area, siblings, areas, projects, cases, services] = await Promise.all([
      getSettings('site'), getArea(sa.area), getServiceAreas({ area: sa.area, exclude: sa.slug, limit: 6 }), getAreas(),
      getProjects(), getCaseStudies(), getServicesWithPackages(),
    ]);
    const pick = (list, slugs, n) => { const chosen = (slugs || []).map((s) => list.find((x) => x.slug === s)).filter(Boolean); return chosen.length ? chosen : list.slice(0, n); };
    const showCases = caseStudiesOn(site);
    const faqs = (sa.blocks || []).filter((b) => b && !b.hidden && b.type === 'faq' && !b.useSite).flatMap((b) => b.items || []);
    return (
      <>
        <JsonLd item={sa} data={buildGraph(site, [crumbs([['Home', '/'], ['Service areas', '/service-areas'], ...(area ? [[area.name, `/service-areas/${area.slug}`]] : []), [sa.title, `/service-areas/${sa.slug}`]]), serviceAreaNode(sa, area), faqNode(faqs)])} />
        <ServiceAreaView sa={sa} area={area} service={services.find((s) => s.slug === sa.service)} siblings={siblings} areas={areas}
          projects={pick(projects, sa.projects, 3)} cases={showCases ? pick(cases, sa.caseStudies, 2) : []} showCases={showCases}
          subject={`Enquiry from: ${sa.title}`} />
      </>
    );
  }

  const area = await getArea(slug);
  if (!area) notFound();
  const [site, areas, pages] = await Promise.all([getSettings('site'), getAreas(), getServiceAreas()]);
  const children = areas.filter((a) => a.parent === area.slug);
  const childPages = Object.fromEntries(children.map((c) => [c.slug, pages.filter((p) => p.area === c.slug)]));
  const parent = area.parent ? areas.find((a) => a.slug === area.parent) : null;
  const own = pages.filter((p) => p.area === area.slug);
  return (
    <>
      <JsonLd item={area} data={buildGraph(site, [crumbs([['Home', '/'], ['Service areas', '/service-areas'], ...(parent ? [[parent.name, `/service-areas/${parent.slug}`]] : []), [area.name, `/service-areas/${area.slug}`]]), {
        '@type': 'CollectionPage', name: `Services in ${area.name}`, url: `${siteUrl()}/service-areas/${area.slug}`,
        mainEntity: { '@type': 'ItemList', itemListElement: own.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl()}/service-areas/${c.slug}`, name: c.title })) },
      }])} />
      <AreaView area={area} pages={own} children={children} childPages={childPages} parent={parent} areas={areas} />
    </>
  );
}
